import { NextResponse } from "next/server";
import { listGraphs, getGraphData } from "@/lib/zep";

const ZEP_API_KEY = process.env.ZEP_API_KEY ?? "";

/**
 * GET /api/zep-graph
 *
 * Fetches graph data from Zep and returns it in force-graph format.
 *
 * Query params:
 *   - graphId (optional): specific graph to fetch. If omitted, uses the first available graph.
 *
 * Returns:
 *   { nodes: [...], links: [...], graphId: string, graphName: string }
 */
export async function GET(request: Request) {
  if (!ZEP_API_KEY) {
    return NextResponse.json(
      { error: "ZEP_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    let graphId = searchParams.get("graphId");
    let graphName = "";

    // If no specific graph requested, list all and pick the first
    if (!graphId) {
      const graphs = await listGraphs(ZEP_API_KEY);
      if (graphs.length === 0) {
        return NextResponse.json(
          { error: "No graphs found in Zep project", nodes: [], links: [] },
          { status: 200 }
        );
      }
      graphId = graphs[0].graph_id;
      graphName = graphs[0].name ?? graphs[0].graph_id;
    }

    const data = await getGraphData(ZEP_API_KEY, graphId);

    return NextResponse.json({
      ...data,
      graphId,
      graphName,
    });
  } catch (err) {
    console.error("Zep graph fetch error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch graph",
        nodes: [],
        links: [],
      },
      { status: 500 }
    );
  }
}
