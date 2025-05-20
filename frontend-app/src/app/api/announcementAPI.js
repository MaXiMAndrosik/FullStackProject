import axios from "axios";
import apiClient from "./client";
import {
    showSuccess,
    showError,
} from "../../shared/services/notificationService";

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
    try {
        const response = await apiClient.get(ADS_URL);
        if (response.status < 200 || response.status >= 300) {
            showError("Неизвестная ошибка сервера");
        }
        return response.data;
    } catch (error) {
        showError(error);
    }
};

// Отправка нового объявления на бек для добавления
export const createAnnouncement = async (announcementData) => {
    checkURL();
    try {
        const response = await apiClient.post(ADS_URL, announcementData);
        showSuccess("Сообшение успешно добавлено");
        return response.data;
    } catch (error) {
        showError(error);
        setTimeout(() => {
             window.location.reload();
        }, 3000);
       
    }
};

// Удаление объявления с бека
export const deleteAnnouncement = async (id) => {
    checkURL();
    try {
        await apiClient.delete(`${ADS_URL}/${id}`);
        showSuccess("Сообшение успешно удалено");
    } catch (error) {
        showError(error);
    }
};
