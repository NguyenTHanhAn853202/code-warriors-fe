import React from 'react';

const TopicFilters = ({ topics }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {topics.map((topic, index) => (
                <div
                    key={topic.name}
                    className={`py-2 px-4 rounded-full cursor-pointer flex items-center ${
                        index === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    <span className="mr-2">
                        {topic.icon === 'list' && <span>📋</span>}
                        {topic.icon === 'network' && <span>🔄</span>}
                        {topic.icon === 'database' && <span>🗄️</span>}
                        {topic.icon === 'terminal' && <span>💻</span>}
                        {topic.icon === 'threads' && <span>🧵</span>}
                        {topic.icon === 'js' && <span>🟨</span>}
                    </span>
                    <span>{topic.name}</span>
                </div>
            ))}
        </div>
    );
};

export default TopicFilters;
