export default function Achievements({ userStats }) {
    const achievements = [
        {
            id: 1,
            name: 'First Blood',
            description: 'Won your first battle',
            icon: '⚔️',
            progress: userStats?.totalMatches > 0 ? 100 : 0,
            completed: userStats?.totalMatches > 0,
            color: 'bg-green-500',
        },
        {
            id: 2,
            name: 'Problem Solver',
            description: 'Solved 50 problems',
            icon: '🎯',
            progress: Math.min((userStats?.problemsSolved || 0) * 2, 100),
            completed: (userStats?.problemsSolved || 0) >= 50,
            color: 'bg-blue-500',
        },
        {
            id: 3,
            name: 'Battle Master',
            description: 'Win 100 battles',
            icon: '👑',
            progress: Math.min((userStats?.wins || 0), 100),
            completed: (userStats?.wins || 0) >= 100,
            color: 'bg-purple-500',
        },
        {
            id: 4,
            name: 'Elite Coder',
            description: 'Reach 2000 ELO rating',
            icon: '⭐',
            progress: Math.min(((userStats?.elo || 0) / 2000) * 100, 100),
            completed: (userStats?.elo || 0) >= 2000,
            color: 'bg-yellow-500',
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-4">
                        <div className={`${achievement.color} p-3 rounded-lg text-white text-xl`}>
                            {achievement.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">{achievement.name}</h3>
                                <span className="text-sm text-gray-500">{achievement.progress}%</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full">
                                <div
                                    className={`h-full rounded-full ${achievement.color}`}
                                    style={{ width: `${achievement.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}