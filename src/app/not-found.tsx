import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Building2, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-crypto-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card p-10 max-w-lg">
        <h1 className="text-4xl font-bold mb-6">
          <span className="text-gradient">404</span> - Page Not Found
        </h1>
        <p className="text-gray-300 mb-8">
          The property you&apos;re looking for doesn&apos;t exist or has been moved to another location.
        </p>
        <Building2 className="w-20 h-20 mx-auto text-crypto-light mb-8 opacity-50" />
        <Link href="/" passHref>
          <Button className="crypto-btn">
            <Home className="mr-2 h-4 w-4" />
            Back to Homepage
          </Button>
        </Link>
      </div>
    </div>
  )
} 