import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTextArea = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        height: "auto !important",
        minHeight: "64px",
        padding: "8px 14px !important",
        alignItems: "flex-start",

        "& textarea": {
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
}));

export default StyledTextArea;
