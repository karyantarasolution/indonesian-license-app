"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { debugUtils } from "@/lib/debug-utils"
import { useAuth } from "@/contexts/auth-context"
import { useUsers } from "@/contexts/user-context"
import { Bug, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react"

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const { user } = useAuth()
  const { users } = useUsers()

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 3000)
  }

  const handleResetDefaults = () => {
    try {
      debugUtils.resetToDefaults()
      showMessage("Data berhasil direset ke default", "success")
    } catch (error) {
      showMessage("Gagal reset data", "error")
    }
  }

  const handleClearAll = () => {
    try {
      debugUtils.clearAllData()
      showMessage("Semua data berhasil dihapus", "success")
    } catch (error) {
      showMessage("Gagal hapus data", "error")
    }
  }

  const handleTestLogin = () => {
    const adminTest = debugUtils.testLogin("admin", "admin123")
    const userTest = debugUtils.testLogin("user1", "password")
    
    if (adminTest && userTest) {
      showMessage("Test login berhasil untuk semua akun", "success")
    } else {
      showMessage("Test login gagal untuk beberapa akun", "error")
    }
  }

  const handleLogState = () => {
    debugUtils.logCurrentState()
    showMessage("Status data telah di-log ke console", "info")
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Debug Panel
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {message && (
          <Alert variant={messageType === "error" ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Current User:</span>
            <Badge variant={user ? "default" : "secondary"}>
              {user ? user.username : "Not logged in"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Total Users:</span>
            <Badge variant="outline">{users.length}</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="w-full"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Reset to Defaults
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="w-full"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Clear All Data
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestLogin}
            className="w-full"
          >
            <CheckCircle className="h-3 w-3 mr-2" />
            Test Login
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogState}
            className="w-full"
          >
            <Bug className="h-3 w-3 mr-2" />
            Log State
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p className="font-medium mb-1">Default Credentials:</p>
          <p>Admin: admin / admin123</p>
          <p>User: user1 / password</p>
        </div>
      </CardContent>
    </Card>
  )
}

