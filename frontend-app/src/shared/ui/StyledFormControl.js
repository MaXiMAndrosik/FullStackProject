import { FormControl } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        height: "auto !important",
        minHeight: "64px",
        padding: "8px 14px !important",
        alignItems: "flex-start",

        "& .MuiSelect-select": {
            padding: "0 !important",
            lineHeight: "1.5",
            minHeight: "calc(64px - 32px) !important",
            overflowY: "auto !important",
            resize: "vertical",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
        },
    },

    "& .MuiInputLabel-outlined": {
        backgroundColor: theme.palette.background.paper,
        padding: "0 4px",
        transform: "translate(14px, 18px) scale(1)",

        "&.Mui-focused, &.MuiInputLabel-shrink": {
            transform: "translate(14px, -6px) scale(0.75)",
            backgroundColor: theme.palette.background.paper,
        },
    },

    // Стили для многострочного Select (multiple)
    "& .MuiSelect-select[multiple]": {
        padding: "8px 0 !important",
        minHeight: "48px",

        "& .MuiChip-root": {
            margin: "2px 4px 2px 0",
            height: "24px",

            "& .MuiChip-label": {
                padding: "0 8px",
                fontSize: "0.8rem",
            },
        },
    },
}));

export default StyledFormControl;
