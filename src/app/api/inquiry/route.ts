import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const inquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  organization: z.string().max(200).optional(),
  serviceType: z.string().max(100).optional(),
  message: z.string().min(10).max(5000),
});

const STATUS_VALUES = ['NEW', 'IN_REVIEW', 'RESPONDED', 'CLOSED'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inquirySchema.parse(body);

    // Save inquiry to database (this is the critical part)
    const inquiry = await db.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        organization: data.organization,
        serviceType: data.serviceType,
        message: data.message,
        status: 'NEW',
      },
    });

    // Email notification requires RESEND_API_KEY environment variable
    // This is documented in .env.example but not required for core functionality
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      // Async email notification (non-blocking)
      sendInquiryEmail(data, inquiry.id, resendApiKey).catch(err => {
        console.error('Email sending failed:', err);
        // Update inquiry with email error asynchronously
        db.inquiry.update({
          where: { id: inquiry.id },
          data: {
            emailError: err instanceof Error ? err.message : 'Unknown error',
          },
        }).catch(updateErr => console.error('Failed to update email status:', updateErr));
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry received. We will respond within 2-3 business days.',
      id: inquiry.id 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid inquiry data', details: error.issues }, { status: 400 });
    }
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Email notification function - requires RESEND_API_KEY and resend package
// This is optional functionality - database persistence works without it
async function sendInquiryEmail(data: z.infer<typeof inquirySchema>, inquiryId: string, resendApiKey: string) {
  try {
    // @ts-ignore - Dynamic import for optional dependency
    const resendModule = await import('resend').catch(() => null);
    if (!resendModule) {
      console.warn('Resend package not installed - email notification skipped');
      return;
    }
    
    // @ts-ignore - Optional dependency
    const Resend = resendModule.Resend;
    // @ts-ignore - Optional dependency
    const resend = new Resend(resendApiKey);
    
    await resend.emails.send({
      from: 'EnvEvidence <inquiries@envevidence.com>',
      to: 'rutturat@gmail.com',
      subject: `New Professional Inquiry: ${data.serviceType || 'General'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Professional Inquiry</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Organization:</strong> ${data.organization || 'Not specified'}</p>
            <p><strong>Service Type:</strong> ${data.serviceType || 'General inquiry'}</p>
            <p><strong>Reference ID:</strong> ${inquiryId}</p>
            <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
          </div>
          <h3 style="color: #374151;">Message:</h3>
          <p style="color: #6b7280; line-height: 1.6;">${data.message}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">This inquiry was submitted via EnvEvidence Professional Intelligence portal.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
