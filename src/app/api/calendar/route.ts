import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  getCalendarPlansFromDb,
  setCalendarPlanInDb,
  deleteCalendarPlanFromDb,
} from '../database/calendar';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

function getUserId(request: NextRequest): string | null {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

// GET /api/calendar — fetch all planned outfits for user
export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({}, { status: 200 });

  try {
    const plans = await getCalendarPlansFromDb(userId);
    return NextResponse.json(plans);
  } catch (err) {
    console.error('/api/calendar GET error:', err);
    return NextResponse.json({}, { status: 200 });
  }
}

// POST /api/calendar — save outfit for a date
// body: { date: "yyyy-MM-dd", outfitId: string }
export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { date, outfitId } = await request.json();
    if (!date || !outfitId)
      return NextResponse.json({ error: 'date and outfitId are required' }, { status: 400 });

    await setCalendarPlanInDb(userId, date, outfitId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('/api/calendar POST error:', err);
    return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 });
  }
}

// DELETE /api/calendar?date=yyyy-MM-dd — remove outfit from a date
export async function DELETE(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });

    await deleteCalendarPlanFromDb(userId, date);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('/api/calendar DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}