import { useEffect, useState } from "react";
import { User, Trash2 } from "lucide-react";
import axios from "axios";
import showSnackbar from "@/utils/showSnackbar";
import { Autocomplete, TextField, Chip } from "@mui/material";

const apiURL = import.meta.env.VITE_BACKEND_URL;

const CFTMembers = ({ jobOrderId, members, setMembers, disabled }) => {
    // Fetch CFT members on mount or when jobOrderId changes
    useEffect(() => {
        if (!jobOrderId) return;
        const fetchMembers = async () => {
            try {
                const res = await axios.get(`${apiURL}/cft_members/read`, { params: { job_order_id: jobOrderId } });
                setMembers(res.data || []);
            } catch (err) {
                setMembers([]);
            }
        };
        fetchMembers();
    }, [jobOrderId, setMembers]);

    // Update member
    const updateMember = async (idx, updatedMember) => {
        if (!jobOrderId) return;
        try {
            await axios.put(`${apiURL}/cft_members/update`, null, {
                params: {
                    job_order_id: jobOrderId,
                    member_index: idx,
                },
                data: updatedMember,
            });
            setMembers((prev) =>
                prev.map((m, i) => (i === idx ? updatedMember : m))
            );
        } catch (err) {
            showSnackbar("Failed to update member", "error", 3000);
        }
    };

    // Remove member (only for single members)
    // No longer used, so you can remove or comment out this function
    // const removeMember = async (memberToRemove) => { ... }

    // State for ProjectTeam users dropdown
    const [projectTeamUsers, setProjectTeamUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");
    const [addError, setAddError] = useState("");
    // Multi-select state: store selected user objects
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
                .then(res => setProjectTeamUsers(res.data || []))
                .catch(() => {
                    setUsersError("Failed to load users");
                    setProjectTeamUsers([]);
                })
                .finally(() => setUsersLoading(false));
        }
    }, []);

    // Only keep single members
    const singleMembers = members.filter(m => !m.group);

    // Prepare Autocomplete options (filter out already added)
    const usedIds = members.filter(m => !m.group).map(m => m.code);
    const filteredUsers = projectTeamUsers.filter(u => !usedIds.includes(u.id));

    // Prepare value for Autocomplete (selectedUsers)
    // If a user is removed from members, also remove from selectedUsers
    useEffect(() => {
        setSelectedUsers(prev =>
            prev.filter(u => members.some(m => m.code === u.id && m.name === u.username))
        );
    }, [members]);

    // Add selected users as members or remove when chip is deleted
    const handleAddMembers = async (event, newValue) => {
        setAddError("");
        // Only add users not already in members
        const toAdd = newValue.filter(
            user => !members.some(m => m.code === user.id && m.name === user.username)
        );
        // Find users to remove (those present in members but not in newValue)
        const toRemove = members.filter(
            m => !m.group && !newValue.some(user => user.id === m.code && user.username === m.name)
        );

        // Remove members
        if (toRemove.length && jobOrderId) {
            await Promise.all(
                toRemove.map(member => {
                    const idx = members.findIndex(
                        m => !m.group && m.code === member.code && m.name === member.name
                    );
                    if (idx !== -1) {
                        return axios.delete(`${apiURL}/cft_members/delete`, {
                            params: {
                                job_order_id: jobOrderId,
                                member_index: idx
                            }
                        });
                    }
                    return Promise.resolve();
                })
            );
        }
        // Update local state for removals
        let updatedMembers = members.filter(
            m => m.group || newValue.some(user => user.id === m.code && user.username === m.name)
        );

        // Add new members
        if (toAdd.length && jobOrderId) {
            try {
                await Promise.all(
                    toAdd.map(user =>
                        axios.post(`${apiURL}/cft_members/add`, {
                            job_order_id: jobOrderId,
                            member: { code: user.id, name: user.username }
                        })
                    )
                );
                updatedMembers = [
                    ...updatedMembers,
                    ...toAdd.map(user => ({ code: user.id, name: user.username }))
                ];
            } catch (err) {
                setAddError("Failed to add member(s)");
            }
        } else if (toAdd.length) {
            updatedMembers = [
                ...updatedMembers,
                ...toAdd.map(user => ({ code: user.id, name: user.username }))
            ];
        }

        setMembers(updatedMembers);
        setSelectedUsers(newValue);
    };

    // State for apply button
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState("");

    const handleApply = async () => {
        setApplyError("");
        if (!jobOrderId) {
            setApplyError("No job order selected.");
            return;
        }
        setApplyLoading(true);
        try {
            await axios.put(
                `${apiURL}/joborders/${jobOrderId}`,
                {
                    job_order_id: jobOrderId,
                    cft_members: members,
                }
            );
            setApplyLoading(false);
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
                {/* Multi-select Autocomplete for adding CFT members */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Select ProjectTeam User(s)</label>
                    <Autocomplete
                        multiple
                        options={filteredUsers}
                        getOptionLabel={option =>
                            `${option.id}${option.username ? ` - ${option.username}` : ""}`
                        }
                        value={singleMembers.map(m =>
                            projectTeamUsers.find(u => u.id === m.code && u.username === m.name)
                        ).filter(Boolean)}
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
            </div>
        </div>
    );
};

export default CFTMembers;