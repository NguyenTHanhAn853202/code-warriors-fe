export default function UserProfile({ user }) {
    // Early return with loading state if user is null
    if (!user) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="mt-4 h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="mt-2 h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    // Safe default values
    const userDetails = {
        avtImage: user?.avtImage || "/default-avatar.png",
        username: user?.username || "Anonymous",
        email: user?.email || "No email provided",
        elo: user?.elo || 0,
        xp: user?.xp || 0,
        location: user?.location || "Location not set",
        birthday: user?.birthday ? new Date(user.birthday).toLocaleDateString() : "Not specified",
        summary: user?.summary || "No summary provided."
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col items-center">
                <div className="relative">
                    <img 
                        src={userDetails.avtImage}
                        alt={userDetails.username}
                        className="w-32 h-32 rounded-full object-cover"
                        onError={(e) => {
                            e.target.src = "/default-avatar.png";
                        }}
                    />
                    <span className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full">
                        <span className="block h-3 w-3 rounded-full bg-green-500"></span>
                    </span>
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
                            <div className="text-xl font-bold">{userDetails.xp}</div>
                            <div className="text-sm text-gray-500">XP Points</div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 w-full space-y-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>{userDetails.location}</span>
                    </div>
                    
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>{userDetails.birthday}</span>
                    </div>
                </div>

                <div className="mt-6 w-full">
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-600">{userDetails.summary}</p>
                </div>
            </div>
        </div>
    );
}