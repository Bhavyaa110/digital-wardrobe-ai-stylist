import { connectToDatabase } from '../src/app/api/database/db';
import { OkPacket, RowDataPacket } from 'mysql2/promise';

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

// Create a new user
export async function createUser(name: string, email: string, passwordHash: string): Promise<number> {
  const connection = await connectToDatabase();
  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  const [results] = await connection.execute<OkPacket>(query, [name, email, passwordHash]);
  return results.insertId;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const connection = await connectToDatabase();
  const query = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await connection.execute<RowDataPacket[]>(query, [email]);
  return rows.length > 0 ? (rows[0] as User) : undefined;
}
