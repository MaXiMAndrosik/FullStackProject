import apiClient from "./client";
import {
    showSuccess,
    showError,
} from "../../shared/services/notificationService";

const API_URL = process.env.REACT_APP_FEEDBACK_ENDPOINT;

export const createFeedback = async (feedbackData) => {
    try {
        const response = await apiClient.post(API_URL, feedbackData);
        if (response.status < 200 || response.status >= 300) {
            showError("Неизвестная ошибка сервера");
        }
        showSuccess(
            "Спасибо за обращение! Мы свяжемся с вами в ближайшее время."
        );
        return response.data;
    } catch (error) {
        showError(error);
    }
};
