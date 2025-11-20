import React from "react";
import { Button, Typography, Tooltip, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const TariffsTable = ({ tariffs, onEdit, onDelete }) => {
    const columnsTariffs = [
        {
            field: "id",
            headerName: "№ п/п",
            width: 80,
            renderCell: (params) => {
                const visibleRows = params.api.getRowModels();
                const rowIndex = Array.from(visibleRows.keys()).indexOf(
                    params.id
                );
                return rowIndex + 1;
            },
        },
        {
            field: "service_name",
            headerName: "Наименование услуги",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "formatted_rate",
            headerName: "Тариф",
            width: 150,
        },
        {
            field: "formatted_start_date",
            headerName: "Дата начала",
            width: 150,
        },
        {
            field: "formatted_end_date",
            headerName: "Дата окончания",
            width: 150,
        },
        {
            field: "status",
            headerName: "Статус",
            width: 120,
            sortable: true,
            renderCell: (params) => {
                const status = params.value; // 'current', 'future', 'expired'
                const isServiceActive = params.row.service_is_active;
                console.log("status = ", status);

                // Определяем цвет в зависимости от статуса тарифа и активности услуги
                let color;
                let statusText;
                let tooltipText;

                if (!isServiceActive) {
                    color = "grey.500"; // Серый, если услуга неактивна
                    statusText = "Отключен";
                    tooltipText = "Услуга отключена";
                } else {
                    switch (status) {
                        case "current":
                            color = "success.main"; // Зеленый для активного тарифа
                            statusText = "Активен";
                            tooltipText = "Активный тариф";
                            break;
                        case "expired":
                            color = "error.main"; // Красный для устаревшего тарифа
                            statusText = "Устарел";
                            tooltipText = "Тариф устарел";
                            break;
                        case "future":
                            color = "info.main"; // Синий для будущего тарифа
                            statusText = "Будущий";
                            tooltipText = "Тариф еще не вступил в силу";
                            break;
                        default:
                            color = "grey.500";
                            statusText = "Неизв.";
                            tooltipText = "Неизвестный статус";
                    }
                }

                return (
                    <Tooltip title={tooltipText}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: color,
                                }}
                            />
                            <Typography variant="body2">
                                {statusText}
                            </Typography>
                        </Box>
                    </Tooltip>
                );
            },
        },
        {
            field: "actions",
            headerName: "Действия",
            width: 200,
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
                Настройки тарифов для
                <Typography
                    component="span"
                    variant="h2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                >
                    ЖКУ
                </Typography>
            </Typography>
            <DataGrid
                rows={tariffs}
                columns={columnsTariffs}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                disableColumnResize
                density="compact"
            />
        </>
    );
};

export default TariffsTable;
