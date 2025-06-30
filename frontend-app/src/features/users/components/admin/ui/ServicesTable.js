import React from "react";
import { Button, Typography, Chip, Switch } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const ServicesTable = ({ services, onAdd, onEdit, onDelete, onToggle }) => {
    const columnsServices = [
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
            field: "type",
            headerName: "Тип услуги",
            width: 180,
            sortable: true,
            renderCell: (params) => {
                const typeLabels = {
                    main: { label: "Основная", color: "primary" },
                    utility: { label: "Коммунальная", color: "secondary" },
                    additional: { label: "Дополнительная", color: "info" },
                    other: { label: "Прочее", color: "warning" },
                };

                const typeInfo = typeLabels[params.value] || {
                    label: params.value,
                    color: "default",
                };

                return (
                    <Chip
                        label={typeInfo.label}
                        color={typeInfo.color}
                        variant="outlined"
                    />
                );
            },
        },
        {
            field: "name",
            headerName: "Название услуги",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "code",
            headerName: "Код",
            width: 120,
        },
        {
            field: "calculation_type",
            headerName: "Тип расчёта",
            width: 150,
            renderCell: (params) => {
                const typeLabels = {
                    fixed: { label: "Фикированный", color: "primary" },
                    meter: { label: "По счетчику", color: "secondary" },
                    area: { label: "По площади", color: "info" },
                };

                const typeInfo = typeLabels[params.value] || {
                    label: params.value,
                    color: "default",
                };

                return <Chip label={typeInfo.label} color={typeInfo.color} />;
            },
        },
        {
            field: "is_active",
            headerName: "Активна",
            width: 120,
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={() => onToggle(params.row.id, params.value)}
                />
            ),
        },
        {
            field: "current_tariff",
            headerName: "Текущий тариф",
            width: 150,
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
                Настройки жилищно-коммунальных
                <Typography
                    component="span"
                    variant="h2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                >
                    услуг
                </Typography>
            </Typography>
            <DataGrid
                rows={services}
                columns={columnsServices}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                disableColumnResize
                density="compact"
            />
            <Button variant="contained" onClick={onAdd} sx={{ my: 2 }}>
                Добавить услугу
            </Button>
        </>
    );
};

export default ServicesTable;
