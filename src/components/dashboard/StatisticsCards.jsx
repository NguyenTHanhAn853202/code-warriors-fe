export default function StatisticsCards({ user }) {
    if (!user) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="mt-2 h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="mt-1 h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        {
            id: 1,
            name: 'Problems Solved',
            value: user.problemsSolved || 0,
            icon: '📝',
            color: 'bg-blue-100 text-blue-800'
        },
        {
            id: 2,
            name: 'ELO Rating',
            value: user.elo || 0,
            icon: '🏆',
            color: 'bg-yellow-100 text-yellow-800'
        },
        {
            id: 3,
            name: 'Win Rate',
            value: `${((user.wins || 0) / (user.totalMatches || 1) * 100).toFixed(1)}%`,
            icon: '📈',
            color: 'bg-green-100 text-green-800'
        },
        {
            id: 4,
            name: 'Total Matches',
            value: user.totalMatches || 0,
            icon: '⚔️',
            color: 'bg-purple-100 text-purple-800'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div key={stat.id} className="bg-white rounded-lg shadow p-4">
                    <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>
                        {stat.icon}
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-500">{stat.name}</h3>
                    <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}