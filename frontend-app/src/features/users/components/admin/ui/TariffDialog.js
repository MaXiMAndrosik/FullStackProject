import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import StyledTextArea from "../../../../../shared/ui/StyledTextArea";
import { format } from "date-fns";

const TariffDialog = ({ open, onClose, currentTariff, onSubmit, services }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Редактирование тарифа</DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit} id="tariff-form">
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="service-label">Услуга</InputLabel>
                        <Select
                            labelId="service-label"
                            name="service_id"
                            defaultValue={currentTariff?.service_id || ""}
                            label="Услуга"
                            required
                        >
                            {services.map((service) => (
                                <MenuItem key={service.id} value={service.id}>
                                    {service.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <StyledTextArea
                        name="rate"
                        label="Тариф"
                        type="number"
                        defaultValue={currentTariff?.rate || ""}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ step: "0.0001", min: "0" }}
                    />

                    <StyledTextArea
                        name="start_date"
                        label="Дата начала"
                        type="date"
                        defaultValue={
                            currentTariff?.start_date
                                ? format(
                                      new Date(currentTariff.start_date),
                                      "yyyy-MM-dd"
                                  )
                                : format(new Date(), "yyyy-MM-dd")
                        }
                        fullWidth
                        margin="normal"
                        required
                        InputLabelProps={{ shrink: true }}
                    />

                    <StyledTextArea
                        name="end_date"
                        label="Дата окончания (необязательно)"
                        type="date"
                        defaultValue={
                            currentTariff?.end_date
                                ? format(
                                      new Date(currentTariff.end_date),
                                      "yyyy-MM-dd"
                                  )
                                : ""
                        }
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button type="submit" form="tariff-form" variant="contained">
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TariffDialog;
