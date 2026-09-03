import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { status: 'asc' },
      include: { 
        _count: { select: { evidenceRecords: true, updateLogs: true } } 
      },
    });
    return NextResponse.json({ 
      success: true,
      sources, 
      total: sources.length 
    });
  } catch (error) {
    console.error('Sources API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error', 
      sources: [], 
      total: 0 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}