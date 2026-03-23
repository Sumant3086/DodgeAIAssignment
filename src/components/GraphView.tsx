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
    <div ref={containerRef} className="h-full w-full bg-white relative overflow-hidden">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeColor={getNodeColor}
        nodeLabel={(node: any) => node.label || node.id}
        nodeRelSize={4}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(148, 163, 184, 0.2)'}
        onNodeClick={(node) => onNodeClick?.(node)}
        linkWidth={1}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const fontSize = 11 / globalScale;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          if (globalScale > 2.5) {
             const label = node.label || node.id;
             ctx.font = `${fontSize}px Inter, sans-serif`;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
             ctx.fillText(label, node.x, node.y + 7);
          }
        }}
      />
      <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-100 shadow-sm text-[10px] text-slate-400 font-medium">
        Interactive Force Graph
      </div>
    </div>
  );
}
