'use client';

import { useState, useRef } from 'react';
import { MoreHorizontal, Minimize2, EyeOff } from 'lucide-react';
import GraphView from '@/components/GraphView';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const graphRef = useRef<any>({});

  return (
    <main className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-100 bg-white flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 border border-slate-300 rounded flex items-center justify-center">
            <div className="w-3 h-3 border-l border-b border-slate-800"></div>
          </div>
          <span className="text-slate-400 font-medium">Mapping / <span className="text-slate-900 font-bold">Order to Cash</span></span>
        </div>
        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
          <MoreHorizontal className="w-6 h-6 text-slate-800" />
        </button>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Section: Graph Container (Full Bleed) */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-white">
          {/* Graph Controls */}
          <div className="absolute top-6 left-6 z-10 flex gap-3">
            <button 
              onClick={() => graphRef.current?.zoomToFit?.()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-lg shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Minimize
            </button>
            <button 
              onClick={() => graphRef.current?.toggleLabels?.()}
              className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg shadow-sm text-xs font-semibold hover:bg-slate-800 transition-all active:scale-95"
            >
              <EyeOff className="w-3.5 h-3.5" /> Hide Granular Overlay
            </button>
          </div>

          <div className="flex-1 relative bg-white overflow-hidden">
             <GraphView graphRef={graphRef} onNodeClick={(node) => setSelectedNode(node)} />

             {/* Metadata Overlay Card (Floating near center) */}
             {selectedNode && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] border border-slate-100 z-30 transition-all animate-in fade-in zoom-in duration-200">
                 <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base font-bold text-slate-900">{selectedNode.group}</h3>
                      <button onClick={() => setSelectedNode(null)} className="text-slate-300 hover:text-slate-500 font-bold text-lg leading-none">&times;</button>
                    </div>
                    <div className="space-y-1 text-[12px] leading-relaxed">
                      <p><span className="text-slate-300">Entity:</span> <span className="text-slate-700 font-medium">{selectedNode.group}</span></p>
                      {Object.entries(selectedNode).map(([key, value]) => {
                        if (['id', 'x', 'y', 'index', 'vx', 'vy', 'group', 'label', 'amount', 'currency', 'color', 'val'].some(k => key.toLowerCase().includes(k))) return null;
                        return (
                          <p key={key}>
                            <span className="text-slate-300 capitalize">{key}:</span> <span className="text-slate-700 font-medium">{String(value)}</span>
                          </p>
                        );
                      })}
                      {selectedNode.amount && (
                         <p><span className="text-slate-300">Amount:</span> <span className="text-slate-700 font-medium">{selectedNode.amount} {selectedNode.currency}</span></p>
                      )}
                      <div className="pt-2 mt-2 border-t border-slate-50">
                        <p className="text-slate-300 italic text-[10px]">Additional fields hidden for readability</p>
                        <p className="text-slate-700 font-semibold mt-1">Connections: {selectedNode.group === 'Payment' ? 1 : 2}</p>
                      </div>
                    </div>
                 </div>
               </div>
             )}
             
             <button 
                onClick={() => graphRef.current?.center?.()}
                className="absolute bottom-6 right-6 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-100 shadow-sm text-[10px] text-slate-400 font-medium hover:bg-white hover:text-slate-600 transition-all active:scale-95"
             >
                Interactive Force Graph
             </button>
          </div>
        </div>

        {/* Right Section: Chat Sidebar */}
        <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0 relative z-10">
          <ChatInterface />
        </aside>
      </div>
    </main>
  );
}
