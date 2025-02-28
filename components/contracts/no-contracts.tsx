"use client"

import { FileX, RefreshCw } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function NoContracts() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastChecked, setLastChecked] = useState<Date>(new Date())

    const handleRefresh = () => {
        setIsRefreshing(true)
        // Simulate a refresh - in a real app, this would be an API call
        setTimeout(() => {
            setIsRefreshing(false)
            setLastChecked(new Date())
        }, 1500)
    }

    return (
        <div className="flex items-center justify-center min-h-[500px] w-full p-4 bg-gradient-to-b from-background to-muted/30">
            <Card className="max-w-md w-full border-dashed shadow-sm hover:shadow transition-all duration-300">
                <CardHeader className="space-y-1 flex flex-col items-center text-center pb-4">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-inner animate-pulse-slow">
                        <FileX className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">No Contracts Available</CardTitle>
                    <CardDescription className="text-base">
                        You don&apos;t have any contracts assigned to your account yet.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="bg-muted p-4 rounded-lg text-sm">
                        <p className="font-medium text-muted-foreground">
                            Contracts represent formal agreements between parties. When contracts are assigned to you, you&apos;ll be able
                            to:
                        </p>
                        <ul className="mt-2 space-y-1 text-left list-disc list-inside">
                            <li>Review contract terms and conditions</li>
                            <li>Track contract status and deadlines</li>
                            <li>Manage approvals and signatures</li>
                            <li>Access related documents and history</li>
                        </ul>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Last checked: {lastChecked.toLocaleTimeString()} on {lastChecked.toLocaleDateString()}
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-2">
                    <Button className="w-full gap-2" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Checking for contracts..." : "Check for new contracts"}
                    </Button>
                    <Button variant="link" className="text-sm">
                        Learn more about contracts
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

