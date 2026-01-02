// src/app/api/database/user.ts
import { supabase } from '../../../lib/supabase';

export async function createUser(name: string, email: string, passwordHash: string) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password_hash: passwordHash }])
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
  return data || undefined;
}