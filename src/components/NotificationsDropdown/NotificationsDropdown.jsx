import React from 'react';
import styles from './notifications.module.css';

const NotificationsDropdown = ({ notifications = [] }) => {
  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <h3>All notifications</h3>
        <span className={styles.markRead}>Mark all as read</span>
      </div>
      <div className={styles.notificationList}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className={styles.notificationItem}>
              <div className={styles.notificationIcon}>
                {notification.icon || '🔔'}
              </div>
              <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>
                  {notification.title}
                </div>
                <div className={styles.notificationDescription}>
                  {notification.description}
                </div>
                <div className={styles.notificationTime}>
                  {notification.time}
                </div>
                {notification.reward && (
                  <div className={styles.rewardBadge}>
                    +{notification.reward}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noNotifications}>
            No notifications
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <span>All notifications</span>
      </div>
    </div>
  );
};

export default NotificationsDropdown;