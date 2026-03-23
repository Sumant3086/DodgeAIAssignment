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
    id: '1', role: 'assistant', content: 'Hi! I can help you analyze the Order to Cash process. Ask me about sales orders, billing documents, specific customers or product flows.'
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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Dodge AI Agent
        </h2>
        <p className="text-xs text-slate-500 mt-1">Order to Cash Assistant</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-blue-600" /></div>}
            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-slate-600" /></div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-blue-600" /></div>
             <div className="px-4 py-2 bg-slate-100 rounded-2xl rounded-tl-sm text-slate-500 flex items-center">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span className="ml-2 text-xs">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about the flows..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
