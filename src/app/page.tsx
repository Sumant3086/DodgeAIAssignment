'use client';

import { useState } from 'react';
import { MoreHorizontal, Minimize2, EyeOff } from 'lucide-react';
import GraphView from '@/components/GraphView';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <main className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 border border-slate-300 rounded flex items-center justify-center">
            <div className="w-3 h-3 border-l border-b border-slate-800"></div>
          </div>
          <span className="text-slate-400 font-medium">Mapping / <span className="text-slate-900 font-bold">Order to Cash</span></span>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <MoreHorizontal className="w-6 h-6 text-slate-800" />
        </button>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Section: Graph Container */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-[#f8fafc]">
          {/* Graph Controls */}
          <div className="absolute top-6 left-6 z-10 flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all">
              <Minimize2 className="w-3.5 h-3.5" /> Minimize
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg shadow-sm text-xs font-semibold hover:bg-slate-800 transition-all">
              <EyeOff className="w-3.5 h-3.5" /> Hide Granular Overlay
            </button>
          </div>

          <div className="flex-1 relative m-4 mb-2 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
             <GraphView onNodeClick={(node) => setSelectedNode(node)} />

             {/* Metadata Overlay Card */}
             {selectedNode && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 z-30 transition-all animate-in fade-in zoom-in duration-200">
                 <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900">{selectedNode.group}</h3>
                      <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
                    </div>
                    <div className="space-y-1 text-[13px] leading-relaxed">
                      <p><span className="text-slate-400">Entity:</span> <span className="text-slate-600 font-medium">{selectedNode.group}</span></p>
                      {Object.entries(selectedNode).map(([key, value]) => {
                        if (['id', 'x', 'y', 'index', 'vx', 'vy', 'group', 'label', 'amount', 'currency'].includes(key)) return null;
                        return (
                          <p key={key}>
                            <span className="text-slate-400 capitalize">{key}:</span> <span className="text-slate-600 font-medium">{String(value)}</span>
                          </p>
                        );
                      })}
                      {selectedNode.amount && (
                         <p><span className="text-slate-400 px-1">Amount:</span> <span className="text-slate-600 font-medium">{selectedNode.amount} {selectedNode.currency}</span></p>
                      )}
                      <div className="pt-2 mt-2 border-t border-slate-50">
                        <p className="text-slate-300 italic text-[11px]">Additional fields hidden for readability</p>
                        <p className="text-slate-600 font-semibold mt-1">Connections: 2</p>
                      </div>
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Right Section: Chat Sidebar */}
        <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0">
          <ChatInterface />
        </aside>
      </div>
    </main>
  );
}
