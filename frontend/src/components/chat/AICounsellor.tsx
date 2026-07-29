import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const AICounsellor = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Namaste! I am your AI Admission Counsellor. I can guide you through college predictions, scholarship applications, or career paths. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: textToSend, sessionId })
      });

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\\n\\n');
          buffer = events.pop() || ''; // Retain the last incomplete chunk
          
          for (const ev of events) {
            if (ev.trim() === '') continue;
            
            if (ev.startsWith('data: ')) {
              try {
                const data = JSON.parse(ev.replace('data: ', ''));
                if (data.type === 'session_id') {
                  setSessionId(data.sessionId);
                } else if (data.type === 'chunk') {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMsgId ? { ...msg, content: msg.content + data.text } : msg
                    )
                  );
                } else if (data.type === 'error') {
                  console.error(data.message);
                } else if (data.type === 'done') {
                  // Stream finished from backend explicitly
                }
              } catch (e) {
                // If it fails to parse, it could be corrupted, but our buffer logic minimizes this.
                console.error("Error parsing SSE JSON:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: "I'm sorry, I encountered an error connecting to my servers. Please try again later." } : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What are my chances for IIT Bombay?",
    "Find scholarships for EWS category in Maharashtra",
    "Which is better: CSE or IT?",
    "Explain the JoSAA counselling process"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">AI Counsellor</h2>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Online • Gemini Powered
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
            </div>
            
            <div className={`rounded-2xl px-5 py-3 shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
              {msg.content || (msg.role === 'assistant' && loading ? <Loader2 className="animate-spin h-5 w-5 text-purple-500" /> : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx} 
                onClick={() => sendMessage(undefined, prompt)}
                className="text-xs bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200 px-3 py-1.5 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className="relative max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your question in English, Hindi, or any language..."
            className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-purple-500 rounded-full py-3.5 pl-6 pr-12 text-slate-800 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={20} className={input.trim() && !loading ? 'ml-1' : ''} />
          </button>
        </form>
        
        <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
          <AlertCircle size={10} /> AI responses may not be 100% accurate. Always verify critical admission data.
        </p>
      </div>
    </div>
  );
};
