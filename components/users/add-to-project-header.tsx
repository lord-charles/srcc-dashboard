"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, UserPlus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { AddTeamMemberDialog } from "./add-team-member-dialog"
import { Badge } from "@/components/ui/badge"
import { User } from "@/types/user"

interface AddToProjectHeaderProps {
  selectedUser: User | null
}

export function AddToProjectHeader({ selectedUser }: AddToProjectHeaderProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)

  const projectId = searchParams.get("projectId")
  const projectName = searchParams.get("projectName")
  const returnUrl = searchParams.get("returnUrl")

  if (!projectId || !projectName) return null

  return (
    <>
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => returnUrl && router.push(returnUrl)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Add Members to {projectName}</h2>
              <p className="text-sm text-gray-400">
                Select a user from the list below to add them to the project
              </p>
            </div>
          </div>
          {selectedUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center font-semibold">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                  <span className="text-sm text-gray-400">{selectedUser.email}</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowDialog(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add to Project
              </Button>
            </div>
          )}
        </div>
      </Card>

      {selectedUser && (
        <AddTeamMemberDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          projectId={projectId}
          projectName={projectName}
          user={selectedUser}
          returnUrl={returnUrl || undefined}
        />
      )}
    </>
  )
}
