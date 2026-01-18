import { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "wagmi";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { address } = useAccount();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from localStorage when address changes
    useEffect(() => {
        if (address) {
            const stored = localStorage.getItem(`notifications_${address}`);
            if (stored) {
                try {
                    const parsedNotifications = JSON.parse(stored);
                    setNotifications(parsedNotifications);
                    setUnreadCount(parsedNotifications.filter((n) => !n.read).length);
                } catch (error) {
                    console.error("Error loading notifications:", error);
                    setNotifications([]);
                    setUnreadCount(0);
                }
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [address]);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        if (address && notifications.length >= 0) {
            localStorage.setItem(
                `notifications_${address}`,
                JSON.stringify(notifications)
            );
        }
    }, [notifications, address]);

    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now().toString() + Math.random().toString(36),
            timestamp: Date.now(),
            read: false,
            ...notification,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    const markAsRead = (notificationId) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
    };

    const clearNotification = (notificationId) => {
        setNotifications((prev) => {
            const notification = prev.find((n) => n.id === notificationId);
            const filtered = prev.filter((n) => n.id !== notificationId);

            if (notification && !notification.read) {
                setUnreadCount((count) => Math.max(0, count - 1));
            }

            return filtered;
        });
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Add a follow notification for a specific user
    const addFollowNotification = (toAddress, fromAddress, fromUsername) => {
        // Only add if the notification is for the current user
        if (address && toAddress.toLowerCase() === address.toLowerCase()) {
            addNotification({
                type: "follow",
                fromAddress,
                fromUsername,
                message: `${fromUsername} followed you`,
            });
        }
    };

    const value = {
        notifications,
        unreadCount,
        addNotification,
        addFollowNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within NotificationProvider"
        );
    }
    return context;
}
