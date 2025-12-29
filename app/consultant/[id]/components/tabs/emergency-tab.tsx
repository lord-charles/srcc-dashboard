"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2, User } from "lucide-react"
import { useState } from "react"
import { useConsultant } from "../consultant-context"
import { useToast } from "@/hooks/use-toast"

export function EmergencyTab() {
  const { data, updateSection, saving } = useConsultant()
  const { toast } = useToast()

  const [contact, setContact] = useState({
    name: data.emergencyContact?.name || "",
    relationship: data.emergencyContact?.relationship || "",
    phoneNumber: data.emergencyContact?.phoneNumber || "",
    alternativePhoneNumber: data.emergencyContact?.alternativePhoneNumber || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSection({ emergencyContact: contact })
    toast({ title: "Success", description: "Emergency contact updated" })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Input
                value={contact.relationship}
                onChange={(e) => setContact((c) => ({ ...c, relationship: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={contact.phoneNumber}
                onChange={(e) => setContact((c) => ({ ...c, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Alternative Phone</Label>
              <Input
                value={contact.alternativePhoneNumber}
                onChange={(e) => setContact((c) => ({ ...c, alternativePhoneNumber: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2 border-t">
        <Button type="submit" disabled={saving} className="min-w-[160px]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Emergency
        </Button>
      </div>
    </form>
  )
}
