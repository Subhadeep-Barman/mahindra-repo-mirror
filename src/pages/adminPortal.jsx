"use client"

import { ArrowBack, PersonAdd, Edit, Delete, ChevronLeft, ChevronRight } from "@mui/icons-material"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PersonAdd as PersonAddIcon } from "@mui/icons-material"
import Navbar2 from "@/components/ui/navbar2"

// Update users array: teamType -> teamLocation, and values to "Chennai"/"Nashik"
const users = [
  {
    userId: "50008810", 
    email: "50008810@mahindra.com",
    name: "Rajbala",
    role: "Project Team Engine",
    teamLocation: "Chennai",
    engineType: "Diesel",
  },
  {
    userId: "25022895",
    email: "25022895@mahindra.com",
    name: "Darshit Sharma",
    role: "Project Team Engine",
    teamLocation: "Nashik",
    engineType: "Diesel",
  },
  {
    userId: "50010414",
    email: "50010414@mahindra.com",
    name: "Sanjana",
    role: "Test Bed Admin",
    teamLocation: "Chennai",
    engineType: "All",
  },
  {
    userId: "50011769",
    email: "50011769@mahindra.com",
    name: "Ludwin",
    role: "Project Team Engine",
    teamLocation: "Nashik",
    engineType: "CNG",
  },
  {
    userId: "50012345",
    email: "50012345@mahindra.com",
    name: "Priya Singh",
    role: "Test Bed Admin",
    teamLocation: "Chennai",
    engineType: "Diesel",
  },
  {
    userId: "50013456",
    email: "50013456@mahindra.com",
    name: "Amit Kumar",
    role: "Project Team Engine",
    teamLocation: "Nashik",
    engineType: "CNG",
  },
  {
    userId: "50014567",
    email: "50014567@mahindra.com",
    name: "Neha Patel",
    role: "Project Team Engine",
    teamLocation: "Chennai",
    engineType: "Diesel",
  },
  {
    userId: "50015678",
    email: "50015678@mahindra.com",
    name: "Rohit Sharma",
    role: "Test Bed Admin",
    teamLocation: "Nashik",
    engineType: "All",
  },
  {
    userId: "50016789",
    email: "50016789@mahindra.com",
    name: "Kavya Reddy",
    role: "Project Team Engine",
    teamLocation: "Chennai",
    engineType: "CNG",
  },
  {
    userId: "50017890",
    email: "50017890@mahindra.com",
    name: "Vikram Joshi",
    role: "Project Team Engine",
    teamLocation: "Nashik",
    engineType: "Diesel",
  },
  {
    userId: "50018901",
    email: "50018901@mahindra.com",
    name: "Anita Gupta",
    role: "Test Bed Admin",
    teamLocation: "Chennai",
    engineType: "All",
  },
  {
    userId: "50019012",
    email: "50019012@mahindra.com",
    name: "Suresh Nair",
    role: "Project Team Engine",
    teamLocation: "Nashik",
    engineType: "CNG",
  },
  {
    userId: "50020123",
    email: "50020123@mahindra.com",
    name: "Deepika Rao",
    role: "Project Team Engine",
    teamLocation: "Chennai",
    engineType: "Diesel",
  },
  {
    userId: "50021234",
    email: "50021234@mahindra.com",
    name: "Arjun Mehta",
    role: "Test Bed Admin",
    teamLocation: "Nashik",
    engineType: "All",
  },
  {
    userId: "50022345",
    email: "50022345@mahindra.com",
    name: "Pooja Verma",
    role: "Project Team Engine",
    teamLocation: "Chennai",
    engineType: "CNG",
  },
  {
    userId: "50023456",
    email: "50023456@mahindra.com",
    name: "Kiran Das",
    role: "Project Team Engine",
    teamLocation: "Nashik",
    engineType: "Diesel",
  },
  {
    userId: "50024567",
    email: "50024567@mahindra.com",
    name: "Ravi Tiwari",
    role: "Test Bed Admin",
    teamLocation: "Chennai",
    engineType: "All",
  },
  {
    userId: "50025678",
    email: "50025678@mahindra.com",
    name: "Shreya Iyer",
    role: "Project Team Engine",
    teamLocation: "Nashik",
    engineType: "CNG",
  },
]

const getRoleBadgeVariant = (role) => {
  switch (role) {
    case "Project Team Engine":
      return "default"
    case "Test Bed Admin":
      return "destructive"
    default:
      return "secondary"
  }
}

