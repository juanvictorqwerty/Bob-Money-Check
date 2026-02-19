import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../drizzle/schema';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
// Debug: Check all env vars
console.log('All env vars:', {
    Host: process.env.Host,
    Port: process.env.Port,
    User: process.env.User,
    Password: process.env.Password,
    Database: process.env.Database
});

const pool = new Pool({
    host: process.env.Host,
    port: Number(process.env.Port),
    user: process.env.User || 'postgres',  // fallback
    password: process.env.Password,
    database: process.env.Database
});
    console.log(process.env.Password)
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
