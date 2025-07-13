import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import { format } from "date-fns";
import apiClient from "../../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import UsersTable from "./components/UsersTable";
import UserDialog from "./components/UserDialog";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/admin/users");
            setUsers(response.data);
        } catch (error) {
            showError("Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };

    // Форматирование данных для DataGrid
    const formattedUsers = users.map((user) => ({
        ...user,
        created_at: formatDate(user.created_at),
        email_verified_at: formatDate(user.email_verified_at),
    }));

    const handleOpenDialog = (user = null) => {
        setCurrentUser(user);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentUser(null);
    };

    // Сохранение пользователя
    const handleSaveUser = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const userData = Object.fromEntries(data.entries());

        try {
            if (currentUser) {
                await apiClient.put(`/admin/users/${currentUser.id}`, userData);
                showSuccess("Пользователь обновлен");
            } else {
                await apiClient.post("/admin/users", userData);
                showSuccess("Пользователь создан");
            }
            fetchUsers();
            handleCloseDialog();
        } catch (error) {
            showError(error.response?.data?.message || "Ошибка сохранения");
        }
    };

    // Удаление пользователя
    const handleDeleteUser = async (id) => {
        if (
            window.confirm("Вы уверены, что хотите удалить этого пользователя?")
        ) {
            try {
                await apiClient.delete(`/admin/users/${id}`);
                showSuccess("Пользователь удален");
                fetchUsers();
            } catch (error) {
                showError("Ошибка удаления");
            }
        }
    };

    return (
        <Box
            component="section"
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
            })}
        >
            <Container
                maxWidth={false}
                sx={{ pt: { xs: 14, sm: 8 }, pb: { xs: 8, sm: 8 } }}
            >
                <UsersTable
                    users={formattedUsers}
                    loading={loading}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteUser}
                    onCreate={() => handleOpenDialog()}
                />

                <UserDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    user={currentUser}
                    onSubmit={handleSaveUser}
                />

            </Container>
        </Box>
    );
};

export default AdminUsersPage;
