'use client';
import { useState } from 'react';

export default function PostComponent({ post, currentUser, onToggleLike, onPostClick }) {
    return (
        <div
            className="p-5 hover:bg-blue-50 transition duration-200 cursor-pointer mb-4 border-b-[1px]"
            onClick={() => onPostClick(post._id)}
        >
            <div className="flex space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-[50px] h-[50px] bg-transparent   overflow-hidden ">
                        <img
                            src={post.avatar}
                            alt={post.author ? post.author.username : 'User'}
                            className="w-[50px] h-[50px] rounded-[100%] block"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                    {/* Header */}
                    <div className="mb-1">
                        <div className="font-medium text-gray-700">
                            {post.author ? post.author.username : 'Anonymous User'}
                        </div>
                        <div className="text-xs  text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-700 transition duration-200">
                        {post.title}
                    </h3>

                    {/* Preview Text */}
                    <div
                        className="text-black-500 mb-5 line-clamp-5"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Post Stats */}
                    <div className="flex items-center space-x-6 text-gray-500">
                        <div
                            className={`flex items-center space-x-1 hover:text-blue-700 transition duration-200 ${post.isLiked ? 'text-blue-600' : 'text-gray-500'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleLike(post._id, e);
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill={post.isLiked ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                            </svg>
                            <span>{post.likes}</span>
                        </div>

                        <div className="flex items-center space-x-1 hover:text-blue-700 transition duration-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <span>{post.commentsCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
