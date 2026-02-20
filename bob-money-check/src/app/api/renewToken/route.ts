import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { token } from '../../../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const authToken = body.authToken;

        if (!authToken) {
            return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
        }

        // Find the token record
        const result = await db.select()
            .from(token)
            .where(eq(token.token, authToken))
            .limit(1);

        // Token not found or has been invalidated
        if (result.length === 0 || result[0].dateEnded) {
            return NextResponse.json({ success: false, error: 'Token not found or invalidated' }, { status: 401 });
        }

        // Renew the token by updating dateCreated to current timestamp
        // This effectively extends the token validity by 300 days from now
        const renewedToken = await db.update(token)
            .set({ dateCreated: sql`CURRENT_TIMESTAMP` })
            .where(eq(token.token, authToken))
            .returning();

        if (renewedToken.length === 0) {
            return NextResponse.json({ success: false, error: 'Failed to renew token' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Token renewed by 300 days' });
    } catch (error) {
        console.error('Token renewal failed:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
