import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const authSchema = z.object({
  password: z.string().min(1).max(100),
});

export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const inquiries = await db.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.error('Inquiries fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, inquiryId, status, notes } = z.object({
      password: z.string().min(1).max(100),
      inquiryId: z.string().min(1),
      status: z.enum(['NEW', 'IN_REVIEW', 'RESPONDED', 'CLOSED']),
      notes: z.string().optional(),
    }).parse(body);

    // Admin authentication
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const inquiry = await db.inquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        notes,
        statusHistory: JSON.stringify([
          { status, timestamp: new Date().toISOString(), notes }
        ]),
      },
    });

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }
    console.error('Inquiry update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}