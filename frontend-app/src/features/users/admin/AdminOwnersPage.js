import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import { format } from "date-fns";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import OwnersTable from "./components/OwnersTable";
import OwnerDialog from "./components/OwnerDialog";
import ImportDialog from "./components/ImportDialog";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminOwnersPage = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentOwner, setCurrentOwner] = useState(null);
    const [importOpen, setImportOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importProgress, setImportProgress] = useState(0);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [importStep, setImportStep] = useState("select"); // 'select', 'progress', 'results'

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/admin/owners");
            setOwners(response.data);
        } catch (error) {
            showError("Ошибка загрузки собственников");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };

    // Форматирование данных для DataGrid
    const formattedOwners = owners.map((request) => {
        return {
            ...request,
            birth_date: formatDate(request.birth_date),
            apartment_number: request.apartment.number,
            ownership_start_date: formatDate(request.ownership_start_date),
            ownership_end_date: formatDate(request.ownership_end_date),
            verified_at: formatDate(request.verified_at),
        };
    });

    const handleOpenDialog = (owner = null) => {
        setCurrentOwner(owner);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentOwner(null);
    };

    // Создание (редактирование) собственника
    const handleSaveOwner = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const ownerData = Object.fromEntries(data.entries());
        try {
            if (currentOwner) {
                // Обновление существующего собственника
                await apiClient.put(
                    `/admin/owners/${currentOwner.id}`,
                    ownerData
                );
                showSuccess("Собственник обновлен");
            } else {
                // Создание нового собственника
                await apiClient.post("/admin/owners", ownerData);
                showSuccess("Собственник создан");
            }
            fetchOwners();
            handleCloseDialog();
        } catch (error) {
            showError(error);
        }
    };
    // Удаление собственника
    const handleDeleteOwner = async (id) => {
        if (
            window.confirm("Вы уверены, что хотите удалить этого собственника?")
        ) {
            try {
                await apiClient.delete(`/admin/owners/${id}`);
                showSuccess("Собственник удален");
                fetchOwners();
            } catch (error) {
                showError("Ошибка удаления");
            }
        }
    };

    // Экспорт данных собственников в Excel таблицу
    const handleExportExcel = () => {
        // Подготовка данных для экспорта
        const data = formattedOwners.map((owner) => ({
            "Номер квартиры": owner.apartment_number,
            Фамилия: owner.last_name,
            Имя: owner.first_name,
            Отчество: owner.patronymic,
            "Дата рождения": owner.birth_date,
            Телефон: owner.phone,
            Телеграм: owner.telegram,
            "Начало владения": owner.ownership_start_date,
            "Конец владения": owner.ownership_end_date || "",
        }));

        // Создаем рабочую книгу и лист
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Собственники");

        // Генерируем бинарный файл
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        // Сохраняем файл
        saveAs(blob, "Собственники.xlsx");
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
        if (e.target.files && e.target.files[0]) {
            setImportFile(e.target.files[0]);
        }
    };

    // Валидация данных собственников перед импортом
    const validateImportRecord = (record) => {
        const errors = [];

        // Проверка обязательных полей
        if (!record["Номер квартиры"]) errors.push("Номер квартиры обязателен");
        if (!record["Фамилия"]) errors.push("Фамилия обязательна");
        if (!record["Имя"]) errors.push("Имя обязательно");
        if (!record["Отчество"]) errors.push("Отчество обязательно");
        if (!record["Начало владения"])
            errors.push("Начало владения обязательно");

        // Функция для преобразования даты в формат YYYY-MM-DD
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

        // Преобразование дат
        const birthDate = parseDate(record["Дата рождения"], "даты рождения");
        const startDate = parseDate(
            record["Начало владения"],
            "даты начала владения"
        );
        const endDate = parseDate(
            record["Конец владения"],
            "даты конца владения"
        );

        // Проверка даты окончания владения
        if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
            errors.push(
                "Дата окончания владения должна быть позже даты начала"
            );
        }

        const transformedData = {
            apartment_number: record["Номер квартиры"]?.toString(),
            last_name: record["Фамилия"],
            first_name: record["Имя"],
            patronymic: record["Отчество"] || null,
            birth_date: birthDate,
            phone: record["Телефон"] || null,
            telegram: record["Телеграм"] || null,
            ownership_start_date: startDate,
            ownership_end_date: endDate || null,
            is_verified: record["Верифицирован"] === "Да",
        };

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors.join("; ") : null,
            data: transformedData,
        };
    };

    // Сохранение ошибок импорта
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
        saveAs(blob, "Ошибки_импорта_собственников.xlsx");
    };

    // Импорт собственников из Excel
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
                                "/admin/owners",
                                validation.data
                            );
                            validRecords++;
                            importResults.success.push({
                                record,
                                transformed: validation.data,
                            });
                        } catch (error) {
                            invalidRecords++;
                            importResults.errors.push({
                                record,
                                transformed: validation.data,
                                error:
                                    error.response?.data?.message ||
                                    error.message ||
                                    "Ошибка сохранения",
                            });
                        }
                    } else {
                        invalidRecords++;
                        importResults.errors.push({
                            record,
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
                fetchOwners();
                setImporting(false);
            };
            reader.readAsArrayBuffer(importFile);
        } catch (error) {
            console.error("Ошибка импорта:", error);
            showError("Ошибка при импорте файла");
            setImporting(false);
            setImportStep("select");
        }
    };

    // Загрузить шаблон для импорта собственников
    const handleDownloadTemplate = () => {
        // Основные данные
        const templateData = [
            {
                "Номер квартиры": "42",
                Фамилия: "Иванов",
                Имя: "Иван",
                Отчество: "Иванович",
                "Дата рождения": "15.05.1980",
                Телефон: "+375291234567",
                Телеграм: "@ivanov",
                "Начало владения": "01.01.2010",
                "Конец владения": "",
            },
            {
                "Номер квартиры": "15",
                Фамилия: "Петрова",
                Имя: "Мария",
                Отчество: "Сергеевна",
                "Дата рождения": "20.11.1992",
                Телефон: "+375337654321",
                Телеграм: "@petrova",
                "Начало владения": "15.06.2015",
                "Конец владения": "31.12.2022",
            },
        ];

        const wb = XLSX.utils.book_new();

        // 1. Лист с шаблоном
        const ws = XLSX.utils.json_to_sheet(templateData);

        // Настройка ширины столбцов
        ws["!cols"] = [
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
        ];

        // Замораживаем заголовки
        ws["!freeze"] = { y: 1 };

        // Добавляем стили заголовкам
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2C6E9B" } },
        };

        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = headerStyle;
        }

        XLSX.utils.book_append_sheet(wb, ws, "Шаблон");

        // 2. Лист с инструкциями
        const instructions = [
            ["Поле", "Обязательное", "Формат", "Пример", "Описание"],
            [
                "Номер квартиры",
                "Да",
                "Число",
                "42",
                "Номер квартиры от 1 до 80",
            ],
            ["Фамилия", "Да", "Текст", "Иванов", "Только русские буквы"],
            ["Имя", "Да", "Текст", "Иван", "Только русские буквы"],
            ["Отчество", "Нет", "Текст", "Иванович", "Только русские буквы"],
            ["Дата рождения", "Нет", "ДД.ММ.ГГГГ", "15.05.1980", ""],
            [
                "Телефон",
                "Нет",
                "+375XXXXXXXXX",
                "+375291234567",
                "Белорусский формат",
            ],
            ["Телеграм", "Нет", "@username", "@ivanov", ""],
            [
                "Начало владения",
                "Да",
                "ДД.ММ.ГГГГ",
                "01.01.2010",
                "Обязательная дата",
            ],
            [
                "Конец владения",
                "Нет",
                "ДД.ММ.ГГГГ",
                "31.12.2022",
                "Должна быть позже начала",
            ],
        ];

        const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);

        // Автоширина для инструкций
        const instructionCols = instructions[0].map((_, i) => ({ wch: 25 }));
        wsInstructions["!cols"] = instructionCols;

        // Стиль для заголовка инструкций
        const instructionHeader = XLSX.utils.encode_cell({ r: 0, c: 0 });
        wsInstructions[instructionHeader].s = headerStyle;

        XLSX.utils.book_append_sheet(wb, wsInstructions, "Инструкции");

        // ws["!protect"] = {
        //     selectLockedCells: false,
        //     selectUnlockedCells: true,
        //     formatCells: true,
        //     formatColumns: true,
        //     formatRows: true,
        //     insertColumns: false,
        //     insertRows: false,
        //     deleteColumns: false,
        //     deleteRows: false,
        // };

        // Генерация и сохранение файла
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "Шаблон_импорта_собственников.xlsx");
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
                    pb: { xs: 8, sm: 8 },
                    width: "100%",
                    mb: 3,
                }}
            >
                <OwnersTable
                    owners={formattedOwners}
                    loading={loading}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteOwner}
                    onExport={handleExportExcel}
                    onCreate={() => handleOpenDialog()}
                    onImport={handleImportOpen}
                />

                <OwnerDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    owner={currentOwner}
                    onSubmit={handleSaveOwner}
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
                />
            </Container>
        </Box>
    );
};

export default AdminOwnersPage;
