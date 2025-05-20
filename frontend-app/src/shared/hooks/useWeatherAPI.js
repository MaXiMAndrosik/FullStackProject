import { useState, useEffect } from "react";
import { fetchWeather } from "../../app/api/weatherApi";

export const useWeatherAPI = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    const loadWeatherData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchWeather();
            if (data.code === "ERR_NETWORK") {
                setError(data.message);
            }
            if (data.code === "ERR_BAD_RESPONSE") {
                setError(data.message);
            }
            setWeatherData(data);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWeatherData();
    }, []);

    return {
        weatherData,
        isLoading,
        error,
    };
};
