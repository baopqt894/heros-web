import { backend, BackendError } from "@/lib/backend";
import { readBody } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try { return Response.json(await backend("commerce/payos/webhook", { method: "POST", body: await readBody(request) })); }
  catch (error) { return Response.json({ error: "Unable to reconcile payment" }, { status: error instanceof BackendError ? error.status : 400 }); }
}
