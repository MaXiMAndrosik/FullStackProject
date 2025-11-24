import React from "react";
import {
    Button,
    Typography,
    Tooltip,
    Box,
    LinearProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const AssignmentsTariffsTable = ({
    tariffs,
    assignments,
    onEdit,
    onDelete,
    loading = false,
}) => {
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
            field: "target_info",
            headerName: "Применить к",
            flex: 1,
            minWidth: 200,
            renderCell: (params) => {
                const assignment = assignments.find(
                    (a) => a.id === params.row.assignment_id
                );

                if (!assignment) return "Не указано";

                if (assignment.scope === "apartment") {
                    return assignment.apartment_number
                        ? `Квартира ${assignment.apartment_number}`
                        : `Квартира ${assignment.apartment_id}`;
                } else {
                    return `Подъезд ${assignment.entrance}`;
                }
            },
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
            width: 150,
            sortable: true,
            renderCell: (params) => {
                const statusText = params.value;
                const status = params.row.status;

                let color;
                let tooltipText;

                switch (status) {
                    case "current":
                        color = "success.main";
                        tooltipText = "Активный тариф";
                        break;
                    case "expired":
                        color = "grey.400";
                        tooltipText = "Тариф устарел";
                        break;
                    case "future":
                        color = "info.main";
                        tooltipText = "Тариф еще не вступил в силу";
                        break;
                    case "disabled":
                        color = "secondary.main";
                        tooltipText = "Услуга отключена";
                        break;
                    default:
                        color = "grey.600";
                        tooltipText = "Неизвестный статус";
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
            width: 120,
            renderCell: (params) => {
                // Запрещаем редактирование устаревших тарифов
                const isExpired = params.row.status === "expired";

                return (
                    <div>
                        <Tooltip
                            title={
                                isExpired
                                    ? "Редактирование устаревшего тарифа запрещено"
                                    : ""
                            }
                        >
                            <span>
                                <Button
                                    size="small"
                                    onClick={() => onEdit(params.row)}
                                    disabled={isExpired}
                                >
                                    Редакт
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
                    услуг
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
                loading={loading}
            />
        </>
    );
};

export default AssignmentsTariffsTable;
