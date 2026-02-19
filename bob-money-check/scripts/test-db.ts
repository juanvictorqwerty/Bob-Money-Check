import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../drizzle/schema';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') })
// Debug: Check all env vars
console.log('All env vars:', {
    Host: process.env.DB_HOST,
    Port: process.env.DB_PORT,
    User: process.env.DB_USER,
    Password: process.env.DB_PASSWORD,
    Database: process.env.Database
});

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER || 'postgres',  // fallback
    password: process.env.DB_PASSWORD,
    database: process.env.Database
});
    const db = drizzle(pool);

    async function test() {
    try {
        const result = await db.select().from(users);
        console.log('✅ Connected! Result:', result);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
    }

    test();
