'use client';

import { useState, useRef } from 'react';
import { MoreHorizontal, Minimize2, EyeOff, Columns2 } from 'lucide-react';
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
          <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-colors">
            <Columns2 className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-slate-400 font-medium text-sm">Mapping / <span className="text-slate-900 font-bold">Order to Cash</span></span>
        </div>
        <button className="w-9 h-9 bg-black rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-white" />
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

             {/* Metadata Overlay Card */}
             {selectedNode && (
               <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 z-30 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-bold text-blue-600">{selectedNode.group}</h3>
                      <button onClick={() => setSelectedNode(null)} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                        <Minimize2 className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                    <div className="space-y-2 text-[12px]">
                      <div className="grid grid-cols-[100px_1fr] gap-x-2 items-baseline">
                        <span className="text-slate-400 font-medium">Entity:</span> 
                        <span className="text-slate-900 font-bold">{selectedNode.group}</span>
                      </div>
                      
                      {Object.entries(selectedNode).map(([key, value]) => {
                        if (['id', 'x', 'y', 'index', 'vx', 'vy', 'group', 'label', 'amount', 'currency', 'color', 'val'].some(k => key.toLowerCase().includes(k))) return null;
                        return (
                          <div key={key} className="grid grid-cols-[100px_1fr] gap-x-2 items-baseline">
                            <span className="text-slate-400 font-medium capitalize">{key}:</span> 
                            <span className="text-slate-900 font-bold break-all">{String(value)}</span>
                          </div>
                        );
                      })}
                      
                      {selectedNode.amount && (
                         <div className="grid grid-cols-[100px_1fr] gap-x-2 items-baseline">
                            <span className="text-slate-400 font-medium">Amount:</span> 
                            <span className="text-slate-900 font-bold">{selectedNode.amount} {selectedNode.currency}</span>
                         </div>
                      )}
                      
                      <div className="pt-4 mt-4 border-t border-slate-100">
                        <p className="text-slate-300 italic text-[11px] mb-2 leading-tight">Additional fields hidden for readability</p>
                        <div className="flex items-center gap-2">
                           <span className="text-slate-900 font-bold">Connections:</span>
                           <span className="text-slate-900 font-bold">{selectedNode.group === 'Payment' ? 1 : 2}</span>
                        </div>
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
