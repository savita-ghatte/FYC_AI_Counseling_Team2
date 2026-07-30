import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Copy, Check, Trash2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
};

export const AICounsellor = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Namaste! I am your AI Admission Counsellor. I can guide you through college predictions, scholarship applications, or career paths. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('aiSessionId'));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const response = await api.get(`/ai/chat/${sessionId}`);
        if (response.data.status === 'success' && response.data.data.messages.length > 0) {
          setMessages(prev => [
            prev[0], // Keep the initial greeting
            ...response.data.data.messages
          ]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const clearChat = () => {
    localStorage.removeItem('aiSessionId');
    setSessionId(null);
    setMessages([{ id: 'initial', role: 'assistant', content: 'Namaste! I am your AI Admission Counsellor. I can guide you through college predictions, scholarship applications, or career paths. How can I assist you today?' }]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    // Remove any previous error messages before sending
    setMessages(prev => prev.filter(msg => !msg.isError));

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      let response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: textToSend, sessionId })
      });

      // If token is expired, attempt to refresh it once
      if (response.status === 401) {
        try {
          const refreshRes = await api.post('/auth/refresh');
          if (refreshRes.data.status === 'success') {
            const newToken = refreshRes.data.data.accessToken;
            // Update api header globally
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            // Retry the fetch
            response = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              body: JSON.stringify({ message: textToSend, sessionId })
            });
          }
        } catch (refreshErr) {
          throw new Error('Your session has expired. Please log out and log back in.');
        }
      }

      if (!response.ok) {
        let errorMsg = 'An unexpected error occurred. Please try again.';
        if (response.status === 429) {
          errorMsg = 'You are sending messages too quickly. Please wait a moment and try again.';
        } else {
          try {
            const errData = await response.json();
            if (errData.message || errData.error) errorMsg = errData.message || errData.error;
          } catch (e) {}
        }
        throw new Error(errorMsg);
      }

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
          const events = buffer.split('\n\n'); // FIX: Replaced literal \\n\\n with standard \n\n
          buffer = events.pop() || ''; // Retain the last incomplete chunk
          
          for (const ev of events) {
            if (ev.trim() === '') continue;
            
            if (ev.startsWith('data: ')) {
              try {
                const data = JSON.parse(ev.replace('data: ', ''));
                if (data.type === 'session_id') {
                  setSessionId(data.sessionId);
                  localStorage.setItem('aiSessionId', data.sessionId);
                } else if (data.type === 'chunk') {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMsgId ? { ...msg, content: msg.content + data.text } : msg
                    )
                  );
                } else if (data.type === 'error') {
                  throw new Error(data.message);
                }
              } catch (e: any) {
                if (e.message !== 'Unexpected end of JSON input') { // allow partial parses just in case
                  throw e;
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: error.message || "I'm sorry, I encountered an error connecting to my servers.", isError: true } : msg
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
        <button 
          onClick={clearChat}
          className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
        >
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : msg.isError ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : msg.isError ? <AlertCircle size={18} /> : <Bot size={18} />}
            </div>
            
            <div className={`group rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : msg.isError ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
              {msg.role === 'assistant' && !msg.isError ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  {msg.content ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    loading && (
                      <div className="flex gap-1 items-center h-5">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}

              {/* Action Buttons below AI messages */}
              {msg.role === 'assistant' && !loading && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  {msg.isError ? (
                    <button 
                      onClick={() => sendMessage(undefined, messages[messages.length - 2]?.content)} 
                      className="text-[10px] flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-100 px-2 py-1 rounded"
                    >
                      <RefreshCw size={12} /> Retry
                    </button>
                  ) : (
                    <button 
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-slate-600"
                    >
                      {copiedId === msg.id ? <><Check size={12} className="text-emerald-500" /> Copied!</> : <><Copy size={12} /> Copy response</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {messages.length <= 2 && (
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
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={input.trim() ? 'ml-1' : ''} />}
          </button>
        </form>
        
        <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
          <AlertCircle size={10} /> AI responses may not be 100% accurate. Always verify critical admission data.
        </p>
      </div>
    </div>
  );
};
