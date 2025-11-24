import React, { useState, useEffect } from "react";
import { Container, Box, CircularProgress } from "@mui/material";
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
    const [meterTypes, setMeterTypes] = useState([]);

    // Добавляем состояния загрузки и ошибок
    const [loading, setLoading] = useState({
        services: false,
        apartments: false,
        meterTypes: false,
        action: false,
    });
    const [errors, setErrors] = useState({
        services: null,
        apartments: null,
        meterTypes: null,
    });

    // Загрузка услуг и тарифов
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    fetchServices(),
                    fetchApartments(),
                    fetchMeterTypes(),
                ]);
            } catch (error) {
                showError("Ошибка загрузки данных");
            }
        };

        loadInitialData();
    }, []);

    // Обновляем функции загрузки с обработкой состояний
    const fetchServices = async () => {
        setLoading((prev) => ({ ...prev, services: true }));
        setErrors((prev) => ({ ...prev, services: null }));
        try {
            const res = await apiClient.get("/admin/services");
            setServices(res.data.data);
        } catch (error) {
            const errorMsg = "Ошибка загрузки услуг";
            showError(errorMsg);
            setErrors((prev) => ({ ...prev, services: errorMsg }));
            setServices([]);
        } finally {
            setLoading((prev) => ({ ...prev, services: false }));
        }
    };

    // Загрузка типов счетчиков для привязки
    const fetchMeterTypes = async () => {
        setLoading((prev) => ({ ...prev, meterTypes: true }));
        setErrors((prev) => ({ ...prev, meterTypes: null }));
        try {
            const response = await apiClient.get("/admin/meter-types");
            setMeterTypes(response.data);
        } catch (error) {
            const errorMsg = "Ошибка при загрузке типов счетчиков";
            showError(errorMsg);
            setErrors((prev) => ({ ...prev, meterTypes: errorMsg }));
            setMeterTypes([]);
        } finally {
            setLoading((prev) => ({ ...prev, meterTypes: false }));
        }
    };

    // Загрузка квартир для расчета
    const fetchApartments = async () => {
        setLoading((prev) => ({ ...prev, apartments: true }));
        setErrors((prev) => ({ ...prev, apartments: null }));
        try {
            const res = await apiClient.get("/admin/apartments");
            setApartments(res.data);
        } catch (error) {
            const errorMsg = "Ошибка загрузки квартир";
            showError(errorMsg);
            setErrors((prev) => ({ ...prev, apartments: errorMsg }));
            setApartments([]);
        } finally {
            setLoading((prev) => ({ ...prev, apartments: false }));
        }
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
        setCalculationType(service?.calculation_type || "fixed");
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
        // const serviceData = Object.fromEntries(data.entries());
        const serviceData = {};
        // Обрабатываем все поля, кроме meter_type_ids
        for (let [key, value] of data.entries()) {
            if (key !== "meter_type_ids") {
                serviceData[key] = value;
            }
        }

        // Правильно обрабатываем meter_type_ids - разбиваем строку на массив чисел
        const meterTypeIdsValue = data.get("meter_type_ids");

        if (meterTypeIdsValue) {
            // Если это строка с запятыми, разбиваем на массив
            if (
                typeof meterTypeIdsValue === "string" &&
                meterTypeIdsValue.includes(",")
            ) {
                serviceData.meter_type_ids = meterTypeIdsValue
                    .split(",")
                    .map((id) => parseInt(id.trim()));
            } else {
                // Если это одиночное значение
                serviceData.meter_type_ids = [parseInt(meterTypeIdsValue)];
            }
        } else {
            serviceData.meter_type_ids = [];
        }

        serviceData.is_active = serviceData.is_active === "on";

        try {
            let response;
            if (currentService) {
                response = await apiClient.put(
                    `/admin/services/${currentService.id}`,
                    serviceData
                );
            } else {
                response = await apiClient.post("/admin/services", serviceData);
            }
            showSuccess(response.data.message);
            fetchServices();
            handleServiceClose();
        } catch (error) {
            showError(error);
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
            const response = await apiClient.put(
                `/admin/tariffs/${currentTariff.id}`,
                tariffData
            );
            showSuccess(response.data.message);
            fetchServices();
            handleCloseTariff();
        } catch (error) {
            showError(error);
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

    // Показываем загрузку если грузятся основные данные
    if (loading.services || loading.services) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        );
    }

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
                    meterTypes={meterTypes}
                    loading={loading.action}
                />

                <TariffsTable
                    tariffs={allTariffs}
                    services={services}
                    onAdd={() => handleOpenTariff()}
                    onEdit={handleOpenTariff}
                    onDelete={handleDeleteTariff}
                    loading={loading.action}
                />
            </Container>

            <ServiceDialog
                open={openServices}
                onClose={handleServiceClose}
                currentService={currentService}
                onSubmit={handleServiceSubmit}
                calculationType={calculationType}
                setCalculationType={setCalculationType}
                meterTypes={meterTypes}
                loading={loading.action}
            />

            <TariffDialog
                open={openTariffs}
                onClose={handleCloseTariff}
                currentTariff={currentTariff}
                onSubmit={handleSubmitTariff}
                services={services}
                apartments={apartments}
                loading={loading.action}
            />
        </Box>
    );
};

export default AdminServicesPage;
