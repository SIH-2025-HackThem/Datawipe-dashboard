import { NextRequest, NextResponse } from 'next/server'
import { upsertDevice } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const device = await upsertDevice(body)
    return NextResponse.json(device)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to upsert device' }, { status: 500 })
  }
}


