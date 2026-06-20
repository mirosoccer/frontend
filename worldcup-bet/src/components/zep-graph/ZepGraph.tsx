"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, RefreshCw } from "lucide-react";
import type { GraphNodeData, GraphEdgeData } from "@/lib/zep";

// Dynamically import ForceGraph2D to avoid SSR issues with canvas
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs text-white/30">Loading graph...</span>
        </div>
      </div>
    ),
  }
);

interface GraphResponse {
  nodes: GraphNodeData[];
  links: GraphEdgeData[];
  graphId?: string;
  graphName?: string;
  error?: string;
}

// Extend node data with position fields that the force graph adds
interface GraphNode extends GraphNodeData {
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  name: string;
  fact: string;
}

export default function ZepGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [data, setData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        setWidth(rect.width);
        setHeight(Math.max(300, rect.height));
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Fetch graph data
  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/zep-graph");
      const json: GraphResponse = await res.json();
      if (json.error && json.nodes.length === 0) {
        setError(json.error);
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch graph");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Graph data for force-graph
  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    return {
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({ ...l })),
    };
  }, [data]);

  // Node paint
  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const size = Math.max(3, Math.min(8, node.val));
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      // Glow ring on hover/select
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(x, y, size + 3, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected
          ? "rgba(255,255,255,0.15)"
          : "rgba(255,255,255,0.08)";
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? "#fff" : isHovered ? "#ccc" : "rgba(255,255,255,0.5)";
      ctx.fill();

      // Label (only show when zoomed in enough)
      if (globalScale > 1.2) {
        const label = node.name.length > 20 ? node.name.slice(0, 18) + "..." : node.name;
        const fontSize = Math.max(10, 12 / globalScale);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = isSelected ? "#fff" : "rgba(255,255,255,0.5)";
        ctx.fillText(label, x, y + size + fontSize + 2);
      }
    },
    [selectedNode, hoveredNode]
  );

  // Link paint
  const paintLink = useCallback(
    (link: GraphLink, ctx: CanvasRenderingContext2D) => {
      const src = link.source as GraphNode;
      const tgt = link.target as GraphNode;
      if (!src.x || !tgt.x) return;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y ?? 0);
      ctx.lineTo(tgt.x, tgt.y ?? 0);

      // Highlight if either end is selected
      const isHighlighted =
        selectedNode &&
        (src.id === selectedNode.id || tgt.id === selectedNode.id);

      ctx.strokeStyle = isHighlighted
        ? "rgba(255,255,255,0.3)"
        : "rgba(255,255,255,0.06)";
      ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
      ctx.stroke();
    },
    [selectedNode]
  );

  // Find connected edges for selected node
  const connectedEdges = useMemo(() => {
    if (!selectedNode || !data) return [];
    return data.links.filter(
      (l) => l.source === selectedNode.id || l.target === selectedNode.id
    );
  }, [selectedNode, data]);

  // Find node name by id
  const nodeName = useCallback(
    (id: string) => data?.nodes.find((n) => n.id === id)?.name ?? id.slice(0, 8),
    [data]
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-white/40" />
          <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">
            MiroFish Knowledge Graph
          </span>
          {data?.graphName && (
            <span className="text-[10px] text-white/20 font-mono">
              ({data.graphName})
            </span>
          )}
        </div>
        <button
          onClick={fetchGraph}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Graph container */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden"
        style={{
          height: "clamp(300px, 50vh, 500px)",
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-xs text-white/30">Fetching Zep graph...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-8">
              <Brain className="h-8 w-8 text-white/15" />
              <p className="text-sm text-white/40">{error}</p>
              <button
                onClick={fetchGraph}
                className="mt-2 px-3 py-1.5 rounded text-xs text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Brain className="h-8 w-8 text-white/15" />
              <p className="text-sm text-white/30">No graph data available</p>
              <p className="text-xs text-white/15">Add data to your Zep graph to see it here</p>
            </div>
          </div>
        ) : (
          <ForceGraph2D
            width={width}
            height={height}
            graphData={graphData}
            /* eslint-disable @typescript-eslint/no-explicit-any */
            nodeCanvasObject={(node: any, ctx: any, globalScale: any) =>
              paintNode(node as GraphNode, ctx, globalScale)
            }
            linkCanvasObject={(link: any, ctx: any) =>
              paintLink(link as GraphLink, ctx)
            }
            onNodeClick={(node: any) => {
              const n = node as GraphNode;
              setSelectedNode((prev) => (prev?.id === n.id ? null : n));
            }}
            onNodeHover={(node: any) => setHoveredNode(node as GraphNode | null)}
            /* eslint-enable @typescript-eslint/no-explicit-any */
            onBackgroundClick={() => setSelectedNode(null)}
            backgroundColor="#0a0a0a"
            cooldownTime={3000}
            d3AlphaDecay={0.03}
            d3VelocityDecay={0.3}
          />
        )}

        {/* Node count */}
        {!loading && !error && graphData.nodes.length > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-white/20 font-mono">
            <span>{graphData.nodes.length} nodes</span>
            <span>{graphData.links.length} edges</span>
          </div>
        )}
      </div>

      {/* Selected node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 rounded-xl p-4"
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
                {selectedNode.labels.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {selectedNode.labels.map((l) => (
                      <span
                        key={l}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {selectedNode.summary && (
              <p className="text-xs text-white/50 leading-relaxed mb-3">
                {selectedNode.summary}
              </p>
            )}

            {connectedEdges.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                  Connections ({connectedEdges.length})
                </span>
                <div className="mt-1.5 space-y-1">
                  {connectedEdges.slice(0, 10).map((edge, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[11px] text-white/40"
                    >
                      <span className="text-white/20">&rarr;</span>
                      <span className="text-white/50 font-medium">{edge.name}</span>
                      <span className="text-white/20">
                        {edge.source === selectedNode.id
                          ? nodeName(edge.target)
                          : nodeName(edge.source)}
                      </span>
                    </div>
                  ))}
                  {connectedEdges.length > 10 && (
                    <p className="text-[10px] text-white/15">
                      +{connectedEdges.length - 10} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
