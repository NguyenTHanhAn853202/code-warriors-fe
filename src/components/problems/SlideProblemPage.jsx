import React from 'react';

const CourseSlider = () => {
    // Sample course data for the slider
    const courses = [
        {
            id: 1,
            title: "CodeWar's Interview Crash Course:",
            subtitle: 'Data Structures and Algorithms',
            bgColor: 'bg-purple-500',
            buttonText: 'Start Learning',
        },
        {
            id: 2,
            title: "CodeWar's Interview Crash Course:",
            subtitle: 'System Design for Interviews and Beyond',
            bgColor: 'bg-green-600',
            buttonText: 'Start Learning',
        },
        {
            id: 3,
            title: 'CodeWar',
            subtitle: '30 Days Challenge Beginner Friendly',
            bgColor: 'bg-blue-500',
            buttonText: 'Start Learning',
        },
        {
            id: 4,
            title: 'CodeWar',
            subtitle: 'Be the First to Try Our Newest Features',
            bgColor: 'bg-yellow-300',
            buttonText: 'Learn More',
        },
    ];

    return (
        <div className="mb-8">
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className={`${course.bgColor} text-white rounded-lg p-6 flex-shrink-0 w-80 relative overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white opacity-10 -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 right-12 w-16 h-16 rounded-full bg-white opacity-10 mb-4"></div>

                        <div className="z-10 relative h-full flex flex-col">
                            <div>
                                <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                                <p className="mb-6 text-sm">{course.subtitle}</p>
                            </div>
                            <div className="mt-auto">
                                <button className="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-all">
                                    {course.buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseSlider;
