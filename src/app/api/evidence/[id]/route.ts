import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id.length > 100) {
      return NextResponse.json({ error: 'Invalid evidence ID', evidence: null }, { status: 400 });
    }

    const evidence = await prisma.evidenceRecord.findUnique({
      where: { id },
      include: { source: true, location: true, parameter: true, category: true },
    });

    return NextResponse.json({ evidence });
  } catch (error) {
    console.error('Evidence API error:', error);
    return NextResponse.json({ error: 'Internal server error', evidence: null }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}