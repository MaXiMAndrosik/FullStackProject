import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import { Close as CloseIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";

const OwnerDialog = ({ open, onClose, owner, onSubmit }) => {
    const parseCustomDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split(".").map(Number);
        return new Date(year, month - 1, day);
    };

    const [errors, setErrors] = useState({
        apartment_number: "",
        last_name: "",
        first_name: "",
        patronymic: "",
        ownership_start_date: "",
        birth_date: "",
        phone: "",
    });

    // Функция валидации обязательных полей
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "apartment_number":
                if (!/^\d+$/.test(value)) {
                    error = "Только цифровое значение";
                } else if (parseInt(value) < 1 || parseInt(value) > 80) {
                    error = "Номер должен быть от 1 до 80";
                }
                break;

            case "last_name":
            case "first_name":
            case "patronymic":
                if (value && !/^[А-ЯЁ][а-яё-]*$/.test(value)) {
                    error =
                        "Только русские буквы и дефис, первая буква заглавная";
                }
                break;
            case "ownership_start_date":
                if (!value) {
                    error = "Дата начала владения обязательна";
                } else if (new Date(value) > new Date()) {
                    error = "Дата не может быть в будущем";
                }
                break;
            case "birth_date":
                if (new Date(value) > new Date()) {
                    error = "Дата рожденияне может быть в будущем";
                }
                break;
            case "phone":
                if (value && !/^\+375\d{9}$/.test(value)) {
                    error = "Формат: +375XXXXXXXXX (9 цифр после кода)";
                }
                break;

            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        return error === "";
    };

    const [formData, setFormData] = useState({
        last_name: "",
        first_name: "",
        patronymic: "",
        birth_date: null,
        phone: "",
        telegram: "",
        apartment_number: "",
        ownership_start_date: null,
        ownership_end_date: null,
        is_verified: false,
    });

    useEffect(() => {
        if (owner) {
            setFormData({
                last_name: owner.last_name || "",
                first_name: owner.first_name || "",
                patronymic: owner.patronymic || "",
                birth_date: parseCustomDate(owner.birth_date) || null,
                phone: owner.phone || "",
                telegram: owner.telegram || "",
                apartment_number: owner.apartment_number || "",
                ownership_start_date:
                    parseCustomDate(owner.ownership_start_date) || null,
                ownership_end_date:
                    parseCustomDate(owner.ownership_end_date) || null,
                is_verified: owner.is_verified || false,
            });
        } else {
            setFormData({
                last_name: "",
                first_name: "",
                patronymic: "",
                birth_date: null,
                phone: "",
                telegram: "",
                apartment_number: "",
                ownership_start_date: null,
                ownership_end_date: null,
                is_verified: false,
            });
        }
    }, [owner, open]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        validateField(name, value);

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleDateChange = (name, date) => {
        validateField(name, date);
        setFormData((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;

        // Удаляем все нецифровые символы, кроме плюса
        let cleanedValue = value.replace(/[^\d+]/g, "");

        // Если начинается не с +375, добавляем префикс
        if (!cleanedValue.startsWith("+375") && cleanedValue.length > 0) {
            // Если пользователь начинает ввод с цифр
            if (/^[0-9]/.test(cleanedValue)) {
                cleanedValue = "+375" + cleanedValue;
            }
            // Если пользователь ввел + и затем цифры
            else if (
                cleanedValue.startsWith("+") &&
                cleanedValue.length > 1 &&
                /^[0-9]/.test(cleanedValue.substring(1))
            ) {
                cleanedValue = "+375" + cleanedValue.substring(1);
            }
        }

        // Ограничиваем длину (3 + 9 = 12 символов)
        if (cleanedValue.length > 13) {
            cleanedValue = cleanedValue.substring(0, 13);
        }

        // Валидируем поле
        validateField(name, cleanedValue);

        // Обновляем состояние
        setFormData((prev) => ({
            ...prev,
            [name]: cleanedValue,
        }));
    };

    const handleClose = () => {
        setFormData({
            last_name: "",
            first_name: "",
            patronymic: "",
            birth_date: null,
            phone: "",
            telegram: "",
            apartment_number: "",
            ownership_start_date: null,
            ownership_end_date: null,
            is_verified: false,
        });
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
                    {owner
                        ? "Редактирование собственника"
                        : "Новый собственник"}
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <form onSubmit={onSubmit} id="owner-form">
                    <Box sx={{ mt: 0, mb: 0 }}>
                        <StyledTextArea
                            fullWidth
                            label="Номер квартиры"
                            name="apartment_number"
                            value={formData.apartment_number}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={owner ? true : false}
                            error={!!errors.apartment_number}
                            helperText={errors.apartment_number}
                        />
                        <StyledTextArea
                            fullWidth
                            label="Фамилия"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            error={!!errors.last_name}
                            helperText={errors.last_name}
                        />
                        <StyledTextArea
                            fullWidth
                            label="Имя"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            error={!!errors.first_name}
                            helperText={errors.first_name}
                        />
                        <StyledTextArea
                            fullWidth
                            label="Отчество"
                            name="patronymic"
                            value={formData.patronymic}
                            onChange={handleChange}
                            margin="normal"
                            required
                            error={!!errors.patronymic}
                            helperText={errors.patronymic}
                        />
                        <input
                            type="hidden"
                            name="birth_date"
                            value={
                                formData.birth_date
                                    ? format(formData.birth_date, "yyyy-MM-dd")
                                    : ""
                            }
                        />
                        <DatePicker
                            label="Дата рождения"
                            value={formData.birth_date}
                            onChange={(date) =>
                                handleDateChange("birth_date", date)
                            }
                            enableAccessibleFieldDOMStructure={false}
                            slots={{
                                textField: StyledTextArea,
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "normal",
                                    error: !!errors.birth_date,
                                    helperText: errors.birth_date,
                                },
                            }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <StyledTextArea
                                fullWidth
                                label="Телефон"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                onBlur={(e) =>
                                    validateField(e.target.name, e.target.value)
                                }
                                margin="normal"
                                error={!!errors.phone}
                                helperText={errors.phone}
                                placeholder="+375XXXXXXXXX"
                            />
                            <StyledTextArea
                                fullWidth
                                label="Telegram"
                                name="telegram"
                                value={formData.telegram}
                                onChange={handleChange}
                                margin="normal"
                            />
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <input
                                type="hidden"
                                name="ownership_start_date"
                                value={
                                    formData.ownership_start_date
                                        ? format(
                                              formData.ownership_start_date,
                                              "yyyy-MM-dd"
                                          )
                                        : ""
                                }
                            />
                            <DatePicker
                                label="Начало владения"
                                value={formData.ownership_start_date}
                                onChange={(date) => {
                                    handleDateChange(
                                        "ownership_start_date",
                                        date
                                    );
                                    validateField("ownership_start_date", date);
                                }}
                                enableAccessibleFieldDOMStructure={false}
                                slots={{
                                    textField: StyledTextArea,
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: "normal",
                                        required: true,
                                        error: !!errors.ownership_start_date,
                                        helperText: errors.ownership_start_date,
                                    },
                                }}
                            />
                            <input
                                type="hidden"
                                name="ownership_end_date"
                                value={
                                    formData.ownership_end_date
                                        ? format(
                                              formData.ownership_end_date,
                                              "yyyy-MM-dd"
                                          )
                                        : ""
                                }
                            />
                            <DatePicker
                                label="Конец владения (если есть)"
                                value={formData.ownership_end_date}
                                onChange={(date) =>
                                    handleDateChange("ownership_end_date", date)
                                }
                                enableAccessibleFieldDOMStructure={false}
                                slots={{
                                    textField: StyledTextArea,
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: "normal",
                                    },
                                }}
                            />
                        </Box>

                        <input
                            type="hidden"
                            name="is_verified"
                            value={formData.is_verified ? 1 : 0}
                        />

                        {owner ? (
                            <>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.is_verified}
                                            name="is_verified"
                                        />
                                    }
                                    label="Верифицирован"
                                    disabled={true}
                                    sx={{ mt: 2 }}
                                />
                            </>
                        ) : null}
                    </Box>
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Отмена
                </Button>
                <Button
                    type="submit"
                    form="owner-form"
                    variant="contained"
                    disabled={Object.values(errors).some((error) => error)}
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OwnerDialog;
