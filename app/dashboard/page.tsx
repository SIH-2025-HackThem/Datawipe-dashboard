import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Your authenticated dashboard goes here.</p>
      </div>
    </main>
  )
}


