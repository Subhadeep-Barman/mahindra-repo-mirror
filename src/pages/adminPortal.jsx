"use client";

import {
  ArrowBack,
  PersonAdd,
  Edit,
  Delete,
  ChevronLeft,
  ChevronRight,
  Close as CloseIcon,
  Settings,
} from "@mui/icons-material";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Card } from "@/components/UI/card";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import Navbar1 from "@/components/UI/navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import showSnackbar from "@/utils/showSnackbar";

const apiURL = import.meta.env.VITE_BACKEND_URL;

export default function SystemUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    id: "",
    email: "",
    username: "",
    role: "",
    team: "", // Added team attribute
  });

  // Fetch users from backend API on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // API Functions
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiURL}/api/users/read_all_users`);
      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setUsers([]); // No users found
      } else {
        console.error("Error fetching users:", error);
        showSnackbar("Failed to fetch users", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await axios.post(
        `${apiURL}/api/users/create_user`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await fetchAllUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to create user";
      alert(errorMessage);
      return false;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await axios.put(
        `${apiURL}/api/users/update_user?user_id=${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await fetchAllUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to update user";
      alert(errorMessage);
      return false;
    }
  };

  const deleteUserApi = async (userId) => {
    try {
      const response = await axios.delete(
        `${apiURL}/api/users/delete_user?user_id=${userId}`
      );

      await fetchAllUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to delete user";
      alert(errorMessage);
      return false;
    }
  };

  // Filter users by search term (include team)
  const filteredUsers = users.filter(
    (user) =>
      user.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.team || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Calculate pagination with additional safeguards
  const safeItemsPerPage = Math.max(1, itemsPerPage); // Ensure at least 1 item per page
  const MAX_TOTAL_PAGES = 100; // Limit for total pages to prevent excessive iterations
  
  // Ensure we have a valid filteredUsers array with a valid length
  const safeFilteredLength = Array.isArray(filteredUsers) ? filteredUsers.length : 0;
  
  // Calculate totalPages with multiple safeguards:
  // 1. Ensure division by a positive number
  // 2. Ensure we get a positive integer
  // 3. Cap the maximum to prevent excessive iterations
  // 4. Ensure we have at least 1 page
  const totalPages = Math.max(1, Math.min(MAX_TOTAL_PAGES, Math.ceil(safeFilteredLength / safeItemsPerPage)));
  
  // Ensure current page is within valid range
  const safeCurrentPage = Math.max(1, Math.min(totalPages, currentPage));
  
  // Calculate slice indices with bounds checking
  const startIndex = (safeCurrentPage - 1) * safeItemsPerPage;
  const endIndex = Math.min(startIndex + safeItemsPerPage, safeFilteredLength);
  
  // Get current page of users with safe array bounds
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setNewUser({
      id: "",
      email: "",
      username: "",
      role: "",
      team: "", // Reset team
    });
    setIsAddUserModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setNewUser({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      team: user.team || "", // Set team if exists
    });
    setIsAddUserModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUserApi(userId);
    }
  };

  const handlePreviousPage = () => {
    // Ensure we don't go below page 1
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    // Ensure we don't exceed maximum total pages
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    // Validate page number before setting
    if (typeof page === 'number' && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
    setEditingUser(null);
    setNewUser({
      id: "",
      email: "",
      username: "",
      role: "",
      team: "", // Reset team
    });
  };

  const handleCreateUser = async () => {
    if (
      !newUser.id ||
      !newUser.email ||
      !newUser.username ||
      !newUser.role
    ) {
      showSnackbar("Please fill in all fields", "error");
      return;
    }

    let success = false;
    if (editingUser) {
      // Update existing user
      success = await updateUser(editingUser.id, newUser);
    } else {
      // Create new user
      success = await createUser(newUser);
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleInputChange = (field, value) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Ensure we do not generate more than MAX_TOTAL_PAGES
    // Additional validation to ensure cappedTotalPages is a positive number
    const cappedTotalPages = Math.max(1, Math.min(totalPages, MAX_TOTAL_PAGES));
    
    // Safeguard against malicious inputs - no pagination needed if only 1 page
    if (cappedTotalPages <= 1) {
      return [1];
    }
    
    if (cappedTotalPages <= maxVisiblePages) {
      // Additional safeguard to limit iterations
      const iterationLimit = Math.min(cappedTotalPages, 100);
      for (let i = 1; i <= iterationLimit; i++) {
        pages.push(i);
      }
    } else {
      if (safeCurrentPage <= 3) {
        // Fixed iteration count (at most 4 iterations)
        const visiblePages = Math.min(4, cappedTotalPages - 1);
        for (let i = 1; i <= visiblePages; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(cappedTotalPages);
      } else if (safeCurrentPage >= cappedTotalPages - 2) {
        pages.push(1);
        pages.push("...");
        // Safeguard to ensure we don't get negative initial values
        const startPage = Math.max(2, cappedTotalPages - 3);
        // Limit iterations to a safe range
        for (let i = startPage; i <= cappedTotalPages && pages.length < 10; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        // Fixed window around current page (3 items at most)
        const startPage = Math.max(2, safeCurrentPage - 1);
        const endPage = Math.min(cappedTotalPages - 1, safeCurrentPage + 1);
        for (let i = startPage; i <= endPage && pages.length < 10; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(cappedTotalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <Navbar1 />
      {/* Header */}
      <div className="bg-white dark:bg-black">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between h-16 gap-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-2 border-red-500 rounded-full p-2"
              >
                <ArrowBack className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-red-500">
                System Users ({users.length})
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64 h-11">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="px-3 h-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full pr-11 text-base"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow flex items-center justify-center"
                    style={{ height: '28px', width: '28px' }}
                    aria-label="Clear search"
                  >
                    <CloseIcon style={{ fontSize: 18 }} />
                  </button>
                )}
              </div>
              <Button
                onClick={handleAddUser}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 px-3 text-sm flex items-center min-w-fit"
              >
                <PersonAdd className="h-5 w-5 mr-1" />
                ADD NEW USERS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    User ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Username
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Role
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Team
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <TableCell className="font-medium text-gray-900">
                        {user.id}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-purple-600 border-purple-200 bg-purple-50"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-200 bg-blue-50"
                        >
                          {user.team || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
                          >
                            <Delete className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex justify-end mt-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={safeCurrentPage === 1}
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
                    variant={safeCurrentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className={
                      safeCurrentPage === page
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
              disabled={safeCurrentPage === totalPages}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Add/Edit User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <PersonAddIcon className="h-5 w-5 text-green-600" />
              </div>
              {editingUser ? "Edit User" : "Create New User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User ID */}
            <div className="space-y-2">
              <Label
                htmlFor="userId"
                className="text-sm font-medium text-gray-700 dark:text-red-500"
              >
                User ID
              </Label>
              <Input
                id="userId"
                placeholder="User ID"
                value={newUser.id}
                onChange={(e) => handleInputChange("id", e.target.value)}
                className="w-full"
                // disabled={editingUser !== null} // Disable editing User ID when editing
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-red-500"
              >
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

            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 dark:text-red-500"
              >
                Username
              </Label>
              <Input
                id="username"
                placeholder="Full Username"
                value={newUser.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-gray-700 dark:text-red-500"
              >
                Role
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ProjectTeam">Project Team</SelectItem>
                  <SelectItem value="TestEngineer">Test Engineer</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Team */}
            <div className="space-y-2">
              <Label
                htmlFor="team"
                className="text-sm font-medium text-gray-700 dark:text-red-500"
              >
                Team
              </Label>
              <Select
                value={newUser.team}
                onValueChange={(value) => handleInputChange("team", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vtc">VTC_CHENNAI</SelectItem>
                  <SelectItem value="vtc_n">VTC_NASHIK</SelectItem>
                  <SelectItem value="rde">RDE</SelectItem>
                  <SelectItem value="pdcd">PDCD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="px-6 py-2 border-red-500 text-white bg-red-500 hover:bg-red-50 hover:text-red-500"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleCreateUser}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white"
            >
              {editingUser ? "UPDATE USER" : "CREATE USER"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
