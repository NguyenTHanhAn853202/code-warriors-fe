export default function UserProfile({ user }) {
    if (!user) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="mt-4 h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    const userDetails = {
        username: user.username || "Anonymous",
        email: user.email || "No email provided",
        elo: user.elo || 0,
        problemsSolved: user.problemsSolved || 0,
        location: user.location || "Location not set",
        birthday: user.birthday ? new Date(user.birthday).toLocaleDateString() : "Not specified",
        summary: user.summary || "No summary provided",
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col items-center">
                <div className="relative">
                    <img 
                        src={user.avatarUrl || "/default-avatar.png"}
                        alt={userDetails.username}
                        className="w-32 h-32 rounded-full object-cover"
                        onError={(e) => e.target.src = "/default-avatar.png"}
                    />
                </div>
                
                <h2 className="mt-4 text-xl font-semibold">{userDetails.username}</h2>
                <p className="text-gray-500">{userDetails.email}</p>
                
                <div className="mt-6 w-full">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xl font-bold">{userDetails.elo}</div>
                            <div className="text-sm text-gray-500">ELO Rating</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xl font-bold">{userDetails.problemsSolved}</div>
                            <div className="text-sm text-gray-500">Problems Solved</div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 w-full">
                    <div className="text-sm text-gray-500">
                        Member since {userDetails.createdAt}
                    </div>
                </div>
            </div>
        </div>
    );
}