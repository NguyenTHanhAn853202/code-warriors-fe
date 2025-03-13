import React, { useState } from "react";
import { FaFilter, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

const AlgorithmType = ({ algorithmType, onFilterSelect }) => {
    const [expanded, setExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);

    // Lọc thuật toán theo tìm kiếm
    const filteredTypes = algorithmType.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayTypes = expanded ? filteredTypes : filteredTypes.slice(0, 6);

    // Chọn/bỏ chọn thuật toán
    const handleTypeSelect = (typeName) => {
        const newSelectedTypes = selectedTypes.includes(typeName)
            ? selectedTypes.filter((type) => type !== typeName)
            : [...selectedTypes, typeName];

        setSelectedTypes(newSelectedTypes);
        onFilterSelect(newSelectedTypes); // Gửi danh sách đã chọn lên App
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Algorithm Categories</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="pl-8 pr-4 py-2 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
                {displayTypes.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center px-3 py-2 rounded-full cursor-pointer transition-all ${
                            selectedTypes.includes(item.name)
                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                        }`}
                        onClick={() => handleTypeSelect(item.name)}
                    >
                        <span className="font-medium text-sm">{item.name}</span>
                        {item.count && (
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white text-gray-600">
                                {item.count}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {filteredTypes.length > 6 && (
                <div
                    className="text-blue-600 flex items-center justify-center cursor-pointer hover:text-blue-800"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <>
                            <span>Show Less</span>
                            <FaChevronUp className="ml-1" />
                        </>
                    ) : (
                        <>
                            <span>Show More</span>
                            <FaChevronDown className="ml-1" />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlgorithmType;
