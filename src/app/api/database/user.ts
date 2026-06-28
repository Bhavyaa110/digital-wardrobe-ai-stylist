import pool from './db';
import bcrypt from 'bcryptjs';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
};

export async function createUser(name: string, email: string, password: string): Promise<string> {
  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashed]
  ) as any;
  
  // Fetch the inserted row to get the UUID
  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  ) as any;
  
  return rows[0].id;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) as any;
  return rows[0] || undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [rows] = await pool.execute(
    'SELECT id, name, email, created_at FROM users WHERE id = ?',
    [id]
  ) as any;
  return rows[0] || undefined;
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}