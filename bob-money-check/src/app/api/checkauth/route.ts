import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { token, users } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
    const body = await request.json();
    const authToken = body.authToken;

    if (!authToken) {
        return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 401 });
    }

    const result = await db.select({
            tokenValid: token.token,
            role: users.role,
        })
        .from(token)
        .innerJoin(users, eq(token.userId, users.id))
        .where(eq(token.token, authToken))
        .limit(1);

    // Token not found or has been invalidated
    if (result.length === 0 || result[0].tokenValid === null || result[0].tokenValid === undefined) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Check if token has ended
    const tokenResult = await db.select()
        .from(token)
        .where(eq(token.token, authToken))
        .limit(1);

    if (tokenResult.length === 0 || tokenResult[0].dateEnded) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true, role: result[0].role });
    } catch (error) {
        // Database connection failed - likely offline
        console.error('Database check failed:', error);
        return NextResponse.json({ valid: false, offline: true }, { status: 503 });
    }
}
