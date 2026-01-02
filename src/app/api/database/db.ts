import mysql, { Connection } from 'mysql2/promise';

const dbConfig = {
    // These must be set in your Vercel Project Settings
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
};

let connection: Connection;

async function connectToDatabase(): Promise<Connection> {
    if (!connection) {
        try {
            connection = await mysql.createConnection(dbConfig);
            console.log('Connected to the database.');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error; // This causes the 500 error you see in logs
        }
    }
    return connection;
}

export { connectToDatabase };