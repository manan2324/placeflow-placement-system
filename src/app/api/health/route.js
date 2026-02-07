import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns: { status: "ok" }
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
