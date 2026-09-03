import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get('location');
    const categorySlug = request.nextUrl.searchParams.get('category');

    const gaps = await prisma.dataGap.findMany({
      where: {
        isDemo: false,
        ...(locationId && { locationId }),
        ...(categorySlug && { categorySlug }),
      },
    });

    return NextResponse.json({ 
      success: true,
      gaps, 
      total: gaps.length 
    });
  } catch (error) {
    console.error('Data Gaps API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error', 
      gaps: [], 
      total: 0 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}