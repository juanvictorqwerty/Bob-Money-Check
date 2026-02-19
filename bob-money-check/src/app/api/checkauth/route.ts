import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { token } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
    const body = await request.json();
    const authToken = body.authToken;

    if (!authToken) {
        return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 401 });
    }

    const result = await db.select()
        .from(token)
        .where(eq(token.token, authToken))
        .limit(1);

    // Token not found or has been invalidated
    if (result.length === 0 || result[0].dateEnded) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
    } catch (error) {
        // Database connection failed - likely offline
        console.error('Database check failed:', error);
        return NextResponse.json({ valid: false, offline: true }, { status: 503 });
    }
}
