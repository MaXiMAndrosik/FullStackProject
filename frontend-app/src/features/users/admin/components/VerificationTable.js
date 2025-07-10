import React from "react";
import { Button, Typography, Chip, CircularProgress, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const VerificationTable = ({ requests, loading, onViewDetails }) => {
    const columns = [
        {
            field: "id",
            headerName: "№",
            width: 60,
            renderCell: (params) => {
                const visibleRows = params.api.getRowModels();
                const rowIndex = Array.from(visibleRows.keys()).indexOf(
                    params.id
                );
                return rowIndex + 1;
            },
        },
        {
            field: "apartment_number",
            headerName: "Квартира",
            width: 100,
        },
        {
            field: "fullName",
            headerName: "ФИО",
            flex: 1,
            minWidth: 180,
        },
        {
            field: "formatted_birth_date",
            headerName: "Дата рождения",
            width: 120,
        },
        {
            field: "phone",
            headerName: "Телефон",
            width: 150,
        },
        {
            field: "formatted_created_at",
            headerName: "Дата заявки",
            width: 150,
        },
        {
            field: "status",
            headerName: "Статус",
            width: 120,
            renderCell: (params) => {
                const statusLabels = {
                    pending: { label: "Ожидает", color: "warning" },
                    approved: { label: "Подтвержден", color: "success" },
                    rejected: { label: "Отклонен", color: "error" },
                };

                const statusInfo = statusLabels[params.value] || {
                    label: params.value,
                    color: "default",
                };

                return (
                    <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        variant="outlined"
                        size="small"
                    />
                );
            },
        },
        {
            field: "actions",
            headerName: "Действия",
            width: 150,
            renderCell: (params) => (
                <Button
                    size="small"
                    color="error"
                    onClick={() => onViewDetails(params.row)}
                >
                    Подробнее
                </Button>
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
                Верификация
                <Typography
                    component="span"
                    variant="h2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                >
                    собственников
                </Typography>
            </Typography>

            <DataGrid
                rows={requests}
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
                    Всего запросов: {requests.length}
                </Typography>
            </Box>
        </>
    );
};

export default VerificationTable;
