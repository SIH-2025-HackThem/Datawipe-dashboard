'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

type RecentWipe = {
  id: string
  target: string
  status: 'Completed' | 'In Progress' | 'Failed'
  sizeGb: number
  startedAt: string
}

const recentWipesSeed: RecentWipe[] = [
  { id: 'W-1024', target: 'SRV-12', status: 'Completed', sizeGb: 256, startedAt: '09:12' },
  { id: 'W-1025', target: 'LAP-07', status: 'In Progress', sizeGb: 64, startedAt: '09:35' },
  { id: 'W-1026', target: 'SRV-19', status: 'Completed', sizeGb: 512, startedAt: '10:02' },
  { id: 'W-1027', target: 'SRV-03', status: 'Failed', sizeGb: 128, startedAt: '10:18' },
  { id: 'W-1028', target: 'VM-21', status: 'Completed', sizeGb: 80, startedAt: '10:44' },
]

const dailyThroughput = [
  { day: 'Mon', wipes: 18 },
  { day: 'Tue', wipes: 22 },
  { day: 'Wed', wipes: 16 },
  { day: 'Thu', wipes: 28 },
  { day: 'Fri', wipes: 35 },
  { day: 'Sat', wipes: 12 },
  { day: 'Sun', wipes: 9 },
]

export function DashboardOverview() {
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<{ totalWipes: number; scheduled: number; activeAgents: number; failures24: number; completionPercent?: number } | null>(null)
  const [recentDevices, setRecentDevices] = React.useState<any[]>([])
  const [connectedDevices, setConnectedDevices] = React.useState<any[]>([])
  const [recentWipes, setRecentWipes] = React.useState<any[]>([])
  const completionPercent = 76

  React.useEffect(() => {
    fetch('/api/overview').then(r => r.json()).then(d => {
      setStats(d.stats)
      setRecentDevices(d.recentDevices || [])
      setConnectedDevices(d.connectedDevices || [])
      setRecentWipes(d.recentWipes || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Wipes</CardTitle>
            <CardDescription>Cumulative successful secure wipes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? <Skeleton className="h-7 w-16" /> : stats?.totalWipes ?? 0}</div>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary">+4.2% this week</Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled</CardTitle>
            <CardDescription>Queued for execution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? <Skeleton className="h-7 w-10" /> : stats?.scheduled ?? 0}</div>
          </CardContent>
          <CardFooter>
            <Badge>Auto-window 22:00 - 04:00</Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Agents</CardTitle>
            <CardDescription>Online wiping nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? <Skeleton className="h-7 w-10" /> : stats?.activeAgents ?? 0}</div>
          </CardContent>
          <CardFooter>
            <Badge variant="outline">2 updating</Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failures</CardTitle>
            <CardDescription>Last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? <Skeleton className="h-7 w-10" /> : stats?.failures24 ?? 0}</div>
          </CardContent>
          <CardFooter>
            <Badge variant="destructive">Investigate</Badge>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Throughput</CardTitle>
            <CardDescription>Number of secure wipes completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                wipes: { label: 'Wipes', color: 'hsl(var(--primary))' },
              }}
            >
              <LineChart data={dailyThroughput} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} width={30} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="wipes" stroke="var(--color-wipes)" strokeWidth={2} dot={false} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Overall Completion</CardTitle>
            <CardDescription>All scheduled jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{stats?.completionPercent ?? 0}%</span>
            </div>
            <Progress value={stats?.completionPercent ?? 0} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Completed</div>
              <div className="justify-self-end font-medium">—</div>
              <div className="text-muted-foreground">Pending</div>
              <div className="justify-self-end font-medium">—</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Wipes</CardTitle>
          <CardDescription>Latest jobs across your fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loading ? [] : (recentWipes.length ? recentWipes : recentWipesSeed)).map((w: any) => (
                <TableRow key={w.id}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.device_id ?? w.target}</TableCell>
                  <TableCell>
                    {(w.status === 'completed' || w.status === 'Completed') && (
                      <Badge variant="secondary">{w.status}</Badge>
                    )}
                    {(w.status === 'in_progress' || w.status === 'In Progress') && <Badge>{w.status}</Badge>}
                    {(w.status === 'failed' || w.status === 'Failed') && (
                      <Badge variant="destructive">{w.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{(w.size_gb ?? w.sizeGb) ?? 0} GB</TableCell>
                  <TableCell>{new Date(w.started_at ?? w.startedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Devices</CardTitle>
            <CardDescription>Newly seen devices in the last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {(loading ? [] : (recentDevices.length ? recentDevices : [{ id: 'SRV-22', model: 'Dell R740', last_seen_at: new Date().toISOString() }, { id: 'LAP-18', model: 'Lenovo T14', last_seen_at: new Date().toISOString() }, { id: 'VM-33', model: 'Ubuntu 22.04', last_seen_at: new Date().toISOString() }])).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{d.id}</div>
                    <div className="text-xs text-muted-foreground">{d.model ?? 'Unknown model'}</div>
                  </div>
                  <Badge variant="outline">{new Date(d.last_seen_at).toLocaleTimeString()}</Badge>
                </div>
              ))}
              {loading && (
                <div className="py-3">
                  <Skeleton className="h-5 w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
            <CardDescription>Click a device to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {(loading ? [] : (connectedDevices.length ? connectedDevices : [{ id: 'SRV-12', model: 'Dell R730', status: 'Online' }, { id: 'SRV-19', model: 'HP DL380', status: 'Online' }, { id: 'LAP-07', model: 'MacBook Pro', status: 'Busy' }])).map((d: any) => (
                <a key={d.id} href={`/dashboard/devices/${encodeURIComponent(d.id)}`} className="flex items-center justify-between py-3 hover:opacity-90">
                  <div>
                    <div className="font-medium">{d.id}</div>
                    <div className="text-xs text-muted-foreground">{d.model ?? 'Unknown model'}</div>
                  </div>
                  {d.status === 'Online' ? (
                    <Badge variant="secondary">Online</Badge>
                  ) : (
                    <Badge>Busy</Badge>
                  )}
                </a>
              ))}
              {loading && (
                <div className="py-3">
                  <Skeleton className="h-5 w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardOverview


