import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

// Strict prompt for AI Counsellor
const SYSTEM_PROMPT = `
You are an expert AI College Admission Counsellor specifically focused on Indian Engineering and Medical admissions (JEE, NEET, MHT-CET).
Your ONLY goal is to guide students through college selection, scholarships, and career paths based on factual admission data.
CRITICAL RULES:
1. ONLY answer queries related to education, admissions, colleges, exams, and scholarships.
2. If a user asks something unrelated to these topics (e.g., general knowledge, coding, politics, weather, entertainment), you MUST politely refuse to answer and redirect them to admission-related topics.
3. NEVER hallucinate or invent information. If you do not know the answer or lack specific data (like exact cutoffs or fee structures), clearly state that you don't have that information.
4. Provide structured, accurate, and concise answers using Markdown. Format your output with clear headings (##), bullet points, and bold text for key terms to make it highly readable.
5. Answer strictly in the user's preferred language (English, Hindi, Marathi, etc.).
`;

export const streamChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    let { sessionId, message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // 1. Fetch or create a Chat Session
    if (!sessionId) {
      const newSession = await prisma.chatSession.create({
        data: { userId }
      });
      sessionId = newSession.id;
    }

    // 2. Fetch User Profile for context
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    let contextString = '';
    if (profile) {
      contextString = `
[STUDENT PROFILE CONTEXT - DO NOT EXPOSE RAW DATA TO USER, USE FOR GUIDANCE ONLY]
- State: ${profile.homeState || 'Unknown'}
- Category: ${profile.category || 'Unknown'}
- Budget: ${profile.budgetMax || 'Unknown'}
- Target Branches: ${profile.preferredBranches?.join(', ') || 'Unknown'}
      `;
    }

    // 3. Save User Message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: message
      }
    });

    // 4. Fetch Conversation History (last 10 interactions)
    let history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Reverse to chronological order for Gemini API
    history = history.reverse();

    // Map history to Gemini format, ensuring alternating roles
    const rawContents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || ' ' }]
    }));

    // Consolidate adjacent messages of the same role to prevent Gemini API errors
    const contents: {role: string, parts: {text: string}[]}[] = [];
    for (const msg of rawContents) {
      if (contents.length > 0 && contents[contents.length - 1].role === msg.role) {
        contents[contents.length - 1].parts[0].text += `\n\n${msg.parts[0].text}`;
      } else {
        // Deep copy to prevent mutating rawContents
        contents.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
      }
    }

    // Gemini strictly requires the first message to be from a 'user'
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift(); // Remove the first message if it's from the model
    }

    // Ensure the last message is from the user, as we just added it
    if (contents.length > 0 && contents[contents.length - 1].role !== 'user') {
      contents.push({ role: 'user', parts: [{ text: message }] });
    } else if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: message }] });
    }

    // Set headers for Streaming Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send the Session ID immediately so the frontend can track the session
    res.write(`data: ${JSON.stringify({ type: 'session_id', sessionId })}\n\n`);

    // 5. Stream Gemini Response
    let fullResponse = '';
    
    // If no real API key, mock the stream
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MOCK_KEY') {
      const mockReply = "I am a mocked AI Counsellor response because the GEMINI_API_KEY is not configured in the backend. However, I can see your message! You asked: " + message;
      const chunks = mockReply.split(' ');
      
      for (const chunk of chunks) {
        fullResponse += chunk + ' ';
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk + ' ' })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 50)); // Artificial delay
      }
    } else {
      // Real Gemini API Call with Timeout
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: `${SYSTEM_PROMPT}\n${contextString}`
      });
      
      const generatePromise = model.generateContentStream({ contents });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API Timeout')), 15000)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]) as any;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
      }
    }

    // 6. Save Assistant Message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: fullResponse.trim()
      }
    });

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error('AI Stream Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'The AI service is currently unavailable or encountered an error. Please try again later.' })}\n\n`);
    res.end();
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      res.status(404).json({ status: 'error', message: 'Chat session not found' });
      return;
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      status: 'success',
      data: {
        sessionId: session.id,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content
        }))
      }
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch chat history' });
  }
};
