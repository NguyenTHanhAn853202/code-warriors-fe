import React, { useState, useEffect } from 'react';
import { Code, Trophy, Users, Brain, ArrowLeft, ArrowRight } from 'lucide-react';

const CodingPlatformSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const bannerData = [
        {
            title: 'Master Coding Challenges',
            description: 'Coding problems and prepare for technical interviews',
            icon: <Code className="text-yellow-400" size={48} />,
            color: 'from-gray-900 to-gray-800',
        },
        {
            title: 'Compete Globally',
            description: 'Join weekly contests and climb the global leaderboard',
            icon: <Trophy className="text-yellow-400" size={48} />,
            color: 'from-gray-900 to-blue-900',
        },
        {
            title: 'Join the Community',
            description: 'Connect with millions of developers worldwide',
            icon: <Users className="text-yellow-400" size={48} />,
            color: 'from-gray-900 to-purple-900',
        },
        {
            title: 'Improve Your Skills',
            description: 'Track your progress and enhance your algorithmic thinking',
            icon: <Brain className="text-yellow-400" size={48} />,
            color: 'from-gray-900 to-green-900',
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerData.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [bannerData.length]);

    const handleDotClick = (index) => {
        setCurrentSlide(index);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerData.length) % bannerData.length);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    };

    return (
        <div className="w-full relative overflow-hidden border border-radius-2 shadow-lg rounded-lg">
            <div className="relative h-96 bg-black">
                {bannerData.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <div
                            className={`w-full h-full bg-gradient-to-r ${slide.color} flex items-center justify-center p-8`}
                        >
                            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center">
                                <div className="bg-black bg-opacity-50 p-8 rounded-full mb-6 md:mb-0 md:mr-8">
                                    {slide.icon}
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                        <span className="text-yellow-400">Code</span>
                                        <span className="text-white">War</span>
                                        <span className="block mt-2">{slide.title}</span>
                                    </h1>
                                    <p className="text-xl text-gray-300 mb-6">{slide.description}</p>
                                    {/* <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-md transition-colors duration-300">
                                        Start Coding
                                    </button> */}
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="w-full h-full opacity-10 flex flex-wrap">
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <div key={i} className="text-xs text-white font-mono p-1">
                                        {'{'}
                                        {Math.random().toString(36).substring(2, 8)}
                                        {'}'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {bannerData.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                currentSlide === index ? 'bg-yellow-400' : 'bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full"
                    aria-label="Previous slide"
                >
                    <ArrowLeft size={24} />
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full"
                    aria-label="Next slide"
                >
                    <ArrowRight size={24} />
                </button>

                <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-md z-10">
                    <div className="flex items-center">
                        <Code className="text-yellow-400 mr-2" size={24} />
                        <span className="font-bold text-xl">
                            Code<span className="text-yellow-400">War</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodingPlatformSlider;
