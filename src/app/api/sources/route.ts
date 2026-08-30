import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production:
    // const sources = await db.source.findMany({
    //   orderBy: { status: 'asc' },
    //   include: { _count: { select: { evidenceRecords: true, updateLogs: true } } },
    // });

    return NextResponse.json({ sources: [], total: 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error', sources: [], total: 0 }, { status: 500 });
  }
}
