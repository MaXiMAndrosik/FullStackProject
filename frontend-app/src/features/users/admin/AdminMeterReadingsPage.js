import React, { useState, useEffect, useRef } from "react";
import { Box, Container } from "@mui/material";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import MeterReadingsTable from "./components/MeterReadingsTable";

const AdminMeterReadingsPage = () => {
    const [readingsData, setReadingsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("");
    const [meterTypes, setMeterTypes] = useState([]);
    const [currentPeriods, setCurrentPeriods] = useState([]);
    const [editingCell, setEditingCell] = useState(null);
    const [selectedMeters, setSelectedMeters] = useState([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const tableRef = useRef();
    const [modifiedReadings, setModifiedReadings] = useState({});

    useEffect(() => {
        fetchMeterTypes();
    }, []);

    useEffect(() => {
        setModifiedReadings({});
    }, [selectedType]);

    useEffect(() => {
        if (meterTypes.length > 0) {
            fetchReadings();
        }
    }, [selectedType, meterTypes]);

    const getDynamicPeriods = () => {
        const currentDate = new Date();
        const periods = [];

        for (let i = 4; i >= 1; i--) {
            const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - i,
                1
            );
            const periodKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;
            const periodLabel = date.toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric",
            });
            periods.push({
                key: periodKey,
                label: periodLabel,
                date: date,
            });
        }

        return periods;
    };

    const fetchMeterTypes = async () => {
        try {
            const response = await apiClient.get("/admin/meter-types");
            setMeterTypes(response.data);
        } catch (error) {
            showError("Ошибка загрузки типов счетчиков");
        }
    };

    const fetchReadings = async () => {
        setLoading(true);
        try {
            const params = selectedType ? { type_id: selectedType } : {};
            const response = await apiClient.get("/admin/meter-readings", {
                params,
            });

            const periods = getDynamicPeriods();
            setCurrentPeriods(periods);

            const processedData = processReadingsData(
                response.data.data || [],
                periods
            );
            setReadingsData(processedData);
            setModifiedReadings({});
        } catch (error) {
            showError("Ошибка загрузки показаний счетчиков");
        } finally {
            setLoading(false);
        }
    };

    const processReadingsData = (data, periods) => {
        if (periods.length < 4) return data;

        const [period0, period1, period2, period3] = periods;

        return data.map((item) => {
            const readings = item.readings;

            const reading0 = readings[period0.key];
            const reading1 = readings[period1.key];
            const reading2 = readings[period2.key];
            const reading3 = readings[period3.key];

            const consumption1 =
                reading1 && reading0
                    ? Math.round(reading1.value - reading0.value)
                    : null;
            const consumption2 =
                reading2 && reading1
                    ? Math.round(reading2.value - reading1.value)
                    : null;

            let consumption3 = null;
            if (
                reading3 &&
                reading3.value !== null &&
                reading2 &&
                reading2.value !== null
            ) {
                consumption3 = Math.round(reading3.value - reading2.value);
            } else if (consumption1 !== null && consumption2 !== null) {
                consumption3 = Math.round((consumption1 + consumption2) / 2);
            }

            // Обработка period3 с учетом is_fixed
            const processedPeriod3 = reading3
                ? {
                      id: reading3.id,
                      value: reading3.value,
                      isCalculated: reading3.is_calculated || false,
                      isManual: reading3.is_manual || false,
                      isFixed: reading3.is_fixed || false, // новое поле
                      isValid: true, // будет пересчитано при валидации
                  }
                : null;

            return {
                ...item,
                processedReadings: {
                    period0: reading0,
                    period1: reading1,
                    period2: reading2,
                    period3: processedPeriod3, // используем обработанный объект
                    consumption1,
                    consumption2,
                    consumption3,
                    periodLabels: {
                        period1: period1.label,
                        period2: period2.label,
                        period3: period3.label,
                    },
                },
            };
        });
    };

    const handleTypeFilterChange = (typeId) => {
        setSelectedType(typeId);
    };

    const handleApplyCalculation = (meterId) => {
        setReadingsData((prevData) => {
            return prevData.map((item) => {
                if (item.meter.id === meterId) {
                    // ПРОВЕРКА: если данные зафиксированы, запрещаем расчет
                    if (item.processedReadings.period3?.isFixed) {
                        showError(
                            "Данные зафиксированы и не могут быть изменены"
                        );
                        return item;
                    }

                    const readings = item.processedReadings;
                    const previousValue = readings.period2?.value;
                    const consumption3 = readings.consumption3;

                    if (previousValue === null || consumption3 === null) {
                        return item;
                    }

                    const calculatedValue = previousValue + consumption3;
                    const isValid = true;

                    setModifiedReadings((prev) => ({
                        ...prev,
                        [meterId]: true,
                    }));

                    return {
                        ...item,
                        processedReadings: {
                            ...readings,
                            period3: {
                                ...readings.period3,
                                value: calculatedValue,
                                isCalculated: true,
                                isValid: isValid,
                                isManual: false,
                            },
                        },
                    };
                }
                return item;
            });
        });
    };

    const handleApplyAllCalculations = () => {
        setReadingsData((prevData) => {
            const newModified = { ...modifiedReadings };

            const updatedData = prevData.map((item) => {
                const readings = item.processedReadings;

                const canApply =
                    !readings.period3?.value &&
                    readings.consumption3 !== null &&
                    readings.period2?.value !== null &&
                    !readings.period3?.isManual &&
                    !readings.period3?.isFixed;

                if (canApply) {
                    const previousValue = readings.period2.value;
                    const consumption3 = readings.consumption3;
                    const calculatedValue = previousValue + consumption3;

                    // Добавляем в измененные данные
                    newModified[item.meter.id] = true;

                    return {
                        ...item,
                        processedReadings: {
                            ...readings,
                            period3: {
                                ...readings.period3,
                                value: calculatedValue,
                                isCalculated: true,
                                isValid: true, // Расчетные значения всегда валидны
                                isManual: false,
                            },
                        },
                    };
                }
                return item;
            });

            // Обновляем состояние измененных данных
            setModifiedReadings(newModified);

            return updatedData;
        });
    };

    // Функция для ручного ввода данных с валидацией
    const handleManualInput = (meterId, newValue) => {
        setReadingsData((prevData) => {
            return prevData.map((item) => {
                if (item.meter.id === meterId) {
                    if (item.processedReadings.period3?.isFixed) {
                        showError(
                            "Данные зафиксированы и не могут быть изменены"
                        );
                        return item;
                    }

                    const readings = item.processedReadings;
                    const previousValue = readings.period2?.value;

                    const numericValue =
                        newValue === "" ? null : parseInt(newValue, 10);

                    // ВАЛИДАЦИЯ: значение должно быть >= предыдущего
                    const isValid =
                        newValue === null ||
                        previousValue === null ||
                        newValue >= previousValue;

                    // ПЕРЕСЧЕТ РАСХОДА ТОЛЬКО ПРИ УСПЕШНОЙ ВАЛИДАЦИИ
                    const newConsumption3 =
                        isValid && newValue !== null && previousValue !== null
                            ? newValue - previousValue
                            : readings.consumption3;

                    setModifiedReadings((prev) => ({
                        ...prev,
                        [meterId]: true,
                    }));

                    return {
                        ...item,
                        processedReadings: {
                            ...readings,
                            consumption3: newConsumption3,
                            period3: {
                                ...readings.period3,
                                value: numericValue,
                                isCalculated: false,
                                isValid: isValid,
                                isManual: newValue !== "",
                            },
                        },
                    };
                }
                return item;
            });
        });
    };

    // Функция для отката невалидного значения
    const handleRevertInvalidValue = (meterId) => {
        setReadingsData((prevData) =>
            prevData.map((item) => {
                if (item.meter.id === meterId) {
                    const period3 = item.processedReadings.period3;
                    if (
                        period3 &&
                        !period3.isValid &&
                        period3.previousValue !== undefined
                    ) {
                        return {
                            ...item,
                            processedReadings: {
                                ...item.processedReadings,
                                period3: {
                                    ...period3,
                                    value: period3.previousValue,
                                    isValid: true,
                                },
                            },
                        };
                    }
                }
                return item;
            })
        );
    };

    const handleEnterNavigation = (currentMeterId, isValid) => {
        // Переходим к следующей ячейке только если текущее значение валидно
        if (!isValid) {
            showError("Исправьте ошибку перед переходом к следующей ячейке");
            return;
        }

        const currentIndex = readingsData.findIndex(
            (item) => item.meter.id === currentMeterId
        );

        if (currentIndex < readingsData.length - 1) {
            const nextMeterId = readingsData[currentIndex + 1].meter.id;
            setEditingCell(nextMeterId);

            setTimeout(() => {
                const nextInput = document.querySelector(
                    `[data-meter-id="${nextMeterId}"]`
                );
                if (nextInput) {
                    nextInput.focus();
                    nextInput.select();
                }
            }, 0);
        } else {
            setEditingCell(null);
            showSuccess("Достигнут конец списка");
        }
    };

    // Функция для сохранения показания 1 счетчика
    const handleSaveReading = async (meterId) => {
        const item = readingsData.find((item) => item.meter.id === meterId);

        if (!item || !item.processedReadings.period3?.value) {
            showError("Нет данных для сохранения");
            return;
        }

        if (item.processedReadings.period3.isValid === false) {
            showError("Исправьте ошибку перед сохранением");
            return;
        }

        if (item.processedReadings.period3.isFixed) {
            showError("Данные зафиксированы и не могут быть изменены");
            return;
        }

        try {
            const period3Reading = item.processedReadings.period3;
            const currentPeriod = currentPeriods[3];
            const readingData = {
                meter_id: meterId,
                period: `${currentPeriod.date.getFullYear()}-${String(
                    currentPeriod.date.getMonth() + 1
                ).padStart(2, "0")}-25`,
                value: Math.round(period3Reading.value),
            };

            if (period3Reading.id) {
                await apiClient.put(
                    `/admin/meter-readings/${period3Reading.id}`,
                    readingData
                );
            } else {
                await apiClient.post("/admin/meter-readings", readingData);
            }

            showSuccess("Показания сохранены");

            setModifiedReadings((prev) => {
                const newModified = { ...prev };
                delete newModified[meterId];
                return newModified;
            });

            fetchReadings();
        } catch (error) {
            showError(
                error.response?.data?.message || "Ошибка сохранения показаний"
            );
        }
    };

    // Функция для сохранения показаний всех счетчиков
    const handleSaveAllReadings = async () => {
        // Фильтруем только измененные и валидные данные
        const readingsToSave = readingsData.filter(
            (item) =>
                item.processedReadings.period3?.value &&
                item.processedReadings.period3.isValid !== false &&
                modifiedReadings[item.meter.id] &&
                !item.processedReadings.period3.isFixed
        );

        if (readingsToSave.length === 0) {
            showError("Нет измененных данных для сохранения");
            return;
        }

        try {
            const currentPeriod = currentPeriods[3];
            const periodStr = `${currentPeriod.date.getFullYear()}-${String(
                currentPeriod.date.getMonth() + 1
            ).padStart(2, "0")}-25`;

            // Подготавливаем данные для сохранения
            const bulkData = {
                readings: readingsToSave.map((item) => ({
                    meter_id: item.meter.id,
                    period: periodStr,
                    value: Math.round(item.processedReadings.period3.value),
                })),
            };

            // Отправляем одним запросом
            const response = await apiClient.post(
                "/admin/meter-readings/bulk",
                bulkData
            );

            showSuccess(
                `Успешно сохранено ${response.data.saved_count} показаний`
            );

            // Очищаем modifiedReadings для сохраненных записей
            setModifiedReadings((prev) => {
                const newModified = { ...prev };
                readingsToSave.forEach((item) => {
                    delete newModified[item.meter.id];
                });
                return newModified;
            });

            fetchReadings();
        } catch (error) {
            console.error("Ошибка сохранения:", error);

            // Обрабатываем ошибки от бэкенда
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors
                    .map((err) => `Счетчик ID ${err.meter_id}: ${err.error}`)
                    .join("\n");
                showError(`Ошибки при сохранении:\n${errorMessages}`);
            } else {
                showError(
                    error.response?.data?.message ||
                        "Ошибка сохранения показаний"
                );
            }
        }
    };

    const startEditing = (meterId) => {
        setEditingCell(meterId);
    };

    const stopEditing = (meterId) => {
        // При потере фокуса откатываем невалидные значения
        const item = readingsData.find((item) => item.meter.id === meterId);
        if (item && item.processedReadings.period3?.isValid === false) {
            handleRevertInvalidValue(meterId);
        }
        setEditingCell(null);
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
                maxWidth={false}
                sx={{
                    pt: { xs: 14, sm: 8 },
                    pb: { xs: 4, sm: 4 },
                    width: "100%",
                    mb: 3,
                }}
            >
                <MeterReadingsTable
                    readingsData={readingsData}
                    loading={loading}
                    meterTypes={meterTypes}
                    selectedType={selectedType}
                    currentPeriods={currentPeriods}
                    editingCell={editingCell}
                    selectedMeters={selectedMeters}
                    bulkActionLoading={bulkActionLoading}
                    onTypeFilterChange={handleTypeFilterChange}
                    onApplyCalculation={handleApplyCalculation}
                    onApplyAllCalculations={handleApplyAllCalculations}
                    onSaveReading={handleSaveReading}
                    onSaveAllReadings={handleSaveAllReadings}
                    onManualInput={handleManualInput}
                    onEnterNavigation={handleEnterNavigation}
                    onStartEditing={startEditing}
                    onStopEditing={stopEditing}
                    onSelectionChange={setSelectedMeters}
                    modifiedReadings={modifiedReadings}
                    ref={tableRef}
                />
            </Container>
        </Box>
    );
};

export default AdminMeterReadingsPage;
