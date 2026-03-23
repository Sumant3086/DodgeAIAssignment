'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function GraphView({ onNodeClick }: { onNodeClick?: (node: any) => void }) {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    fetch('/api/graph')
      .then((res) => res.json())
      .then((json) => {
        if (json.error || !json.nodes) {
          console.error('Graph API Error:', json.error);
          setData({ nodes: [], links: [] });
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load graph:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNodeColor = useCallback((node: any) => {
    switch (node.group) {
      case 'Customer': return '#e11d48'; // Rose
      case 'SalesOrder': return '#2563eb'; // Blue
      case 'Product': return '#10b981'; // Emerald
      case 'Delivery': return '#f59e0b'; // Amber
      case 'Billing': return '#8b5cf6'; // Violet
      case 'JournalEntry': return '#06b6d4'; // Cyan
      case 'Payment': return '#059669'; // Green
      default: return '#9ca3af'; // Gray
    }
  }, []);

  if (loading) return <div className="flex h-full w-full items-center justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  return (
    <div ref={containerRef} className="h-full w-full bg-slate-50 relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeColor={getNodeColor}
        nodeLabel={(node: any) => node.label || node.id}
        nodeRelSize={6}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkColor={() => '#94a3b8'}
        onNodeClick={(node) => onNodeClick?.(node)}
        linkWidth={1.5}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label || node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

          ctx.fillStyle = getNodeColor(node);
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fill();

          if (globalScale > 1.5) {
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillStyle = '#1e293b';
             ctx.fillText(label, node.x, node.y + 8);
          }
        }}
      />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-sm border border-slate-200 text-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Legend</h3>
        <ul className="space-y-1">
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-600"></div>Customer</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div>Sales Order</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Product</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Delivery</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500"></div>Invoice</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div>Journal Entry</li>
        </ul>
      </div>
    </div>
  );
}