const getEngineTypeBadgeVariant = (engineType) => {
  switch (engineType) {
    case "Diesel":
      return "outline"
    case "All":
      return "outline"
    case "CNG":
      return "outline"
    default:
      return "secondary"
  }
}

export default function SystemUsersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    userId: "",
    email: "",
    fullName: "",
    role: "",
    teamLocation: "",
    engineType: "",
  })

  // Calculate pagination
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  const handleBack = () => {
    console.log("Navigate back")
  }

  const handleAddUser = () => {
    setIsAddUserModalOpen(true)
  }

  const handleEdit = (userId) => {
    console.log("Edit user:", userId)
  }

  const handleDelete = (userId) => {
    console.log("Delete user:", userId)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePageClick = (page) => {
    setCurrentPage(page)
  }

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false)
    setNewUser({
      userId: "",
      email: "",
      fullName: "",
      role: "",
      teamLocation: "",
      engineType: "",
    })
  }

  const handleCreateUser = () => {
    console.log("Creating user:", newUser)
    // Here you would typically make an API call to create the user
    handleCloseModal()
  }

  const handleInputChange = (field, value) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <>
     <Navbar2/>
      {/* Header */}
      <div className="bg-white dark:bg-black">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-2 border-red-500 rounded-full p-2"
                >
                <ArrowBack className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-red-500">System Users</h1>
            </div>
            <Button onClick={handleAddUser} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
              <PersonAdd className="h-4 w-4 mr-2" />
              ADD NEW USER
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">UserID</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Team Location</TableHead>
                <TableHead className="font-semibold text-gray-700">Engine Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user, index) => (
                  <TableRow key={user.userId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <TableCell className="font-medium text-gray-900">{user.userId}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-900">{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="bg-red-500 hover:bg-red-600 text-white">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.teamLocation}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getEngineTypeBadgeVariant(user.engineType)}
                      className="text-blue-600 border-blue-200 bg-blue-50"
                      >
                      {user.engineType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user.userId)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
                        >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.userId)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
                        >
                        <Delete className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        <div className="flex justify-end mt-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
                <div key={index}>
                {page === "..." ? (
                    <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                    <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className={
                        currentPage === page
                        ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                    }
                    >
                    {page}
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <PersonAddIcon className="h-5 w-5 text-green-600" />
              </div>
              Create New User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium text-gray-700 dark:text-red-500">
                User ID
              </Label>
              <Input
                id="userId"
                placeholder="User ID"
                value={newUser.userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                className="w-full"
                />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-red-500">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full"
                />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-red-500">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Full Name"
                value={newUser.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full"
                />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-red-500">
                Role
              </Label>
              <Select value={newUser.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project Team Engine">Project Team Engine</SelectItem>
                  <SelectItem value="Test Bed Admin">Test Bed Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Location */}
            <div className="space-y-2">
              <Label htmlFor="teamLocation" className="text-sm font-medium text-gray-700 dark:text-red-500">
                Team Location
              </Label>
              <Select value={newUser.teamLocation} onValueChange={(value) => handleInputChange("teamLocation", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Team Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Nashik">Nashik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Engine Type */}
            <div className="space-y-2">
              <Label htmlFor="engineType" className="text-sm font-medium text-gray-700 dark:text-red-500">
                Engine Type
              </Label>
              <Select value={newUser.engineType} onValueChange={(value) => handleInputChange("engineType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Engine Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="CNG">CNG</SelectItem>
                  <SelectItem value="All">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="px-6 py-2 border-red-500g text-white bg-red-500 hover:bg-red-50"
              >
              CANCEL
            </Button>
            <Button onClick={handleCreateUser} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white">
              CREATE USER
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}




// "use client"

// import { ArrowBack, PersonAdd, Edit, Delete, ChevronLeft, ChevronRight } from "@mui/icons-material"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card } from "@/components/ui/card"
// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { PersonAdd as PersonAddIcon } from "@mui/icons-material"
// import Navbar2 from "@/components/ui/navbar2"

// // Helper functions for badge styling
// const getRoleBadgeVariant = (role) => {
//   switch (role) {
//     case "Project Team Engine":
//       return "default"
//     case "Test Bed Admin":
//       return "destructive"
//     default:
//       return "secondary"
//   }
// }

// const getEngineTypeBadgeVariant = (engineType) => {
//   switch (engineType) {
//     case "Diesel":
//     case "All":
//     case "CNG":
//       return "outline"
//     default:
//       return "secondary"
//   }
// }

// export default function SystemUsersPage() {
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 8
//   const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
//   const [users, setUsers] = useState([]) // <-- Now users come from API
//   const [newUser, setNewUser] = useState({
//     userId: "",
//     email: "",
//     fullName: "",
//     role: "",
//     teamLocation: "",
//     engineType: "",
//   })

//   // Fetch users from backend API on mount
//   useEffect(() => {
//     fetchUsers()
//   }, [])

//   // Fetch users from backend API
//   const fetchUsers = async () => {
//     try {
//       // TODO: Replace '/api/users' with your backend endpoint
//       const res = await fetch('/api/users')
//       const data = await res.json()
//       setUsers(data)
//     } catch (err) {
//       alert("Failed to fetch users")
//     }
//   }

//   // Pagination logic
//   const totalPages = Math.ceil(users.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentUsers = users.slice(startIndex, endIndex)

//   const handleBack = () => {
//     // Navigation logic here
//   }

//   const handleAddUser = () => {
//     setIsAddUserModalOpen(true)
//   }

//   // Edit user handler (open modal and prefill)
//   const handleEdit = (userId) => {
//     const user = users.find(u => u.userId === userId)
//     if (user) {
//       setNewUser({
//         userId: user.userId,
//         email: user.email,
//         fullName: user.name, // assuming 'name' is full name
//         role: user.role,
//         teamLocation: user.teamLocation,
//         engineType: user.engineType,
//       })
//       setIsAddUserModalOpen(true)
//     }
//   }

//   // Delete user handler
//   const handleDelete = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return
//     try {
//       // TODO: Replace '/api/users' with your backend endpoint
//       await fetch(`/api/users/${userId}`, { method: "DELETE" })
//       fetchUsers()
//     } catch (err) {
//       alert("Failed to delete user")
//     }
//   }

//   const handlePreviousPage = () => {
//     setCurrentPage((prev) => Math.max(prev - 1, 1))
//   }

//   const handleNextPage = () => {
//     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//   }

//   const handlePageClick = (page) => {
//     setCurrentPage(page)
//   }

//   const handleCloseModal = () => {
//     setIsAddUserModalOpen(false)
//     setNewUser({
//       userId: "",
//       email: "",
//       fullName: "",
//       role: "",
//       teamLocation: "",
//       engineType: "",
//     })
//   }

//   // Add or update user via API
//   const handleCreateUser = async () => {
//     try {
//       // If userId exists in users, update; else, create
//       const isEdit = users.some(u => u.userId === newUser.userId)
//       // TODO: Replace '/api/users' with your backend endpoint
//       if (isEdit) {
//         await fetch(`/api/users/${newUser.userId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             ...newUser,
//             name: newUser.fullName,
//           }),
//         })
//       } else {
//         await fetch('/api/users', {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             ...newUser,
//             name: newUser.fullName,
//           }),
//         })
//       }
//       fetchUsers()
//       handleCloseModal()
//     } catch (err) {
//       alert("Failed to save user")
//     }
//   }

//   const handleInputChange = (field, value) => {
//     setNewUser((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   // Generate page numbers to display
//   const getPageNumbers = () => {
//     const pages = []
//     const maxVisiblePages = 5

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i)
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) {
//           pages.push(i)
//         }
//         pages.push("...")
//         pages.push(totalPages)
//       } else if (currentPage >= totalPages - 2) {
//         pages.push(1)
//         pages.push("...")
//         for (let i = totalPages - 3; i <= totalPages; i++) {
//           pages.push(i)
//         }
//       } else {
//         pages.push(1)
//         pages.push("...")
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pages.push(i)
//         }
//         pages.push("...")
//         pages.push(totalPages)
//       }
//     }

//     return pages
//   }

//   return (
//     <>
//       <Navbar2 />
//       {/* Header */}
//       <div className="bg-white dark:bg-black">
//         <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={handleBack}
//                 className="text-red-500 hover:text-red-600 hover:bg-red-50 border-2 border-red-500 rounded-full p-2"
//               >
//                 <ArrowBack className="h-5 w-5" />
//               </Button>
//               <h1 className="text-xl font-semibold text-gray-900 dark:text-red-500">System Users</h1>
//             </div>
//             <Button onClick={handleAddUser} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
//               <PersonAdd className="h-4 w-4 mr-2" />
//               ADD NEW USER
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <Card>
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-gray-50">
//                 <TableHead className="font-semibold text-gray-700">UserID</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Email</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Name</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Role</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Team Location</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Engine Type</TableHead>
//                 <TableHead className="font-semibold text-gray-700">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {currentUsers.map((user, index) => (
//                 <TableRow key={user.userId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
//                   <TableCell className="font-medium text-gray-900">{user.userId}</TableCell>
//                   <TableCell className="text-gray-600">{user.email}</TableCell>
//                   <TableCell className="text-gray-900">{user.name}</TableCell>
//                   <TableCell>
//                     <Badge variant={getRoleBadgeVariant(user.role)} className="bg-red-500 hover:bg-red-600 text-white">
//                       {user.role}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-gray-600">{user.teamLocation}</TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={getEngineTypeBadgeVariant(user.engineType)}
//                       className="text-blue-600 border-blue-200 bg-blue-50"
//                     >
//                       {user.engineType}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center space-x-2">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleEdit(user.userId)}
//                         className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDelete(user.userId)}
//                         className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
//                       >
//                         <Delete className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>

//         {/* Pagination */}
//         <div className="flex justify-end mt-6">
//           <div className="flex items-center space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handlePreviousPage}
//               disabled={currentPage === 1}
//               className="text-gray-600 border-gray-300 hover:bg-gray-50"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             {getPageNumbers().map((page, index) => (
//               <div key={index}>
//                 {page === "..." ? (
//                   <span className="px-3 py-1 text-gray-500">...</span>
//                 ) : (
//                   <Button
//                     variant={currentPage === page ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handlePageClick(page)}
//                     className={
//                       currentPage === page
//                         ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
//                         : "text-gray-600 border-gray-300 hover:bg-gray-50"
//                     }
//                   >
//                     {page}
//                   </Button>
//                 )}
//               </div>
//             ))}

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className="text-gray-600 border-gray-300 hover:bg-gray-50"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>
//       {/* Add/Edit User Modal */}
//       <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
//               <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
//                 <PersonAddIcon className="h-5 w-5 text-green-600" />
//               </div>
//               {users.some(u => u.userId === newUser.userId) ? "Edit User" : "Create New User"}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             {/* User ID */}
//             <div className="space-y-2">
//               <Label htmlFor="userId" className="text-sm font-medium text-gray-700 dark:text-red-500">
//                 User ID
//               </Label>
//               <Input
//                 id="userId"
//                 placeholder="User ID"
//                 value={newUser.userId}
//                 onChange={(e) => handleInputChange("userId", e.target.value)}
//                 className="w-full"
//                 disabled={users.some(u => u.userId === newUser.userId)} // Prevent editing userId on edit
//               />
//             </div>

//             {/* Email Address */}
//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-red-500">
//                 Email Address
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Email Address"
//                 value={newUser.email}
//                 onChange={(e) => handleInputChange("email", e.target.value)}
//                 className="w-full"
//               />
//             </div>

//             {/* Full Name */}
//             <div className="space-y-2">
//               <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-red-500">
//                 Full Name
//               </Label>
//               <Input
//                 id="fullName"
//                 placeholder="Full Name"
//                 value={newUser.fullName}
//                 onChange={(e) => handleInputChange("fullName", e.target.value)}
//                 className="w-full"
//               />
//             </div>

//             {/* Role */}
//             <div className="space-y-2">
//               <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-red-500">
//                 Role
//               </Label>
//               <Select value={newUser.role} onValueChange={(value) => handleInputChange("role", value)}>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Project Team Engine">Project Team Engine</SelectItem>
//                   <SelectItem value="Test Bed Admin">Test Bed Admin</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Team Location */}
//             <div className="space-y-2">
//               <Label htmlFor="teamLocation" className="text-sm font-medium text-gray-700 dark:text-red-500">
//                 Team Location
//               </Label>
//               <Select value={newUser.teamLocation} onValueChange={(value) => handleInputChange("teamLocation", value)}>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Team Location" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Chennai">Chennai</SelectItem>
//                   <SelectItem value="Nashik">Nashik</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Engine Type */}
//             <div className="space-y-2">
//               <Label htmlFor="engineType" className="text-sm font-medium text-gray-700 dark:text-red-500">
//                 Engine Type
//               </Label>
//               <Select value={newUser.engineType} onValueChange={(value) => handleInputChange("engineType", value)}>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Engine Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Diesel">Diesel</SelectItem>
//                   <SelectItem value="CNG">CNG</SelectItem>
//                   <SelectItem value="All">All</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-3 pt-4">
//             <Button
//               variant="outline"
//               onClick={handleCloseModal}
//               className="px-6 py-2 border-red-500g text-white bg-red-500 hover:bg-red-50"
//             >
//               CANCEL
//             </Button>
//             <Button onClick={handleCreateUser} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white">
//               {users.some(u => u.userId === newUser.userId) ? "UPDATE USER" : "CREATE USER"}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }