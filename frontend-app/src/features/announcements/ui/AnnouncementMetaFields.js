import { Box, Typography } from "@mui/material";
import StyledTextArea from "../../../shared/ui/StyledTextArea";
import { ContactsField } from "./ContactsField";
import { ExpirationDatePicker } from "./ExpirationDatePicker";

export const AnnouncementMetaFields = ({
    form,
    onChange,
    currentDate = new Date(),
}) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Подпись */}
            <Box>
                <Typography
                    variant="body2"
                    sx={{ color: "primary.main", mb: 0.5 }}
                >
                    Подпись
                </Typography>
                <StyledTextArea
                    fullWidth
                    label="Подпись"
                    value={form.signature || ""}
                    onChange={(e) => onChange("signature", e.target.value)}
                    required
                />
            </Box>

            {/* Контакты */}
            <ContactsField form={form} onChange={onChange} />

            {/* Действует до */}
            <Box>
                <Typography
                    variant="body2"
                    sx={{ color: "primary.main", mb: 0.5 }}
                >
                    Дата удаления объявления
                </Typography>
                <ExpirationDatePicker
                    value={form.expiresAt ? new Date(form.expiresAt) : null}
                    onChange={(dateString) => onChange("expiresAt", dateString)}
                    defaultMonthsOffset={1}
                />
            </Box>

            {/* Дата публикации */}
            <Typography sx={{ mb: 1 }}>
                Дата публикации объявления:{" "}
                {currentDate.toLocaleDateString("ru-RU")}
            </Typography>
        </Box>
    );
};
