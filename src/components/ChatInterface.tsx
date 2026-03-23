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
      
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-2">
            <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-none">Dodge Al</p>
                    <p className="text-[10px] text-slate-400 font-medium">Graph Agent</p>
                  </div>
                </>
              ) : (
                <p className="text-[13px] font-bold text-slate-900">You</p>
              )}
            </div>
            
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-3 rounded-xl max-w-[90%] text-[13px] leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">D</span>
              </div>
               <div>
                <p className="text-[13px] font-bold text-slate-900 leading-none">Dodge Al</p>
                <p className="text-[10px] text-slate-400 font-medium font-medium">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 pt-2">
        <div className="mb-2 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
           <span className="text-[11px] text-slate-400 font-medium">Dodge Al is awaiting instructions</span>
        </div>
        <form onSubmit={handleSubmit} className="relative bg-slate-50 rounded-xl border border-slate-100 p-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Analyze anything"
            rows={3}
            className="w-full bg-transparent border-none rounded-lg p-3 text-[13px] focus:outline-none transition-all placeholder:text-slate-400 resize-none text-slate-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex justify-end p-2 pt-0">
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-slate-400 text-white text-xs font-bold rounded-lg hover:bg-slate-500 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
