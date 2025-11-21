import React from "react";
import { Button, Typography, Tooltip, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const TariffsTable = ({ tariffs, onEdit, onDelete }) => {
    // Подготавливаем данные с дополнительным полем для фильтрации
    const processedTariffs = tariffs.map((tariff) => {
        const status = tariff.status;
        const isServiceActive = tariff.service_is_active;

        let statusText;
        if (!isServiceActive) {
            statusText = "Отключен";
        } else {
            switch (status) {
                case "current":
                    statusText = "Активен";
                    break;
                case "expired":
                    statusText = "Устарел";
                    break;
                case "future":
                    statusText = "Будущий";
                    break;
                default:
                    statusText = "Неизвестно";
            }
        }

        return {
            ...tariff,
            statusText,
        };
    });

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
            field: "statusText",
            headerName: "Статус",
            width: 120,
            sortable: true,
            renderCell: (params) => {
                const statusText = params.value;
                const status = params.row.status;
                const isServiceActive = params.row.service_is_active;

                let color;
                let tooltipText;

                if (!isServiceActive) {
                    color = "grey.500";
                    tooltipText = "Услуга отключена";
                } else {
                    switch (status) {
                        case "current":
                            color = "success.main";
                            tooltipText = "Активный тариф";
                            break;
                        case "expired":
                            color = "error.main";
                            tooltipText = "Тариф устарел";
                            break;
                        case "future":
                            color = "info.main";
                            tooltipText = "Тариф еще не вступил в силу";
                            break;
                        default:
                            color = "grey.500";
                            tooltipText = "Неизвестный статус";
                    }
                }

                return (
                    <Tooltip title={tooltipText}>
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
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
                rows={processedTariffs}
                columns={columnsTariffs}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                disableColumnResize
                density="compact"
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                    },
                }}
            />
        </>
    );
};

export default TariffsTable;
