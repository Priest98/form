export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const responses = await prisma.surveyResponse.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(responses);
  } catch (error: any) {
    console.error("Admin fetch error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
