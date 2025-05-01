import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const NotificationDropdown = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!userId) {
            setErrorMsg("User ID not available");
            console.log("No userId provided to NotificationDropdown");
            return;
        }

        try {
            console.log("Fetching notifications for:", userId);
            const response = await fetch(`${API_BASE_URL}/api/notifications/get-user-notifications/${userId}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Notifications data:", data);

            if (data.status) {
                setNotifications(data.data);
                const unreadNotifs = data.data.filter(notif => !notif.read);
                setUnreadCount(unreadNotifs.length);
                setErrorMsg(null);
            } else {
                setErrorMsg(data.message || "Failed to fetch notifications");
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setErrorMsg("Error loading notifications");
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/mark-as-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status) {
                fetchNotifications();
            } else {
                setErrorMsg("Failed to mark notification as read");
            }
        } catch (error) {
            console.error("Error marking as read:", error);
            setErrorMsg("Error updating notification");
        }
    };

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000); // Fetch every minute
            return () => clearInterval(interval);
        }
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-green-600 transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg text-gray-800 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                        {errorMsg && (
                            <div className="p-4 text-center text-red-500">
                                {errorMsg}
                            </div>
                        )}
                        {!errorMsg && notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                        !notification.read ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => markAsRead(notification._id)}
                                >
                                    <h4 className="font-medium">{notification.title}</h4>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;