import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Box, CircularProgress, Alert } from "@mui/material";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import { format } from "date-fns";

// Импортируем UI-компоненты диалогов
import AssignmentDialog from "./components/AssignmentServicesDialog";
import AssignmentsServicesTable from "./components/AssignmentsServicesTable";
import AssignmentsTariffsTable from "./components/AssignmentsTariffsTable";
import AssignmentTariffDialog from "./components/AssignmentTariffDialog";

const AdminServicesAssignmentsPage = () => {
    const [assignmentsServices, setAssignmentsServices] = useState([]);
    const [openAssignment, setAssignmentOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [apartments, setApartments] = useState([]);
    const [selectedEntrances, setSelectedEntrances] = useState([]);
    const [selectedApartments, setSelectedApartments] = useState([]);
    const [assignmentScope, setAssignmentScope] = useState(null);
    const [calculationType, setCalculationType] = useState("fixed");
    const [openTariffs, setTariffsOpen] = useState(false);
    const [currentTariff, setCurrentTariff] = useState(null);

    // Добавляем состояния загрузки и ошибок
    const [loading, setLoading] = useState({
        assignments: false,
        apartments: false,
        action: false,
    });
    const [errors, setErrors] = useState({
        assignments: null,
        apartments: null,
    });

    // Загрузка услуг и тарифов
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    fetchAssignmentsServices(),
                    fetchApartments(),
                ]);
            } catch (error) {
                showError("Ошибка загрузки данных");
            }
        };

        loadInitialData();
    }, []);

    // Загрузка сервисов с тарифами
    const fetchAssignmentsServices = async () => {
        setLoading((prev) => ({ ...prev, assignments: true }));
        setErrors((prev) => ({ ...prev, assignments: null }));

        try {
            const res = await apiClient.get("/admin/service-assignments");
            setAssignmentsServices(res.data);
        } catch (error) {
            const errorMsg = "Ошибка загрузки услуг";
            showError(errorMsg);
            setErrors((prev) => ({ ...prev, assignments: errorMsg }));
            setAssignmentsServices([]);
        } finally {
            setLoading((prev) => ({ ...prev, assignments: false }));
        }
    };

    // Загрузка квартир
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

    // ---------------------------------------------------------------------------------------------------
    // Единицы измерения для тарифов на услуги
    const unitLabels = {
        m2: "руб/м²",
        gcal: "руб/Гкал",
        m3: "руб/м³",
        kwh: "руб/кВт·ч",
        fixed: "руб",
    };

    // Функция для форматирования числа с удалением незначащих нулей
    const formatRate = useCallback((value) => {
        const formatted = parseFloat(value)
            .toFixed(4)
            .replace(/\.?0+$/, "");
        return formatted.includes(".") ? formatted : `${formatted}.0`;
    }, []);

    const formatDate = useCallback((dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    }, []);

    // ---------------------------------------------------------------------------------------------------
    // Получим все услуги и отформатируем - исправляем useMemo
    const allAssignmentsServices = useMemo(() => {
        return assignmentsServices.map((service) => {
            let currentTariff = "Нет активного";
            let tariffStatus = "none"; // 'active', 'future', 'expired', 'none'

            if (service.tariff) {
                const today = new Date();
                const startDate = new Date(service.tariff.start_date);
                const endDate = service.tariff.end_date
                    ? new Date(service.tariff.end_date)
                    : null;

                if (startDate <= today && (!endDate || endDate >= today)) {
                    // Активный тариф
                    const formattedRate = formatRate(service.tariff.rate);
                    const unitLabel = unitLabels[service.tariff.unit] || "руб";
                    currentTariff = `${formattedRate} ${unitLabel}`;
                    tariffStatus = "active";
                } else if (startDate > today) {
                    // Будущий тариф
                    currentTariff = "Ожидается";
                    tariffStatus = "future";
                } else if (endDate && endDate < today) {
                    // Устаревший тариф
                    currentTariff = "Архивный";
                    tariffStatus = "expired";
                }

                // Если не нашли подходящий тариф, но есть устаревшие
                if (tariffStatus === "none") {
                    if (endDate && endDate < today) {
                        currentTariff = "Архивный";
                        tariffStatus = "expired";
                    }
                }
            }

            return {
                ...service,
                current_tariff: currentTariff,
                tariff_status: tariffStatus,
            };
        });
    }, [assignmentsServices, formatRate]);

    // Получим все номера подьездов
    const entrances = useMemo(
        () => [...new Set(apartments.map((a) => a.entrance))].sort(),
        [apartments]
    );

    // ---------------------------------------------------------------------------------------------------
    // Получим все тарифы из ответа сервера и отформатируем
    const allTariffs = useMemo(
        () =>
            assignmentsServices.flatMap((service) => {
                if (!service.tariff) return []; // Изменили service.tariffs на service.tariff

                const today = new Date();
                const startDate = new Date(service.tariff.start_date);
                const endDate = service.tariff.end_date
                    ? new Date(service.tariff.end_date)
                    : null;

                // Определяем статус тарифа - СОХРАНЯЕМ ВАШУ ЛОГИКУ ПОРЯДКА ПРОВЕРОК
                let status;
                let statusText;

                if (endDate && endDate < today) {
                    status = "expired";
                    statusText = "Архивный";
                } else if (startDate > today) {
                    status = "future";
                    statusText = "Будущий";
                } else if (!service.is_active) {
                    status = "disabled";
                    statusText = "Отключен";
                } else {
                    status = "current";
                    statusText = "Активен";
                }

                const formattedRate = formatRate(service.tariff.rate);
                const unitLabel = unitLabels[service.tariff.unit] || "руб";

                return {
                    ...service.tariff,
                    id: service.tariff.id,
                    service_name: service.name || "Неизвестная услуга",
                    service_is_active: service.is_active,
                    formatted_rate: `${formattedRate} ${unitLabel}`,
                    formatted_start_date: formatDate(service.tariff.start_date),
                    formatted_end_date: formatDate(service.tariff.end_date),
                    status: status, // 'disabled', 'current', 'expired', 'future'
                    statusText: statusText,
                    assignment_id: service.id,
                };
            }),
        [assignmentsServices, formatRate, formatDate]
    );

    // Обработчики для Assignments
    const handleAssignmentOpen = useCallback((assignment = null) => {
        setCurrentAssignment(assignment);
        setSelectedEntrances([]);
        setSelectedApartments([]);

        if (assignment) {
            // Для редактирования
            setAssignmentScope(assignment.scope);
            if (assignment.scope === "entrance") {
                setSelectedEntrances([assignment.entrance]);
            } else {
                setSelectedApartments([assignment.apartment_id]);
            }
        } else {
            // Для создания
            setAssignmentScope("apartment");
        }

        setAssignmentOpen(true);
    }, []);

    const handleAssignmentClose = useCallback(() => {
        setAssignmentOpen(false);
        setCurrentAssignment(null);
        setSelectedEntrances([]);
        setSelectedApartments([]);
    }, []);

    // Переключение активности
    const handleAssignmentToggle = useCallback(async (id, isActive) => {
        setLoading((prev) => ({ ...prev, action: true }));

        setAssignmentsServices((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, is_active: !isActive } : item
            )
        );

        try {
            const response = await apiClient.put(
                `/admin/service-assignments/${id}/toggle-active`,
                { is_active: !isActive }
            );

            if (response.data.success) {
                const updatedAssignment = response.data.data;
                setAssignmentsServices((prev) =>
                    prev.map((item) =>
                        item.id === id ? updatedAssignment : item
                    )
                );
                showSuccess(response.data.message);
            }
        } catch (error) {
            showError(error.response?.data?.message || "Ошибка переключения");
        } finally {
            setLoading((prev) => ({ ...prev, action: false }));
        }
    }, []);

    // Удаление услуги
    const handleAssignmentDelete = useCallback(async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить эту услугу?")) {
            setLoading((prev) => ({ ...prev, action: true }));
            try {
                const response = await apiClient.delete(
                    `/admin/service-assignments/${id}`
                );

                if (response.data.success) {
                    setAssignmentsServices((prev) =>
                        prev.filter((item) => item.id !== id)
                    );
                    showSuccess(response.data.message);
                }
            } catch (error) {
                showError(
                    error.response?.data?.message || "Ошибка удаления услуги"
                );
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
            }
        }
    }, []);

    // Сохранение услуги
    const handleAssignmentSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading((prev) => ({ ...prev, action: true }));

            const data = new FormData(e.target);
            const baseData = Object.fromEntries(data.entries());
            baseData.is_active = baseData.is_active === "on";

            try {
                let response;
                if (currentAssignment) {
                    // Для редактирования отправляем только разрешенные поля
                    const assignmentData = {
                        name: baseData.name,
                        type: baseData.type,
                        unit: baseData.unit || null,
                        calculation_type: baseData.calculation_type,
                        is_active: baseData.is_active,
                    };

                    response = await apiClient.put(
                        `/admin/service-assignments/${currentAssignment.id}`,
                        assignmentData
                    );

                    if (response.data.success) {
                        const updatedAssignment = response.data.data;
                        setAssignmentsServices((prev) =>
                            prev.map((item) =>
                                item.id === currentAssignment.id
                                    ? updatedAssignment
                                    : item
                            )
                        );
                        showSuccess(response.data.message);
                    }
                } else {
                    // Для создания подготавливаем массив назначений
                    const assignmentsToCreate = [];

                    if (assignmentScope === "entrance") {
                        selectedEntrances.forEach((entrance) => {
                            assignmentsToCreate.push({
                                ...baseData,
                                scope: "entrance",
                                entrance: entrance,
                                apartment_id: null,
                            });
                        });
                    } else {
                        selectedApartments.forEach((apartment_id) => {
                            assignmentsToCreate.push({
                                ...baseData,
                                scope: "apartment",
                                apartment_id: apartment_id,
                                entrance: null,
                            });
                        });
                    }

                    if (assignmentsToCreate.length === 0) {
                        showError("Выберите хотя бы один объект");
                        return;
                    }

                    response = await apiClient.post(
                        "/admin/service-assignments",
                        assignmentsToCreate
                    );

                    if (response.data.success) {
                        const newAssignments = response.data.data;
                        setAssignmentsServices((prev) => [
                            ...prev,
                            ...newAssignments,
                        ]);
                        showSuccess(
                            `Создано ${assignmentsToCreate.length} услуг`
                        );
                    }
                }

                handleAssignmentClose();
            } catch (error) {
                showError(
                    error.response?.data?.message || "Ошибка сохранения услуги"
                );
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
            }
        },
        [
            currentAssignment,
            assignmentScope,
            selectedEntrances,
            selectedApartments,
            handleAssignmentClose,
        ]
    );

    // Обработчики диалога тарифов
    const handleOpenTariff = useCallback((tariff = null) => {
        setCurrentTariff(tariff);
        setTariffsOpen(true);
    }, []);

    const handleCloseTariff = useCallback(() => {
        setTariffsOpen(false);
        setCurrentTariff(null);
    }, []);

    // Сохранение тарифа
    const handleSubmitTariff = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading((prev) => ({ ...prev, action: true }));

            const data = new FormData(e.target);
            const tariffData = Object.fromEntries(data.entries());

            // Преобразование пустых строк в null
            if (tariffData.end_date === "") tariffData.end_date = null;

            // Форматируем rate до 4 знаков
            if (tariffData.rate) {
                tariffData.rate = parseFloat(tariffData.rate).toFixed(4);
            }

            try {
                // Отправляем данные
                const response = await apiClient.put(
                    `/admin/assignment-tariffs/${currentTariff.id}`,
                    {
                        rate: tariffData.rate,
                        start_date: tariffData.start_date,
                        end_date: tariffData.end_date,
                    }
                );

                if (response.data.success) {
                    // Обновляем конкретную услугу данными с сервера
                    const updatedAssignment = response.data.data;
                    setAssignmentsServices((prev) =>
                        prev.map((item) =>
                            item.id === updatedAssignment.id
                                ? updatedAssignment
                                : item
                        )
                    );
                    showSuccess(response.data.message);
                }

                handleCloseTariff();
            } catch (error) {
                showError(
                    error.response?.data?.message || "Ошибка сохранения тарифа"
                );
            } finally {
                setLoading((prev) => ({ ...prev, action: false }));
            }
        },
        [currentTariff, handleCloseTariff]
    );

    // Удаление тарифа
    const handleDeleteTariff = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этот тариф?")) {
            try {
                await apiClient.delete(`/admin/assignment-tariffs/${id}`);
                showSuccess("Тариф удален");
                fetchAssignmentsServices();
            } catch (error) {
                showError(error);
            }
        }
    };

    // Показываем загрузку если грузятся основные данные
    if (loading.assignments || loading.apartments) {
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
                maxWidth={false}
                sx={{
                    pt: { xs: 14, sm: 8 },
                    pb: { xs: 8, sm: 8 },
                    width: "100%",
                    mb: 3,
                }}
            >
                {/* Показываем ошибки */}
                {errors.assignments && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.assignments}
                    </Alert>
                )}
                {errors.apartments && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {errors.apartments}
                    </Alert>
                )}

                <AssignmentsServicesTable
                    assignments={allAssignmentsServices}
                    apartments={apartments}
                    onAdd={() => handleAssignmentOpen()}
                    onEdit={handleAssignmentOpen}
                    onDelete={handleAssignmentDelete}
                    onToggle={handleAssignmentToggle}
                    loading={loading.action}
                />

                <AssignmentsTariffsTable
                    tariffs={allTariffs}
                    assignments={allAssignmentsServices}
                    onAdd={() => handleOpenTariff()}
                    onEdit={handleOpenTariff}
                    loading={loading.action}
                    onDelete={handleDeleteTariff}
                />
            </Container>

            <AssignmentDialog
                open={openAssignment}
                onClose={handleAssignmentClose}
                currentAssignment={currentAssignment}
                onSubmit={handleAssignmentSubmit}
                services={allAssignmentsServices}
                apartments={apartments}
                entrances={entrances}
                assignmentScope={assignmentScope}
                setAssignmentScope={setAssignmentScope}
                selectedEntrances={selectedEntrances}
                setSelectedEntrances={setSelectedEntrances}
                selectedApartments={selectedApartments}
                setSelectedApartments={setSelectedApartments}
                calculationType={calculationType}
                setCalculationType={setCalculationType}
                loading={loading.action}
            />

            <AssignmentTariffDialog
                open={openTariffs}
                onClose={handleCloseTariff}
                currentTariff={currentTariff}
                onSubmit={handleSubmitTariff}
                services={allAssignmentsServices}
                apartments={apartments}
                entrances={entrances}
                loading={loading.action}
            />
        </Box>
    );
};

export default AdminServicesAssignmentsPage;
