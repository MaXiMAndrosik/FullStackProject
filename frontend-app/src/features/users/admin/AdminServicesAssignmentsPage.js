import React, { useState, useEffect } from "react";
import { Container, Box } from "@mui/material";
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

    // Загрузка услуг и тарифов
    useEffect(() => {
        fetchAssignmentsServices();
        fetchApartments();
    }, []);

    // Загрузка сервисов с тарифами
    const fetchAssignmentsServices = () => {
        apiClient
            .get("/admin/service-assignments")
            .then((res) => setAssignmentsServices(res.data))
            .catch((error) => {
                showError("Ошибка загрузки услуг");
                setAssignmentsServices([]);
            });
    };

    // Загрузка квартир
    const fetchApartments = () => {
        apiClient
            .get("/admin/apartments")
            .then((res) => setApartments(res.data))
            .catch((error) => {
                showError("Ошибка загрузки квартир");
                setApartments([]);
            });
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
    const formatRate = (value) => {
        const formatted = parseFloat(value)
            .toFixed(4)
            .replace(/\.?0+$/, "");
        return formatted.includes(".") ? formatted : `${formatted}.0`;
    };
    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };
    // ---------------------------------------------------------------------------------------------------
    // Получим все услуги и отформатируем
    const allAssignmentsServices = assignmentsServices.map((service) => {
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
    // Получим все номера подьездов
    const entrances = [...new Set(apartments.map((a) => a.entrance))].sort();
    // ---------------------------------------------------------------------------------------------------
    // Обработчики для Assignments
    // Обработчики диалога
    const handleAssignmentOpen = (assignment = null) => {
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
    };

    const handleAssignmentClose = () => {
        setAssignmentOpen(false);
        setCurrentAssignment(null);
        setSelectedEntrances([]);
        setSelectedApartments([]);
    };

    // Переключение активности
    const handleAssignmentToggle = async (id, isActive) => {
        try {
            await apiClient.put(
                `/admin/service-assignments/${id}/toggle-active`,
                {
                    is_active: !isActive,
                }
            );
            showSuccess("Статус изменен");
            fetchAssignmentsServices();
        } catch (error) {
            showError("Ошибка переключения");
        }
    };

    // Удаление услуги
    const handleAssignmentDelete = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить эту услугу?")) {
            try {
                await apiClient.delete(`/admin/service-assignments/${id}`);
                showSuccess("Услуга удалена");
                fetchAssignmentsServices();
            } catch (error) {
                showError("Ошибка удаления услуги");
            }
        }
    };
    // Сохранение услуги
    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const baseData = Object.fromEntries(data.entries());
        baseData.is_active = baseData.is_active === "on";

        try {
            if (currentAssignment) {
                // Для редактирования отправляем только разрешенные поля
                const assignmentData = {
                    name: baseData.name,
                    type: baseData.type,
                    unit: baseData.unit || null,
                    calculation_type: baseData.calculation_type,
                    is_active: baseData.is_active,
                };

                await apiClient.put(
                    `/admin/service-assignments/${currentAssignment.id}`,
                    assignmentData
                );
                showSuccess("Услуга обновлена");
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

                await apiClient.post(
                    "/admin/service-assignments",
                    assignmentsToCreate
                );
                showSuccess(`Создано ${assignmentsToCreate.length} услуг`);
            }

            fetchAssignmentsServices();
            handleAssignmentClose();
        } catch (error) {
            showError("Ошибка сохранения услуги");
            console.error(error);
        }
    };

    // ---------------------------------------------------------------------------------------------------
    // Получим все тарифы из ответа сервера и отформатируем
    const allTariffs = assignmentsServices.flatMap((service) =>
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
                `/admin/assignment-tariffs/${currentTariff.id}`,
                tariffData
            );
            showSuccess("Тариф сохранен");
            fetchAssignmentsServices();
            handleCloseTariff();
        } catch (error) {
            showError("Ошибка сохранения");
        }
    };
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
                <AssignmentsServicesTable
                    assignments={allAssignmentsServices}
                    apartments={apartments}
                    onAdd={() => handleAssignmentOpen()}
                    onEdit={handleAssignmentOpen}
                    onDelete={handleAssignmentDelete}
                    onToggle={handleAssignmentToggle}
                />

                <AssignmentsTariffsTable
                    tariffs={allTariffs}
                    assignments={allAssignmentsServices}
                    onAdd={() => handleOpenTariff()}
                    onEdit={handleOpenTariff}
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
            />

            <AssignmentTariffDialog
                open={openTariffs}
                onClose={handleCloseTariff}
                currentTariff={currentTariff}
                onSubmit={handleSubmitTariff}
                services={allAssignmentsServices}
                apartments={apartments}
                entrances={entrances}
            />
        </Box>
    );
};

export default AdminServicesAssignmentsPage;
