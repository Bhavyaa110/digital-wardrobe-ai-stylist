import pool from './db';

export async function getCalendarPlansFromDb(userId: string) {
  const [rows] = await pool.execute(
    'SELECT date, outfit_id FROM calendar_plans WHERE user_id = ?',
    [userId]
  ) as any;

  // Return as { "yyyy-MM-dd": outfitId }
  const result: Record<string, string> = {};
  for (const r of rows) {
    const dateStr = new Date(r.date).toISOString().slice(0, 10);
    result[dateStr] = r.outfit_id;
  }
  return result;
}

export async function setCalendarPlanInDb(userId: string, date: string, outfitId: string) {
  // INSERT or UPDATE if date already exists for this user
  await pool.execute(
    `INSERT INTO calendar_plans (user_id, date, outfit_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE outfit_id = VALUES(outfit_id)`,
    [userId, date, outfitId]
  );
}

export async function deleteCalendarPlanFromDb(userId: string, date: string) {
  await pool.execute(
    'DELETE FROM calendar_plans WHERE user_id = ? AND date = ?',
    [userId, date]
  );
}