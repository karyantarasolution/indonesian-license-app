"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "pimpinan";
  name: string;
  phone?: string;
  department?: string;
  createdAt: string;
  isActive: boolean;
  password?: string;
}

interface UserContextType {
  users: User[];
  addUser: (
    user: Omit<User, "id" | "createdAt"> & { password: string },
  ) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Default users
const defaultUsers: User[] = [
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from localStorage or use defaults
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        // Convert old roles: staff/pemohon/user -> pimpinan
        const migratedUsers = parsedUsers.map((user: User) => {
          let newRole = user.role;
          const roleStr = (user.role as string);
          
          if (roleStr === "staff" || roleStr === "pemohon" || roleStr === "user") {
            newRole = "pimpinan";
          }
          
          return {
            ...user,
            role: newRole,
          };
        });
        setUsers(migratedUsers);
        // Save migrated users back to localStorage
        if (JSON.stringify(migratedUsers) !== JSON.stringify(parsedUsers)) {
          localStorage.setItem("users", JSON.stringify(migratedUsers));
        }
        console.log("Users loaded from localStorage:", migratedUsers);
      } catch (error) {
        console.error("Error parsing saved users:", error);
        setUsers(defaultUsers);
        localStorage.setItem("users", JSON.stringify(defaultUsers));
        console.log("Default users loaded:", defaultUsers);
      }
    } else {
      setUsers(defaultUsers);
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      console.log("Default users loaded:", defaultUsers);
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem("users", JSON.stringify(newUsers));
  };

  const addUser = (
    userData: Omit<User, "id" | "createdAt"> & { password: string },
  ) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    const newUsers = [...users, newUser];
    saveUsers(newUsers);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const newUsers = users.map((user) =>
      user.id === id ? { ...user, ...userData } : user,
    );
    saveUsers(newUsers);
  };

  const deleteUser = (id: string) => {
    const newUsers = users.filter((user) => user.id !== id);
    saveUsers(newUsers);
  };

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id);
  };

  const getUserByUsername = (username: string) => {
    return users.find((user) => user.username === username);
  };

  return (
    <UserContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
        getUserByUsername,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
