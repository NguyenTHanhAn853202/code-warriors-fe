import React from 'react';

const CategoryList = ({ categories }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6 text-gray-700">
      {categories.map((category) => (
        <div key={category.name} className="flex items-center cursor-pointer">
          <span className="font-medium">{category.name}</span>
          <span className="ml-2 text-gray-500 text-sm">{category.count}</span>
        </div>
      ))}
      <div className="text-blue-500 cursor-pointer">Expand ▼</div>
    </div>
  );
};

export default CategoryList;