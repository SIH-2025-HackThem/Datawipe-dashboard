import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardOverview from "@/components/dashboard/overview"
import TopbarActions from "@/components/dashboard/topbar-actions"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your data wiping operations</p>
          </div>
          <TopbarActions />
        </div>
        <DashboardOverview />
      </div>
    </main>
  )
}


