import { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "wagmi";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { address } = useAccount();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from localStorage when address changes
    const loadNotifications = () => {
        if (address) {
            const storageKey = `notifications_${address.toLowerCase()}`;
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setNotifications(parsed);
                } catch (error) {
                    console.error("Error loading notifications:", error);
                }
            } else {
                // Add a welcome notification for first-time users to prove it works
                const welcome = {
                    id: 'welcome',
                    type: 'follow',
                    fromAddress: '0x0000000000000000000000000000000000000000',
                    fromUsername: 'Liberty Social',
                    message: 'Welcome to the decentralized web!',
                    timestamp: Date.now(),
                    read: false
                };
                setNotifications([welcome]);
            }
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [address]);

    // Derived unread count
    useEffect(() => {
        setUnreadCount(notifications.filter((n) => !n.read).length);
    }, [notifications]);

    // Sync across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (address && e.key === `notifications_${address.toLowerCase()}`) {
                loadNotifications();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [address]);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        if (address) {
            localStorage.setItem(
                `notifications_${address.toLowerCase()}`,
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
    };

    const markAsRead = (notificationId) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    };

    const clearNotification = (notificationId) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // Helper to add a notification to any user's storage
    const sendNotification = (toAddress, notification) => {
        if (!toAddress) return;

        const targetAddress = toAddress.toLowerCase();
        const notificationData = {
            id: Date.now().toString() + Math.random().toString(36),
            timestamp: Date.now(),
            read: false,
            ...notification,
        };

        // If it's for the current user, update state directly
        // This will trigger the save useEffect
        if (address && targetAddress === address.toLowerCase()) {
            setNotifications((prev) => [notificationData, ...prev]);
        } else {
            // If it's for someone else, write directly to their localStorage
            const storageKey = `notifications_${targetAddress}`;
            const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
            localStorage.setItem(storageKey, JSON.stringify([notificationData, ...existing]));
        }
    };

    // Add a follow notification for a specific user
    const addFollowNotification = (toAddress, fromAddress, fromUsername, isFollowBack = false) => {
        sendNotification(toAddress, {
            type: "follow",
            fromAddress,
            fromUsername,
            isFollowBack,
            message: isFollowBack ? `${fromUsername} followed you back` : `${fromUsername} followed you`,
        });
    };

    // Add a like notification for a specific user
    const addLikeNotification = (toAddress, fromAddress, fromUsername, postId) => {
        sendNotification(toAddress, {
            type: "like",
            fromAddress,
            fromUsername,
            postId,
            message: `${fromUsername} liked your post`,
        });
    };

    // Add a comment notification for a specific user
    const addCommentNotification = (toAddress, fromAddress, fromUsername, postId, commentText) => {
        sendNotification(toAddress, {
            type: "comment",
            fromAddress,
            fromUsername,
            postId,
            message: `${fromUsername} commented: "${commentText}"`,
        });
    };

    const value = {
        notifications,
        unreadCount,
        addNotification,
        addFollowNotification,
        addLikeNotification,
        addCommentNotification,
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
