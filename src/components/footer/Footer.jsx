"use client";
import React from "react";
import styles from "./footer.module.css";
import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from "react-icons/fa";

const socialIcons = [
  { name: "Twitter", icon: <FaTwitter />, url: "#" },
  { name: "LinkedIn", icon: <FaLinkedin />, url: "#" },
  { name: "GitHub", icon: <FaGithub />, url: "https://github.com/NguyenTHanhAn853202/code-warriors-fe.git" },
  { name: "Discord", icon: <FaDiscord />, url: "https://discord.gg/ShVfZHGM" }
];

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.content}>
        <div className={styles.copyright}>
          Copyright © 2025 CodeWars.
        </div>
        <nav className={styles.links}>
          <Link href="#">Help Center</Link>
          <Link href="#">API</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">About</Link>
        </nav>
        <div className={styles.socialIcons}>
          {socialIcons.map((social) => (
            <Link 
              key={social.name} 
              href={social.url} 
              className={styles.socialIcon}
              aria-label={social.name}
            >
              {social.icon}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
