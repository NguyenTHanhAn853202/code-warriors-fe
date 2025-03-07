"use client"
import React, { useState } from 'react';
import styles from './page.module.css';

const ExploreSection = ({ title, chapters, items, gradientClass, isNew }) => (
  <div className={`${styles.courseCard} ${gradientClass}`}>
    <div className={styles.courseInfo}>
      {isNew && <div className={styles.newTag}>New</div>}
      <h3>{title}</h3>
      <div className={styles.courseStats}>
        <div>
          <span>{chapters}</span>
          <p>Chapters</p>
        </div>
        <div>
          <span>{items}</span>
          <p>Items</p>
        </div>
      </div>
      <div className={styles.progressContainer}>
        <span>0%</span>
        <div className={styles.playButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
);

const Explore = () => {
  // Add state to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    featured: false,
    compete: false,
    learn: false
  });

  // Function to toggle section expansion
  const toggleExpand = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const featuredCourses = [
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nSystem Design for Interviews and Beyond",
      chapters: 16,
      items: 81,
      gradientClass: styles.greenGradient
    },
    {
      title: "The LeetCode Beginner's Guide",
      chapters: 4,
      items: 17,
      gradientClass: styles.orangeGradient
    },
    {
      title: "Easy Collection\nTop Interview Questions",
      chapters: 9,
      items: 48,
      gradientClass: styles.blueGradient
    },
    {
      title: "Detailed Explanation of\nDynamic Programming",
      chapters: 6,
      items: 55,
      gradientClass: styles.tealGradient
    },
    {
      title: "Introduction to Data Structures\nArrays 101",
      chapters: 6,
      items: 31,
      gradientClass: styles.yellowGradient
    },
    {
      title: "Get Well Prepared for\nGoogle Interview",
      chapters: 9,
      items: 85,
      gradientClass: styles.multiColorGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nSystem Design for Interviews and Beyond",
      chapters: 16,
      items: 81,
      gradientClass: styles.greenGradient
    },
    {
      title: "The LeetCode Beginner's Guide",
      chapters: 4,
      items: 17,
      gradientClass: styles.orangeGradient
    },
    {
      title: "Easy Collection\nTop Interview Questions",
      chapters: 9,
      items: 48,
      gradientClass: styles.blueGradient
    },
    {
      title: "Detailed Explanation of\nDynamic Programming",
      chapters: 6,
      items: 55,
      gradientClass: styles.tealGradient
    },
    {
      title: "Introduction to Data Structures\nArrays 101",
      chapters: 6,
      items: 31,
      gradientClass: styles.yellowGradient
    },
    {
      title: "Get Well Prepared for\nGoogle Interview",
      chapters: 9,
      items: 85,
      gradientClass: styles.multiColorGradient
    }
  ];

  const interviewCourses = [
    {
      title: "Cheatsheets",
      chapters: 1,
      items: 3,
      gradientClass: styles.blueLightGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nSystem Design for Interviews and Beyond",
      chapters: 16,
      items: 81,
      gradientClass: styles.greenGradient
    },
    {
      title: "The LeetCode Beginner's Guide",
      chapters: 4,
      items: 17,
      gradientClass: styles.orangeGradient
    },
    {
      title: "Easy Collection\nTop Interview Questions",
      chapters: 9,
      items: 48,
      gradientClass: styles.blueGradient
    },
    {
      title: "Detailed Explanation of\nDynamic Programming",
      chapters: 6,
      items: 55,
      gradientClass: styles.tealGradient
    },
    {
      title: "Introduction to Data Structures\nArrays 101",
      chapters: 6,
      items: 31,
      gradientClass: styles.yellowGradient
    },
    {
      title: "Get Well Prepared for\nGoogle Interview",
      chapters: 9,
      items: 85,
      gradientClass: styles.multiColorGradient
    }
  ];

  const learnCourses = [
    {
      title: "The LeetCode\nBeginner's Guide",
      chapters: 4,
      items: 17,
      gradientClass: styles.orangeGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nData Structures and Algorithms",
      chapters: 13,
      items: 149,
      gradientClass: styles.purpleGradient
    },
    {
      title: "LeetCode's Interview Crash Course\nSystem Design for Interviews and Beyond",
      chapters: 16,
      items: 81,
      gradientClass: styles.greenGradient
    },
    {
      title: "The LeetCode Beginner's Guide",
      chapters: 4,
      items: 17,
      gradientClass: styles.orangeGradient
    },
    {
      title: "Easy Collection\nTop Interview Questions",
      chapters: 9,
      items: 48,
      gradientClass: styles.blueGradient
    },
    {
      title: "Detailed Explanation of\nDynamic Programming",
      chapters: 6,
      items: 55,
      gradientClass: styles.tealGradient
    },
    {
      title: "Introduction to Data Structures\nArrays 101",
      chapters: 6,
      items: 31,
      gradientClass: styles.yellowGradient
    },
    {
      title: "Get Well Prepared for\nGoogle Interview",
      chapters: 9,
      items: 85,
      gradientClass: styles.multiColorGradient
    }
  ];

  const renderSection = (title, courses, sectionKey) => {
    const isExpanded = expandedSections[sectionKey];
    const visibleCourses = isExpanded ? courses : courses.slice(0, 5);
    
    return (
      <div className={styles.exploreSection}>
        <div className={styles.sectionHeader}>
          <h2>{title}</h2>
          {courses.length > 8 && (
            <a 
              href="#" 
              className={styles.moreLink}
              onClick={(e) => {
                e.preventDefault();
                toggleExpand(sectionKey);
              }}
            >
              {isExpanded ? "Less" : "More"}
            </a>
          )}
        </div>
        <div className={styles.courseContainer}>
          {visibleCourses.map((course, index) => (
            <ExploreSection 
              key={index}
              title={course.title}
              chapters={course.chapters}
              items={course.items}
              gradientClass={course.gradientClass}
              isNew={course.isNew}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.exploreContainer}>
      <h1>Welcome to CodeWars Explore</h1>
      {renderSection('Featured', featuredCourses, 'featured')}
      {renderSection('Compete', interviewCourses, 'compete')}
      {renderSection('Learn', learnCourses, 'learn')}
    </div>
  );
};

export default Explore;