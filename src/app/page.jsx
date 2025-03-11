"use client";
import Link from "next/link";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  // Add mouse movement effect
  useEffect(() => {
    const container = document.querySelector(`.${styles.container}`);
    const icons = document.querySelectorAll(`.${styles.icon}`);
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate center of screen 
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      
      // Calculate how far mouse is from center (in percentage)
      const moveX = (clientX - centerX) / centerX;
      const moveY = (clientY - centerY) / centerY;
      
      // Apply transformations to each icon
      icons.forEach((icon) => {
        // Get icon's position to create varying effects based on location
        const rect = icon.getBoundingClientRect();
        const iconCenterX = rect.left + rect.width / 2;
        const iconCenterY = rect.top + rect.height / 2;
        
        // Calculate distance factor - icons further from cursor move more
        const distanceX = (iconCenterX - clientX) / 500;
        const distanceY = (iconCenterY - clientY) / 500;
        
        // Create 3D effect with translateZ and rotateX/Y
        const baseRotate = icon.style.transform ? 
          icon.style.transform.match(/rotate\(([^)]+)\)/) ? 
          icon.style.transform.match(/rotate\(([^)]+)\)/)[1] : 
          "0deg" : "0deg";
          
        icon.style.transform = `
          translateX(${moveX * 15 - distanceX * 20}px) 
          translateY(${moveY * 15 - distanceY * 20}px) 
          translateZ(${Math.abs(moveX) * 10 + Math.abs(moveY) * 10}px)
          rotateX(${moveY * -10}deg)
          rotateY(${moveX * 10}deg)
          rotate(${baseRotate})
        `;
      });
    };
    
    // Add parallax effect on scroll
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      icons.forEach((icon, index) => {
        // Create different scroll speeds for each icon
        const speed = 0.1 + (index % 3) * 0.05;
        const yPos = scrollY * speed;
        
        // Apply transform preserving existing transforms
        const existingTransform = icon.style.transform || '';
        const newTransform = existingTransform.replace(/translateY\([^)]*\)/, '');
        
        icon.style.transform = `${newTransform} translateY(${-yPos}px)`;
      });
    };
    
    // Add smooth reset when mouse leaves the container
    const handleMouseLeave = () => {
      icons.forEach((icon) => {
        // Get original rotation
        const baseRotate = icon.className.includes(styles.iconJs) ? "-10deg" :
                        icon.className.includes(styles.iconTs) ? "5deg" :
                        icon.className.includes(styles.iconPy) ? "8deg" :
                        icon.className.includes(styles.iconGo) ? "-5deg" :
                        icon.className.includes(styles.iconRuby) ? "12deg" :
                        icon.className.includes(styles.iconJava) ? "-8deg" :
                        icon.className.includes(styles.iconCsharp) ? "3deg" :
                        icon.className.includes(styles.iconCpp) ? "-15deg" :
                        "7deg";
                        
        // Smoothly transition back
        icon.style.transition = "transform 0.5s ease-out";
        icon.style.transform = `rotate(${baseRotate})`;
        
        // Reset transition after animation completes
        setTimeout(() => {
          icon.style.transition = "transform 0.1s ease-out";
        }, 500);
      });
    };
    
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll);
      
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Background with programming language icons */}
      <div className={styles.backgroundIcons}>
        <div className={styles.iconWrapper}>
          <div className={`${styles.icon} ${styles.iconJs}`}>JS</div>
          <div className={`${styles.icon} ${styles.iconTs}`}>TS</div>
          <div className={`${styles.icon} ${styles.iconPy}`}>PY</div>
          <div className={`${styles.icon} ${styles.iconGo}`}>GO</div>
          <div className={`${styles.icon} ${styles.iconRuby}`}>RB</div>
          <div className={`${styles.icon} ${styles.iconJava}`}>JV</div>
          <div className={`${styles.icon} ${styles.iconCsharp}`}>C#</div>
          <div className={`${styles.icon} ${styles.iconCpp}`}>C++</div>
          <div className={`${styles.icon} ${styles.iconRust}`}>RS</div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.gradientText}>Achieve mastery</span>
          <br />
          <span className={styles.whiteText}>through challenge</span>
        </h1>
        
        <p className={styles.description}>
        Enhance your coding skills by practicing with peers through challenging exercises that continuously refine your expertise.
        </p>
        
        {/* Login and Sign Up buttons */}
        <div className={styles.buttonContainer}>
          <Link href="/login">
            <button className={styles.primaryButton}>Login</button>
          </Link>
          
          <Link href="/signup">
            <button className={styles.secondaryButton}>Sign Up</button>
          </Link>
        </div>
      </div>

      {/* Features section - What can I use Codewars for? */}
      <div className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>
          What can I use Codewars for?
        </h2>
        <p className={styles.featuresSubtitle}>
          From beginner to expert and beyond...
        </p>

        <div className={styles.featureCards}>
          {/* Feature Card 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconContainer}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h3 className={styles.featureTitle}>Get new perspectives</h3>
            <p className={styles.featureDescription}>
              Solve challenges then view how others solved the same challenge. Pickup new techniques from some of the most skilled developers in the world.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconContainer}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.4 9l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h3 className={styles.featureTitle}>Learn new languages</h3>
            <p className={styles.featureDescription}>
              Solve challenges in a language you are comfortable with, then do it in a language you want to improve with. Level up across different languages.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconContainer}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 5H7v6h10V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 16l-2 2-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h3 className={styles.featureTitle}>Compete with peers</h3>
            <p className={styles.featureDescription}>
              Compete against your friends, colleagues, and the community at large. Allow competition to motivate you towards mastering your craft.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}