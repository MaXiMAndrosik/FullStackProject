import React, { useState, useEffect } from "react";
import { Container, Box, CircularProgress, Alert } from "@mui/material";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import { getTariffStatusDisplay } from "./ui/StatusHelper";
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
    const [oldTariffs, setOldTariffs] = useState([]);

    // Добавляем состояния загрузки и ошибок
    const [loading, setLoading] = useState({
        services: false,
        oldTariffs: false,
        apartments: false,
        meterTypes: false,
        action: false,
    });
    const [errors, setErrors] = useState({
        services: null,
        oldTariffs: null,
        apartments: null,
        meterTypes: null,
    });

    // Загрузка услуг и тарифов
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    fetchServices(),
                    fetchOldTariffs(),
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

    // Загружаем тарифы от удаленных услуг
    const fetchOldTariffs = async () => {
        setLoading((prev) => ({ ...prev, oldTariffs: true }));
        setErrors((prev) => ({ ...prev, oldTariffs: null }));
        try {
            const res = await apiClient.get("/admin/tariffs/old"); // новый endpoint
            setOldTariffs(res.data.data);
        } catch (error) {
            const errorMsg = "Ошибка загрузки архивных тарифов";
            showError(errorMsg);
            setErrors((prev) => ({ ...prev, oldTariffs: errorMsg }));
            setOldTariffs([]);
        } finally {
            setLoading((prev) => ({ ...prev, oldTariffs: false }));
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

    // // Единицы измерения для тарифов на услуги
    // const unitLabels = {
    //     m2: "руб/м²",
    //     gcal: "руб/Гкал",
    //     m3: "руб/м³",
    //     kwh: "руб/кВт·ч",
    //     fixed: "руб",
    // };

    // // Функция для форматирования числа с удалением незначащих нулей
    // const formatRate = (value) => {
    //     // Округляем до 4 знаков и удаляем незначащие нули
    //     const formatted = parseFloat(value)
    //         .toFixed(4)
    //         .replace(/\.?0+$/, "");
    //     // Если число целое - добавляем .0 для указания на десятичную дробь
    //     return formatted.includes(".") ? formatted : `${formatted}.0`;
    // };

    // Получим все услуги отформатируем
    const processedServices = services.map((service) => {
        const currentTariffObj = service.current_tariff;

        let formattedRate = "Ожидается";

        if (currentTariffObj) {
            formattedRate = currentTariffObj.formatted_rate;
        }

        return {
            ...service,
            current_tariff_obj: currentTariffObj,
            current_tariff_display: formattedRate,
            tariff_status: currentTariffObj?.status || "none",
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
        setLoading((prev) => ({ ...prev, action: true }));
        const data = new FormData(e.target);
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
                if (response.data.success) {
                    const updatedService = response.data.data;
                    setServices((prev) =>
                        prev.map((item) =>
                            item.id === updatedService.id
                                ? updatedService
                                : item
                        )
                    );
                    showSuccess(response.data.message);
                }
            } else {
                response = await apiClient.post("/admin/services", serviceData);
                if (response.data.success) {
                    const newService = response.data.data;
                    setServices((prev) => [...prev, newService]);
                    showSuccess(response.data.message);
                }
            }
            handleServiceClose();
        } catch (error) {
            showError(
                error.response?.data?.message || "Ошибка обработки услуги"
            );
        } finally {
            setLoading((prev) => ({ ...prev, action: false }));
        }
    };

    // Переключение активности услуги
    const handleServiceToggle = async (id, isActive) => {
        setLoading((prev) => ({ ...prev, action: true }));
        try {
            const response = await apiClient.put(
                `/admin/services/${id}/toggle-active`,
                {
                    is_active: !isActive,
                }
            );

            if (response.data.success) {
                const updatedService = response.data.data;
                setServices((prev) =>
                    prev.map((item) =>
                        item.id === updatedService.id ? updatedService : item
                    )
                );
                showSuccess(response.data.message);
            }
        } catch (error) {
            showError(error.response?.data?.message || "Ошибка переключения");
        } finally {
            setLoading((prev) => ({ ...prev, action: false }));
        }
    };

    // Удаление услуги
    const handleServiceDelete = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить эту услугу?")) {
            setLoading((prev) => ({ ...prev, action: true }));
            try {
                const response = await apiClient.delete(
                    `/admin/services/${id}`
                );

                if (response.data.success) {
                    setServices((prev) =>
                        prev.filter((item) => item.id !== id)
                    );
                    await fetchOldTariffs();
                    showSuccess(response.data.message);
                }
            } catch (error) {
                showError(error.response?.data?.message || "Ошибка удаления");
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
            }
        }
    };

    // Обработчики для ТАРИФОВ
    // ---------------------------------------------------------------------------------------------------------
    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };

    // Получим все тарифы из ответа сервера и отформатируем
    const processedTariffsFromServices = services.flatMap((service) =>
        (service.tariffs || []).map((tariff) => {
            const statusInfo = getTariffStatusDisplay({
                ...tariff,
                service_is_active: service.is_active,
                is_service_deleted: false,
            });

            return {
                ...tariff,
                id: tariff.id,
                service_name: service.name || "Неизвестная услуга",
                service_is_active: service.is_active,
                is_service_deleted: false,
                formatted_rate: tariff.formatted_rate,
                formatted_start_date: formatDate(tariff.start_date),
                formatted_end_date: formatDate(tariff.end_date),
                status: tariff.status,
                status_display: statusInfo.displayText,
                status_color: statusInfo.color,
                status_tooltip: statusInfo.tooltip,
                status_show_dot: statusInfo.showDot,
            };
        })
    );

    // Получим все тарифы без связанных услуг из ответа сервера и отформатируем
    const processedOldTariffs = (oldTariffs || [])
        .filter((tariff) => tariff != null)
        .map((tariff) => {
            const statusInfo = getTariffStatusDisplay({
                ...tariff,
                service_is_active: false,
                is_service_deleted: true,
            });

            return {
                ...tariff,
                id: tariff.id,
                service_name: tariff.service_name || "Удаленная услуга",
                service_is_active: false,
                is_service_deleted: true,
                formatted_rate: tariff.formatted_rate,
                formatted_start_date: formatDate(tariff.start_date),
                formatted_end_date: formatDate(tariff.end_date),
                status: tariff.status,
                status_display: statusInfo.displayText,
                status_color: statusInfo.color,
                status_tooltip: statusInfo.tooltip,
                status_show_dot: statusInfo.showDot,
            };
        });

    // Объединяем и сортируем
    const allTariffs = [
        ...processedTariffsFromServices, // сначала тарифы связанных услуг
        ...processedOldTariffs, // потом тарифы без связанных услуг
    ].sort((a, b) => {
        // if (!a.is_service_deleted && b.is_service_deleted) return -1;
        // if (a.is_service_deleted && !b.is_service_deleted) return 1;
        // // Затем по статусу: current -> future -> expired
        // const statusOrder = {
        //     current: 1,
        //     future: 2,
        //     expired: 3,
        //     disabled: 4,
        // };
        // const statusA = statusOrder[a.status] || 5;
        // const statusB = statusOrder[b.status] || 5;
        // if (statusA !== statusB) return statusA - statusB;
        // // Затем по дате начала (новые сверху)
        // return new Date(b.start_date) - new Date(a.start_date);
    });

    // Обработчики диалога
    const handleOpenTariff = (tariff = null) => {
        setCurrentTariff(tariff);
        setTariffsOpen(true);
    };
    const handleCloseTariff = () => {
        setTariffsOpen(false);
        setCurrentTariff(null);
    };

    // Обновление тарифа
    const handleSubmitTariff = async (e) => {
        e.preventDefault();
        setLoading((prev) => ({ ...prev, action: true }));

        const data = new FormData(e.target);
        const tariffData = Object.fromEntries(data.entries());

        // Преобразование пустых строк в null
        if (tariffData.end_date === "") tariffData.end_date = null;

        try {
            const response = await apiClient.put(
                `/admin/tariffs/${currentTariff.id}`,
                tariffData
            );

            if (response.data.success) {
                const updatedService = response.data.data;
                setServices((prev) =>
                    prev.map((service) =>
                        service.id === updatedService.id
                            ? updatedService
                            : service
                    )
                );
                showSuccess(response.data.message);
            }

            handleCloseTariff();
        } catch (error) {
            showError(
                error.response?.data?.message || "Ошибка обновления тарифа"
            );
        } finally {
            setLoading((prev) => ({ ...prev, action: false }));
        }
    };

    // Удаление тарифа
    const handleDeleteTariff = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этот тариф?")) {
            setLoading((prev) => ({ ...prev, action: true }));
            try {
                const response = await apiClient.delete(`/admin/tariffs/${id}`);

                if (response.data.success) {
                    showSuccess(response.data.message);

                    if (response.data.data) {
                        const updatedService = response.data.data;
                        setServices((prev) =>
                            prev.map((service) =>
                                service.id === updatedService.id
                                    ? updatedService
                                    : service
                            )
                        );
                    } else {
                        setOldTariffs((prev) =>
                            prev.filter((tariff) => tariff.id !== id)
                        );
                    }
                }
            } catch (error) {
                showError(
                    error.response?.data?.message || "Ошибка удаления тарифа"
                );
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
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
                {/* Показываем ошибки */}
                {errors.services && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.services}
                    </Alert>
                )}
                {errors.apartments && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {errors.apartments}
                    </Alert>
                )}
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
