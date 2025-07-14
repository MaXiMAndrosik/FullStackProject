import React from "react";
import {
    Button,
    Typography,
    Chip,
    CircularProgress,
    Box,
    Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const UsersTable = ({ users, loading, onEdit, onDelete, onCreate }) => {
    const columns = [
        {
            field: "id",
            headerName: "ID",
            width: 80,
        },
        {
            field: "name",
            headerName: "Имя",
            flex: 1,
            width: 250,
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1,
            maxWidth: 250,
        },
        {
            field: "role",
            headerName: "Роль",
            width: 250,
            renderCell: (params) => {
                const typeLabels = {
                    admin: { label: "Администратор", color: "primary" },
                    owner: { label: "Собственник", color: "success" },
                    user: { label: "Пользователь", color: "default" },
                };

                const typeInfo = typeLabels[params.value] || {
                    label: params.value,
                    color: "default",
                };

                return <Chip label={typeInfo.label} color={typeInfo.color} />;
            },
        },
        {
            field: "created_at",
            headerName: "Создан",
            width: 120,
        },
        {
            field: "actions",
            headerName: "Действия",
            width: 250,
            renderCell: (params) => (
                <div>
                    <Tooltip
                        title={
                            params.row.role
                                ? "Нельзя изменить активную запись собственника"
                                : ""
                        }
                        placement="top"
                    >
                        <span>
                            <Button
                                size="small"
                                onClick={() => onEdit(params.row)}
                                disabled={params.row.role === "owner"}
                            >
                                Изменить роль
                            </Button>
                        </span>
                    </Tooltip>
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
                    пользователями
                </Typography>
            </Typography>

            <DataGrid
                rows={users}
                columns={columns}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                disableColumnResize
                density="compact"
                autoHeight
            />

            <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Всего пользователей: {users.length}
                </Typography>
            </Box>
        </>
    );
};

export default UsersTable;
