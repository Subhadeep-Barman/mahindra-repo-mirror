import { useState } from "react";
import { User, Users, Trash2 } from "lucide-react";

const CFTMembers = () => {
    const [members, setMembers] = useState([
        { id: 1, code: "25002966", name: "K GURUSAMY" },
        { id: 2, code: "23090169", name: "AMARA RAJESH" }
    ]);

    const removeMember = (id) => {
        setMembers(members.filter(member => member.id !== id));
    };

    const addNewMember = () => {
        // This would typically open another modal or form
        // For demo, just add a dummy member
        setMembers([
            ...members,
            { id: Date.now(), code: "NEWCODE", name: "NEW MEMBER" }
        ]);
    };

    const handleGroupsClick = () => {
        console.log("Navigating to groups panel");
        alert("Groups panel would open here");
    };

    const handleApply = () => {
        // Handle apply logic here
        console.log("Apply clicked with members:", members);
        alert("Changes applied successfully!");
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
                    <button className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-700 transition-colors">
                        <User size={16} />
                    </button>
                    <button
                        onClick={handleGroupsClick}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                        <Users size={16} />
                    </button>
                </div>

                {/* Members List */}
                <div className="mb-2">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between py-2 bg-gray-50 rounded-lg mb-2">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 border-2 p-1">
                                    {member.code} - {member.name}
                                </div>
                            </div>
                            <button
                                onClick={() => removeMember(member.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add CFT Button */}
                <button
                    onClick={addNewMember}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center mt-2"
                >
                    + ADD CFT
                </button>
                <div className="absolute right-4">
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CFTMembers;