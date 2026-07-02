// Debug utilities for the Indonesian License App

export const debugUtils = {
  // Clear all localStorage data
  clearAllData: () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("users")
    localStorage.removeItem("licenses")
    console.log("All localStorage data cleared")
  },

  // Reset to default data
  resetToDefaults: () => {
    const defaultUsers = [
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
        id: "2",
        username: "user1",
        email: "user1@perizinan.id",
        role: "user",
        name: "User Perizinan",
        phone: "081234567891",
        department: "Perizinan",
        createdAt: "2024-01-02",
        isActive: true,
        password: "password",
      },
    ]

    localStorage.setItem("users", JSON.stringify(defaultUsers))
    localStorage.removeItem("currentUser")
    console.log("Reset to default users:", defaultUsers)
  },

  // Log current state
  logCurrentState: () => {
    const currentUser = localStorage.getItem("currentUser")
    const users = localStorage.getItem("users")
    const licenses = localStorage.getItem("licenses")

    console.log("=== Current App State ===")
    console.log("Current User:", currentUser ? JSON.parse(currentUser) : null)
    console.log("Users:", users ? JSON.parse(users) : null)
    console.log("Licenses:", licenses ? JSON.parse(licenses) : null)
    console.log("=========================")
  },

  // Test login credentials
  testLogin: (username: string, password: string) => {
    const users = localStorage.getItem("users")
    if (!users) {
      console.log("No users found in localStorage")
      return false
    }

    const userList = JSON.parse(users)
    const foundUser = userList.find((u: any) => u.username === username && u.isActive)

    if (foundUser && foundUser.password === password) {
      console.log("✅ Login test successful for:", username)
      return true
    } else {
      console.log("❌ Login test failed for:", username)
      return false
    }
  },
}

// Make debug utils available globally for console access
if (typeof window !== "undefined") {
  (window as any).debugUtils = debugUtils
  console.log("Debug utilities available. Use debugUtils in console:")
  console.log("- debugUtils.clearAllData() - Clear all data")
  console.log("- debugUtils.resetToDefaults() - Reset to default users")
  console.log("- debugUtils.logCurrentState() - Log current state")
  console.log("- debugUtils.testLogin('admin', 'admin123') - Test login")
}

