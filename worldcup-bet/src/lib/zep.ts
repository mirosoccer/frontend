// ============================================================================
// Zep Knowledge Graph API Client
// Fetches graph data (nodes + edges) from Zep's API
// Docs: https://help.getzep.com/sdk-reference/graph
// ============================================================================

const ZEP_API_BASE = "https://api.getzep.com/api/v2";

// ── Zep response types ────────────────────────────────────────────────────

export interface ZepNode {
  uuid: string;
  name: string;
  summary: string;
  labels?: string[];
  attributes?: Record<string, unknown>;
  created_at: string;
  score?: number;
  relevance?: number;
}

export interface ZepEdge {
  uuid: string;
  name: string;
  fact: string;
  source_node_uuid: string;
  target_node_uuid: string;
  scope?: string;
  valid_at?: string;
  invalid_at?: string;
  expired_at?: string;
  created_at: string;
  attributes?: Record<string, unknown>;
  score?: number;
}

export interface ZepGraph {
  uuid: string;
  graph_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ZepGraphListResponse {
  graphs: ZepGraph[];
  row_count: number;
  total_count: number;
}

// ── Transformed types for the force-graph component ───────────────────────

export interface GraphNodeData {
  id: string;
  name: string;
  summary: string;
  labels: string[];
  val: number;       // for node size
}

export interface GraphEdgeData {
  source: string;
  target: string;
  name: string;
  fact: string;
}

export interface GraphData {
  nodes: GraphNodeData[];
  links: GraphEdgeData[];
}

// ── API functions ─────────────────────────────────────────────────────────

/**
 * List all graphs in the Zep project.
 * Called server-side (from API route) to keep the API key hidden.
 */
export async function listGraphs(apiKey: string): Promise<ZepGraph[]> {
  const res = await fetch(`${ZEP_API_BASE}/graph/list-all`, {
    method: "GET",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zep listGraphs failed (${res.status}): ${err}`);
  }

  const data: ZepGraphListResponse = await res.json();
  return data.graphs ?? [];
}

/**
 * Get all nodes for a graph.
 */
export async function getGraphNodes(
  apiKey: string,
  graphId: string,
  limit = 200
): Promise<ZepNode[]> {
  const res = await fetch(`${ZEP_API_BASE}/graph/node/graph/${graphId}`, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zep getGraphNodes failed (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Get all edges for a graph.
 */
export async function getGraphEdges(
  apiKey: string,
  graphId: string,
  limit = 500
): Promise<ZepEdge[]> {
  const res = await fetch(`${ZEP_API_BASE}/graph/edge/graph/${graphId}`, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zep getGraphEdges failed (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Fetch nodes + edges for a graph and transform into force-graph format.
 */
export async function getGraphData(
  apiKey: string,
  graphId: string
): Promise<GraphData> {
  const [rawNodes, rawEdges] = await Promise.all([
    getGraphNodes(apiKey, graphId),
    getGraphEdges(apiKey, graphId),
  ]);

  // Build a set of node UUIDs for validation
  const nodeUUIDs = new Set(rawNodes.map((n) => n.uuid));

  const nodes: GraphNodeData[] = rawNodes.map((n) => ({
    id: n.uuid,
    name: n.name,
    summary: n.summary,
    labels: n.labels ?? [],
    val: Math.max(2, (n.summary?.length ?? 0) / 20), // size by summary length
  }));

  // Only include edges where both source & target exist
  const links: GraphEdgeData[] = rawEdges
    .filter((e) => nodeUUIDs.has(e.source_node_uuid) && nodeUUIDs.has(e.target_node_uuid))
    .map((e) => ({
      source: e.source_node_uuid,
      target: e.target_node_uuid,
      name: e.name,
      fact: e.fact,
    }));

  return { nodes, links };
}
