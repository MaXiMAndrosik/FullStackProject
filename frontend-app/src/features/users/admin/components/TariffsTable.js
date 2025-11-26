import React from "react";
import {
    Button,
    Typography,
    Tooltip,
    Box,
    LinearProgress,
} from "@mui/material";
import {
    getTariffServiceNameStyle,
    getTariffRateStyle,
} from "../ui/StatusHelper";
import { DataGrid } from "@mui/x-data-grid";


const TariffsTable = ({ tariffs, onEdit, onDelete, loading = false }) => {
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
            renderCell: (params) => {
                const displayInfo = getTariffServiceNameStyle(
                    params.row.service_is_active,
                    params.row.is_service_deleted
                );

                return (
                    <Tooltip title={displayInfo.tooltip}>
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: displayInfo.color,
                                    fontStyle: displayInfo.fontStyle,
                                }}
                            >
                                {params.value}
                            </Typography>
                        </Box>
                    </Tooltip>
                );
            },
        },
        {
            field: "formatted_rate",
            headerName: "Тариф",
            width: 150,
            renderCell: (params) => {
                const displayInfo = getTariffRateStyle(
                    params.row.service_is_active,
                    params.row.is_service_deleted
                );

                return (
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: displayInfo.color,
                                fontStyle: displayInfo.fontStyle,
                            }}
                        >
                            {params.value}
                        </Typography>
                    </Box>
                );
            },
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
            field: "status_display",
            headerName: "Статус",
            minWidth: 150,
            sortable: true,
            renderCell: (params) => (
                <Tooltip title={params.row.status_tooltip}>
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
                        {params.row.status_show_dot && (
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: params.row.status_color,
                                }}
                            />
                        )}
                        <Typography variant="body2">{params.value}</Typography>
                    </Box>
                </Tooltip>
            ),
        },
        {
            field: "actions",
            headerName: "Действия",
            width: 200,
            renderCell: (params) => {
                // Запрещаем редактирование архивных тарифов
                const isArchived = params.row.status === "expired";
                // Запрещаем удаление всех тарифов, кроме архивных
                const isDeletable = params.row.status === "expired";

                return (
                    <div>
                        {/* Кнопка редактирования */}
                        <Tooltip
                            title={
                                isArchived
                                    ? "Редактирование архивного тарифа запрещено"
                                    : ""
                            }
                        >
                            <span>
                                <Button
                                    size="small"
                                    onClick={() => onEdit(params.row)}
                                    disabled={isArchived}
                                >
                                    Редакт
                                </Button>
                            </span>
                        </Tooltip>

                        {/* Кнопка удаления */}
                        <Tooltip
                            title={
                                !isDeletable
                                    ? "Удаление разрешено только для архивных тарифов"
                                    : ""
                            }
                        >
                            <span>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(params.row.id)}
                                    disabled={!isDeletable}
                                >
                                    Удалить
                                </Button>
                            </span>
                        </Tooltip>
                    </div>
                );
            },
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

            {loading && <LinearProgress />}

            <DataGrid
                rows={tariffs}
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
                loading={loading}
            />
        </>
    );
};

export default TariffsTable;
