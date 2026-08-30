import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  organization: z.string().max(200).optional(),
  serviceType: z.string().max(100).optional(),
  message: z.string().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inquirySchema.parse(body);

    // In production:
    // await db.order.create({
    //   data: {
    //     userEmail: data.email,
    //     orderType: data.serviceType,
    //     notes: data.message,
    //     paymentStatus: 'pending',
    //   },
    // });

    return NextResponse.json({ success: true, message: 'Inquiry received. We will respond within 2-3 business days.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid inquiry data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
