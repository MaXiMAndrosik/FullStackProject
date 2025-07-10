import React, { useState, useEffect } from "react";
import { Container, Box } from "@mui/material";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import { format } from "date-fns";

// Импортируем UI-компоненты диалогов
import ServiceDialog from "./components/ServiceDialog";
import TariffDialog from "./components/TariffDialog";
import ServicesTable from "./components/ServicesTable";
import TariffsTable from "./components/TariffsTable";

const AdminServicesPage = () => {
    const [services, setServices] = useState([]);
    const [openServices, setServicesOpen] = useState(false);
    const [calculationType, setCalculationType] = useState("fixed");
    const [openTariffs, setTariffsOpen] = useState(false);
    const [currentTariff, setCurrentTariff] = useState(null);
    const [currentService, setCurrentService] = useState(null);
    const [apartments, setApartments] = useState([]);

    // Загрузка услуг и тарифов
    useEffect(() => {
        fetchServices();
        fetchApartments();
    }, []);

    // Загрузка сервисов с тарифами
    const fetchServices = () => {
        apiClient
            .get("/admin/services")
            .then((res) => setServices(res.data))
            .catch((error) => {
                showError("Ошибка загрузки услуг");
                setServices([]);
            });
    };

    // Загрузка квартир для расчета
    const fetchApartments = () => {
        apiClient
            .get("/admin/apartments")
            .then((res) => setApartments(res.data))
            .catch((error) => {
                showError("Ошибка загрузки квартир");
                setApartments([]);
            });
    };

    // Единицы измерения для тарифов на услуги
    const unitLabels = {
        m2: "руб/м²",
        gcal: "руб/Гкал",
        m3: "руб/м³",
        kwh: "руб/кВт·ч",
        fixed: "руб",
    };

    // Функция для форматирования числа с удалением незначащих нулей
    const formatRate = (value) => {
        // Округляем до 4 знаков и удаляем незначащие нули
        const formatted = parseFloat(value)
            .toFixed(4)
            .replace(/\.?0+$/, "");
        // Если число целое - добавляем .0 для указания на десятичную дробь
        return formatted.includes(".") ? formatted : `${formatted}.0`;
    };

    // Получим все услуги отформатируем
    const processedServices = services.map((service) => {
        let currentTariff = "Нет активного";

        if (service.tariffs && Array.isArray(service.tariffs)) {
            const today = new Date();
            const activeTariff = service.tariffs.find((tariff) => {
                const startDate = new Date(tariff.start_date);
                const endDate = tariff.end_date
                    ? new Date(tariff.end_date)
                    : null;
                return startDate <= today && (!endDate || endDate >= today);
            });

            if (activeTariff) {
                const formattedRate = formatRate(activeTariff.rate);
                const unitLabel = unitLabels[activeTariff.unit] || "руб";
                currentTariff = `${formattedRate} ${unitLabel}`;
            }
        }

        return {
            ...service,
            current_tariff: currentTariff,
        };
    });

    // Обработчики для УСЛУГ
    // Обработчики диалога для услуг
    const handleServiceOpen = (service = null) => {
        setCurrentService(service);
        setServicesOpen(true);
    };
    const handleServiceClose = () => {
        setServicesOpen(false);
        setCurrentService(null);
    };
    // Сохранение услуги
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const serviceData = Object.fromEntries(data.entries());
        serviceData.is_active = serviceData.is_active === "on";

        try {
            if (currentService) {
                await apiClient.put(
                    `/admin/services/${currentService.id}`,
                    serviceData
                );
            } else {
                await apiClient.post("/admin/services", serviceData);
            }
            showSuccess("Услуга сохранена");
            fetchServices();
            handleServiceClose();
        } catch (error) {
            showError("Ошибка сохранения");
        }
    };
    // Переключение активности услуги
    const handleServiceToggle = async (id, isActive) => {
        try {
            await apiClient.put(`/admin/services/${id}/toggle-active`, {
                is_active: !isActive,
            });
            showSuccess("Статус изменен");
            fetchServices();
        } catch (error) {
            showError("Ошибка переключения");
        }
    };
    // Удаление услуги
    const handleServiceDelete = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить эту услугу?")) {
            try {
                await apiClient.delete(`/admin/services/${id}`);
                showSuccess("Услуга удалена");
                fetchServices();
            } catch (error) {
                showError("Ошибка удаления");
            }
        }
    };

    // Обработчики для ТАРИФОВ
    // ---------------------------------------------------------------------------------------------------------
    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };
    // Получим все тарифы из ответа сервера и отформатируем
    const allTariffs = services.flatMap((service) =>
        (service.tariffs || []).map((tariff) => {
            // Проверка и форматирование для каждого тарифа
            const isCurrent = (() => {
                const today = new Date();
                const startDate = new Date(tariff.start_date);
                const endDate = tariff.end_date
                    ? new Date(tariff.end_date)
                    : null;
                return startDate <= today && (!endDate || endDate >= today);
            })();

            const formattedRate = formatRate(tariff.rate);
            const unitLabel = unitLabels[tariff.unit] || "руб";

            return {
                ...tariff,
                id: tariff.id, // Убедимся, что ID присутствует
                service_name: service.name || "Неизвестная услуга",
                formatted_rate: `${formattedRate} ${unitLabel}`,
                formatted_start_date: formatDate(tariff.start_date),
                formatted_end_date: formatDate(tariff.end_date),
                is_current: isCurrent,
            };
        })
    );
    // Обработчики диалога
    const handleOpenTariff = (tariff = null) => {
        setCurrentTariff(tariff);
        setTariffsOpen(true);
    };
    const handleCloseTariff = () => {
        setTariffsOpen(false);
        setCurrentTariff(null);
    };
    // Сохранение тарифа
    const handleSubmitTariff = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const tariffData = Object.fromEntries(data.entries());

        // Преобразование пустых строк в null
        if (tariffData.end_date === "") tariffData.end_date = null;

        try {
            await apiClient.put(
                `/admin/tariffs/${currentTariff.id}`,
                tariffData
            );
            showSuccess("Тариф сохранен");
            fetchServices();
            handleCloseTariff();
        } catch (error) {
            showError("Ошибка сохранения");
        }
    };
    // Удаление тарифа
    const handleDeleteTariff = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этот тариф?")) {
            try {
                await apiClient.delete(`/admin/tariffs/${id}`);
                showSuccess("Тариф удален");
                fetchServices();
            } catch (error) {
                showError(error);
            }
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
                maxWidth={false}
                sx={{
                    pt: { xs: 14, sm: 8 },
                    pb: { xs: 8, sm: 8 },
                    width: "100%",
                    mb: 3,
                }}
            >
                <ServicesTable
                    services={processedServices}
                    onAdd={() => handleServiceOpen()}
                    onEdit={handleServiceOpen}
                    onDelete={handleServiceDelete}
                    onToggle={handleServiceToggle}
                />

                <TariffsTable
                    tariffs={allTariffs}
                    services={services}
                    onAdd={() => handleOpenTariff()}
                    onEdit={handleOpenTariff}
                    onDelete={handleDeleteTariff}
                />
            </Container>

            <ServiceDialog
                open={openServices}
                onClose={handleServiceClose}
                currentService={currentService}
                onSubmit={handleServiceSubmit}
                calculationType={calculationType}
                setCalculationType={setCalculationType}
            />

            <TariffDialog
                open={openTariffs}
                onClose={handleCloseTariff}
                currentTariff={currentTariff}
                onSubmit={handleSubmitTariff}
                services={services}
                apartments={apartments}
            />

        </Box>
    );
};

export default AdminServicesPage;
