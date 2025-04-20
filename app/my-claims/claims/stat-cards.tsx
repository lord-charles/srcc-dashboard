"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpIcon, BanknoteIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Claim } from "@/types/claim"

interface ClaimsStatCardsProps {
  claims: Claim[]
}

export function ClaimsStatCards({ claims }: ClaimsStatCardsProps) {
  // For animation of numbers
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  })

  // Calculate statistics
  const totalClaims = claims.length
  const totalAmount = claims.reduce((sum, claim) => sum + claim.amount, 0)

  const rejectedClaims = claims.filter((claim) => claim.status === "rejected").length
  const approvedClaims = claims.filter((claim) => claim.status === "approved").length
  const pendingClaims = claims.filter((claim) =>  claim.status.includes("pending")).length

  // Get the most common currency
  const currencies = claims.map((claim) => claim.currency)
  const mostCommonCurrency =
    currencies.length > 0
      ? currencies
          .sort((a, b) => currencies.filter((v) => v === a).length - currencies.filter((v) => v === b).length)
          .pop()
      : "KES"

  // Calculate trend (for demonstration - in a real app this would compare to previous period)
  const trend = 12.5

  // Animate the counters
  useEffect(() => {
    const animateCounts = () => {
      setCounts({
        total: totalClaims,
        approved: approvedClaims,
        rejected: rejectedClaims,
        pending: pendingClaims,
      })
    }

    const timeout = setTimeout(animateCounts, 100)
    return () => clearTimeout(timeout)
  }, [totalClaims, approvedClaims, rejectedClaims, pendingClaims])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <BanknoteIcon className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{counts.total}</div>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Total value: {formatCurrency(totalAmount, mostCommonCurrency)}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-transparent">
            <CardTitle className="text-sm font-medium">Approved Claims</CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{counts.approved}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`flex items-center text-xs ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
                {trend > 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                <span>{Math.abs(trend)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">from previous period</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="overflow-hidden border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-50 to-transparent">
            <CardTitle className="text-sm font-medium">Rejected Claims</CardTitle>
            <div className="rounded-full bg-red-100 p-2">
              <XCircleIcon className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{counts.rejected}</div>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {rejectedClaims > 0
                  ? `${Math.round((rejectedClaims / totalClaims) * 100)}% of total claims`
                  : "No rejected claims"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-transparent">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <div className="rounded-full bg-amber-100 p-2">
              <ClockIcon className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{counts.pending}</div>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {pendingClaims > 0
                  ? `${Math.round((pendingClaims / totalClaims) * 100)}% of total claims`
                  : "No pending claims"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
