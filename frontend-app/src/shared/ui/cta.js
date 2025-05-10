import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TelegramIcon from "@mui/icons-material/Telegram";

export const CTA = () => {
    return (
        <Box
            sx={{
                textAlign: "center",
                // mt: 4,
                p: 4,
                borderRadius: 2,
                backgroundColor: "primary.main",
                color: "primary.contrastText",
            }}
        >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Остались вопросы?
            </Typography>
            <Typography sx={{ mb: 3 }}>
                Свяжитесь с нами через Telegram или по телефону +375 (29)
                696-43-11
            </Typography>
            <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<TelegramIcon />}
                href="//t.me/zenitchik4"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    fontWeight: "bold",
                    px: 4,
                }}
            >
                Написать в Telegram
            </Button>
        </Box>
    );
};
