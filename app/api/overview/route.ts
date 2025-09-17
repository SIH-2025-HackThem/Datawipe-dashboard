import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    let sb
    try {
      sb = getSupabaseClient()
    } catch (e) {
      // Env not configured – return safe fallbacks so UI can render seeds
      return NextResponse.json({
        stats: { totalWipes: 0, scheduled: 0, activeAgents: 0, failures24: 0, completionPercent: 0 },
        recentDevices: [],
        recentWipes: [],
        connectedDevices: [],
      })
    }

    const sinceIso = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const [wipes24Res, totalCountRes, scheduledCountRes, failures24Res, devicesRes, recentWipesRes] = await Promise.all([
      sb.from('wipes').select('id').gte('started_at', sinceIso),
      sb.from('wipes').select('*', { count: 'exact', head: true }),
      sb.from('wipes').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      sb.from('wipes').select('id').gte('started_at', sinceIso).eq('status', 'failed'),
      sb.from('devices').select('*').order('last_seen_at', { ascending: false }).limit(10),
      sb.from('wipes').select('id, device_id, status, size_gb, started_at').order('started_at', { ascending: false }).limit(10),
    ])

    const totalCount = (totalCountRes as any)?.count ?? 0
    const scheduledCount = (scheduledCountRes as any)?.count ?? 0
    const devices = (devicesRes as any)?.data || []
    const recentWipes = (recentWipesRes as any)?.data || []

    const activeAgents = devices.length
    const failures24 = ((failures24Res as any)?.data || []).length
    const completedCountRes = await sb.from('wipes').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    const completedCount = (completedCountRes as any)?.count ?? 0
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return NextResponse.json({
      stats: {
        totalWipes: totalCount,
        scheduled: scheduledCount,
        activeAgents,
        failures24,
        completionPercent,
      },
      recentDevices: devices,
      recentWipes,
      connectedDevices: devices.slice(0, 5),
    })
  } catch (e) {
    return NextResponse.json({
      stats: { totalWipes: 0, scheduled: 0, activeAgents: 0, failures24: 0, completionPercent: 0 },
      recentDevices: [],
      recentWipes: [],
      connectedDevices: [],
    })
  }
}


