import axios from "axios";
import apiClient from "./client";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const ADS_ENDPOINT =
    process.env.REACT_APP_ADVERTISEMENTS_ENDPOINT || "/announcements";
const ADS_URL = `${API_URL}${ADS_ENDPOINT}`;

// Для разработки - мок-функции
export const mockFetchAnnouncements = async () => {
    console.log("GET: /mocks/announcements.json");
    const response = await axios.get("/mocks/announcements.json");
    return response.data;
};

const checkURL = () => {
    if (!process.env.REACT_APP_API_URL) {
        console.warn(
            "REACT_APP_API_URL is not defined, using fallback:",
            API_URL
        );
    }
    if (!process.env.REACT_APP_ADVERTISEMENTS_ENDPOINT) {
        console.warn(
            "REACT_APP_ADVERTISEMENTS_ENDPOINT is not defined, using fallback:",
            ADS_ENDPOINT
        );
    }
};

// Получение объявлений с бекенда
export const fetchAnnouncements = async () => {
    checkURL();
    console.log("GET: " + ADS_URL);

    try {
        const response = await apiClient.get(ADS_URL);
        if (response.status < 200 || response.status >= 300) {
            toast.error(response.statusText || "Неизвестная ошибка сервера", {
                position: "top-right",
                autoClose: 1000,
            });
        }
        return response.data;
    } catch (error) {
        handleApiError(error, "Ошибка при получении объявлений");
    }
};

// Отправка нового объявления на бек для добавления
export const createAnnouncement = async (announcementData) => {
    checkURL();
    console.log("POST: " + ADS_URL + "Data:" + announcementData);
    try {
        const response = await apiClient.post(ADS_URL, announcementData);
        toast.success("Сообшение успешно добавлено", {
            position: "top-right",
            autoClose: 1000,
        });
        return response.data;
    } catch (error) {
        handleApiError(error, "Ошибка при создании объявления");
    }
};

// Удаление объявления с бека
export const deleteAnnouncement = async (id) => {
    checkURL();
    console.log("DELETE: " + ADS_URL);
    try {
        await apiClient.delete(`${ADS_URL}/${id}`);
        toast.success("Сообшение успешно удалено", {
            position: "top-right",
            autoClose: 1000,
        });
    } catch (error) {
        handleApiError(error, "Ошибка при удалении объявления");
    }
};

// Обработка ошибок API
const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);

    if (error.response) {
        toast.error(error.response.data.message || defaultMessage, {
            position: "top-right",
            autoClose: 1000,
        });
    } else if (error.request) {
        toast.error("Не удалось получить ответ от сервера", {
            position: "top-right",
            autoClose: 1000,
        });
    } else {
        toast.error("Ошибка при выполнении запроса", {
            position: "top-right",
            autoClose: 1000,
        });
    }
};
