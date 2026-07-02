"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function SimpleLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Initialize data on mount
  useEffect(() => {
    console.log("🔄 Initializing login page...");

    // Set default users if not exists
    const existingUsers = localStorage.getItem("users");
    if (!existingUsers) {
      const defaultUsers = [
        {
          id: "1",
          username: "admin",
          email: "admin@perizinan.id",
          role: "admin",
          name: "Administrator",
          password: "admin123",
          isActive: true,
        },
        {
          id: "3",
          username: "pimpinan1",
          email: "pimpinan@perizinan.id",
          role: "pimpinan",
          name: "Pimpinan Dinas",
          password: "pimpinan123",
          isActive: true,
        },
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      console.log("✅ Default users created");
    }

    // Check if already logged in
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log("✅ User already logged in:", user.username);
      } catch (error) {
        console.error("❌ Error parsing saved user:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("🔐 Login attempt:", { username, password });

    try {
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get users from localStorage
      const usersData = localStorage.getItem("users");
      if (!usersData) {
        throw new Error("Data user tidak ditemukan");
      }

      const users = JSON.parse(usersData);
      console.log(
        "👥 Available users:",
        users.map((u: any) => u.username),
      );

      // Find user
      const foundUser = users.find(
        (u: any) =>
          u.username === username && u.password === password && u.isActive,
      );

      if (foundUser) {
        const authUser = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role,
          name: foundUser.name,
        };

        // Save to localStorage
        localStorage.setItem("currentUser", JSON.stringify(authUser));

        // Update state
        setCurrentUser(authUser);
        setIsLoggedIn(true);
        setError("");

        console.log("✅ Login successful:", authUser);
      } else {
        throw new Error("Username atau password salah");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error.message);
      setError(error.message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    console.log("👋 User logged out");
  };

  const handleResetData = () => {
    localStorage.clear();
    const defaultUsers = [
      {
        id: "1",
        username: "admin",
        email: "admin@perizinan.id",
        role: "admin",
        name: "Administrator",
        password: "admin123",
        isActive: true,
      },
      {
        id: "3",
        username: "pimpinan1",
        email: "pimpinan@perizinan.id",
        role: "pimpinan",
        name: "Pimpinan Dinas",
        password: "pimpinan123",
        isActive: true,
      },
    ];
    localStorage.setItem("users", JSON.stringify(defaultUsers));
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setError("");
    console.log("🔄 Data reset to defaults");
  };

  // Show success page if logged in
  if (isLoggedIn && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Login Berhasil!
            </CardTitle>
            <CardDescription>
              Selamat datang di Sistem Perizinan Indonesia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                {currentUser.name}
              </p>
              <p className="text-sm text-gray-600">Role: {currentUser.role}</p>
              <p className="text-sm text-gray-600">
                Username: {currentUser.username}
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Masuk ke Dashboard
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            MALL PELAYANAN PUBLIK
          </CardTitle>
          <CardDescription>
            Sistem Manajemen Pelayanan Perizinan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <Button
              onClick={handleResetData}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Reset Data Default
            </Button>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-2">Demo Accounts:</p>
              <div className="space-y-1">
                <p>
                  <strong>Admin:</strong> username: <code>admin</code>,
                  password: <code>admin123</code>
                </p>
                <p>
                  <strong>User:</strong> username: <code>user1</code>, password:{" "}
                  <code>password</code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
