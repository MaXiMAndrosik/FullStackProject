import React, { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import OwnerMeterReadingCards from "./components/OwnerMeterReadingCards";

const OwnerMeterReadingPage = () => {
    const [readingsData, setReadingsData] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReadings();
        fetchServices();
    }, [fetchReadings]);

    const fetchReadings = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/owner/meter-readings");
            const processedData = processReadingsData(response.data.data || []);
            setReadingsData(processedData);
        } catch (error) {
            showError("Ошибка загрузки показаний счетчиков");
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await apiClient.get("/owner/services");
            setServices(response.data.data || []);
        } catch (error) {
            showError("Ошибка загрузки тарифов");
        }
    };

    // Выборка и преобразование данных счетчиков из ответа сервера
    const processReadingsData = (data) => {
        const currentDate = new Date();
        const currentMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const previousMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
        );

        // Вычисляем ключи для текущего и предыдущих периодов
        const currentPeriodKey = `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
        ).padStart(2, "0")}`;
        const previousPeriodKey = `${previousMonth.getFullYear()}-${String(
            previousMonth.getMonth() + 1
        ).padStart(2, "0")}`;
        const previousPreviousPeriodKey = `${previousMonth.getFullYear()}-${String(
            previousMonth.getMonth()
        ).padStart(2, "0")}`;

        return data.map((item) => {
            const meter = item.meter;
            const readings = item.readings;

            // Получаем (считываем) данные счетчиков по ключам
            const currentReading = readings[currentPeriodKey];
            let previousReading = readings[previousPeriodKey];

            // Если показаний не подавал в прошлом месяце
            if (!previousReading?.value) {
                previousReading = readings[previousPreviousPeriodKey];
            }

            // Расчет текущего расхода если есть текущие показания
            const currentConsumption =
                currentReading.value !== null
                    ? currentReading.value - previousReading.value
                    : null;

            return {
                // Данные счетчика
                id: meter.id,
                type: meter.type?.name || "Неизвестный тип",
                unit: meter.type?.unit || "ед.",
                serialNumber: meter.serial_number,
                nextVerificationDate: meter.next_verification_date,
                // Данные текущего периода (которые надо подать)
                currentReading: currentReading?.value || null,
                currentReadingId: currentReading?.id || null,
                currentPeriod: currentReading?.period || null,
                // Данные прошедшего периода
                previousReading: previousReading?.value || null,
                previousPeriod: previousReading?.period || null,
                // Вычисленные данные
                currentConsumption: currentConsumption,
            };
        });
    };

    const handleSaveReading = async (
        meterId,
        newReading,
        newConsumption,
        isConsumptionInput = false
    ) => {
        const item = readingsData.find((item) => item.id === meterId);

        if (!item) {
            showError("Счетчик не найден");
            return;
        }

        let finalReading;

        if (isConsumptionInput) {
            finalReading = item.previousReading + newConsumption;
        } else {
            finalReading = newReading;
        }

        try {
            const readingData = {
                meter_id: meterId,
                value: Math.round(finalReading),
                period: `${item.currentPeriod}-25`,
            };

            if (item.currentReadingId) {
                await apiClient.put(
                    `/owner/meter-readings/${item.currentReadingId}`,
                    readingData
                );
            } else {
                await apiClient.post("/owner/meter-readings", readingData);
            }

            showSuccess("Показания отправлены");
        } catch (error) {
            showError(
                error.response?.data?.message || "Ошибка сохранения показаний"
            );
        }
    };

    return (
        <Box
            component="section"
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
            })}
        >
            <Container
                // maxWidth="lg"
                sx={{
                    pt: { xs: 14, sm: 8 },
                    pb: { xs: 8, sm: 8 },
                }}
            >
                {/* Заголовок страницы */}
                <Typography
                    variant="h2"
                    sx={{
                        textAlign: "center",
                        mb: 4,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    Показания
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        счетчиков
                    </Typography>
                </Typography>

                {/* Описание */}
                <Box
                    sx={{
                        backgroundColor: "background.paper",
                        borderRadius: 2,
                        p: 4,
                        mb: 2,
                        boxShadow: 1,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="caption">
                        💡 Можно вводить как показания, так и расход - значения
                        пересчитаются автоматически
                    </Typography>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    {/* Карточки */}
                    <OwnerMeterReadingCards
                        readingsData={readingsData}
                        loading={loading}
                        services={services}
                        onSaveReading={handleSaveReading}
                        onRefresh={fetchReadings}
                    />
                </Box>
            </Container>
        </Box>
    );
};

export default OwnerMeterReadingPage;
