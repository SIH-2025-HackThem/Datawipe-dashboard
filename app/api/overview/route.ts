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
        weeklyThroughput: [],
      })
    }

    const sinceIso = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const weekAgoIso = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    
    // Fetch all required data in parallel for better performance
    const [
      totalCountRes, 
      scheduledCountRes, 
      failures24Res, 
      devicesRes, 
      recentWipesRes,
      completedCountRes,
      weeklyWipesRes
    ] = await Promise.all([
      sb.from('wipes').select('*', { count: 'exact', head: true }),
      sb.from('wipes').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      sb.from('wipes').select('id').gte('started_at', sinceIso).eq('status', 'failed'),
      sb.from('devices').select('*').order('last_seen_at', { ascending: false }).limit(10),
      sb.from('wipes').select('id, device_id, status, size_gb, started_at').order('started_at', { ascending: false }).limit(10),
      sb.from('wipes').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      sb.from('wipes').select('started_at').gte('started_at', weekAgoIso).eq('status', 'completed')
    ])

    const totalCount = (totalCountRes as any)?.count ?? 0
    const scheduledCount = (scheduledCountRes as any)?.count ?? 0
    const devices = (devicesRes as any)?.data || []
    const recentWipes = (recentWipesRes as any)?.data || []
    const completedCount = (completedCountRes as any)?.count ?? 0
    const weeklyWipes = (weeklyWipesRes as any)?.data || []

    // Calculate active agents (devices seen in last 24 hours)
    const activeDevices = devices.filter((device: any) => {
      if (!device.last_seen_at) return false
      const lastSeen = new Date(device.last_seen_at)
      const dayAgo = new Date(Date.now() - 24 * 3600 * 1000)
      return lastSeen > dayAgo
    })

    const activeAgents = activeDevices.length
    const failures24 = ((failures24Res as any)?.data || []).length
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    // Generate weekly throughput data
    const weeklyThroughput = generateWeeklyThroughput(weeklyWipes)

    // Get recent devices (seen in last 24 hours)
    const recentDevices = devices.filter((device: any) => {
      if (!device.last_seen_at) return false
      const lastSeen = new Date(device.last_seen_at)
      const dayAgo = new Date(Date.now() - 24 * 3600 * 1000)
      return lastSeen > dayAgo
    }).slice(0, 5)

    // Get connected devices (all devices with status)
    const connectedDevices = devices.map((device: any) => ({
      ...device,
      status: activeDevices.some((active: any) => active.id === device.id) ? 'Online' : 'Offline'
    })).slice(0, 5)

    return NextResponse.json({
      stats: {
        totalWipes: totalCount,
        scheduled: scheduledCount,
        activeAgents,
        failures24,
        completionPercent,
      },
      recentDevices,
      recentWipes,
      connectedDevices,
      weeklyThroughput,
    })
  } catch (e) {
    console.error('Error fetching dashboard data:', e)
    return NextResponse.json({
      stats: { totalWipes: 0, scheduled: 0, activeAgents: 0, failures24: 0, completionPercent: 0 },
      recentDevices: [],
      recentWipes: [],
      connectedDevices: [],
      weeklyThroughput: [],
    })
  }
}

function generateWeeklyThroughput(weeklyWipes: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const throughput = days.map(day => ({ day, wipes: 0 }))
  
  weeklyWipes.forEach((wipe: any) => {
    const date = new Date(wipe.started_at)
    const dayIndex = (date.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
    if (dayIndex >= 0 && dayIndex < 7) {
      throughput[dayIndex].wipes++
    }
  })
  
  return throughput
}


