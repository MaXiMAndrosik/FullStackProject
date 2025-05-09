import apiClient from "./client";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_FEEDBACK_ENDPOINT;

export const createFeedback = async (feedbackData) => {
    console.log("POST: " + API_URL + "Data:" + feedbackData);
    try {
        const response = await apiClient.post(API_URL, feedbackData);
        if (response.status < 200 || response.status >= 300) {
            toast.error(response.statusText || "Неизвестная ошибка сервера", {
                position: "top-right",
                autoClose: 1000,
            });
        }
        toast.info(
            response.data.message ||
                "Спасибо за обращение! Мы свяжемся с вами в ближайшее время.",
            {
                position: "top-right",
                autoClose: 1000,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching feedback:", error);

        if (error.response) {
            toast.error(error.response.data.message, {
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
    }
};
