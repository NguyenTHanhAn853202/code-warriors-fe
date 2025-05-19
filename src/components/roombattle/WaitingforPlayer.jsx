import React, { useState, useEffect } from 'react';
import { Users, Award, Clock, Loader } from 'lucide-react';

const WaitingForPlayers = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="relative    ">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800">
                        Waiting for submissions
                    </h2>
                    <p className="text-gray-500 mt-1">Please wait while all players submit their solutions</p>
                </div>

                

                <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Results will be shown automatically when everyone submits</span>
                </div>
            </div>
        </div>
    );
};

export default WaitingForPlayers;
