'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1', role: 'assistant', content: 'Hi! I can help you analyze the Order to Cash process.'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.response || data.error || 'Something went wrong.' 
      }]);
    } catch (error) {
       console.error(error);
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Connection failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">Chat with Graph</h2>
        <p className="text-[11px] text-slate-400 font-medium">Order to Cash</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-black' : 'bg-slate-200'
              }`}>
                {msg.role === 'assistant' ? (
                  <span className="text-white font-bold text-sm">D</span>
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <p className="text-[13px] font-bold text-slate-900 leading-tight">
                  {msg.role === 'assistant' ? 'Dodge Al' : 'You'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium lowercase">
                  {msg.role === 'assistant' ? 'Graph Agent' : ''}
                </p>
              </div>
            </div>
            
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[13px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">D</span>
              </div>
               <div>
                <p className="text-[13px] font-bold text-slate-900 leading-tight">Dodge Al</p>
                <p className="text-[10px] text-slate-400 font-medium">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 pt-2">
        <div className="mb-3 flex items-center gap-2 px-1">
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
           <span className="text-[11px] text-slate-400 font-medium">Dodge Al is awaiting instructions</span>
        </div>
        <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-slate-300 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Analyze anything"
            rows={3}
            className="w-full bg-transparent border-none p-4 text-[13px] focus:outline-none transition-all placeholder:text-slate-300 resize-none text-slate-900 leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex justify-end p-3 bg-slate-50/50 border-t border-slate-50">
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                input.trim() ? 'bg-black text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
