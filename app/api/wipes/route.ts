import { NextRequest, NextResponse } from 'next/server'
import { addWipeLog, createWipe, updateWipe } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const wipe = await createWipe(body)
    return NextResponse.json(wipe)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create wipe' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...patch } = body
    const wipe = await updateWipe(id, patch)
    return NextResponse.json(wipe)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update wipe' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const log = await addWipeLog(body)
    return NextResponse.json(log)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add log' }, { status: 500 })
  }
}


