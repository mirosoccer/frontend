"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { BrainCircuit } from "lucide-react";
import type { KnowledgeNode, KnowledgeEdge } from "@/lib/types";

// ── Dynamic import — no SSR (canvas-based) ───────────────────────────────
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-xl bg-[#0d0d0d]">
        <div className="flex flex-col items-center gap-3">
          <div className="shimmer h-full w-full absolute inset-0 rounded-xl" />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <p className="text-sm text-white/30">Loading Knowledge Graph...</p>
        </div>
      </div>
    ),
  }
);

// ── Node type → color map (data visualization — stays colorful) ──────────
const NODE_COLORS: Record<KnowledgeNode["type"], string> = {
  team: "#D4AF37",
  player: "#60A5FA",
  factor: "#34D399",
  stat: "#A78BFA",
  injury: "#F87171",
  weather: "#67E8F9",
  tactic: "#FB923C",
};

const NODE_TYPE_LABELS: Record<KnowledgeNode["type"], string> = {
  team: "Team",
  player: "Player",
  factor: "Factor",
  stat: "Stat",
  injury: "Injury",
  weather: "Weather",
  tactic: "Tactic",
};

// ── Types for react-force-graph-2d node/link objects ─────────────────────
interface GraphNode {
  id: string;
  name: string;
  type: KnowledgeNode["type"];
  val: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
  value: number;
}

interface MiroFishGraphProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  // matchId reserved for future use (e.g. fetching graph data directly)
}

export default function MiroFishGraph({
  nodes,
  edges,
}: MiroFishGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // ── Responsive width ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    obs.observe(containerRef.current);
    // set initial width
    setWidth(containerRef.current.offsetWidth || 600);
    return () => obs.disconnect();
  }, []);

  // ── Build graph data ─────────────────────────────────────────────────
  const graphData = {
    nodes: nodes.map((n) => ({
      id: n.id,
      name: n.label,
      type: n.type,
      val: n.value,
    })) as GraphNode[],
    links: edges.map((e) => ({
      source: e.source,
      target: e.target,
      label: e.label,
      value: e.weight,
    })) as GraphLink[],
  };

  // ── Node canvas render ───────────────────────────────────────────────
  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const color = NODE_COLORS[node.type] ?? "#888";
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const radius = Math.max(4, Math.sqrt(node.val) * 0.9);

      const x = node.x ?? 0;
      const y = node.y ?? 0;

      // glow ring for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI);
        ctx.fillStyle = color + "33";
        ctx.fill();
      }

      // main circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? color : color + "cc";
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#fff" : color;
      ctx.lineWidth = isSelected ? 1.5 : 0.8;
      ctx.stroke();

      // label — only render at reasonable zoom
      const fontSize = Math.max(3, 10 / globalScale);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = isSelected || isHovered ? "#ffffff" : "#ccccdd";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.name, x, y + radius + fontSize * 0.9);
    },
    [selectedNode, hoveredNode]
  );

  // ── Link canvas render ───────────────────────────────────────────────
  const paintLink = useCallback(
    (
      link: GraphLink,
      ctx: CanvasRenderingContext2D,
    ) => {
      const src = link.source as GraphNode;
      const tgt = link.target as GraphNode;
      if (!src.x || !tgt.x) return;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y ?? 0);
      ctx.lineTo(tgt.x, tgt.y ?? 0);
      ctx.strokeStyle = `rgba(120,120,180,${link.value * 0.6 + 0.15})`;
      ctx.lineWidth = link.value * 1.5 + 0.3;
      ctx.stroke();
    },
    []
  );

  return (
    <div className="rounded-xl border border-white/8 bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-0.5 border-b border-white/8 bg-[#1a1a1a] px-4 py-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">
            MiroFish Knowledge Graph
          </h3>
        </div>
        <p className="text-[11px] text-white/30">
          AI-generated influence map &mdash; updates every 5-10 minutes
        </p>
      </div>

      {/* Graph + tooltip row */}
      <div className="relative flex gap-0">
        {/* Graph canvas */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden"
          style={{ height: 500, background: "#0a0a0a", cursor: hoveredNode ? "pointer" : "default" }}
        >
          <ForceGraph2D
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            graphData={graphData as any}
            width={width}
            height={500}
            backgroundColor="#0a0a0a"
            nodeCanvasObject={paintNode as never}
            nodeCanvasObjectMode={() => "replace"}
            linkCanvasObject={paintLink as never}
            linkCanvasObjectMode={() => "replace"}
            onNodeClick={(node) => {
              const n = node as GraphNode;
              setSelectedNode((prev) => (prev?.id === n.id ? null : n));
            }}
            onNodeHover={(node) => setHoveredNode((node as GraphNode) ?? null)}
            nodePointerAreaPaint={(node, color, ctx) => {
              const n = node as GraphNode;
              const radius = Math.max(4, Math.sqrt(n.val) * 0.9) + 4;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(n.x ?? 0, n.y ?? 0, radius, 0, 2 * Math.PI);
              ctx.fill();
            }}
            d3AlphaDecay={0.03}
            d3VelocityDecay={0.3}
            cooldownTicks={120}
            enableNodeDrag
            enableZoomInteraction
            minZoom={0.3}
            maxZoom={4}
          />

          {/* Legend overlay */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 rounded-lg border border-white/8 bg-[#0d0d0dee] px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
              Node Types
            </p>
            {(Object.keys(NODE_COLORS) as KnowledgeNode["type"][]).map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: NODE_COLORS[t] }}
                />
                <span className="text-[10px] text-white/40">
                  {NODE_TYPE_LABELS[t]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip panel */}
        {selectedNode && (
          <div className="w-52 shrink-0 border-l border-white/8 bg-[#111] p-4 flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                Selected Node
              </p>
              <p className="mt-1 text-sm font-bold text-white leading-tight">
                {selectedNode.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full shrink-0"
                style={{ background: NODE_COLORS[selectedNode.type] }}
              />
              <span className="text-xs capitalize text-white/40">
                {selectedNode.type}
              </span>
            </div>
            <div className="rounded-lg bg-white/5 p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-white/30">
                Influence Weight
              </p>
              <p className="mt-1 text-lg font-black tabular-nums text-white">
                {selectedNode.val}
                <span className="ml-0.5 text-xs font-normal text-white/30">
                  / 100
                </span>
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${selectedNode.val}%`,
                    background: NODE_COLORS[selectedNode.type],
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30">
                Connections
              </p>
              <div className="mt-1 space-y-1 max-h-[200px] overflow-y-auto">
                {edges
                  .filter(
                    (e) =>
                      e.source === selectedNode.id ||
                      e.target === selectedNode.id
                  )
                  .map((e, i) => {
                    const isSource = e.source === selectedNode.id;
                    const otherId = isSource ? e.target : e.source;
                    const other = nodes.find((n) => n.id === otherId);
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 rounded-md bg-white/5 px-2 py-1.5"
                      >
                        <span
                          className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background: other
                              ? NODE_COLORS[other.type]
                              : "#888",
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium leading-tight text-white/60 truncate">
                            {other?.label ?? otherId}
                          </p>
                          <p className="text-[9px] text-white/30">
                            {isSource ? "→" : "←"} {e.label} ({(e.weight * 100).toFixed(0)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-auto text-[10px] text-white/30 hover:text-white/60 transition-colors text-left"
            >
              ✕ Deselect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
