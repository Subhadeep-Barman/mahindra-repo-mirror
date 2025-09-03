import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import axios from "axios";
import showSnackbar from "@/utils/showSnackbar";
import { Autocomplete, TextField, Chip } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
 
const apiURL = import.meta.env.VITE_BACKEND_URL;
 
const CFTMembers = ({ jobOrderId, members, setMembers, disabled }) => {
    // State to track original/saved CFT members (what's actually in the database)
    const [originalMembers, setOriginalMembers] = useState([]);
    const { userRole, userId, userName } = useAuth(); // Destructure user details from useAuth
 
    // Fetch CFT members on mount or when jobOrderId changes
    useEffect(() => {
        if (!jobOrderId) return;
 
        // Only fetch if no members are provided or members array is empty
        if (!members || members.length === 0) {
            const fetchMembers = async () => {
                try {
                    const encodedJobOrderId = encodeURIComponent(jobOrderId);
                    const res = await axios.get(`${apiURL}/cft_members/read?job_order_id=${encodedJobOrderId}`);
                    const fetchedMembers = res.data || [];
                    setMembers(fetchedMembers);
                    setOriginalMembers(fetchedMembers); // Store original members
                    setHasUnsavedChanges(false);
                } catch (err) {
                    console.error("Failed to fetch CFT members:", err);
                    setMembers([]);
                    setOriginalMembers([]);
                }
            };
            fetchMembers();
        } else {
            // If members are provided from parent, store them as original
            setOriginalMembers(members);
            setHasUnsavedChanges(false);
        }
    }, [jobOrderId, setMembers]);
 
    // Reset unsaved changes when members are updated from parent
    useEffect(() => {
        if (members && members.length > 0) {
            setHasUnsavedChanges(false);
        }
    }, [jobOrderId]); // Only reset when jobOrderId changes, not when members change
 
    // Update member
    const updateMember = async (idx, updatedMember) => {
        if (!jobOrderId) return;
        try {
            const encodedJobOrderId = encodeURIComponent(jobOrderId);
            await axios.put(`${apiURL}/cft_members/update?job_order_id=${encodedJobOrderId}&member_index=${idx}`,
                updatedMember
            );
            setMembers((prev) =>
                prev.map((m, i) => (i === idx ? updatedMember : m))
            );
        } catch (err) {
            showSnackbar("Failed to update member", "error", 3000);
        }
    };
 
    // State for ProjectTeam users dropdown
    const [projectTeamUsers, setProjectTeamUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");
    const [addError, setAddError] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    const openAddModal = async () => {
        setAddError("");
        setSelectedUsers([]);
        setUsersLoading(true);
        setUsersError("");
        try {
            const res = await axios.get(`${apiURL}/api/cft/projectteam_users`);
            setProjectTeamUsers(res.data || []);
        } catch (err) {
            setUsersError("Failed to load users");
            setProjectTeamUsers([]);
        }
        setUsersLoading(false);
    };
   
    // Fetch users if not loaded
    useEffect(() => {
        if (projectTeamUsers.length === 0) {
            setUsersLoading(true);
            setUsersError("");
            axios.get(`${apiURL}/api/cft/projectteam_users`)
                .then(res => {
                    const users = res.data || [];
                    setProjectTeamUsers(users);
 
                    // Automatically add logged-in user if they are in the ProjectTeam
                    if (userRole === "ProjectTeam") {
                        const loggedInUser = users.find(u => u.id === userId);
                        if (loggedInUser) {
                            setSelectedUsers([loggedInUser]);
                            setMembers(prev => {
                                const updated = [
                                    ...prev,
                                    { code: loggedInUser.id, name: loggedInUser.username }
                            ];
                            // Ensure no duplicates in members
                            return Array.from(
                                new Map(updated.map(m => [m.code, m])).values()
                            );
                        });
                        }
                    }
                })
                .catch(() => {
                    setUsersError("Failed to load users");
                    setProjectTeamUsers([]);
                })
                .finally(() => setUsersLoading(false));
        }
    }, [projectTeamUsers.length, userRole, userId, setMembers]);
 
    // Only keep single members
    const singleMembers = members.filter(m => !m.group);
 
    // Prepare Autocomplete options (filter out already added)
    const usedIds = members.filter(m => !m.group).map(m => m.code);
    const filteredUsers = projectTeamUsers.filter(u => !usedIds.includes(u.id));
 
    // Prepare value for Autocomplete (selectedUsers)
    useEffect(() => {
        if (members && members.length > 0) {
            const currentUserSelections = members
                .filter(m => !m.group)
                .map(m => projectTeamUsers.find(u => u.id === m.code && u.username === m.name))
                .filter(Boolean);
            setSelectedUsers(currentUserSelections);
        } else {
            setSelectedUsers([]);
        }
    }, [members, projectTeamUsers]);
 
    // Add selected users as members or remove when chip is deleted
    const handleAddMembers = async (event, newValue) => {
        setAddError("");
        const toAdd = newValue.filter(
            user => !members.some(m => m.code === user.id && m.name === user.username)
        );
        const toRemove = members.filter(
            m => !m.group && !newValue.some(user => user.id === m.code && user.username === m.name)
        );
 
        let updatedMembers = members.filter(
            m => m.group || newValue.some(user => user.id === m.code && user.username === m.name)
        );
 
        if (toAdd.length) {
            updatedMembers = [
                ...updatedMembers,
                ...toAdd.map(user => ({ code: user.id, name: user.username }))
            ];
        }
 
        // Ensure no duplicates in updatedMembers
        const uniqueMembers = Array.from(
            new Map(updatedMembers.map(m => [m.code, m])).values()
        );
 
        setMembers(uniqueMembers);
        setSelectedUsers(newValue);
       
        if (toAdd.length > 0 || toRemove.length > 0) {
            setHasUnsavedChanges(true);
        }
    };
 
    // State for apply button
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 
    const handleApply = async () => {
        setApplyError("");
        if (!jobOrderId) {
            setApplyError("No job order selected.");
            return;
        }
        setApplyLoading(true);
       
        const cftMembersToSend = members.filter(m => !m.group);
        const isRDEJobOrder = jobOrderId && jobOrderId.startsWith("JO RDE");
        const apiEndpoint = isRDEJobOrder
            ? `${apiURL}/rde_joborders/${encodeURIComponent(jobOrderId)}`
            : `${apiURL}/joborders/${encodeURIComponent(jobOrderId)}`;
       
        try {
            await axios.put(
                apiEndpoint,
                {
                    job_order_id: jobOrderId,
                    cft_members: cftMembersToSend,
                }
            );
            setApplyLoading(false);
            setHasUnsavedChanges(false);
            setOriginalMembers(cftMembersToSend);
            showSnackbar("CFT members updated successfully", "success", 3000);
        } catch (err) {
            setApplyError("Failed to update CFT members.");
            setApplyLoading(false);
        }
    };
 
    return (
        <div className="relative flex flex-col dark:bg-black border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-200 dark:bg-gray-800 rounded-lg">
                <h2 className="text-md font-semibold text-gray-800 dark:text-white">ADD CFT MEMBERS</h2>
            </div>
 
            {/* Content */}
            <div className="p-4 flex-1">
                {/* Current CFT Members Display */}
                {originalMembers && originalMembers.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Current CFT Members:</label>
                        <div className="flex flex-wrap gap-2">
                            {originalMembers.filter(m => !m.group).map((member, index) => (
                                <div key={index} className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                                    {member.code} - {member.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
 
                {/* Multi-select Autocomplete for adding CFT members */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Select ProjectTeam User(s)</label>
                    <Autocomplete
                        multiple
                        options={filteredUsers}
                        getOptionLabel={option =>
                            `${option.id}${option.username ? ` - ${option.username}` : ""}`
                        }
                        value={selectedUsers}
                        loading={usersLoading}
                        disabled={disabled}
                        onChange={handleAddMembers}
                        isOptionEqualToValue={(option, value) =>
                            option?.id === value?.id
                        }
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    key={option.id}
                                    label={`${option.id}${option.username ? ` - ${option.username}` : ""}`}
                                    {...getTagProps({ index })}
                                    size="medium"
                                    sx={{
                                        maxWidth: "100%",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        borderRadius: "16px",
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === "dark"
                                                ? "rgba(255,255,255,0.08)"
                                                : "rgba(25,118,210,0.08)",
                                        color: "primary.main",
                                        fontWeight: 500,
                                    }}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="CFT Members"
                                error={!!addError}
                                helperText={addError || usersError}
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                    },
                                }}
                            />
                        )}
                    />
                </div>
 
                {/* Apply Button */}
                {jobOrderId && (
                    <div className="mt-4 flex justify-between items-center">
                        {hasUnsavedChanges && (
                            <span className="text-orange-600 text-sm font-medium">
                                ⚠ You have unsaved changes
                            </span>
                        )}
                        <button
                            onClick={handleApply}
                            disabled={applyLoading || disabled}
                            className={`px-4 py-2 ${
                                hasUnsavedChanges
                                    ? "bg-orange-600 hover:bg-orange-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                            } disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 ml-auto`}
                        >
                            {applyLoading ? "Updating..." : hasUnsavedChanges ? "Update" : "Up to Date"}
                        </button>
                    </div>
                )}
 
                {/* Apply Error */}
                {applyError && (
                    <div className="mt-2 text-red-600 text-sm">
                        {applyError}
                    </div>
                )}
            </div>
        </div>
    );
};
 
export default CFTMembers;