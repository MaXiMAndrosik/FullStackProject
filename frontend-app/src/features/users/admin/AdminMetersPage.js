import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
    showWarning,
} from "../../../shared/services/notificationService";
import MetersTable from "./components/MetersTable";
import MeterDialog from "./components/MeterDialog";
import ImportDialog from "./components/ImportDialog";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminMetersPage = () => {
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentMeter, setCurrentMeter] = useState(null);
    const [importOpen, setImportOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importProgress, setImportProgress] = useState(0);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [importStep, setImportStep] = useState("select");
    const [meterTypes, setMeterTypes] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [selectedMeters, setSelectedMeters] = useState([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [metersRes, typesRes, apartmentsRes] = await Promise.all([
                apiClient.get("/admin/meters"),
                apiClient.get("/admin/meter-types"),
                apiClient.get("/admin/apartments"),
            ]);

            setMeters(metersRes.data);
            setMeterTypes(typesRes.data);
            setApartments(apartmentsRes.data);
        } catch (error) {
            showError("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const unitLabels = {
        m2: "м²",
        gcal: "Гкал",
        m3: "м³",
        kwh: "кВт·ч",
    };

    // Форматирование данных для DataGrid
    const formattedMeters = meters.map((meter) => {
        const apartment = apartments.find((a) => a.id === meter.apartment_id);
        const meterType = meterTypes.find((t) => t.id === meter.type_id);

        return {
            ...meter,
            apartment_number: apartment ? apartment.number : "N/A",
            type_name: meterType ? meterType.name : "N/A",
            unit: meterType ? unitLabels[meterType.unit] : "N/A",
            installation_date_formatted: formatDate(meter.installation_date),
            next_verification_date_formatted: formatDate(
                meter.next_verification_date
            ),
        };
    });

    const handleOpenDialog = (meter = null) => {
        setCurrentMeter(meter);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentMeter(null);
    };

    const handleSaveMeter = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const formData = Object.fromEntries(data.entries());
        const payload = {
            ...formData,
            apartment_id: parseInt(formData.apartment_id),
            type_id: parseInt(formData.type_id),
            is_active: formData.is_active === "1",
        };
        try {
            if (currentMeter) {
                await apiClient.put(
                    `/admin/meters/${currentMeter.id}`,
                    payload
                );
                showSuccess("Счетчик обновлен");
            } else {
                await apiClient.post("/admin/meters", payload);
                showSuccess("Счетчик создан");
            }
            fetchData();
            handleCloseDialog();
        } catch (error) {
            showError(error.response?.data?.message || "Ошибка сохранения");
        }
    };

    const handleDeleteMeter = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этот счетчик?")) {
            try {
                await apiClient.delete(`/admin/meters/${id}`);
                showSuccess("Счетчик удален");
                fetchData();
            } catch (error) {
                showError("Ошибка удаления счетчика");
            }
        }
    };

    // Обработчик выбора счетчиков
    const handleSelectionChange = (newSelection) => {
        setSelectedMeters(newSelection);
    };

    // Массовое включение/выключение счетчиков
    const handleBulkToggle = async (activate) => {
        if (selectedMeters.length === 0) {
            showWarning("Выберите хотя бы один счетчик");
            return;
        }

        setBulkActionLoading(true);

        try {
            await apiClient.patch("/admin/meters/bulk-toggle", {
                ids: selectedMeters,
                is_active: activate,
            });

            showSuccess(
                activate
                    ? `Активировано ${selectedMeters.length} счетчиков`
                    : `Деактивировано ${selectedMeters.length} счетчиков`
            );

            // Обновляем данные
            fetchData();
            setSelectedMeters([]);
        } catch (error) {
            showError(error);
            // showError("Ошибка при обновлении статуса счетчиков");
        } finally {
            setBulkActionLoading(false);
        }
    };

    // Массовое удаление счетчиков
    const handleBulkDelete = async () => {
        if (selectedMeters.length === 0) {
            showWarning("Выберите хотя бы один счетчик");
            return;
        }

        if (
            !window.confirm(
                `Вы уверены, что хотите удалить ${selectedMeters.length} счетчиков?`
            )
        ) {
            return;
        }

        setBulkActionLoading(true);
        try {
            await apiClient.post("/admin/meters/bulk-delete", {
                ids: selectedMeters,
            });

            showSuccess(`Удалено ${selectedMeters.length} счетчиков`);
            fetchData();
            setSelectedMeters([]);
        } catch (error) {
            showError("Ошибка при удалении счетчиков");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleQuickToggle = async (id, isActive) => {
        try {
            await apiClient.patch(`/admin/meters/${id}/toggle`, {
                is_active: isActive,
            });
            showSuccess(
                isActive ? "Счетчик активирован" : "Счетчик деактивирован"
            );
            fetchData();
        } catch (error) {
            showError("Ошибка при изменении статуса счетчика");
        }
    };

    // Экспорт данных в Excel
    const handleExportExcel = () => {
        const data = formattedMeters.map((meter) => ({
            "Номер квартиры": meter.apartment_number,
            "Тип счетчика": meter.type_name,
            "Единица измерения": meter.unit,
            "Серийный номер": meter.serial_number,
            "Дата установки": meter.installation_date_formatted,
            "Дата следующей поверки":
                meter.next_verification_date_formatted || "",
            Статус: meter.is_active ? "Активен" : "Неактивен",
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Счетчики");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "Счетчики.xlsx");
    };

    const handleImportOpen = () => setImportOpen(true);

    const handleImportClose = () => {
        setImportOpen(false);
        setImportFile(null);
        setImportStep("select");
        setImportResults(null);
        setImportProgress(0);
    };

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setImportFile(e.target.files[0]);
        }
    };

    // Валидация записи при импорте
    const validateImportRecord = (record) => {
        const errors = [];

        // Обязательные поля
        if (!record["Номер квартиры"]) errors.push("Номер квартиры обязателен");
        if (!record["Тип счетчика"]) errors.push("Тип счетчика обязателен");
        if (!record["Серийный номер"]) errors.push("Серийный номер обязателен");
        if (!record["Дата установки"])
            errors.push("Дата установки обязательна");

        // Поиск квартиры
        const apartment = apartments.find(
            (a) => a.number.toString() === record["Номер квартиры"].toString()
        );
        if (!apartment) {
            errors.push(
                `Квартира с номером ${record["Номер квартиры"]} не найдена`
            );
        }

        // Поиск типа счетчика
        const meterType = meterTypes.find(
            (t) => t.name === record["Тип счетчика"]
        );
        if (!meterType) {
            errors.push(`Тип счетчика "${record["Тип счетчика"]}" не найден`);
        }

        // Преобразование дат
        const parseDate = (dateStr, fieldName) => {
            if (!dateStr) return null;

            try {
                // Если дата уже в формате YYYY-MM-DD
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

                // Формат DD.MM.YYYY
                if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
                    const [day, month, year] = dateStr.split(".");
                    return `${year}-${month.padStart(2, "0")}-${day.padStart(
                        2,
                        "0"
                    )}`;
                }

                // Формат MM/DD/YYYY
                if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                    const [month, day, year] = dateStr.split("/");
                    return `${year}-${month.padStart(2, "0")}-${day.padStart(
                        2,
                        "0"
                    )}`;
                }

                errors.push(`Неверный формат ${fieldName}: ${dateStr}`);
                return null;
            } catch (e) {
                errors.push(`Ошибка преобразования ${fieldName}: ${e.message}`);
                return null;
            }
        };

        const installationDate = parseDate(
            record["Дата установки"],
            "даты установки"
        );
        const nextVerificationDate = parseDate(
            record["Дата следующей поверки"],
            "даты следующей поверки"
        );

        // Проверка даты поверки
        if (nextVerificationDate && installationDate) {
            const installDate = new Date(installationDate);
            const verifyDate = new Date(nextVerificationDate);

            if (verifyDate < installDate) {
                errors.push("Дата поверки не может быть раньше даты установки");
            }
        }

        const transformedData = {
            apartment_id: apartment?.id || null,
            type_id: meterType?.id || null,
            serial_number: record["Серийный номер"]?.toString(),
            installation_date: installationDate,
            next_verification_date: nextVerificationDate || null,
            is_active: record["Статус"] === "Активен",
        };

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors.join("; ") : null,
            data: transformedData,
        };
    };

    // Сохранение отчета об ошибках
    const saveErrorReport = () => {
        if (!importResults || importResults.errors.length === 0) return;

        const errorData = importResults.errors.map((err, index) => ({
            "#": index + 1,
            Ошибка: err.error,
            "Исходная запись": JSON.stringify(err.record),
            "Преобразованные данные": JSON.stringify(err.transformed || {}),
        }));

        const ws = XLSX.utils.json_to_sheet(errorData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ошибки импорта");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "Ошибки_импорта_счетчиков.xlsx");
    };

    // Импорт счетчиков из Excel
    const handleImport = async () => {
        if (!importFile) return;

        setImporting(true);
        setImportStep("progress");
        setImportProgress(0);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const totalRecords = jsonData.length;
                let processedRecords = 0;
                let validRecords = 0;
                let invalidRecords = 0;

                const importResults = {
                    success: [],
                    errors: [],
                };

                for (const record of jsonData) {
                    const validation = validateImportRecord(record);

                    if (validation.isValid) {
                        try {
                            await apiClient.post(
                                "/admin/meters",
                                validation.data
                            );
                            validRecords++;
                        } catch (error) {
                            invalidRecords++;
                            importResults.errors.push({
                                record,
                                transformed: validation.data,
                                error:
                                    error.response?.data?.message ||
                                    "Ошибка сохранения",
                            });
                        }
                    } else {
                        invalidRecords++;
                        importResults.errors.push({
                            record,
                            transformed: validation.data,
                            error: validation.errors,
                        });
                    }

                    processedRecords++;
                    setImportProgress(
                        Math.round((processedRecords / totalRecords) * 100)
                    );
                }

                setImportResults({
                    successCount: validRecords,
                    errorCount: invalidRecords,
                    errors: importResults.errors,
                });

                setImportStep("results");
                fetchData();
                setImporting(false);
            };
            reader.readAsArrayBuffer(importFile);
        } catch (error) {
            showError("Ошибка при импорте файла");
            setImporting(false);
            setImportStep("select");
        }
    };

    // Загрузка шаблона для импорта
    const handleDownloadTemplate = () => {
        const templateData = [
            {
                "Номер квартиры": "42",
                "Тип счетчика": "Холодная вода",
                "Единица измерения": "м³",
                "Серийный номер": "SN-42-WATER-12345",
                "Дата установки": "01.01.2023",
                "Дата следующей поверки": "01.01.2028",
                Статус: "Активен",
            },
            {
                "Номер квартиры": "15",
                "Тип счетчика": "Электричество",
                "Единица измерения": "кВт·ч",
                "Серийный номер": "SN-15-ELEC-67890",
                "Дата установки": "15.06.2022",
                "Дата следующей поверки": "15.06.2027",
                Статус: "Активен",
            },
        ];

        // Лист с инструкциями
        const instructions = [
            ["Поле", "Обязательное", "Формат", "Пример", "Описание"],
            [
                "Номер квартиры",
                "Да",
                "Число",
                "42",
                "Должен существовать в системе",
            ],
            [
                "Тип счетчика",
                "Да",
                "Текст",
                "Холодная вода",
                "Должен существовать в системе",
            ],
            [
                "Единица измерения",
                "Нет",
                "Текст",
                "м³",
                "Автоматически определяется по типу",
            ],
            [
                "Серийный номер",
                "Да",
                "Текст",
                "SN-12345",
                "Уникальный идентификатор",
            ],
            ["Дата установки", "Да", "ДД.ММ.ГГГГ", "01.01.2023", ""],
            [
                "Дата следующей поверки",
                "Нет",
                "ДД.ММ.ГГГГ",
                "01.01.2028",
                "Должна быть позже даты установки",
            ],
            [
                "Статус",
                "Нет",
                "Активен/Неактивен",
                "Активен",
                "По умолчанию 'Активен'",
            ],
        ];

        const wb = XLSX.utils.book_new();

        // Шаблон
        const wsTemplate = XLSX.utils.json_to_sheet(templateData);
        XLSX.utils.book_append_sheet(wb, wsTemplate, "Шаблон");

        // Инструкции
        const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
        XLSX.utils.book_append_sheet(wb, wsInstructions, "Инструкции");

        // Генерация и сохранение файла
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "Шаблон_импорта_счетчиков.xlsx");
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
                <MetersTable
                    meters={formattedMeters}
                    loading={loading}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteMeter}
                    onExport={handleExportExcel}
                    onCreate={() => handleOpenDialog()}
                    onImport={handleImportOpen}
                    selectedMeters={selectedMeters}
                    onSelectionChange={handleSelectionChange}
                    bulkActionLoading={bulkActionLoading}
                    onQuickToggle={handleQuickToggle}
                    bulkToggle={handleBulkToggle}
                    bulkDelete={handleBulkDelete}
                    meterTypes={meterTypes}
                />
                <MeterDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    meter={currentMeter}
                    onSubmit={handleSaveMeter}
                    meterTypes={meterTypes}
                    apartments={apartments}
                />
                <ImportDialog
                    open={importOpen}
                    onClose={handleImportClose}
                    onFileChange={handleFileChange}
                    onImport={handleImport}
                    file={importFile}
                    progress={importProgress}
                    importing={importing}
                    importStep={importStep}
                    importResults={importResults}
                    onSaveErrorReport={saveErrorReport}
                    handleTemplate={handleDownloadTemplate}
                    title="Импорт счетчиков из Excel"
                />
            </Container>
        </Box>
    );
};

export default AdminMetersPage;
