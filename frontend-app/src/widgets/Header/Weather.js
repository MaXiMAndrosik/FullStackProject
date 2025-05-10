import { useWeatherAPI } from "../../shared/hooks/useWeatherAPI";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

const Weather = () => {
    const { weatherData, isLoading, error } = useWeatherAPI();

    if (isLoading) {
        return (
            <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={24} />
                {/* <Typography>Загрузка погоды...</Typography> */}
            </Stack>
        );
    }

    if (error) {
        return (
            <Typography color="error">
                Не удалось загрузить данные о погоде
            </Typography>
        );
    }

    if (!weatherData || !weatherData.weather || !weatherData.main) {
        return null;
    }

    return (
        <>
            <Stack
                direction="row"
                sx={{
                    gap: 1,
                    margin: 0,
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="body1"
                    sx={{ color: "text.primary", fontWeight: 600, ml: 2 }}
                >
                    Фаниполь
                </Typography>
                <Avatar
                    sizes="small"
                    alt="Weather in Fanipol, BY"
                    src={`//openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/${weatherData.weather[0].icon}.png`}
                    sx={{ width: 64, height: 64 }}
                    variant="rounded"
                />
                <Typography
                    variant="body1"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                >
                    {Math.round(weatherData.main.temp)} °C
                </Typography>
            </Stack>
        </>
    );
};

export default Weather;
