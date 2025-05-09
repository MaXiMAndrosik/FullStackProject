import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Schedule } from "@mui/icons-material";
import StyledTextArea from "../../../shared/ui/StyledTextArea";
import { ArrayTextField } from "../ui/ArrayTextField";
import { AnnouncementMetaFields } from "../ui/AnnouncementMetaFields";

export default function SimpleAnnouncement({
    form,
    onChange,
    onArrayChange,
    onAddToArray,
    onRemoveFromArray,
    onSubmit,
}) {
    const [isSubmitting] = useState(false);
    const [currentDate] = useState(new Date());

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
                {/* Заголовок */}
                <Box>
                    <Typography
                        variant="body2"
                        sx={{ color: "primary.main", mb: 0.5 }}
                    >
                        Заголовок
                    </Typography>
                    <StyledTextArea
                        fullWidth
                        name="title"
                        label="Заголовок"
                        value={form.title || ""}
                        onChange={(e) => onChange("title", e.target.value)}
                        required
                    />
                </Box>

                {/* Текст объявления (как массив абзацев) */}
                <ArrayTextField
                    fieldName="message"
                    form={form}
                    onArrayChange={onArrayChange}
                    onAddToArray={onAddToArray}
                    onRemoveFromArray={onRemoveFromArray}
                    label="Текст объявления"
                    addButtonText="Добавить абзац"
                    rows={4}
                />

                {/* Общие компоненты: Подпись, Контакты, Дата Публикации, Дата удаления объявления */}
                <AnnouncementMetaFields
                    form={form}
                    onChange={onChange}
                    currentDate={currentDate}
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={<Schedule />}
                    sx={{ alignSelf: "flex-start" }}
                >
                    {isSubmitting ? "Создание..." : "Создать объявление"}
                </Button>
            </Stack>
        </Box>
    );
}
