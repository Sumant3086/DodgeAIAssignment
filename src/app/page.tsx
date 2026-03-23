import GraphView from '@/components/GraphView';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="flex min-h-screen bg-slate-100 p-4 gap-4 box-border">
      {/* Left side: Graph UI */}
      <div className="flex-[2] flex flex-col h-[calc(100vh-2rem)]">
        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Context Graph</h1>
            <p className="text-sm text-slate-500">Mapping / Order to Cash</p>
          </div>
          <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
            System Active
          </div>
        </header>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative">
          <GraphView />
        </div>
      </div>

      {/* Right side: Chat */}
      <div className="flex-1 min-w-[320px] max-w-[450px] h-[calc(100vh-2rem)]">
        <ChatInterface />
      </div>
    </main>
  );
}
