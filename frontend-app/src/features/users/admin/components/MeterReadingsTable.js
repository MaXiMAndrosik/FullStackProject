import React, { useState, useMemo, forwardRef, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Chip,
    TextField,
    MenuItem,
    Toolbar,
    Input,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    FileDownload as ExportIcon,
    Calculate as CalculateIcon,
    Save as SaveIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const MeterReadingsTable = forwardRef(
    (
        {
            readingsData,
            loading,
            meterTypes,
            selectedType,
            currentPeriods,
            editingCell,
            onTypeFilterChange,
            onApplyCalculation,
            onApplyAllCalculations,
            onSaveReading,
            onSaveAllReadings,
            onManualInput,
            onEnterNavigation,
            onStartEditing,
            onStopEditing,
            modifiedReadings,
        },
        ref
    ) => {
        const [typeFilter, setTypeFilter] = useState(selectedType);

        // Форматирование значения для отображения (целые числа)
        const formatValue = (value) => {
            if (value === null || value === undefined) return "н/д";
            if (value === 0) return "0";
            return Math.round(value).toString();
        };

        // Функция для определения стиля ячейки на основе значения
        const getCellStyle = (value, isValid = true) => {
            if (value === null || value === undefined) {
                return {
                    backgroundColor: "#ffebee", // светло-красный для отсутствующих данных
                    color: "#c62828",
                    fontWeight: "bold",
                };
            }
            if (!isValid) {
                return {
                    backgroundColor: "#ffcdd2", // красный для невалидных данных
                    color: "#b71c1c",
                    fontWeight: "bold",
                    border: "2px solid #f44336",
                };
            }
            return {
                backgroundColor: "transparent",
                color: "text.primary",
            };
        };

        // Подготовка данных для таблицы
        const rows = useMemo(() => {
            return readingsData.map((item, index) => {
                const meter = item.meter;
                const readings = item.processedReadings;

                // Сохраняем старую логику определения расчетных и ручных значений
                const isPeriod3Calculated =
                    readings.period3?.isCalculated === true ||
                    (readings.consumption3 !== null &&
                        readings.consumption3 !== undefined &&
                        !readings.period3?.isManual &&
                        !readings.period3?.value); // Нет сохраненного значения в БЗ

                const isPeriod3Manual = readings.period3?.isManual === true;

                // Добавляем новое поле isPeriod3Fixed из обработанных данных
                const isPeriod3Fixed = readings.period3?.isFixed || false;

                return {
                    id: meter.id,
                    apartment_number: meter.apartment.number,
                    type_name: meter.type.name,
                    period1_reading: readings.period1?.value,
                    period1_consumption: readings.consumption1 ?? 0,
                    period2_reading: readings.period2?.value,
                    period2_consumption: readings.consumption2 ?? 0,
                    period3_reading: readings.period3?.value,
                    period3_consumption: readings.consumption3 ?? 0,
                    hasPeriod3Data: !!readings.period3?.value,
                    isPeriod3Calculated: isPeriod3Calculated,
                    isPeriod3Manual: isPeriod3Manual,
                    isPeriod3Valid: readings.period3?.isValid !== false,
                    isPeriod3Fixed: isPeriod3Fixed, // новое поле
                    meter: meter,
                    processedReadings: readings,
                    index: index,
                };
            });
        }, [readingsData]);

        // Фильтрация по типу
        const filteredRows = useMemo(() => {
            if (!typeFilter) {
                return rows;
            }
            return rows.filter(
                (row) => row.meter.type_id.toString() === typeFilter.toString()
            );
        }, [rows, typeFilter]);

        // Функция для создания многострочного заголовка
        const createMultiLineHeader = (title, periodLabel) => (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    lineHeight: 1.2,
                    height: "100%",
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {title}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                    за {periodLabel}
                </Typography>
            </Box>
        );

        // Функция для рендеринга базовых ячеек (квартира, тип счетчика)
        const renderBaseCell = (params) => (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                    {params.value}
                </Typography>
            </Box>
        );

        // Функция для рендеринга простой ячейки с условным стилем
        const renderSimpleCell = (params) => {
            const cellStyle = getCellStyle(params.value);
            return (
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: cellStyle.backgroundColor,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: cellStyle.color,
                            fontWeight: "bold",
                            textAlign: "center",
                        }}
                    >
                        {formatValue(params.value)}
                    </Typography>
                </Box>
            );
        };

        // Создаем компонент для редактируемой ячейки
        const ImprovedEditableCell = ({
            value,
            rowId,
            isValid,
            isCalculated,
            isManual,
            previousValue,
            isEditing,
            onManualInput,
            onEnterNavigation,
            onStartEditing,
            onStopEditing,
            formatValue,
            getCellStyle,
        }) => {
            const inputRef = useRef(null);
            const [tempValue, setTempValue] = useState(value);
            const [localIsValid, setLocalIsValid] = useState(true);

            // Синхронизируем tempValue с внешним value при изменении пропсов
            useEffect(() => {
                if (!isEditing) {
                    setTempValue(value);
                    setLocalIsValid(isValid);
                }
            }, [value, isValid, isEditing]);

            // Фокусировка при начале редактирования
            useEffect(() => {
                if (isEditing && inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, [isEditing]);

            // Валидация значения
            const validateValue = (val) => {
                if (val === null || val === undefined || val === "")
                    return true;
                const numericValue = parseInt(val, 10);
                return (
                    previousValue === null ||
                    previousValue === undefined ||
                    numericValue >= previousValue
                );
            };

            const handleChange = (e) => {
                const newValue = e.target.value;
                // Разрешаем ввод только цифр и пустой строки
                if (newValue === "" || /^\d+$/.test(newValue)) {
                    setTempValue(
                        newValue === "" ? null : parseInt(newValue, 10)
                    );
                }
            };

            const handleKeyDown = (e) => {
                if (e.key === "Enter") {
                    // ВАЛИДАЦИЯ ТОЛЬКО ПРИ НАЖАТИИ ENTER
                    const isValidValue = validateValue(tempValue);
                    setLocalIsValid(isValidValue);

                    if (isValidValue) {
                        onManualInput(rowId, tempValue);
                        onEnterNavigation(rowId, true);
                        onStopEditing(rowId);
                    } else {
                        onEnterNavigation(rowId, false);
                    }
                    e.preventDefault();
                } else if (e.key === "Escape") {
                    // ОТКАТ ПРИ ESC - ВОЗВРАЩАЕМ ИСХОДНОЕ ЗНАЧЕНИЕ
                    setTempValue(value);
                    setLocalIsValid(isValid);
                    onStopEditing(rowId);
                }
            };

            const handleBlur = () => {
                // При потере фокуса также валидируем и сохраняем
                const isValidValue = validateValue(tempValue);
                setLocalIsValid(isValidValue);

                if (isValidValue) {
                    onManualInput(rowId, tempValue);
                } else {
                    // Если невалидно - возвращаем исходное значение
                    setTempValue(value);
                    setLocalIsValid(isValid);
                }
                onStopEditing(rowId);
            };

            const handleClick = () => {
                onStartEditing(rowId);
            };

            const displayValue = isEditing ? tempValue : value;
            const displayIsValid = isEditing ? localIsValid : isValid;
            const cellStyle = getCellStyle(displayValue, displayIsValid);

            return (
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: cellStyle.backgroundColor,
                        border: cellStyle.border,
                        gap: 0.5,
                        cursor: "pointer",
                    }}
                >
                    {isEditing ? (
                        <Input
                            inputRef={inputRef}
                            data-meter-id={rowId}
                            value={
                                tempValue === null ? "" : tempValue.toString()
                            }
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            inputProps={{
                                style: {
                                    textAlign: "center",
                                    fontSize: "0.875rem",
                                    padding: "4px",
                                    width: "80px",
                                },
                                min: previousValue ? previousValue + 1 : 0,
                                type: "number",
                            }}
                            autoFocus
                            sx={{
                                "& .MuiInput-input": {
                                    textAlign: "center",
                                },
                                "& .MuiInput-underline:before": {
                                    borderBottomColor: displayIsValid
                                        ? "primary.main"
                                        : "error.main",
                                },
                                "& .MuiInput-underline:after": {
                                    borderBottomColor: displayIsValid
                                        ? "primary.main"
                                        : "error.main",
                                },
                            }}
                            error={!displayIsValid}
                        />
                    ) : (
                        <>
                            <Typography
                                variant="body2"
                                onClick={handleClick}
                                sx={{
                                    color: isCalculated
                                        ? "primary.main"
                                        : isManual
                                        ? "success.main"
                                        : cellStyle.color,
                                    fontWeight: cellStyle.fontWeight,
                                    textAlign: "center",
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                        borderRadius: 1,
                                        padding: "2px 4px",
                                    },
                                }}
                            >
                                {formatValue(displayValue)}
                            </Typography>
                        </>
                    )}
                </Box>
            );
        };

        // Функция для рендеринга ячейки с ручным вводом и ОТЛОЖЕННОЙ валидацией
        const renderEditableCell = (params) => {
            const previousValue = params.row.processedReadings.period2?.value;
            const isFixed = params.row.isPeriod3Fixed;

            // Если данные зафиксированы, показываем нередактируемую ячейку
            if (isFixed) {
                const cellStyle = getCellStyle(
                    params.row.period3_reading,
                    params.row.isPeriod3Valid
                );
                return (
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: cellStyle.backgroundColor,
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: cellStyle.color,
                                fontWeight: "bold",
                                textAlign: "center",
                            }}
                        >
                            {formatValue(params.row.period3_reading)}
                        </Typography>
                    </Box>
                );
            }

            return (
                <ImprovedEditableCell
                    value={params.row.period3_reading}
                    rowId={params.row.id}
                    isValid={params.row.isPeriod3Valid}
                    isCalculated={params.row.isPeriod3Calculated}
                    isManual={params.row.isPeriod3Manual}
                    previousValue={previousValue}
                    isEditing={editingCell === params.row.id}
                    onManualInput={onManualInput}
                    onEnterNavigation={onEnterNavigation}
                    onStartEditing={onStartEditing}
                    onStopEditing={onStopEditing}
                    formatValue={formatValue}
                    getCellStyle={getCellStyle}
                />
            );
        };

        // Функция для рендеринга ячейки расхода периода 3 с цветовой индикацией
        const renderPeriod3ConsumptionCell = (params) => {
            const value = params.value;
            const isCalculated = params.row.isPeriod3Calculated;
            const isManual = params.row.isPeriod3Manual;
            const isValid = params.row.isPeriod3Valid;
            const isFixed = params.row.isPeriod3Fixed;

            const cellStyle = getCellStyle(value, isValid);

            // Определяем цвет текста в зависимости от типа ввода
            let textColor = "text.primary"; // черный по умолчанию (сохраненные в БЗ)
            if (isCalculated) {
                textColor = "primary.main"; // синий для расчетных
            } else if (isManual) {
                textColor = "success.main"; // зеленый для ручных
            }

            // Если значение невалидно, оставляем красный цвет
            const finalColor = !isValid ? cellStyle.color : textColor;

            return (
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: cellStyle.backgroundColor,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: finalColor,
                            fontWeight: isFixed ? "bold" : "normal", // жирный для зафиксированных
                            textAlign: "center",
                        }}
                    >
                        {formatValue(value)}
                    </Typography>
                </Box>
            );
        };

        // Создаем колонки на основе динамических периодов
        const columns = useMemo(() => {
            if (currentPeriods.length < 4) return [];

            const baseColumns = [
                {
                    field: "apartment_number",
                    headerName: "Квартира",
                    width: 100,
                    sortComparator: (v1, v2) => {
                        const num1 = parseInt(v1, 10);
                        const num2 = parseInt(v2, 10);
                        return isNaN(num1) || isNaN(num2)
                            ? v1.localeCompare(v2)
                            : num1 - num2;
                    },
                    renderCell: renderBaseCell,
                },
                {
                    field: "type_name",
                    headerName: "Тип счетчика",
                    width: 180,
                    renderCell: renderBaseCell,
                },
            ];

            // Динамические колонки для периодов
            const periodColumns = [];

            // Period 1 (второй самый старый)
            if (currentPeriods[1]) {
                periodColumns.push(
                    {
                        field: "period1_reading",
                        headerName: `Показания\nза ${currentPeriods[1].label}`,
                        width: 180,
                        renderHeader: () =>
                            createMultiLineHeader(
                                "Показания",
                                currentPeriods[1].label
                            ),
                        renderCell: renderSimpleCell,
                    },
                    {
                        field: "period1_consumption",
                        headerName: `Расход\nза ${currentPeriods[1].label}`,
                        width: 150,
                        renderHeader: () =>
                            createMultiLineHeader(
                                "Расход",
                                currentPeriods[1].label
                            ),
                        renderCell: renderSimpleCell,
                    }
                );
            }

            // Period 2 (третий самый старый)
            if (currentPeriods[2]) {
                periodColumns.push(
                    {
                        field: "period2_reading",
                        headerName: `Показания\nза ${currentPeriods[2].label}`,
                        width: 180,
                        renderHeader: () =>
                            createMultiLineHeader(
                                "Показания",
                                currentPeriods[2].label
                            ),
                        renderCell: renderSimpleCell,
                    },
                    {
                        field: "period2_consumption",
                        headerName: `Расход\nза ${currentPeriods[2].label}`,
                        width: 150,
                        renderHeader: () =>
                            createMultiLineHeader(
                                "Расход",
                                currentPeriods[2].label
                            ),
                        renderCell: renderSimpleCell,
                    }
                );
            }

            // Period 3 (самый новый)
            if (currentPeriods[3]) {
                periodColumns.push(
                    {
                        field: "period3_reading",
                        headerName: `Показания\nза ${currentPeriods[3].label}`,
                        width: 180,
                        renderHeader: () =>
                            createMultiLineHeader(
                                "Показания",
                                currentPeriods[3].label
                            ),
                        renderCell: renderEditableCell,
                    },
                    {
                        field: "period3_consumption",
                        headerName: `Расход\nза ${currentPeriods[3].label}`,
                        width: 150,
                        renderHeader: () =>
                            createMultiLineHeader(
                                "Расход",
                                currentPeriods[3].label
                            ),
                        renderCell: renderPeriod3ConsumptionCell,
                    }
                );
            }

            // Колонка действий
            const actionColumn = {
                field: "actions",
                headerName: "Действия",
                width: 200,
                renderCell: (params) => {
                    const isFixed = params.row.isPeriod3Fixed;

                    // Если данные зафиксированы, показываем статус вместо кнопок
                    if (isFixed) {
                        return (
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Chip
                                    label="Зафиксировано"
                                    size="medium"
                                    color="success"
                                    variant="outlined"
                                />
                            </Box>
                        );
                    }

                    const canApply =
                        !params.row.hasPeriod3Data &&
                        params.row.processedReadings.consumption3 !== null &&
                        !params.row.isPeriod3Manual;

                    const canSave =
                        params.row.hasPeriod3Data &&
                        params.row.isPeriod3Valid &&
                        modifiedReadings[params.row.id]; // Добавлена проверка на изменение

                    return (
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                            }}
                        >
                            <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                    onApplyCalculation(params.row.id)
                                }
                                sx={{ color: "primary.main" }}
                                disabled={!canApply}
                            >
                                Рассчитать
                            </Button>
                            <Button
                                size="small"
                                variant="text"
                                onClick={() => onSaveReading(params.row.id)}
                                disabled={!canSave}
                            >
                                Сохранить
                            </Button>
                        </Box>
                    );
                },
            };

            return [...baseColumns, ...periodColumns, actionColumn];
        }, [
            currentPeriods,
            editingCell,
            onApplyCalculation,
            onSaveReading,
            onManualInput,
            onEnterNavigation,
            onStartEditing,
            onStopEditing,
        ]);

        if (loading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            );
        }

        // Функция экспорта в Excel
        const handleExport = () => {
            try {
                // Подготавливаем данные для экспорта (основной лист)
                const dataForExport = filteredRows.map((row) => {
                    const exportRow = {
                        Квартира: row.apartment_number,
                        "Тип счетчика": row.type_name,
                    };

                    // Период 1
                    if (currentPeriods[1]) {
                        exportRow[`Показания ${currentPeriods[1].label}`] =
                            row.period1_reading ?? "н/д";
                        exportRow[`Расход ${currentPeriods[1].label}`] =
                            row.period1_consumption ?? "н/д";
                    }

                    // Период 2
                    if (currentPeriods[2]) {
                        exportRow[`Показания ${currentPeriods[2].label}`] =
                            row.period2_reading ?? "н/д";
                        exportRow[`Расход ${currentPeriods[2].label}`] =
                            row.period2_consumption ?? "н/д";
                    }

                    // Период 3 (текущий)
                    if (currentPeriods[3]) {
                        exportRow[`Показания ${currentPeriods[3].label}`] =
                            row.period3_reading ?? "н/д";
                        exportRow[`Расход ${currentPeriods[3].label}`] =
                            row.period3_consumption ?? "н/д";

                        // Статус с иконками для наглядности
                        let status = "📋 Сохраненные";
                        if (row.isPeriod3Calculated) {
                            status = "🔷 Расчетные";
                        } else if (row.isPeriod3Manual) {
                            status = "✅ Ручной ввод";
                        }
                        if (row.hasPeriod3Data && !row.isPeriod3Valid) {
                            status = "❌ Ошибка валидации";
                        }
                        exportRow["Статус"] = status;

                        exportRow["Зафиксировано"] = row.isPeriod3Fixed
                            ? "Да"
                            : "Нет";
                    }

                    return exportRow;
                });

                if (dataForExport.length === 0) {
                    alert("Нет данных для экспорта");
                    return;
                }

                // Создаем рабочую книгу
                const wb = XLSX.utils.book_new();

                // 1. Добавляем СВОДНЫЙ лист ПЕРВЫМ
                addSummarySheet(wb, filteredRows);

                // 2. Добавляем ОСНОВНОЙ лист с данными
                const ws = XLSX.utils.json_to_sheet(dataForExport);

                // Настраиваем ширину колонок для основного листа
                const colWidths = [
                    { wch: 8 }, // Квартира
                    { wch: 25 }, // Тип счетчика
                ];

                // Динамически добавляем колонки периодов
                const periodsCount = [
                    currentPeriods[1],
                    currentPeriods[2],
                    currentPeriods[3],
                ].filter(Boolean).length;
                for (let i = 0; i < periodsCount; i++) {
                    colWidths.push({ wch: 15 }, { wch: 12 }); // Показания и расход для каждого периода
                }

                // Добавляем колонку статуса
                if (currentPeriods[3]) {
                    colWidths.push({ wch: 20 }); // Статус
                }

                ws["!cols"] = colWidths;

                // Настраиваем стили для заголовков основного листа
                if (ws["!ref"]) {
                    const range = XLSX.utils.decode_range(ws["!ref"]);

                    for (let R = range.s.r; R <= range.e.r; R++) {
                        for (let C = range.s.c; C <= range.e.c; C++) {
                            const cellAddress = { c: C, r: R };
                            const cellRef = XLSX.utils.encode_cell(cellAddress);

                            if (!ws[cellRef]) continue;

                            // Заголовки (первая строка) - жирный шрифт и заливка
                            if (R === 0) {
                                ws[cellRef].s = {
                                    font: {
                                        bold: true,
                                        color: { rgb: "2F5597" },
                                    },
                                    alignment: {
                                        horizontal: "center",
                                        vertical: "center",
                                    },
                                    fill: {
                                        fgColor: { rgb: "E6E6E6" },
                                    },
                                    border: {
                                        top: {
                                            style: "thin",
                                            color: { rgb: "000000" },
                                        },
                                        left: {
                                            style: "thin",
                                            color: { rgb: "000000" },
                                        },
                                        bottom: {
                                            style: "thin",
                                            color: { rgb: "000000" },
                                        },
                                        right: {
                                            style: "thin",
                                            color: { rgb: "000000" },
                                        },
                                    },
                                };
                            }
                            // Данные - выравнивание по правому краю для чисел
                            else if (C > 1) {
                                // Все колонки после "Тип счетчика"
                                ws[cellRef].s = {
                                    alignment: { horizontal: "right" },
                                };
                            }
                        }
                    }
                }

                XLSX.utils.book_append_sheet(wb, ws, "Детальные данные");

                // Генерируем и сохраняем файл
                const wbout = XLSX.write(wb, {
                    bookType: "xlsx",
                    type: "array",
                });

                const blob = new Blob([wbout], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });

                const currentDate = new Date().toISOString().split("T")[0];
                const fileName = `Показания_счетчиков_${currentDate}.xlsx`;

                saveAs(blob, fileName);
                console.log(`Экспортировано записей: ${dataForExport.length}`);
            } catch (error) {
                console.error("Ошибка экспорта:", error);
                alert("Ошибка при экспорте данных");
            }
        };

        // Дополнительный сводный лист для Excell
        const addSummarySheet = (wb, data) => {
            // Расширенная статистика
            const totalCount = data.length;
            const withCurrentData = data.filter(
                (row) => row.hasPeriod3Data
            ).length;
            const calculated = data.filter(
                (row) => row.isPeriod3Calculated
            ).length;
            const manual = data.filter((row) => row.isPeriod3Manual).length;
            const withErrors = data.filter(
                (row) => row.hasPeriod3Data && !row.isPeriod3Valid
            ).length;
            const readyToSave = data.filter(
                (row) => row.hasPeriod3Data && row.isPeriod3Valid
            ).length;
            const withoutData = totalCount - withCurrentData;

            // Статистика по типам счетчиков
            const typesStats = {};
            data.forEach((row) => {
                const type = row.type_name;
                if (!typesStats[type]) {
                    typesStats[type] = { total: 0, withData: 0 };
                }
                typesStats[type].total++;
                if (row.hasPeriod3Data) {
                    typesStats[type].withData++;
                }
            });

            const summaryData = [
                ["СВОДНАЯ ИНФОРМАЦИЯ ПО ПОКАЗАНИЯМ СЧЕТЧИКОВ"],
                [""],
                ["ОБЩАЯ СТАТИСТИКА", ""],
                ["Общее количество счетчиков:", totalCount],
                ["С данными за текущий период:", withCurrentData],
                ["Без данных за текущий период:", withoutData],
                ["", ""],
                ["СТАТУС ДАННЫХ ЗА ТЕКУЩИЙ ПЕРИОД", ""],
                ["Расчетные значения:", calculated],
                ["Ручной ввод:", manual],
                ["С ошибками валидации:", withErrors],
                ["Готовы к сохранению:", readyToSave],
                ["", ""],
                ["СТАТИСТИКА ПО ТИПАМ СЧЕТЧИКОВ", "С данными/Всего"],
            ];

            // Добавляем статистику по типам
            Object.entries(typesStats).forEach(([type, stats]) => {
                summaryData.push([type, `${stats.withData}/${stats.total}`]);
            });

            summaryData.push(
                [""],
                ["", ""],
                [`Дата экспорта: ${new Date().toLocaleString("ru-RU")}`],
                [`Текущий период: ${currentPeriods[3]?.label || "Не указан"}`],
                [
                    `Фильтр по типу: ${
                        typeFilter
                            ? meterTypes.find(
                                  (t) =>
                                      t.id.toString() === typeFilter.toString()
                              )?.name || typeFilter
                            : "Все типы"
                    }`,
                ]
            );

            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

            // Настройки ширины колонок
            wsSummary["!cols"] = [
                { wch: 40 }, // Первая колонка
                { wch: 20 }, // Вторая колонка
            ];

            // Применяем стили
            const range = XLSX.utils.decode_range(wsSummary["!ref"]);

            for (let R = range.s.r; R <= range.e.r; R++) {
                for (let C = range.s.c; C <= range.e.c; C++) {
                    const cellAddress = { c: C, r: R };
                    const cellRef = XLSX.utils.encode_cell(cellAddress);

                    if (!wsSummary[cellRef]) continue;

                    const cellValue = summaryData[R]?.[C];

                    // Заголовок
                    if (R === 0) {
                        wsSummary[cellRef].s = {
                            font: {
                                bold: true,
                                sz: 16,
                                color: { rgb: "2F5597" },
                            },
                            alignment: {
                                horizontal: "center",
                                vertical: "center",
                            },
                            fill: { fgColor: { rgb: "D9E2F3" } },
                        };
                        // Объединяем для заголовка
                        if (!wsSummary["!merges"]) wsSummary["!merges"] = [];
                        wsSummary["!merges"].push({
                            s: { r: 0, c: 0 },
                            e: { r: 0, c: 1 },
                        });
                    }
                    // Подзаголовки разделов
                    else if (
                        cellValue &&
                        typeof cellValue === "string" &&
                        (cellValue.includes("СТАТИСТИКА") ||
                            cellValue.includes("СТАТУС"))
                    ) {
                        wsSummary[cellRef].s = {
                            font: {
                                bold: true,
                                sz: 12,
                                color: { rgb: "2F5597" },
                            },
                            fill: { fgColor: { rgb: "E6E6E6" } },
                        };
                        if (C === 0) {
                            wsSummary["!merges"].push({
                                s: { r: R, c: 0 },
                                e: { r: R, c: 1 },
                            });
                        }
                    }
                    // Обычные данные
                    else {
                        if (C === 0) {
                            wsSummary[cellRef].s = {
                                font: {
                                    bold:
                                        !cellValue?.includes("Дата") &&
                                        !cellValue?.includes("Фильтр"),
                                },
                                alignment: { horizontal: "left" },
                            };
                        } else if (C === 1) {
                            wsSummary[cellRef].s = {
                                alignment: { horizontal: "right" },
                            };
                        }
                    }
                }
            }

            XLSX.utils.book_append_sheet(wb, wsSummary, "Сводка");
        };

        // Подсчет статистики
        const canApplyCount = filteredRows.filter(
            (row) =>
                !row.hasPeriod3Data &&
                row.processedReadings.consumption3 !== null &&
                !row.isPeriod3Manual &&
                !row.isPeriod3Fixed
        ).length;

        const canSaveCount = filteredRows.filter(
            (row) =>
                row.hasPeriod3Data &&
                row.isPeriod3Valid &&
                modifiedReadings[row.id] &&
                !row.isPeriod3Fixed
        ).length;

        const manualInputCount = filteredRows.filter(
            (row) =>
                row.isPeriod3Manual &&
                modifiedReadings[row.id] &&
                !row.isPeriod3Fixed
        ).length;

        const invalidCount = filteredRows.filter(
            (row) => row.hasPeriod3Data && !row.isPeriod3Valid
        ).length;

        return (
            <>
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

                {/* Панель выборки типа счетчика, экспорта */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <TextField
                            select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                onTypeFilterChange(e.target.value);
                            }}
                            size="small"
                            sx={{ width: 200 }}
                            disabled={meterTypes.length === 0}
                            SelectProps={{
                                displayEmpty: true,
                                renderValue:
                                    typeFilter !== ""
                                        ? undefined
                                        : () => "Все типы",
                            }}
                        >
                            <MenuItem value="">Все типы</MenuItem>
                            {meterTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Chip
                            label={`Показано: ${filteredRows.length}`}
                            variant="outlined"
                        />
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<ExportIcon />}
                            onClick={handleExport}
                        >
                            Экспорт
                        </Button>
                    </Box>
                </Box>
                {/* Панель массовых действий */}
                {(canApplyCount > 0 ||
                    canSaveCount > 0 ||
                    manualInputCount > 0 ||
                    invalidCount > 0) && (
                    <Toolbar
                        sx={{
                            bgcolor: "action.selected",
                            mb: 2,
                            borderRadius: 1,
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            {canApplyCount > 0 && (
                                <Chip
                                    label={`Можно рассчитать: ${canApplyCount}`}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {manualInputCount > 0 && (
                                <Chip
                                    label={`Ручной ввод: ${manualInputCount}`}
                                    color="success"
                                    variant="outlined"
                                />
                            )}
                            {canSaveCount > 0 && (
                                <Chip
                                    label={`Можно сохранить: ${canSaveCount}`}
                                    variant="outlined"
                                />
                            )}
                            {invalidCount > 0 && (
                                <Chip
                                    label={`Ошибки: ${invalidCount}`}
                                    color="error"
                                    variant="outlined"
                                />
                            )}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            {canApplyCount > 0 && (
                                <Button
                                    variant="contained"
                                    startIcon={<CalculateIcon />}
                                    onClick={onApplyAllCalculations}
                                >
                                    Рассчитать все
                                </Button>
                            )}
                            {canSaveCount > 0 && (
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={onSaveAllReadings}
                                    disabled={canSaveCount === 0} // Дополнительная проверка
                                >
                                    Сохранить все ({canSaveCount})
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                )}

                {filteredRows.length === 0 ? (
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            justifyContent: "center",
                            my: 8,
                        }}
                    >
                        <Box component="span">📊</Box>
                        Нет данных для отображения
                    </Typography>
                ) : (
                    <>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            pageSizeOptions={[10, 20, 50]}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 20 },
                                },
                            }}
                            disableColumnResize
                            density="compact"
                            sx={{
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: "grey.50",
                                    borderBottom: "2px solid",
                                    borderColor: "divider",
                                },
                                "& .MuiDataGrid-cell": {
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    padding: 0,
                                    display: "flex",
                                    alignItems: "center",
                                },
                                "& .MuiDataGrid-row": {
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },
                                },
                                "& .MuiDataGrid-virtualScroller": {
                                    minHeight: "200px",
                                },
                            }}
                            getRowHeight={() => "auto"}
                        />

                        {/* Футер с подсказками */}
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Typography variant="body2">
                                Всего счетчиков: {rows.length}
                            </Typography>
                            <Box
                                sx={{
                                    mt: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 2,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            backgroundColor: "#ffebee",
                                        }}
                                    />
                                    <Typography variant="caption">
                                        Отсутствуют данные
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "primary.main",
                                            textAlign: "center",
                                        }}
                                    >
                                        1234
                                    </Typography>
                                    <Typography variant="caption">
                                        Расчетное значение
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "success.main",
                                            textAlign: "center",
                                        }}
                                    >
                                        6543
                                    </Typography>
                                    <Typography variant="caption">
                                        Ручной ввод
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "bold",
                                            textAlign: "center",
                                        }}
                                    >
                                        7890
                                    </Typography>
                                    <Typography variant="caption">
                                        Зафиксированные данные
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            backgroundColor: "#ffcdd2",
                                            border: "2px solid #f44336",
                                        }}
                                    />
                                    <Typography variant="caption">
                                        Невалидные данные
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="caption">
                                        Enter - переход к следующей строке
                                        (только при валидных данных)
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </>
                )}
            </>
        );
    }
);

export default MeterReadingsTable;
