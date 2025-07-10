import React from "react";
import {
    Button,
    Typography,
    Chip,
    CircularProgress,
    Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    FileDownload as ExportIcon,
    FileUpload as ImportIcon,
} from "@mui/icons-material";

const OwnersTable = ({
    owners,
    loading,
    onEdit,
    onDelete,
    onExport,
    onCreate,
    onImport,
}) => {
    const columns = [
        // {
        //     field: "id",
        //     headerName: "№",
        //     width: 60,
        //     renderCell: (params) => {
        //         const visibleRows = params.api.getRowModels();
        //         const rowIndex = Array.from(visibleRows.keys()).indexOf(
        //             params.id
        //         );
        //         return rowIndex + 1;
        //     },
        // },
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
        },
        {
            field: "last_name",
            headerName: "Фамилия",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "first_name",
            headerName: "Имя",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "patronymic",
            headerName: "Отчество",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "birth_date",
            headerName: "Дата рождения",
            width: 120,
        },
        {
            field: "phone",
            headerName: "Телефон",
            width: 150,
        },
        {
            field: "ownership_start_date",
            headerName: "Начало владения",
            width: 120,
        },
        {
            field: "ownership_end_date",
            headerName: "Конец владения",
            width: 120,
        },
        {
            field: "is_verified",
            headerName: "Статус",
            width: 120,
            renderCell: (params) => {
                const endDate = params.row.ownership_end_date;
                const isVerified = params.value;
                if (endDate) {
                    return (
                        <Chip
                            label={"Устарел"}
                            color={"default"}
                            size="small"
                        />
                    );
                }
                if (isVerified) {
                    return (
                        <Chip
                            label={"Активирован"}
                            color={"success"}
                            size="small"
                        />
                    );
                } else {
                    return null;
                }
            },
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
                    <Button
                        size="small"
                        color="error"
                        onClick={() => onDelete(params.row.id)}
                    >
                        Удалить
                    </Button>
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
                    собственниками
                </Typography>
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<ImportIcon />}
                        onClick={onImport}
                        sx={{ mr: 1 }}
                    >
                        Импорт из Excel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ExportIcon />}
                        onClick={onExport}
                        sx={{ mr: 1 }}
                    >
                        Экспорт
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onCreate}
                    >
                        Добавить
                    </Button>
                </Box>
            </Box>

            <DataGrid
                rows={owners}
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
                    Всего собственников: {owners.length}
                </Typography>
            </Box>
        </>
    );
};

export default OwnersTable;
