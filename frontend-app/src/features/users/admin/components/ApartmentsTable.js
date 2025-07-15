import React from "react";
import { Button, Typography, CircularProgress, Box, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    FileDownload as ExportIcon,
    FileUpload as ImportIcon,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import ApartmentsSummary from "./ApartmentsSummary";

const ApartmentsTable = ({
    apartments,
    loading,
    onEdit,
    onDelete,
    onExport,
    onCreate,
    onImport,
}) => {
    const columns = [
        {
            field: "number",
            headerName: "Номер",
            width: 120,
            sortComparator: (v1, v2) => {
                const num1 = parseInt(v1, 10);
                const num2 = parseInt(v2, 10);
                return isNaN(num1) || isNaN(num2)
                    ? v1.localeCompare(v2)
                    : num1 - num2;
            },
        },
        {
            field: "area",
            headerName: "Площадь (м²)",
            width: 120,
            valueFormatter: (params) => {
                // Преобразуем строку в число
                const areaValue = parseFloat(params.value);
                // Проверяем, что преобразование успешно
                return !isNaN(areaValue) ? areaValue.toFixed(2) : params.value;
            },
            sortComparator: (v1, v2) => {
                const num1 = parseFloat(v1.replace(",", "."));
                const num2 = parseFloat(v2.replace(",", "."));

                if (isNaN(num1)) return isNaN(num2) ? 0 : -1;
                if (isNaN(num2)) return 1;
                return num1 - num2;
            },
        },
        { field: "floor", headerName: "Этаж", width: 100 },
        { field: "entrance", headerName: "Подъезд", width: 120 },
        { field: "rooms", headerName: "Комнат", width: 120 },
        {
            field: "has_owners",
            headerName: "Собственники",
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value > 0 ? `Активирован` : "Нет данных"}
                    color={params.value > 0 ? "success" : "warning"}
                    variant="outlined"
                    size="small"
                />
            ),
        },
        {
            field: "actions",
            headerName: "Действия",
            width: 150,
            renderCell: (params) => (
                <div>
                    <Button size="small" onClick={() => onEdit(params.row)}>
                        Редакт
                    </Button>
                    <Tooltip
                        title={
                            params.row.has_owners
                                ? "Нельзя удалить: квартира связана с собственником"
                                : ""
                        }
                        placement="top"
                    >
                        <span>
                            <Button
                                size="small"
                                color="error"
                                onClick={() => onDelete(params.row.id)}
                                disabled={params.row.has_owners}
                            >
                                Удалить
                            </Button>
                        </span>
                    </Tooltip>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

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
                Управление
                <Typography
                    component="span"
                    variant="h2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                >
                    квартирами
                </Typography>
            </Typography>

            {/* Информационная панель */}
            <ApartmentsSummary apartments={apartments} />

            <Box
                maxWidth="lg"
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        width: "100%",
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<ImportIcon />}
                        onClick={onImport}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Импорт из Excel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<ExportIcon />}
                        onClick={onExport}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Экспорт
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onCreate}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Добавить квартиру
                    </Button>
                </Box>
            </Box>

            <DataGrid
                sx={{
                    maxWidth: { xs: "100%", sm: "80%", md: 885 },
                    mx: "auto",
                }}
                rows={apartments}
                columns={columns}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                disableColumnResize
                density="compact"
            />

            <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Всего квартир: {apartments.length}
                </Typography>
            </Box>
        </>
    );
};

export default ApartmentsTable;
