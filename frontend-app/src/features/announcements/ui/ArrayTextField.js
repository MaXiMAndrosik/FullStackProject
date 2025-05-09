import { Box, Button, Typography, IconButton } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import StyledTextArea from "../../../shared/ui/StyledTextArea";

export const ArrayTextField = ({
    fieldName,
    form,
    onArrayChange,
    onAddToArray,
    onRemoveFromArray,
    label = "Текст",
    addButtonText = "Добавить элемент",
    rows = 3,
    necessarily = true,
}) => {
    const items = form[fieldName] || [];

    return (
        <Box sx={{ width: "100%", mt: 3 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="body2" sx={{ color: "primary.main" }}>
                    {label}
                </Typography>

                <Button
                    startIcon={<Add />}
                    onClick={() => onAddToArray(fieldName, "")}
                    variant="outlined"
                    size="small"
                    sx={{ ml: 2, whiteSpace: "nowrap" }}
                >
                    {addButtonText}
                </Button>
            </Box>

            {items.map((item, index) => (
                <Box
                    key={index}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        borderRadius: 1,
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0, pr: 6 }}>
                        <StyledTextArea
                            fullWidth
                            label={`${label} ${index + 1}`}
                            value={item || ""}
                            onChange={(e) =>
                                onArrayChange(fieldName, index, e.target.value)
                            }
                            multiline
                            rows={rows}
                            required={necessarily}
                        />
                    </Box>

                    <IconButton
                        onClick={() => onRemoveFromArray(fieldName, index)}
                        disabled={items.length <= 1}
                        color="error"
                        sx={{ flexShrink: 0, ml: "auto", mr: 2 }}
                    >
                        <Delete />
                    </IconButton>
                </Box>
            ))}
        </Box>
    );
};
