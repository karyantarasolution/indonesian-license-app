"use client";

import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log("Form submitted with:", { username, password });

    if (!username || !password) {
      setError("Username dan password harus diisi");
      return;
    }

    try {
      const success = await login(username, password);
      console.log("Login result:", success);

      if (success) {
        // Redirect ke dashboard setelah login berhasil
        router.push("/dashboard");
      } else {
        setError("Username atau password salah. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 items-center justify-center">
            <Image
              src="/logo2.png"
              alt="Logo"
              width={90}
              height={90}
              className="h-20 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            SERVICE LEVEL AGREEMENT
          </CardTitle>
          <CardDescription>
            Sistem Manajemen Pelayanan Perizinan SLA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
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
                autoComplete="current-password"
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

          {/* <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium"></p>
            <p>
              Admin: username: <code>admin</code>, password: <code>admin123</code>
            </p>
            <p>
              User: username: <code>user1</code>, password: <code>password</code>
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
