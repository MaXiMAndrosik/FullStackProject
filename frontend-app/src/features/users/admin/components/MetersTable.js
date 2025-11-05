import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Chip,
    Checkbox,
    TextField,
    MenuItem,
    Switch,
    Toolbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    FileDownload as ExportIcon,
    FileUpload as ImportIcon,
    ToggleOn as ActivateIcon,
    ToggleOff as DeactivateIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

const MetersTable = ({
    meters,
    loading,
    onEdit,
    onDelete,
    onExport,
    onCreate,
    onImport,
    selectedMeters = [],
    onSelectionChange,
    bulkActionLoading,
    meterTypes = [],
    onQuickToggle,
    bulkToggle,
    bulkDelete,
}) => {
    const [typeFilter, setTypeFilter] = useState("");

    const dateSortComparator = (v1, v2) => {
        if (!v1 && !v2) return 0;
        if (!v1) return 1;
        if (!v2) return -1;

        const date1 = new Date(v1);
        const date2 = new Date(v2);

        if (isNaN(date1.getTime())) return isNaN(date2.getTime()) ? 0 : 1;
        if (isNaN(date2.getTime())) return -1;

        return date1 - date2;
    };

    // Фильтрация счетчиков
    const filteredMeters = useMemo(() => {
        if (!typeFilter) {
            return meters;
        }

        const result = meters.filter((meter) => {
            return meter.type_id.toString() === typeFilter.toString();
        });

        return result;
    }, [meters, typeFilter]);

    const columns = [
        {
            field: "selection",
            headerName: "",
            width: 50,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => {
                // Получаем ID только отфильтрованных счетчиков
                const filteredIds = filteredMeters.map((m) => m.id);

                // Проверяем, выбраны ли все отфильтрованные счетчики
                const allFilteredSelected =
                    filteredIds.length > 0 &&
                    filteredIds.every((id) => selectedMeters.includes(id));

                // Проверяем, выбрана ли часть отфильтрованных счетчиков
                const someFilteredSelected =
                    filteredIds.length > 0 &&
                    filteredIds.some((id) => selectedMeters.includes(id)) &&
                    !allFilteredSelected;

                return (
                    <Checkbox
                        indeterminate={someFilteredSelected}
                        checked={allFilteredSelected}
                        onChange={(e) => {
                            if (allFilteredSelected || someFilteredSelected) {
                                // Удаляем все отфильтрованные из выбранных
                                const newSelected = selectedMeters.filter(
                                    (id) => !filteredIds.includes(id)
                                );
                                onSelectionChange(newSelected);
                            } else {
                                // Добавляем все отфильтрованные
                                const newSelected = [
                                    ...new Set([
                                        ...selectedMeters,
                                        ...filteredIds,
                                    ]),
                                ];
                                onSelectionChange(newSelected);
                            }
                        }}
                        disabled={bulkActionLoading}
                    />
                );
            },
            renderCell: (params) => (
                <Checkbox
                    checked={selectedMeters.includes(params.row.id)}
                    onChange={(e) => {
                        const newSelection = e.target.checked
                            ? [...selectedMeters, params.row.id]
                            : selectedMeters.filter(
                                  (id) => id !== params.row.id
                              );
                        onSelectionChange(newSelection);
                    }}
                    disabled={bulkActionLoading}
                />
            ),
        },
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
            field: "type_name",
            headerName: "Тип счетчика",
            width: 180,
        },
        {
            field: "unit",
            headerName: "Ед. изм.",
            width: 80,
        },
        {
            field: "serial_number",
            headerName: "Серийный номер",
            flex: 1,
            minWidth: 150,
            sortComparator: dateSortComparator,
        },
        {
            field: "installation_date_formatted",
            headerName: "Установлен",
            width: 120,
            sortComparator: dateSortComparator,
        },
        {
            field: "next_verification_date_formatted",
            headerName: "След. поверка",
            width: 120,
        },
        {
            field: "is_active",
            headerName: "Статус",
            width: 100,
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={() => onQuickToggle(params.row.id, !params.value)}
                />
            ),
            sortComparator: (v1, v2) => {
                if (v1 === v2) return 0;
                return v1 ? -1 : 1;
            },
        },
        {
            field: "actions",
            headerName: "Действия",
            width: 180,
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
                Управление приборами
                <Typography
                    component="span"
                    variant="h2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                >
                    учета
                </Typography>
            </Typography>

            <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                        select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                        }}
                        size="small"
                        sx={{ width: 200 }}
                        disabled={meterTypes.length === 0}
                        SelectProps={{
                            displayEmpty: true,
                            renderValue:
                                typeFilter !== ""
                                    ? undefined
                                    : () => "Все типы",
                        }}
                    >
                        <MenuItem value="">Все типы</MenuItem>
                        {meterTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                                {type.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Chip
                        label={`Показано: ${filteredMeters.length}`}
                        variant="outlined"
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<ImportIcon />}
                        onClick={onImport}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Импорт
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
                        Добавить счетчик
                    </Button>
                </Box>
            </Box>

            {/* Панель массовых действий */}
            {selectedMeters.length > 0 && (
                <Toolbar
                    sx={{
                        bgcolor: "action.selected",
                        mb: 2,
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Box>
                        <Chip
                            label={`Выбрано: ${selectedMeters.length}`}
                            color="primary"
                            sx={{ mr: 2 }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<ActivateIcon />}
                            onClick={() => bulkToggle(true)}
                            disabled={bulkActionLoading}
                        >
                            Активировать
                        </Button>

                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<DeactivateIcon />}
                            onClick={() => bulkToggle(false)}
                            disabled={bulkActionLoading}
                        >
                            Деактивировать
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={bulkDelete}
                            disabled={bulkActionLoading}
                        >
                            Удалить
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => onSelectionChange([])}
                            disabled={bulkActionLoading}
                        >
                            Снять выделение
                        </Button>
                    </Box>
                </Toolbar>
            )}

            <DataGrid
                rows={filteredMeters}
                columns={columns}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                disableColumnResize
                density="compact"
            />

            <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2">
                    Всего счетчиков: {meters.length}
                </Typography>
            </Box>
        </>
    );
};

export default MetersTable;
