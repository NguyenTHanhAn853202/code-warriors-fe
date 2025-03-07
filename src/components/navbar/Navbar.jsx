"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import NotificationsDropdown from "../NotificationsDropdown/NotificationsDropdown";
import { FaBell, FaUserCircle } from "react-icons/fa"; // Import icon từ react-icons

const links = [
  { id: 1, title: "Explore", url: "/explore" },
  { id: 2, title: "Problems", url: "/problem" },
  { id: 3, title: "Contest", url: "/contest" },
  { id: 4, title: "Discuss", url: "/discuss" },
];

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.logo}>
        <Image 
          src="/logoCode.png" 
          alt="CodeWars Logo" 
          width={150} 
          height={50} 
          priority
        />
      </Link>
      <div className={styles.links}>
        {links.map((link) => (
          <Link key={link.id} href={link.url} className={styles.link}>
            {link.title}
          </Link>
        ))}
        
        <div className={styles.icons}>
          {mounted && (
            <>
              <button 
                className={styles.notificationIcon}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <FaBell size={20} />
              </button>
              
              <button className={styles.AvtIcon} aria-label="User Profile">
                <FaUserCircle size={24} />
              </button>
            </>
          )}
          <DarkModeToggle />
        </div>
      </div>
      {showNotifications && <NotificationsDropdown notifications={[]} />}
    </div>
  );
};

export default Navbar;
