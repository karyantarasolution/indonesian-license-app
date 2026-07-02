"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import Image from "next/image";

// Default users data
const DEFAULT_USERS = [
  {
    id: "1",
    username: "admin",
    email: "admin@perizinan.id",
    role: "admin",
    name: "Administrator",
    phone: "081234567890",
    department: "IT",
    createdAt: "2024-01-01",
    isActive: true,
    password: "admin123",
  },
  {
    id: "3",
    username: "pimpinan1",
    email: "pimpinan@perizinan.id",
    role: "pimpinan",
    name: "Pimpinan Dinas",
    phone: "081234567892",
    department: "Pimpinan",
    createdAt: "2024-01-03",
    isActive: true,
    password: "pimpinan123",
  },
];

export function SimpleLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    console.log("SimpleLoginForm mounted");
    initializeData();
  }, []);

  const initializeData = () => {
    try {
      // Check if users exist in localStorage
      const existingUsers = localStorage.getItem("users");
      if (!existingUsers) {
        localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
        console.log("Default users initialized");
      } else {
        // Migrate existing users: convert staff/pemohon to user
        try {
          const parsedUsers = JSON.parse(existingUsers);
          const migratedUsers = parsedUsers.map((user: any) => ({
            ...user,
            role:
              user.role === "staff" || user.role === "pemohon"
                ? "user"
                : user.role,
          }));
          localStorage.setItem("users", JSON.stringify(migratedUsers));
          console.log("Users migrated:", migratedUsers);
        } catch (error) {
          console.error("Error migrating users:", error);
          localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
        }
      }

      // Check if licenses exist
      const existingLicenses = localStorage.getItem("licenses");
      if (!existingLicenses) {
        localStorage.setItem("licenses", JSON.stringify([]));
        console.log("Empty licenses initialized");
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setIsLoading(true);

    console.log("🔐 Login form submitted:", { username, password: "***" });

    if (!username || !password) {
      setError("Username dan password harus diisi");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Pastikan data user sudah ter-initialize
      initializeData();

      // Get users from localStorage
      let usersData = localStorage.getItem("users");
      let users: any[] = [];

      if (!usersData) {
        // Jika tidak ada, initialize dengan default users
        localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
        users = DEFAULT_USERS;
        console.log("Users initialized with defaults");
      } else {
        try {
          users = JSON.parse(usersData);
          // Ensure we have valid users array
          if (!Array.isArray(users) || users.length === 0) {
            users = DEFAULT_USERS;
            localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
            console.log("Users array invalid, using defaults");
          }
        } catch (parseError) {
          console.error("Error parsing users:", parseError);
          users = DEFAULT_USERS;
          localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
          console.log("Error parsing users, using defaults");
        }
      }
      console.log(
        "Available users:",
        users.map((u: any) => ({
          username: u.username,
          isActive: u.isActive,
          role: u.role,
        })),
      );

      // Find user - case insensitive untuk username
      const foundUser = users.find((u: any) => {
        const usernameMatch =
          u.username &&
          u.username.toLowerCase().trim() === username.toLowerCase().trim();
        const isActive =
          u.isActive === true ||
          u.isActive === undefined ||
          u.isActive === null;
        return usernameMatch && isActive;
      });
      console.log(
        "Found user:",
        foundUser
          ? {
              username: foundUser.username,
              hasPassword: !!foundUser.password,
              role: foundUser.role,
              isActive: foundUser.isActive,
              passwordMatch: foundUser.password === password,
            }
          : null,
      );

      if (foundUser) {
        // Case sensitive untuk password
        if (foundUser.password === password) {
          // Convert old roles to new role system: staff/pemohon/user -> pimpinan
          let userRole: "admin" | "pimpinan" = foundUser.role as
            | "admin"
            | "pimpinan";
          const roleStr = foundUser.role as any;
          if (roleStr === "staff" || roleStr === "pemohon" || roleStr === "user") {
            userRole = "pimpinan";
          }

          // Ensure role is valid
          if (userRole !== "admin" && userRole !== "pimpinan") {
            userRole = "pimpinan";
          }

          const authUser = {
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            role: userRole,
            name: foundUser.name,
          };

          // Save to localStorage
          localStorage.setItem("currentUser", JSON.stringify(authUser));

          console.log("Login successful:", authUser);
          setError("");

          // Langsung redirect ke dashboard setelah login berhasil
          console.log("Redirecting to dashboard...");
          try {
            router.push("/dashboard");
            // Fallback: use window.location if router.push doesn't work
            setTimeout(() => {
              if (window.location.pathname !== "/dashboard") {
                window.location.href = "/dashboard";
              }
            }, 500);
          } catch (redirectError) {
            console.error("Router push error:", redirectError);
            window.location.href = "/dashboard";
          }
        } else {
          setError("Password salah. Silakan coba lagi.");
          console.log("Login failed: Password mismatch");
        }
      } else {
        setError(
          "Username tidak ditemukan atau akun tidak aktif. Silakan coba lagi.",
        );
        console.log("Login failed: User not found or inactive");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUsername("");
    setPassword("");
    console.log("User logged out");
  };

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

          {/* <div className="mt-6">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Demo Accounts:</p>
              <p>
                Admin: username: <code>admin</code>, password: <code>admin123</code>
              </p>
              <p>
                User: username: <code>user1</code>, password: <code>password</code>
              </p>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
