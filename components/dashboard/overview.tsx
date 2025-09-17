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
  const completionPercent = 76

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Wipes</CardTitle>
            <CardDescription>Cumulative successful secure wipes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,248</div>
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
            <div className="text-3xl font-bold">37</div>
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
            <div className="text-3xl font-bold">14</div>
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
            <div className="text-3xl font-bold">3</div>
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
              <span className="text-sm font-medium">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Completed</div>
              <div className="justify-self-end font-medium">282</div>
              <div className="text-muted-foreground">Pending</div>
              <div className="justify-self-end font-medium">88</div>
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
              {recentWipesSeed.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.target}</TableCell>
                  <TableCell>
                    {w.status === 'Completed' && (
                      <Badge variant="secondary">{w.status}</Badge>
                    )}
                    {w.status === 'In Progress' && <Badge>{w.status}</Badge>}
                    {w.status === 'Failed' && (
                      <Badge variant="destructive">{w.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{w.sizeGb} GB</TableCell>
                  <TableCell>{w.startedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardOverview


