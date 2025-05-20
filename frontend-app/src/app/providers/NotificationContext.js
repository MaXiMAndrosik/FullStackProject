import { createContext, useState, useEffect } from "react";
import { setNotificationHandler } from "../../shared/services/notificationService";
import NotificationModal from "../../shared/services/NotificationModal";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        setNotificationHandler(setNotification);
        return () => setNotificationHandler(null);
    }, []);

    const closeNotification = () => setNotification(null);

    return (
        <NotificationContext.Provider value={{}}>
            {children}
            {notification && (
                <NotificationModal
                    open={true}
                    onClose={closeNotification}
                    type={notification.type}
                    message={notification.message}
                    duration={notification.duration}
                />
            )}
        </NotificationContext.Provider>
    );
}
