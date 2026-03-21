import dotenv from 'dotenv';
dotenv.config();

export default {
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
    databaseUrl: process.env.DATABASE_URL,
};
