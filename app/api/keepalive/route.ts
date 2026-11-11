// app/api/keepalive/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Health check & Keep-alive endpoint
 * Dipanggil secara berkala oleh Cron-job.org / UptimeRobot
 * untuk mencegah Supabase Free Tier auto-pause.
 */
export async function GET() {
  const startTime = Date.now();
  try {
    // Query ringan (head only) untuk memicu aktivitas database Supabase
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      status: 'ok',
      database: error ? 'reachable_with_warning' : 'connected',
      message: 'ScholarFlow & Supabase active keep-alive ping successful',
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err?.message || 'Keep-alive ping failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
