import { NextRequest, NextResponse } from 'next/server'
import { signBytes, getPublicKeyHex } from '@/lib/signing'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Accept either a precomputed hex digest or the JSON payload to hash
    let payloadJson: string | undefined = body?.payloadJson
    let digestHex: string | undefined = body?.digestHex

    if (!digestHex && !payloadJson) {
      return NextResponse.json({ error: 'payloadJson or digestHex required' }, { status: 400 })
    }

    if (!digestHex && payloadJson) {
      const enc = new TextEncoder().encode(payloadJson)
      const digestBuffer = await crypto.subtle.digest('SHA-256', enc)
      const digestArray = Array.from(new Uint8Array(digestBuffer))
      digestHex = digestArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    const digestBytes = new Uint8Array(digestHex!.match(/.{1,2}/g)!.map((h: string) => parseInt(h, 16)))
    const signature = signBytes(digestBytes)
    const signatureHex = Buffer.from(signature).toString('hex')

    return NextResponse.json({ signatureHex, publicKeyHex: getPublicKeyHex(), digestHex })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to sign' }, { status: 500 })
  }
}


