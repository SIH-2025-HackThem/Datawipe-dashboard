import { NextResponse } from 'next/server'
import { getPublicKeyHex } from '@/lib/signing'

export async function GET() {
  return NextResponse.json({ publicKeyHex: getPublicKeyHex() })
}


