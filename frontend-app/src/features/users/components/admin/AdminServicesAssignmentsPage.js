import React, { useState, useEffect } from "react";
import { Container, Box } from "@mui/material";
import apiClient from "../../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../../shared/services/notificationService";
import { format } from "date-fns";

// Импортируем UI-компоненты диалогов
import AssignmentDialog from "./ui/AssignmentDialog";
import AssignmentsServicesTable from "./ui/AssignmentsServicesTable";
import TariffsTable from "./ui/TariffsTable";

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

        try {
            if (currentAssignment) {
                // Редактирование существующей услуги
                const assignmentData = {
                    scope: data.get("scope") || null,
                    apartment_id:
                        assignmentScope === "apartment" &&
                        selectedApartments.length > 0
                            ? selectedApartments
                            : null,
                    entrance:
                        assignmentScope === "entrance" &&
                        selectedEntrances.length > 0
                            ? selectedEntrances
                            : null,
                    name: data.get("name") || null,
                    type: data.get("type") || null,
                    calculation_type: data.get("calculation_type") || null,
                    is_active: data.get("is_active") === "on",
                };

                await apiClient.put(
                    `/admin/service-assignments/${currentAssignment.id}`,
                    assignmentData
                );
                showSuccess("Услуга обновлена");
            } else {
                const serviceId = parseInt(data.get("service_id"));
                const isEnabled = data.get("is_active") === "on";
                const startDate = data.get("start_date") || null;
                const endDate = data.get("end_date") || null;

                const assignmentsToCreate = [];

                // Для подъездов
                if (assignmentScope === "entrance") {
                    selectedEntrances.forEach((entrance) => {
                        assignmentsToCreate.push({
                            service_id: serviceId,
                            scope: "entrance",
                            entrance: entrance,
                            is_active: isEnabled,
                            start_date: startDate,
                            end_date: endDate,
                        });
                    });
                }
                // Для квартир
                else {
                    selectedApartments.forEach((apartmentId) => {
                        assignmentsToCreate.push({
                            service_id: serviceId,
                            scope: "apartment",
                            apartment_id: apartmentId,
                            is_active: isEnabled,
                            start_date: startDate,
                            end_date: endDate,
                        });
                    });
                }

                // Проверка, что есть что создавать
                if (assignmentsToCreate.length === 0) {
                    showError(
                        "Выберите хотя бы один объект (подъезд или квартиру)"
                    );
                    return;
                }

                // Отправляем запрос
                await apiClient.post("/admin/service-assignments/bulk", {
                    assignments: assignmentsToCreate,
                });

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
                `/admin/tariffs/${currentTariff.id}`,
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
                await apiClient.delete(`/admin/tariffs/${id}`);
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
                    onAdd={() => handleAssignmentOpen()}
                    onEdit={handleAssignmentOpen}
                    onDelete={handleAssignmentDelete}
                    onToggle={handleAssignmentToggle}
                />

                <TariffsTable
                    tariffs={allTariffs}
                    services={allAssignmentsServices}
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
        </Box>
    );
};

export default AdminServicesAssignmentsPage;
