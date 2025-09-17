import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DeviceDetails from "@/components/dashboard/device-details"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DevicePage({ params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Device {decodeURIComponent(params.id)}</h1>
            <p className="text-muted-foreground">Live logs, history and actions</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Back</Button>
          </Link>
        </div>
        <DeviceDetails deviceId={decodeURIComponent(params.id)} />
      </div>
    </main>
  )
}


