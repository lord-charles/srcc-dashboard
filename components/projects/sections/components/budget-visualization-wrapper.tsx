"use client"

import { useState, useEffect } from "react"
import BudgetVisualization from "./budget-visualization"
import type { BudgetCategory } from "@/types/project"

interface BudgetVisualizationWrapperProps {
  internalFormState: {
    categories: BudgetCategory[]
    totalBudget: number
    notes: string
  }
  currency: string
}

export default function BudgetVisualizationWrapper({ internalFormState, currency }: BudgetVisualizationWrapperProps) {
  // Create a local copy of the form state to avoid direct mutation
  const [localFormState, setLocalFormState] = useState(internalFormState)

  // Update local state when the form state changes
  useEffect(() => {
    setLocalFormState(internalFormState)
  }, [internalFormState])

  return (
    <div className="mt-6 mb-8">
      <BudgetVisualization formState={localFormState} currency={currency} />
    </div>
  )
}

