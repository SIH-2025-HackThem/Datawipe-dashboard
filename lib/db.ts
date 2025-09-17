import { getSupabaseClient } from './supabase'

export type Device = { id: string; name?: string | null; model?: string | null; last_seen_at?: string | null; total_wipes?: number | null }
export type Wipe = { id?: string; device_id: string; status: 'in_progress' | 'completed' | 'failed'; size_gb: number; passes: number; started_at: string; ended_at?: string | null }
export type WipeLog = { wipe_id: string; ts: string; message: string }

export async function upsertDevice(device: Device) {
  const sb = getSupabaseClient()
  const { data, error } = await sb.from('devices').upsert({
    id: device.id,
    name: device.name ?? null,
    model: device.model ?? null,
    last_seen_at: device.last_seen_at ?? new Date().toISOString(),
    total_wipes: device.total_wipes ?? null,
  }).select().single()
  if (error) throw error
  return data as Device
}

export async function createWipe(wipe: Wipe) {
  const sb = getSupabaseClient()
  const { data, error } = await sb.from('wipes').insert({
    device_id: wipe.device_id,
    status: wipe.status,
    size_gb: wipe.size_gb,
    passes: wipe.passes,
    started_at: wipe.started_at,
    ended_at: wipe.ended_at ?? null,
  }).select().single()
  if (error) throw error
  return data as Wipe
}

export async function updateWipe(id: string, patch: Partial<Wipe>) {
  const sb = getSupabaseClient()
  const { data, error } = await sb.from('wipes').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Wipe
}

export async function addWipeLog(log: WipeLog) {
  const sb = getSupabaseClient()
  const { data, error } = await sb.from('wipe_logs').insert(log).select().single()
  if (error) throw error
  return data as WipeLog
}


