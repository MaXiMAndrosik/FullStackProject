import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import ApartmentsTable from "./components/ApartmentsTable";
import ApartmentDialog from "./components/ApartmentDialog";
import ImportDialog from "./components/ImportDialog";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminApartmentsPage = () => {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentApartment, setCurrentApartment] = useState(null);
    const [importOpen, setImportOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importProgress, setImportProgress] = useState(0);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [importStep, setImportStep] = useState("select");

    useEffect(() => {
        fetchApartments();
    }, []);

    const fetchApartments = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/admin/apartments");
            setApartments(response.data);
        } catch (error) {
            showError("Ошибка загрузки квартир");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (apartment = null) => {
        setCurrentApartment(apartment);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentApartment(null);
    };

    // Создание/редактирование квартиры
    const handleSaveApartment = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const apartmentData = Object.fromEntries(data.entries());

        // Преобразование числовых полей
        apartmentData.area =
            parseFloat(
                apartmentData.area.replace(",", ".").replace(/[^\d.]/g, "")
            ) || 0;
        // apartmentData.area = parseFloat(apartmentData.area);
        apartmentData.floor = parseInt(apartmentData.floor);
        apartmentData.entrance = parseInt(apartmentData.entrance);
        apartmentData.rooms = parseInt(apartmentData.rooms);

        try {
            if (currentApartment) {
                await apiClient.put(
                    `/admin/apartments/${currentApartment.id}`,
                    apartmentData
                );
                showSuccess("Квартира обновлена");
            } else {
                await apiClient.post("/admin/apartments", apartmentData);
                showSuccess("Квартира создана");
            }
            fetchApartments();
            handleCloseDialog();
        } catch (error) {
            showError(error.response?.data?.message || "Ошибка сохранения");
        }
    };

    // Удаление квартиры
    const handleDeleteApartment = async (id, hasOwners) => {
        if (window.confirm("Вы уверены, что хотите удалить эту квартиру?")) {
            try {
                await apiClient.delete(`/admin/apartments/${id}`);
                showSuccess("Квартира удалена");
                fetchApartments();
            } catch (error) {
                if (
                    error.response?.data?.message?.includes(
                        "foreign key constraint fails"
                    )
                ) {
                    showError(
                        "Нельзя удалить квартиру, так как она связана с собственником"
                    );
                } else {
                    showError("Ошибка удаления квартиры");
                }
            }
        }
    };

    // Экспорт данных в Excel
    const handleExportExcel = () => {
        const data = apartments.map((apartment) => ({
            Номер: apartment.number,
            Площадь: apartment.area,
            Этаж: apartment.floor,
            Подъезд: apartment.entrance,
            Комнат: apartment.rooms,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Квартиры");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "Квартиры.xlsx");
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

        if (!record["Номер"]) errors.push("Номер обязателен");
        if (!record["Площадь"]) errors.push("Площадь обязательна");
        if (!record["Этаж"]) errors.push("Этаж обязателен");
        if (!record["Подъезд"]) errors.push("Подъезд обязателен");
        if (!record["Комнат"]) errors.push("Количество комнат обязательно");

        const transformedData = {
            number: record["Номер"]?.toString(),
            area: parseFloat(record["Площадь"]),
            floor: parseInt(record["Этаж"]),
            entrance: parseInt(record["Подъезд"]),
            rooms: parseInt(record["Комнат"]),
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
        }));

        const ws = XLSX.utils.json_to_sheet(errorData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ошибки импорта");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "Ошибки_импорта_квартир.xlsx");
    };

    // Импорт квартир из Excel
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
                                "/admin/apartments",
                                validation.data
                            );
                            validRecords++;
                        } catch (error) {
                            invalidRecords++;
                            importResults.errors.push({
                                record,
                                error:
                                    error.response?.data?.message ||
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
                fetchApartments();
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
                Номер: "42",
                Площадь: "75.5",
                Этаж: "5",
                Подъезд: "1",
                Комнат: "3",
            },
            {
                Номер: "15",
                Площадь: "45.0",
                Этаж: "2",
                Подъезд: "3",
                Комнат: "2",
            },
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);
        XLSX.utils.book_append_sheet(wb, ws, "Шаблон");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "Шаблон_импорта_квартир.xlsx");
    };

    return (
        <Box
            component="section"
            sx={{
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
            }}
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
                <ApartmentsTable
                    apartments={apartments}
                    loading={loading}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteApartment}
                    onExport={handleExportExcel}
                    onCreate={() => handleOpenDialog()}
                    onImport={handleImportOpen}
                />

                <ApartmentDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    apartment={currentApartment}
                    onSubmit={handleSaveApartment}
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
                    title="Импорт квартир из Excel"
                />
            </Container>
        </Box>
    );
};

export default AdminApartmentsPage;
