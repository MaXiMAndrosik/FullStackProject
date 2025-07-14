import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Divider,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

// Компонент информационной панели
const ApartmentsSummary = ({ apartments }) => {
    // Рассчитываем статистику
    const calculateStats = () => {
        if (!apartments || apartments.length === 0) {
            return {
                total: 0,
                byRooms: {},
                totalArea: 0,
            };
        }

        const stats = {
            total: apartments.length,
            byRooms: {},
            totalArea: 0,
        };

        apartments.forEach((apartment) => {
            // Количество комнат
            const rooms = apartment.rooms || 0;
            stats.byRooms[rooms] = (stats.byRooms[rooms] || 0) + 1;

            // Общая площадь
            const areaValue = parseFloat(
                String(apartment.area).replace(",", ".")
            );
            if (!isNaN(areaValue)) {
                stats.totalArea += areaValue;
            }
        });

        return stats;
    };

    const stats = calculateStats();

    return (
        <Card
            sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 3,
                maxWidth: { xs: "100%", sm: "80%", md: 800 },
                mx: "auto",
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                    <HomeIcon sx={{ mr: 1, color: "primary.main" }} />
                    Статистика по квартирам
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    {/* Общее количество */}
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                            {stats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Всего квартир
                        </Typography>
                    </Box>

                    {/* Общая площадь */}
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                            {stats.totalArea.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            м² общая площадь
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Распределение по комнатам */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                    }}
                >
                    {Object.entries(stats.byRooms)
                        .sort((a, b) => a[0] - b[0])
                        .map(([rooms, count]) => (
                            <Chip
                                key={rooms}
                                label={`${rooms} комн.: ${count}`}
                                variant="outlined"
                                color="secondary"
                                size="small"
                            />
                        ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ApartmentsSummary;
