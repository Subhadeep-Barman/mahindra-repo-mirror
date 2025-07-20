import { useEffect, useState } from "react";
import { User, Users, Trash2 } from "lucide-react";
import axios from "axios";

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

    const removeMember = async (idx) => {
        if (!jobOrderId) return;
        try {
            await axios.delete(`${apiURL}/cft_members/delete`, { params: { job_order_id: jobOrderId, member_index: idx } });
            setMembers((prev) => prev.filter((_, i) => i !== idx));
        } catch (err) {
            alert("Failed to delete member");
        }
    };

    // Modal state for add member
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newCode, setNewCode] = useState("");
    const [newName, setNewName] = useState("");
    const [addError, setAddError] = useState("");

    const openAddModal = () => {
        setNewCode("");
        setNewName("");
        setAddError("");
        setAddModalOpen(true);
    };

    const closeAddModal = () => {
        setAddModalOpen(false);
    };

    const handleAddMember = async () => {
        if (!jobOrderId) {
            setAddError("Create Job Order first");
            return;
        }
        if (!newCode.trim() || !newName.trim()) {
            setAddError("Both code and name are required");
            return;
        }
        try {
            await axios.post(`${apiURL}/cft_members/add`, { job_order_id: jobOrderId, member: { code: newCode.trim(), name: newName.trim() } });
            setMembers((prev) => [...prev, { code: newCode.trim(), name: newName.trim() }]);
            setAddModalOpen(false);
        } catch (err) {
            setAddError("Failed to add member");
        }
    };

    const handleGroupsClick = () => {
        alert("Groups panel would open here");
    };

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
                    <button className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-700 transition-colors" disabled>
                        <User size={16} />
                    </button>
                    <button
                        onClick={handleGroupsClick}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                        disabled={disabled}
                    >
                        <Users size={16} />
                    </button>
                </div>

                {/* Members List */}
                <div className="mb-2">
                    {members.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 bg-gray-50 rounded-lg mb-2">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 border-2 p-1">
                                    {member.code} - {member.name}
                                </div>
                            </div>
                            <button
                                onClick={() => removeMember(idx)}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                                disabled={disabled}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add CFT Button */}
                <button
                    onClick={openAddModal}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center mt-2"
                    disabled={disabled}
                >
                    + ADD CFT
                </button>

                {/* Add Member Modal */}
                {addModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
                            <h3 className="text-lg font-semibold mb-4">Add CFT Member</h3>
                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Code</label>
                                <input
                                    type="text"
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                    placeholder="Enter code"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                    placeholder="Enter name"
                                />
                            </div>
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
            </div>
        </div>
    );
};

export default CFTMembers;