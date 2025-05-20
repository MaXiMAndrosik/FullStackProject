import { createContext, useContext, useState, useEffect } from "react";
import {
    fetchAnnouncements,
    createAnnouncement,
    deleteAnnouncement as apiDeleteAnnouncement,
    // mockFetchAnnouncements,
} from "../../app/api/announcementAPI";

const AdContext = createContext();

export const useAds = () => useContext(AdContext);

export const AdProvider = ({ children }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка обьявлений с бека, установка Context
    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            // Загрузка данных из Mock
            // const data = await mockFetchAnnouncements();

            // Загрузка данных с нашего сервера
            const data = await fetchAnnouncements();

            if (!data) {
                throw new Error("Некорректный формат данных");
            }

            const normalizedData = Array.isArray(data) ? data : [data];

            setAnnouncements(normalizedData);
        } catch (err) {
            setError(err.message);
            console.error("Ошибка загрузки объявлений:", err);
        } finally {
            setLoading(false);
        }
    };

    // Добавление обьявления на бек, обновление Context
    const addAnnouncement = async (newAnnouncement) => {
        // В режиме разработки (mock) просто добавляем локально
        // if (process.env.NODE_ENV === "development") {
        //     const mockAnnouncement = {
        //         ...newAnnouncement,
        //         id: Date.now(), // Генерируем временный id
        //     };
        //     setAnnouncements((prev) => [mockAnnouncement, ...prev]);
        //     return mockAnnouncement;
        // }

        try {
            const createdAnnouncement = await createAnnouncement(
                newAnnouncement
            );
            setAnnouncements((prev) => [newAnnouncement, ...prev]);
            return createdAnnouncement;
        } catch (error) {
            console.error("Ошибка при добавлении:", error);
            throw error;
        }
    };

    // Удаление объявления
    const deleteAnnouncement = async (id) => {
        try {
            await apiDeleteAnnouncement(id);
            setAnnouncements((prev) => prev.filter((ad) => ad.id !== id));
        } catch (error) {
            console.error("Ошибка при удалении:", error);
            throw error;
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    return (
        <AdContext.Provider
            value={{
                announcements,
                loading,
                error,
                addAnnouncement,
                deleteAnnouncement,
                refreshAnnouncements: loadAnnouncements,
            }}
        >
            {children}
        </AdContext.Provider>
    );
};

export default AdProvider;
