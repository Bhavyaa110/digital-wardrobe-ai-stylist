import { connectToDatabase } from './db';
import { OkPacket, RowDataPacket } from 'mysql2/promise';

export type User = {
    id: number;
    name: string;
    email: string;
    password: string;
};

export async function createUser(name: string, email: string, passwordHash: string): Promise<number> {
    const connection = await connectToDatabase();
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const [results] = await connection.execute<OkPacket>(query, [name, email, passwordHash]);
    return results.insertId;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    const connection = await connectToDatabase();
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await connection.execute<RowDataPacket[]>(query, [email]);
    return rows.length > 0 ? (rows[0] as User) : undefined;
}
