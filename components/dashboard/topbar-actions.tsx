'use client'

import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function TopbarActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/">
        <Button variant="outline" size="sm">Home</Button>
      </Link>
      <SignOutButton>
        <Button size="sm" variant="destructive">Logout</Button>
      </SignOutButton>
    </div>
  )
}


