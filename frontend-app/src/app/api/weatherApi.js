import axios from "axios";
import apiClient from "./client";
import { toast } from "react-toastify";

const MOCK_WEATHER_URL = "/mocks/weather.json";
console.log(process.env.REACT_APP_WEATHER_API_URL);
console.log("GET: /mocks/weather.json");

export const fetchWeather = async (
    city = process.env.REACT_APP_WEATHER_DEFAULT_CITY
) => {
    try {
        const response = await axios.get(MOCK_WEATHER_URL);

        // const response = await apiClient.get(
        //     process.env.REACT_APP_WEATHER_API_URL,
        //     {
        //         params: {
        //             q: city,
        //             appid: process.env.REACT_APP_WEATHER_API_KEY,
        //             units: process.env.REACT_APP_WEATHER_UNITS,
        //             lang: process.env.REACT_APP_WEATHER_LANG,
        //         },
        //     }
        // );

        if (response.status < 200 || response.status >= 300) {
            toast.error(response.statusText || "Неизвестная ошибка сервера", {
                position: "top-right",
                autoClose: 1000,
            });
        }

        return response.data;
    } catch (error) {
        console.error("Error fetching weather:", error);

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
