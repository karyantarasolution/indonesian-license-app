"use client";

import type React from "react";

import { useState } from "react";
import { useUsers } from "@/contexts/user-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import type { User } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";

interface UserFormData {
  username: string;
  email: string;
  name: string;
  phone: string;
  department: string;
  role: "admin" | "pimpinan";
  isActive: boolean;
  password: string;
}

function UserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<UserFormData>({
    username: user?.username || "",
    email: user?.email || "",
    name: user?.name || "",
    phone: user?.phone || "",
    department: user?.department || "",
    role:
      ((user?.role as string) === "staff" ||
      (user?.role as string) === "pemohon" ||
      (user?.role as string) === "user"
        ? "pimpinan"
        : user?.role) || "pimpinan",
    isActive: user?.isActive ?? true,
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required={!user}
          placeholder={
            user
              ? "Kosongkan jika tidak ingin mengubah password"
              : "Masukkan password"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">No. Telepon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Departemen</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "admin" | "pimpinan") =>
              setFormData({ ...formData, role: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="pimpinan">Pimpinan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="isActive">Status Aktif</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <span className="text-sm">
              {formData.isActive ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{user ? "Update" : "Tambah"} User</Button>
      </div>
    </form>
  );
}

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterType, setFilterType] = useState<"all" | "active" | "admin">(
    "all",
  );
  const { toast } = useToast();

  const isCurrentUserAdmin = currentUser?.role === "admin";

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all"
        ? true
        : filterType === "active"
          ? user.role === "pimpinan"
          : filterType === "admin"
            ? user.role === "admin"
            : true;

    return matchesSearch && matchesFilter;
  });

  const handleAddUser = (userData: UserFormData) => {
    if (!isCurrentUserAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menambahkan user baru.",
        variant: "destructive",
      });
      return;
    }
    // Ensure role is converted: staff/pemohon/user -> pimpinan
    const finalUserData = {
      ...userData,
      role:
        (userData.role as string) === "staff" ||
        (userData.role as string) === "pemohon" ||
        (userData.role as string) === "user"
          ? "pimpinan"
          : userData.role,
    };
    addUser(finalUserData);
    setIsAddDialogOpen(false);
  };

  const handleUpdateUser = (userData: UserFormData) => {
    if (!isCurrentUserAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat mengedit user.",
        variant: "destructive",
      });
      return;
    }
    if (editingUser) {
      // Ensure role is converted: staff/pemohon -> user
      const finalUserData = {
        ...userData,
        role:
          (userData.role as any) === "staff" ||
          (userData.role as any) === "pemohon" ||
          (userData.role as any) === "user"
            ? "pimpinan"
            : userData.role,
      };
      updateUser(editingUser.id, finalUserData);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (!isCurrentUserAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menghapus user.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser?.id === id) {
      toast({
        title: "Aksi Tidak Diizinkan",
        description: "Anda tidak dapat menghapus akun Anda sendiri.",
        variant: "destructive",
      });
      return;
    }

    deleteUser(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen User</h2>
          <p className="text-gray-600">Kelola user dan hak akses sistem</p>
        </div>
        <div className="flex space-x-2">
          {isCurrentUserAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah User Baru</DialogTitle>
                </DialogHeader>
                <UserForm
                  onSubmit={handleAddUser}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filterType === "all" ? "ring-2 ring-blue-500 bg-blue-50" : ""
          }`}
          onClick={() => setFilterType("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filterType === "active" ? "ring-2 ring-green-500 bg-green-50" : ""
          }`}
          onClick={() => setFilterType("active")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "pimpinan").length}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filterType === "admin" ? "ring-2 ring-purple-500 bg-purple-50" : ""
          }`}
          onClick={() => setFilterType("admin")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Cari user berdasarkan nama, username, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {isCurrentUserAdmin && (
                        <Dialog
                          open={editingUser?.id === user.id}
                          onOpenChange={(open) => !open && setEditingUser(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <UserForm
                              user={user}
                              onSubmit={handleUpdateUser}
                              onCancel={() => setEditingUser(null)}
                            />
                          </DialogContent>
                        </Dialog>
                      )}

                      {isCurrentUserAdmin && currentUser?.id !== user.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus User</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus user {user.name}
                              ? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {!isCurrentUserAdmin && (
                        <span className="text-sm text-gray-500 italic"></span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
