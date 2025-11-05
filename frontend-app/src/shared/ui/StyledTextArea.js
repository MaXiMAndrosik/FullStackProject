import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTextArea = styled(TextField)(({ theme, multiline }) => ({
    "& .MuiOutlinedInput-root": {
        height: !multiline ? "40px !important" : "auto !important",
        minHeight: !multiline ? "40px !important" : "64px",
        padding: !multiline ? "8px 12px !important" : "8px 14px !important",
        alignItems: !multiline ? "center" : "flex-start",

        "& input": {
            padding: "0 !important",
            ...(!multiline && {
                height: "100%",
            }),
        },

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
        transform: !multiline
            ? "translate(14px, 12px) scale(1)"
            : "translate(14px, 18px) scale(1)",

        "&.Mui-focused, &.MuiInputLabel-shrink": {
            transform: "translate(14px, -6px) scale(0.75)",
            backgroundColor: theme.palette.background.paper,
        },
    },
}));

export default StyledTextArea;
