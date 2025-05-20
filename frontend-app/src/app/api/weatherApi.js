// import axios from "axios";
import apiClient from "./client";
// import { toast } from "react-toastify";

// const MOCK_WEATHER_URL = "/mocks/weather.json";

export const fetchWeather = async (
    // city = process.env.REACT_APP_WEATHER_DEFAULT_CITY
) => {
    try {
        // Запрос данных mock
        // const response = await axios.get(MOCK_WEATHER_URL);

        // Запрос данных о погоде на сайте
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

        // Запрос данных о погоде с нашего сервера
        const response = await apiClient.get(
            `${process.env.REACT_APP_API_URL}/weather`
        );

        if (response.status < 200 || response.status >= 300) {
            return response.status;
            // toast.error(response.statusText || "Неизвестная ошибка сервера", {
            //     position: "top-right",
            //     autoClose: 1000,
            // });
        }

        return response.data;

    } catch (error) {
        // console.error("Error fetching weather:", error);
        return error;

        // Только для DEVELOPMENT
        // if (error.response) {
        //     toast.error(error.response.data.message, {
        //         position: "top-right",
        //         autoClose: 1000,
        //     });
        // } else if (error.request) {
        //     toast.error("Не удалось получить ответ от сервера", {
        //         position: "top-right",
        //         autoClose: 1000,
        //     });
        // } else {
        //     toast.error("Ошибка при выполнении запроса", {
        //         position: "top-right",
        //         autoClose: 1000,
        //     });
        // }
    }
};
