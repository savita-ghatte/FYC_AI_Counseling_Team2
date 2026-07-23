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
Your goal is to guide students through college selection, scholarships, and career paths.
You must be supportive, professional, and knowledgeable.
Answer strictly in the user's preferred language (you support English, Hindi, Marathi, etc.).
Keep responses concise and well-formatted in Markdown.
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

    // 4. Fetch Conversation History (last 5 interactions)
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Map history to Gemini format
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Inject system prompt and context into the very first message
    if (contents.length > 0) {
      contents[0].parts[0].text = `${SYSTEM_PROMPT}\n${contextString}\n\n${contents[0].parts[0].text}`;
    } else {
      // Fallback if history is somehow empty (should not happen since we just saved)
      contents.push({
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n${contextString}\n\n${message}` }]
      });
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
      // Real Gemini API Call
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContentStream({
        contents
      });

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

  } catch (error) {
    console.error('AI Stream Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to process AI request' })}\n\n`);
    res.end();
  }
};
