'use client';

import CreateRoomForm from '@/components/create-roombattle/CreateRoomForm';
import JoinRoomForm from '@/components/create-roombattle/JoinRoomForm';
import { useState } from 'react';


export default function CreateRoomPage() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Code Wars</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    <CreateRoomForm onError={setError} loading={loading} setLoading={setLoading} />
                    <JoinRoomForm onError={setError} loading={loading} setLoading={setLoading} />
                </div>
            </div>
        </div>
    );
}
