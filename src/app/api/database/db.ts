import mysql, { Connection } from 'mysql2/promise';

// Database connection credentials (replace with your actual credentials)
const dbConfig = {
    host: 'localhost',
    user: 'bhavya',
    password: 'abcdef',
    database: 'digital_wardrobe',
};

let connection: Connection;

async function connectToDatabase(): Promise<Connection> {
    if (!connection) {
        try {
            connection = await mysql.createConnection(dbConfig);
            console.log('Connected to the database.');
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw error;
        }
    }
    return connection;
}

// Export the connect function to get the database connection
export { connectToDatabase };

// Optional: Close the connection when the process exits
process.on('exit', () => {
    if (connection) {
        connection.end();
        console.log('Database connection closed.');
    }
});

process.on('SIGINT', async () => {
    if (connection) {
        await connection.end();
        console.log('Database connection closed.');
    }
    process.exit(0);
});