// components/EditProblemModal.jsx
import React from 'react';

export default function EditProblemModal({ isOpen, onClose, formData, onChange, onSubmit }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Edit Problem</h2>
                
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    className="w-full border p-2 mb-3"
                    placeholder="Title"
                />

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={onChange}
                    className="w-full border p-2 mb-3"
                    placeholder="Description"
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                    <button onClick={onSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
}
