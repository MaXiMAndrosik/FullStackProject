import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";

const ServiceDialog = ({
    open,
    onClose,
    currentService,
    onSubmit,
    calculationType,
    setCalculationType,
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {currentService ? "Редактирование услуги" : "Новая услуга"}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit} id="service-form">
                    <StyledTextArea
                        name="name"
                        label="Название"
                        defaultValue={currentService?.name || ""}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <StyledTextArea
                        name="type"
                        label="Тип услуги"
                        select
                        defaultValue={currentService?.type || "main"}
                        fullWidth
                        margin="normal"
                        required
                    >
                        <MenuItem value="main">Основная</MenuItem>
                        <MenuItem value="utility">Коммунальная</MenuItem>
                        <MenuItem value="additional">Дополнительная</MenuItem>
                        <MenuItem value="other">Прочее</MenuItem>
                    </StyledTextArea>
                    <StyledTextArea
                        name="code"
                        label="Код"
                        defaultValue={currentService?.code || ""}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ maxLength: 20 }}
                        helperText="Максимум 20 символов"
                    />
                    <StyledTextArea
                        name="description"
                        label="Описание"
                        defaultValue={currentService?.description || ""}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <StyledTextArea
                        name="calculation_type"
                        label="Тип расчёта"
                        select
                        SelectProps={{ native: true }}
                        defaultValue={
                            currentService?.calculation_type || "fixed"
                        }
                        fullWidth
                        margin="normal"
                        onChange={(e) => setCalculationType(e.target.value)}
                        required
                    >
                        <option value="fixed">Фиксированный</option>
                        <option value="meter">По счётчику</option>
                        <option value="area">По площади</option>
                    </StyledTextArea>

                    {calculationType === "meter" && (
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Единица измерения</InputLabel>
                            <Select
                                name="unit"
                                defaultValue={
                                    currentService?.tariffs?.[0]?.unit || "m3"
                                }
                                label="Единица измерения"
                                required
                            >
                                <MenuItem value="m3">
                                    м³ (кубический метр)
                                </MenuItem>
                                <MenuItem value="gcal">
                                    Гкал (гигакалория)
                                </MenuItem>
                                <MenuItem value="kwh">
                                    кВт·ч (киловатт-час)
                                </MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            defaultChecked={currentService?.is_active ?? true}
                        />
                        <label htmlFor="is_active" style={{ marginLeft: 8 }}>
                            Активна
                        </label>
                    </Box>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button type="submit" form="service-form" variant="contained">
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServiceDialog;
