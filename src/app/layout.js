'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import ContextProvider from '@/components/ContextProvider';
import { useParams, usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Chatbot from '@/components/Chatbot';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const noPadding = ['/room'];

export default function RootLayout({ children }) {
    const pathname = usePathname();
    console.log(pathname);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/user/info', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    console.log('User data received:', userData);
                    console.log('Avatar image path:', userData.data?.avatarImage || userData.data?.avtImage); // Kiểm tra đường dẫn ảnh
                    setIsAuthenticated(true);
                    setUser(userData.data);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/user/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setIsAuthenticated(false);
                setUser(null);
                setShowDropdown(false);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
     // Check if user has admin role
    const isAdmin = user?.role === "admin";


    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
            <body>
                <header className="sticky top-0 z-50 bg-white shadow-sm">
                    <div className="container mx-auto px-4 flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <a href="/" className="flex items-center font-semibold text-xl">
                                <Image src="/logoCode.png" alt="LeetCode Logo" width={55} height={55} />
                                CodeWars
                            </a>

                            <nav className="hidden md:flex ml-10">
                                {/* Admin Dashboard Menu Item - Only shown for users with admin role */}
                                    {isAdmin && (
                                            <Link
                                                href="/dashboard"    
                                                className="mr-6 text-gray-600 hover:text-orange-500 text-sm font-medium"
                                            >
                                                Dashboard
                                            </Link>
                                    )}
                                <Link
                                    href="/contest"
                                    className="mr-6 text-gray-600 hover:text-orange-500 text-sm font-medium"
                                >
                                    Contest
                                </Link>
                                {isAuthenticated && (
                                    <>
                                        <Link
                                            href="/create-room"
                                            className="mr-6 text-gray-600 hover:text-orange-500 text-sm font-medium"
                                        >
                                            Room Battle
                                        </Link>
                                        <Link
                                            className="mr-6 text-gray-600 hover:text-orange-500 text-sm font-medium"
                                            href={'/room'}
                                        >
                                            Online Battle
                                        </Link>
                                    </>
                                )}
                                <Link
                                    href="/problems"
                                    className="mr-6 text-gray-600 hover:text-orange-500 text-sm font-medium"
                                >
                                    Problems
                                </Link>
                                <Link
                                    href="/discussion"
                                    className="mr-6 text-gray-600 hover:text-orange-500 text-sm font-medium"
                                >
                                    Discuss
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center">
                            <div className="relative mr-4 hidden md:block">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        ></path>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 pr-3 py-2 w-48 rounded border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Search problems..."
                                />
                            </div>

                            {/* <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium mr-4">
                                Premium
                            </button> */}

                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors duration-200 rounded-full py-1 px-2 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                                        aria-expanded={showDropdown}
                                        aria-haspopup="true"
                                    >
                                        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                                            {!user.avtImage ? (
                                                <Image
                                                    src="/user_1.png"
                                                    alt="User Avatar"
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full object-cover w-full h-full"
                                                />
                                            ) : (
                                                <img
                                                    src={user.avtImage}
                                                    alt="Fallback Avatar"
                                                    className="rounded-full object-cover w-full h-full"
                                                    width={36}
                                                    height={36}
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium text-sm truncate max-w-[100px]">
                                                {user?.username || (user?.email && user.email.split('@')[0]) || 'User'}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {/* Dropdown Panel with Animation */}
                                    {showDropdown && (
                                        <div
                                            className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 transform transition-all duration-150 ease-out z-50"
                                            role="menu"
                                            aria-orientation="vertical"
                                            aria-labelledby="user-menu"
                                        >
                                            {/* User Info Section */}
                                            <div className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center ring-4 ring-orange-100 overflow-hidden">
                                                        {!user.avtImage ? (
                                                            <Image
                                                                src="/user_1.png"
                                                                alt="User Avatar"
                                                                width={56}
                                                                height={56}
                                                                className="rounded-full object-cover w-full h-full"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentNode.classList.add(
                                                                        'flex',
                                                                        'items-center',
                                                                        'justify-center',
                                                                    );
                                                                }}
                                                            />
                                                        ) : (
                                                            <img
                                                                src={user.avtImage}
                                                                alt="Fallback Avatar"
                                                                className="rounded-full object-cover w-full h-full"
                                                                width={56}
                                                                height={56}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 truncate max-w-[180px]">
                                                            {user?.username ||
                                                                user?.name ||
                                                                (user?.email && user.email.split('@')[0]) ||
                                                                'User'}
                                                        </span>
                                                        <span className="text-sm text-gray-500 truncate max-w-[180px]">
                                                            {user?.email || ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                <a
                                                    href="/account"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    role="menuitem"
                                                >
                                                    <svg
                                                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-orange-500"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                    Profile
                                                </a>
                                                <a
                                                    href="/account/submissions"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    role="menuitem"
                                                >
                                                    <svg
                                                        className="mr-3 h-5 w-5 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                    Your Submissions
                                                </a>
                                                <a
                                                    href="/contest/myContest"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    role="menuitem"
                                                >
                                                    <svg
                                                        className="mr-3 h-5 w-5 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                        />
                                                    </svg>
                                                    Manage Contests
                                                </a>
                                                <a
                                                    href="/problems/manageProblems"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    role="menuitem"
                                                >
                                                    <svg
                                                        className="mr-3 h-5 w-5 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                        />
                                                    </svg>
                                                    Manage Problems
                                                </a>
                                                <a
                                                    href="/settings"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    role="menuitem"
                                                >
                                                    <svg
                                                        className="mr-3 h-5 w-5 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    Settings
                                                </a>
                                            </div>

                                            {/* Sign Out Button */}
                                            <div className="py-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    role="menuitem"
                                                >
                                                    <svg
                                                        className="mr-3 h-5 w-5 text-red-500"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                        />
                                                    </svg>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <a
                                    href="/account/signin"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                                >
                                    <svg
                                        className="mr-2 -ml-1 h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Sign In
                                </a>
                            )}
                        </div>
                    </div>
                </header>

                <main className={noPadding.includes(pathname) ? '' : 'p-4'}>
                    <ToastContainer />
                    <ContextProvider>{children}</ContextProvider>
                    {!(pathname.includes('/submit') || pathname.includes('match')) && <Chatbot />}
                </main>

                <footer className="bg-white border-t border-gray-200 mt-8">
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <h3 className="font-medium text-gray-800 mb-4">CodeWars</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Careers
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Store
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Contact
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-800 mb-4">Products</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Premium
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Teams
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Contest
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-800 mb-4">Support</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Help Center
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Students
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Terms
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Privacy
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-800 mb-4">Community</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Articles
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-sm text-gray-600 hover:text-orange-500">
                                            Discord
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-4 md:mb-0">
                                <p className="text-sm text-gray-500">
                                    Copyright © 2025 CodeWars. All rights reserved.
                                </p>
                            </div>

                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-500 hover:text-orange-500">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-orange-500">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-orange-500">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
