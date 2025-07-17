import { useState, useEffect } from "react";
import { User, Users, Trash2, Plus, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const CFTMembers = ({ jobOrderId }) => {
    const location = useLocation();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMember, setNewMember] = useState({ code: "", name: "" });
    const [activePanel, setActivePanel] = useState("member"); // "member" or "group"

    const BASE_URL = "http://localhost:8000";

    const fetchMembers = async () => {
        if (!jobOrderId) {
            setError("Job Order ID is missing.");
            setMembers([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/cft_members/read?job_order_id=${jobOrderId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMembers(data || []);
        } catch (err) {
            setError("Failed to fetch CFT members");
            console.error("Error fetching members:", err);
        } finally {
            setLoading(false);
        }
    };

    const addMember = async () => {
        if (!newMember.code || !newMember.name) {
            setError("Please fill in both code and name");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/cft_members/add?job_order_id=${jobOrderId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: newMember.code,
                    name: newMember.name,
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchMembers();
            setNewMember({ code: "", name: "" });
            setShowAddForm(false);
        } catch (err) {
            setError("Failed to add CFT member");
            console.error("Error adding member:", err);
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (memberIndex) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/cft_members/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    job_order_id: jobOrderId,
                    member_index: memberIndex
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchMembers();
        } catch (err) {
            setError("Failed to remove CFT member");
            console.error("Error removing member:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateMember = async (memberIndex, updatedMember) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/cft_members/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    job_order_id: jobOrderId,
                    member_index: memberIndex,
                    updated_member: updatedMember
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchMembers();
        } catch (err) {
            setError("Failed to update CFT member");
            console.error("Error updating member:", err);
        } finally {
            setLoading(false);
        }
    };

    const sendEmail = async () => {
        setLoading(true);
        setError(null);
        try {
            const emailData = {
                recipient: "admin@company.com",
                subject: `CFT Members for Job Order ${jobOrderId}`,
                body: `CFT Members List:\n${members.map(m => `${m.code} - ${m.name}`).join('\n')}`,
                cft_members: members
            };

            const response = await fetch(`${BASE_URL}/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert("Email sent successfully!");
        } catch (err) {
            setError("Failed to send email");
            console.error("Error sending email:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        await sendEmail();
    };

    const handleMemberClick = () => {
        setActivePanel("member");
        setShowAddForm(false);
    };

    const handleGroupsClick = () => {
        setActivePanel("group");
        setShowAddForm(false);
    };

    useEffect(() => {
        fetchMembers();
    }, [jobOrderId]);

    return (
        <div className="relative h-auto flex flex-col">
            <div className="flex items-center justify-between p-2 border-b bg-gray-200 rounded-lg">
                <h2 className="text-md font-semibold text-gray-800">ADD CFT MEMBERS</h2>
            </div>

            <div className="p-4 flex-1">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={handleMemberClick}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors 
                            ${activePanel === "member"
                                ? "bg-red-500 text-white hover:bg-red-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                        `}
                        disabled={loading}
                    >
                        <User size={16} />
                    </button>

                    <button
                        onClick={handleGroupsClick}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors 
                            ${activePanel === "group"
                                ? "bg-red-500 text-white hover:bg-red-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                        `}
                        disabled={loading}
                    >
                        <Users size={16} />
                    </button>
                </div>

                {/* === MEMBER PANEL === */}
                {activePanel === "member" && (
                    <>
                        {showAddForm && (
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <h3 className="text-sm font-medium mb-3">Add New CFT Member</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Member Code"
                                        value={newMember.code}
                                        onChange={(e) => setNewMember({ ...newMember, code: e.target.value })}
                                        className="flex-1 px-3 py-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Member Name"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        className="flex-1 px-3 py-2 border rounded text-sm"
                                    />
                                    <button
                                        onClick={addMember}
                                        disabled={loading}
                                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                        title="Add CFT Member"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            {loading && members.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-gray-500" />
                                    <span className="ml-2 text-gray-500">Loading CFT members...</span>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No CFT members found. Add some members to get started.
                                </div>
                            ) : (
                                members.map((member, index) => (
                                    <div key={member.id || index} className="flex items-center justify-between py-2 bg-gray-50 rounded-lg mb-2">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 border-2 p-1">
                                                {member.code} - {member.name}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeMember(index)}
                                            disabled={loading}
                                            className="text-gray-400 hover:text-red-500 transition-colors ml-2 disabled:opacity-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center mt-2"
                        >
                            <Plus size={16} className="mr-1" />
                            ADD CFT
                        </button>
                    </>
                )}

                {/* === GROUP PANEL === */}
                {activePanel === "group" && (
                    <div>
                        {showAddForm && (
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <h3 className="text-sm font-medium mb-3">Add New CFT Member</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Member Code"
                                        value={newMember.code}
                                        onChange={(e) => setNewMember({ ...newMember, code: e.target.value })}
                                        className="flex-1 px-3 py-2 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Member Name"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        className="flex-1 px-3 py-2 border rounded text-sm"
                                    />
                                    <button
                                        onClick={addMember}
                                        disabled={loading}
                                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                        title="Add CFT Member"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            {loading && members.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-gray-500" />
                                    <span className="ml-2 text-gray-500">Loading CFT members...</span>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No CFT members found. Add some members to get started.
                                </div>
                            ) : (
                                members.map((member, index) => (
                                    <div key={member.id || index} className="flex items-center justify-between py-2 bg-gray-50 rounded-lg mb-2">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 border-2 p-1">
                                                {member.code} - {member.name}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeMember(index)}
                                            disabled={loading}
                                            className="text-gray-400 hover:text-red-500 transition-colors ml-2 disabled:opacity-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center mt-2"
                        >
                            <Plus size={16} className="mr-1" />
                            ADD CFT
                        </button>
                    </div>
                )}

                {/* === APPLY BUTTON === */}
                <div className="absolute right-4 bottom-4">
                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CFTMembers;
