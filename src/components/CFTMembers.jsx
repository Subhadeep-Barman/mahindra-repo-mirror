import { useEffect, useState } from "react";
import { User, Users, Trash2 } from "lucide-react";
import axios from "axios";
import showSnackbar from "@/utils/showSnackbar";
 
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
 
    // View state: "single" or "group"
    const [viewType, setViewType] = useState("single");
 
    // Remove member (single or group)
    const removeMember = async (idx) => {
        if (!jobOrderId) return;
        try {
            await axios.delete(`${apiURL}/cft_members/delete`, { params: { job_order_id: jobOrderId, member_index: idx } });
            setMembers((prev) => prev.filter((_, i) => i !== idx));
        } catch (err) {
            showSnackbar("Failed to delete member", "error", 3000);
        }
    };
 
    // State for ProjectTeam users dropdown
    const [projectTeamUsers, setProjectTeamUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");
 
    // Modal state for add member
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newCode, setNewCode] = useState("");
    const [newName, setNewName] = useState("");
    const [addError, setAddError] = useState("");
    const [selectedUserIdx, setSelectedUserIdx] = useState(-1);
 
    const openAddModal = async () => {
        setNewCode("");
        setNewName("");
        setAddError("");
        setSelectedUserIdx(-1);
        setAddModalOpen(true);
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
 
    const closeAddModal = () => {
        setAddModalOpen(false);
    };
 
    const handleAddMember = async () => {
        // Remove jobOrderId check and allow adding locally
        if (selectedUserIdx === -1) {
            setAddError("Please select a user");
            return;
        }
        const user = projectTeamUsers[selectedUserIdx];
        if (!user) {
            setAddError("Invalid user selected");
            return;
        }
        // If jobOrderId exists, try to add to backend, else just update local state
        if (jobOrderId) {
            try {
                await axios.post(`${apiURL}/cft_members/add`, { job_order_id: jobOrderId, member: { code: user.id, name: user.username } });
                setMembers((prev) => [...prev, { code: user.id, name: user.username }]);
                setAddModalOpen(false);
            } catch (err) {
                setAddError("Failed to add member");
            }
        } else {
            // Add to local state only
            setMembers((prev) => [...prev, { code: user.id, name: user.username }]);
            setAddModalOpen(false);
        }
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
 
    // Groups modal state
    const [groupsModalOpen, setGroupsModalOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [groupError, setGroupError] = useState("");
 
    const openGroupsModal = () => {
        setGroupName("");
        setGroupError("");
        setGroupsModalOpen(true);
    };
 
    const closeGroupsModal = () => {
        setGroupsModalOpen(false);
    };
 
    // Add Group to members (with group: true and members array)
    const handleAddGroup = () => {
        if (!groupName.trim()) {
            setGroupError("Group name required");
            return;
        }
        // Add group object to members
        setMembers(prev => [
            ...prev,
            { group: true, name: groupName.trim(), members: [] }
        ]);
        setGroupsModalOpen(false);
    };
 
    // Filtered lists
    const singleMembers = members.filter(m => !m.group);
    const groupMembers = members.filter(m => m.group);
 
    return (
        <div className="relative h-72 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-200 rounded-lg">
                <h2 className="text-md font-semibold text-gray-800">ADD CFT MEMBERS</h2>
            </div>
 
            {/* Content */}
            <div className="p-4 flex-1">
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                    <button
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${viewType === "single" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        onClick={() => setViewType("single")}
                        disabled={viewType === "single"}
                    >
                        <User size={16} />
                    </button>
                    <button
                        onClick={() => setViewType("group")}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${viewType === "group" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        disabled={viewType === "group"}
                    >
                        <Users size={16} />
                    </button>
                </div>
 
                {/* Members List */}
                <div className="mb-2">
                    {viewType === "single" && singleMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 bg-gray-50 rounded-lg mb-2">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 border-2 p-1">
                                    {member.code} - {member.name}
                                </div>
                            </div>
                            <button
                                onClick={() => removeMember(members.indexOf(member))}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {viewType === "group" && groupMembers.map((group, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 bg-gray-50 rounded-lg mb-2">
                            <div className="flex-1">
                                <div className="text-sm font-bold text-gray-900 border-2 p-1">
                                    Group: {group.name}
                                </div>
                                {/* Optionally, show group members here */}
                                {/* <div className="text-xs text-gray-700 ml-2">
                                    {group.members.map((m, i) => (
                                        <span key={i}>{m.code} - {m.name}{i < group.members.length - 1 ? ", " : ""}</span>
                                    ))}
                                </div> */}
                            </div>
                            <button
                                onClick={() => removeMember(members.indexOf(group))}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
 
                {/* Add CFT Button */}
                {viewType === "single" && (
                    <button
                        onClick={openAddModal}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center mt-2"
                    >
                        + ADD CFT
                    </button>
                )}
                {viewType === "group" && (
                    <button
                        onClick={openGroupsModal}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center mt-2"
                    >
                        + ADD GROUP
                    </button>
                )}
 
                {/* Add Member Modal */}
                {addModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
                            <h3 className="text-lg font-semibold mb-4">Add CFT Member</h3>
                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Select ProjectTeam User</label>
                                {usersLoading ? (
                                    <div className="text-xs text-gray-500">Loading users...</div>
                                ) : usersError ? (
                                    <div className="text-xs text-red-600">{usersError}</div>
                                ) : (
                                    <select
                                        className="w-full border rounded px-2 py-1"
                                        value={selectedUserIdx}
                                        onChange={e => {
                                            setSelectedUserIdx(Number(e.target.value));
                                            const idx = Number(e.target.value);
                                            if (idx >= 0 && filteredUsers[idx]) {
                                                setNewCode(filteredUsers[idx].id);
                                                setNewName(filteredUsers[idx].username);
                                            } else {
                                                setNewCode("");
                                                setNewName("");
                                            }
                                        }}
                                    >
                                        <option value={-1}>Select user</option>
                                        {/* Filter out users already in members */}
                                        {(() => {
                                            // Only single members (not groups)
                                            const usedIds = members.filter(m => !m.group).map(m => m.code);
                                            // Filtered users for dropdown
                                            var filteredUsers = projectTeamUsers.filter(u => !usedIds.includes(u.id));
                                            // Expose filteredUsers to onChange handler
                                            window.filteredUsers = filteredUsers;
                                            return filteredUsers.map((user, idx) => (
                                                <option key={user.id} value={idx}>
                                                    {user.id} - {user.username}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                )}
                            </div>
                            {/* Show code and name as read-only */}
                            {selectedUserIdx >= 0 && (
                                <div className="mb-2">
                                    <div className="text-xs text-gray-700">
                                        <span className="font-semibold">ID:</span> {newCode}
                                    </div>
                                    <div className="text-xs text-gray-700">
                                        <span className="font-semibold">Name:</span> {newName}
                                    </div>
                                </div>
                            )}
                            {addError && <div className="text-red-600 text-xs mb-2">{addError}</div>}
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={closeAddModal}
                                    className="px-3 py-1 bg-gray-200 rounded text-gray-700 text-sm"
                                >Cancel</button>
                                <button
                                    onClick={handleAddMember}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                >Add</button>
                            </div>
                        </div>
                    </div>
                )}
 
                {/* Groups Modal */}
                {groupsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
                            <h3 className="text-lg font-semibold mb-4">Add Group</h3>
                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Group Name</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                    placeholder="Enter group name"
                                />
                            </div>
                            {groupError && <div className="text-red-600 text-xs mb-2">{groupError}</div>}
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={closeGroupsModal}
                                    className="px-3 py-1 bg-gray-200 rounded text-gray-700 text-sm"
                                >Cancel</button>
                                <button
                                    onClick={handleAddGroup}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                >Add Group</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
 
export default CFTMembers;