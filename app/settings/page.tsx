import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Welcome to the settings module. Select a category from the sidebar to manage specialized configurations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profile</CardTitle>
            <CardDescription>Manage your personal account settings.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground italic">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
