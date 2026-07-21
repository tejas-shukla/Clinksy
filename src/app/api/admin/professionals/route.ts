// GET  /api/admin/professionals — list all professionals (admin only)
// POST /api/admin/professionals — { id, status } to activate/reject/pause (admin only)
// Auth: x-admin-key header must match ADMIN_SECRET env var.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["PENDING_VERIFICATION", "ACTIVE", "PAUSED", "REJECTED"] as const;

function authorised(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.get("x-admin-key") === secret;
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const professionals = await prisma.professional.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  return NextResponse.json({ professionals });
}

export async function POST(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.id || !STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Provide id and a valid status." }, { status: 400 });
  }

  const professional = await prisma.professional.update({
    where: { id: body.id },
    data: {
      status: body.status as (typeof STATUSES)[number],
      // Re-activating clears the timeout strike counter.
      ...(body.status === "ACTIVE" ? { consecutiveTimeouts: 0 } : {}),
    },
  });

  return NextResponse.json({ ok: true, professional });
}
