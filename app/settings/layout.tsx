import Link from "next/link";
import React from "react";
import DashboardProvider from "../dashboard-provider";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
    <div className="flex min-h-[80vh]">
      <aside className="w-44 border-r bg-muted/30 p-4">
        <h2 className="text-sm font-semibold mb-3">Settings</h2>
        <nav className="space-y-2 text-sm">
          <Link className="block hover:underline" href="/settings">General</Link>
          <Link className="block hover:underline" href="/settings/contract-templates">Contract Templates</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
    </DashboardProvider>
  );
}
