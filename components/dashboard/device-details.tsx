'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import * as ed from '@noble/ed25519'

type LogEntry = { ts: string; message: string }
type HistoryEntry = { when: string; sizeGb: number; passes: number }

export default function DeviceDetails({ deviceId }: { deviceId: string }) {
  const [connected, setConnected] = React.useState(true)
  const [logs, setLogs] = React.useState<LogEntry[]>([
    { ts: new Date().toLocaleTimeString(), message: 'Agent connected' },
  ])
  const [history, setHistory] = React.useState<HistoryEntry[]>([
    { when: '2 days ago', sizeGb: 128, passes: 3 },
  ])
  const [wiping, setWiping] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [pdfBusy, setPdfBusy] = React.useState(false)
  const [verifyBusy, setVerifyBusy] = React.useState(false)
  const [verifyJson, setVerifyJson] = React.useState('')
  const [verifyHash, setVerifyHash] = React.useState('')
  const [verifyResult, setVerifyResult] = React.useState<null | 'ok' | 'fail'>(null)
  const [serverPubKeyHex, setServerPubKeyHex] = React.useState<string | null>(null)
  const [serverSignatureHex, setServerSignatureHex] = React.useState<string | null>(null)

  const wipeIdRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!wiping) return
    const start = async () => {
      setLogs((l) => [...l, { ts: new Date().toLocaleTimeString(), message: 'Wipe started' }])
      try {
        await fetch('/api/devices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: deviceId, name: deviceId, model: null, last_seen_at: new Date().toISOString() }) })
        const wipeRes = await fetch('/api/wipes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ device_id: deviceId, status: 'in_progress', size_gb: 128, passes: 3, started_at: new Date().toISOString() }) })
        const wipeJson = await wipeRes.json()
        wipeIdRef.current = wipeJson.id as string
        await fetch('/api/wipes', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ wipe_id: wipeIdRef.current!, ts: new Date().toISOString(), message: 'Wipe started' }) })
      } catch (e) {
        console.error('DB init failed', e)
      }

      const steps = [
        'Enumerating volumes',
        'Locking filesystem',
        'Pass 1/3 in progress',
        'Pass 2/3 in progress',
        'Pass 3/3 in progress',
        'Verifying integrity',
        'Finalizing and unlocking',
      ]

      let idx = 0
      const interval = setInterval(async () => {
        setProgress((p) => Math.min(100, p + 8))
        if (idx < steps.length) {
          const message = steps[idx++]
          setLogs((l) => [...l, { ts: new Date().toLocaleTimeString(), message }])
          try {
            if (wipeIdRef.current) {
              await fetch('/api/wipes', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ wipe_id: wipeIdRef.current, ts: new Date().toISOString(), message }) })
            }
          } catch (e) {
            console.error('DB add log failed', e)
          }
        }
      }, 500)

      const done = setTimeout(async () => {
        setWiping(false)
        setProgress(100)
        setLogs((l) => [
          ...l,
          { ts: new Date().toLocaleTimeString(), message: 'Wipe completed successfully' },
        ])
        setHistory((h) => [{ when: 'Just now', sizeGb: 128, passes: 3 }, ...h])
        try {
          if (wipeIdRef.current) {
            await fetch('/api/wipes', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: wipeIdRef.current, status: 'completed', ended_at: new Date().toISOString() }) })
            await fetch('/api/wipes', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ wipe_id: wipeIdRef.current, ts: new Date().toISOString(), message: 'Wipe completed successfully' }) })
          }
        } catch (e) {
          console.error('DB finalize failed', e)
        }
        clearInterval(interval)
      }, 7000)

      return () => {
        clearInterval(interval)
        clearTimeout(done)
      }
    }
    const cleanup = start()
    return () => { (async () => { const fn = await cleanup; if (typeof fn === 'function') (fn as any)() })() }
  }, [wiping, deviceId])

  React.useEffect(() => {
    // Fetch server public key once for verification
    fetch('/api/sign/public-key').then(r => r.json()).then(d => setServerPubKeyHex(d.publicKeyHex)).catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Device Info</CardTitle>
              <CardDescription>ID: {deviceId}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={async () => {
                setPdfBusy(true)
                try {
                  // Prepare certificate data
                  const cert = {
                    deviceId,
                    generatedAt: new Date().toISOString(),
                    history,
                  }
                  const certString = JSON.stringify(cert)
                  const enc = new TextEncoder().encode(certString)
                  const digest = await crypto.subtle.digest('SHA-256', enc)
                  const hashArray = Array.from(new Uint8Array(digest))
                  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

                  // Ask server to sign the digest
                  let signatureHex: string | null = null
                  try {
                    const res = await fetch('/api/sign', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ digestHex: hashHex }) })
                    if (res.ok) {
                      const j = await res.json()
                      signatureHex = j.signatureHex
                      setServerSignatureHex(signatureHex)
                      if (!serverPubKeyHex) setServerPubKeyHex(j.publicKeyHex)
                    }
                  } catch {}

                  // Generate professional PDF using custom template
                  const { generateWipeCertificatePDF } = await import('@/lib/pdf-template')
                  
                  const certificateData = {
                    deviceId,
                    generatedAt: new Date(),
                    hashHex,
                    signatureHex: signatureHex || undefined,
                    history
                  }
                  
                  const doc = generateWipeCertificatePDF(certificateData)
                  doc.save(`wipe-certificate-${deviceId}.pdf`)
                } catch (e) {
                  console.error(e)
                  alert('PDF generation failed. Please ensure jsPDF is installed.')
                } finally {
                  setPdfBusy(false)
                }
              }} disabled={pdfBusy}>{pdfBusy ? 'Generating…' : 'Generate PDF'}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            {connected ? <Badge variant="secondary">Connected</Badge> : <Badge variant="destructive">Disconnected</Badge>}
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={wiping} onClick={() => { setProgress(0); setWiping(true) }}>Start Wipe</Button>
            <Button variant="outline" onClick={() => setConnected((c) => !c)}>
              {connected ? 'Simulate Disconnect' : 'Simulate Reconnect'}
            </Button>
          </div>
          {wiping && (
            <div className="mt-4">
              <div className="mb-1 text-sm">Wipe Progress</div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wipe History</CardTitle>
          <CardDescription>Previous operations on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="text-muted-foreground">{h.when}</div>
                <div className="font-medium">{h.sizeGb} GB • {h.passes} passes</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Live Logs</CardTitle>
          <CardDescription>Agent output and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-72 overflow-auto rounded-lg border bg-background p-3 text-xs leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-3">
                <span className="text-muted-foreground whitespace-nowrap">{log.ts}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
          <CardDescription>Paste the JSON payload OR the 64-char SHA-256, plus either SHA-256 or signature (hex)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <textarea
              value={verifyJson}
              onChange={(e) => setVerifyJson(e.target.value)}
              placeholder='Paste JSON payload OR 64-char SHA-256 hex'
              className="min-h-28 w-full rounded-md border bg-background p-2 font-mono text-xs"
            />
            <input
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value.trim())}
              placeholder="Expected SHA-256 hex OR server signature hex"
              className="w-full rounded-md border bg-background p-2 font-mono text-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" disabled={verifyBusy} onClick={async () => {
                setVerifyBusy(true)
                setVerifyResult(null)
                try {
                  const input = verifyJson.trim()
                  const looksLikeHex = /^[0-9a-fA-F]+$/.test(input)
                  let msgBytes: Uint8Array
                  let hashHex: string
                  if (looksLikeHex && input.length === 64) {
                    // Treat as digest hex directly
                    msgBytes = new Uint8Array(input.match(/.{1,2}/g)!.map(h => parseInt(h, 16)))
                    hashHex = input.toLowerCase()
                  } else {
                    const enc = new TextEncoder().encode(input)
                    const digest = await crypto.subtle.digest('SHA-256', enc)
                    msgBytes = new Uint8Array(digest)
                    const hashArray = Array.from(msgBytes)
                    hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
                  }
                  // If the second input looks like a signature (>= 128 hex chars), verify signature; otherwise compare against hash
                  const trimmed = verifyHash.trim()
                  if (serverPubKeyHex && /^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length >= 128) {
                    const sig = new Uint8Array(trimmed.match(/.{1,2}/g)!.map(h => parseInt(h, 16)))
                    const pub = new Uint8Array(serverPubKeyHex.match(/.{1,2}/g)!.map(h => parseInt(h, 16)))
                    const ok = await ed.verify(sig, msgBytes, pub)
                    setVerifyResult(ok ? 'ok' : 'fail')
                  } else {
                    setVerifyResult(hashHex.toLowerCase() === trimmed.toLowerCase() ? 'ok' : 'fail')
                  }
                } catch (e) {
                  console.error(e)
                  setVerifyResult('fail')
                } finally {
                  setVerifyBusy(false)
                }
              }}>{verifyBusy ? 'Verifying…' : 'Verify'}</Button>
              {verifyResult === 'ok' && <Badge variant="secondary">Valid</Badge>}
              {verifyResult === 'fail' && <Badge variant="destructive">Invalid</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


