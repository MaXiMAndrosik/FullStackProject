import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import { Close as CloseIcon } from "@mui/icons-material";

const ApartmentDialog = ({ open, onClose, apartment, onSubmit }) => {
    const [errors, setErrors] = useState({
        number: "",
        area: "",
        floor: "",
        entrance: "",
        rooms: "",
    });

    const [formData, setFormData] = useState({
        number: "",
        area: "",
        floor: "",
        entrance: "",
        rooms: "",
    });

    useEffect(() => {
        if (apartment) {
            setFormData({
                number: apartment.number || "",
                area: apartment.area?.toString() || "",
                floor: apartment.floor?.toString() || "",
                entrance: apartment.entrance?.toString() || "",
                rooms: apartment.rooms?.toString() || "",
            });
        } else {
            setFormData({
                number: "",
                area: "",
                floor: "",
                entrance: "",
                rooms: "",
            });
        }
    }, [apartment, open]);

    // Валидация полей
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "number":
                if (!value) error = "Номер обязателен";
                else if (!/^\d+$/.test(value)) error = "Только цифры";
                break;
            case "area":
                if (!value) error = "Площадь обязательна";
                else if (isNaN(parseFloat(value))) error = "Должно быть числом";
                else if (parseFloat(value) <= 0) error = "Должно быть больше 0";
                break;
            case "floor":
            case "entrance":
            case "rooms":
                if (!value) error = "Обязательное поле";
                else if (!/^\d+$/.test(value)) error = "Только целые числа";
                else if (parseInt(value) <= 0) error = "Должно быть больше 0";
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        return error === "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {apartment ? "Редактирование квартиры" : "Новая квартира"}
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <form onSubmit={onSubmit} id="apartment-form">
                    <Box sx={{ mt: 0, mb: 0 }}>
                        <StyledTextArea
                            fullWidth
                            label="Номер квартиры"
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={!!apartment}
                            error={!!errors.number}
                            helperText={errors.number}
                        />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <StyledTextArea
                                fullWidth
                                label="Площадь (м²)"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                margin="normal"
                                required
                                error={!!errors.area}
                                helperText={errors.area}
                            />
                            <StyledTextArea
                                fullWidth
                                label="Этаж"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                margin="normal"
                                required
                                error={!!errors.floor}
                                helperText={errors.floor}
                            />
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <StyledTextArea
                                fullWidth
                                label="Подъезд"
                                name="entrance"
                                value={formData.entrance}
                                onChange={handleChange}
                                margin="normal"
                                required
                                error={!!errors.entrance}
                                helperText={errors.entrance}
                            />
                            <StyledTextArea
                                fullWidth
                                label="Комнат"
                                name="rooms"
                                value={formData.rooms}
                                onChange={handleChange}
                                margin="normal"
                                required
                                error={!!errors.rooms}
                                helperText={errors.rooms}
                            />
                        </Box>
                    </Box>
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Отмена
                </Button>
                <Button
                    type="submit"
                    form="apartment-form"
                    variant="contained"
                    disabled={Object.values(errors).some((error) => error)}
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApartmentDialog;
