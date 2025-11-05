import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    MenuItem,
    Select,
    InputLabel,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import StyledFormControl from "../../../../shared/ui/StyledFormControl";


const UserDialog = ({ open, onClose, user, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "user",
        verification_status: false,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                role: user.role || "",
                verification_status: user.verification_status || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                role: "",
                verification_status: "unverified",
            });
        }
    }, [user, open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Редактирование пользователя</DialogTitle>

            <DialogContent>
                <form onSubmit={onSubmit} id="user-form">
                    <Box sx={{ mt: 2 }}>
                        <StyledTextArea
                            fullWidth
                            label="Имя"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={!!user}
                        />

                        <StyledTextArea
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={!!user}
                        />

                        <StyledFormControl fullWidth margin="normal">
                            <InputLabel>Роль</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                label="Роль"
                            >
                                <MenuItem value="user">Пользователь</MenuItem>
                                {/* <MenuItem value="owner">Собственник</MenuItem> */}
                                <MenuItem value="admin">Администратор</MenuItem>
                            </Select>
                        </StyledFormControl>
                    </Box>
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Отмена
                </Button>
                <Button
                    type="submit"
                    form="user-form"
                    variant="contained"
                    disabled={!formData.name || !formData.email}
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDialog;
