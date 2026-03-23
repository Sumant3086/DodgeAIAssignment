'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function GraphView({ 
  onNodeClick, 
  graphRef 
}: { 
  onNodeClick?: (node: any) => void;
  graphRef?: any;
}) {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Expose controls to parent
  useEffect(() => {
    if (graphRef) {
      graphRef.current = {
        zoomToFit: () => {
          if (graphRef.current.fg) {
            graphRef.current.fg.zoomToFit(400, 20);
          }
        },
        toggleLabels: () => setShowLabels(prev => !prev),
        center: () => {
           if (graphRef.current.fg) {
              graphRef.current.fg.centerAt(0, 0, 400);
           }
        }
      };
    }
  }, [graphRef]);

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
    if (!loading && data.nodes.length > 0 && graphRef?.current?.fg) {
       setTimeout(() => {
          graphRef.current.fg.zoomToFit(400, 20); // Less padding to fill more space
       }, 500);
    }
  }, [loading, data]);

  // Robust Resize Observation
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
        // Re-center on significant resize to prevent blank space
        if (graphRef?.current?.fg) {
          graphRef.current.fg.zoomToFit(400, 50);
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [loading]);

  const getNodeColor = useCallback((node: any) => {
    const isHighlighted = selectedNodeId === node.id || hoveredNode?.id === node.id;
    if (isHighlighted) return '#3b82f6'; // Bright Blue focus

    switch (node.group) {
      case 'Customer': return '#3b82f6'; // Blue
      case 'SalesOrder': return '#3b82f6'; // Blue
      case 'Product': return '#10b981'; // Emerald
      case 'Delivery': return '#f59e0b'; // Amber
      case 'Billing': return '#ef4444'; // Red
      case 'JournalEntry': return '#ef4444'; // Red
      default: return '#94a3b8'; // Slate
    }
  }, [selectedNodeId, hoveredNode]);

  const fgRef = useRef<any>(null);

  // Sync internal fgRef with external graphRef
  useEffect(() => {
    if (graphRef && graphRef.current) {
      graphRef.current.fg = fgRef.current;
    }
  }, [graphRef]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    onNodeClick?.(node);
  }, [selectedNodeId, onNodeClick]);

  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node);
  }, []);

  if (loading) return <div className="flex h-full w-full items-center justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-200"></div></div>;

  return (
    <div ref={containerRef} className="h-full w-full bg-white relative overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeColor={getNodeColor}
        nodeLabel={(node: any) => node.label || node.id}
        nodeRelSize={2.5}
        linkDirectionalArrowLength={0}
        linkColor={(link: any) => {
          const isRelated = selectedNodeId === link.source.id || selectedNodeId === link.target.id || 
                          hoveredNode?.id === link.source.id || hoveredNode?.id === link.target.id;
          return isRelated ? '#3b82f6' : 'rgba(148, 163, 184, 0.05)';
        }}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        linkWidth={(link: any) => {
          const isRelated = selectedNodeId === link.source.id || selectedNodeId === link.target.id || 
                          hoveredNode?.id === link.source.id || hoveredNode?.id === link.target.id;
          return isRelated ? 1.5 : 0.5;
        }}
        d3AlphaDecay={0.012}
        d3VelocityDecay={0.2}
        cooldownTicks={150}
        onEngineStop={() => {
           if (graphRef?.current?.fg) {
              graphRef.current.fg.zoomToFit(600, 50);
           }
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNode?.id === node.id;
          const size = isSelected || isHovered ? 4 : 2;
          
          if (isSelected) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, size * 2.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          if (showLabels && globalScale > 2.2) {
             const label = node.label || node.id;
             const fontSize = 10 / globalScale;
             ctx.font = `500 ${fontSize}px Inter, sans-serif`;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillStyle = isSelected ? '#0f172a' : 'rgba(100, 116, 139, 0.5)';
             ctx.fillText(label, node.x, node.y + (size + 5));
          }
        }}
      />
      <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-100 shadow-sm text-[10px] text-slate-400 font-medium">
        Interactive Force Graph
      </div>
    </div>
  );
}
