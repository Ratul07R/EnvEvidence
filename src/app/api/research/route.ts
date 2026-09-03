import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const researchSchema = z.object({
  q: z.string().max(200).optional(),
  topic: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = researchSchema.parse({
      q: request.nextUrl.searchParams.get('q') || undefined,
      topic: request.nextUrl.searchParams.get('topic') || undefined,
    });

    const research = await prisma.researchItem.findMany({
      where: {
        isDemo: false,
        ...(params.q && {
          OR: [
            { title: { contains: params.q, mode: 'insensitive' } },
            { topic: { contains: params.q, mode: 'insensitive' } },
            { abstract: { contains: params.q, mode: 'insensitive' } },
          ],
        }),
        ...(params.topic && { topic: params.topic }),
      },
      orderBy: { publicationDate: 'desc' },
      take: 20,
    });

    return NextResponse.json({ 
      success: true,
      research, 
      total: research.length 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid parameters',
        research: [],
        total: 0
      }, { status: 400 });
    }
    console.error('Research API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      research: [],
      total: 0
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}