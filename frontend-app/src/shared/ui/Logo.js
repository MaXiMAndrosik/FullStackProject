import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export const Logo = () => {
    return (
        <Stack
            direction="row"
            sx={{
                p: 2,
                gap: 2,
                alignItems: "center",
                borderColor: "divider",
            }}
        >
            <Avatar
                sizes="small"
                alt="ЖСПК"
                src="/images/Logo.jpg"
                sx={{ width: 46, height: 46 }}
                variant="rounded"
            />
            <Box sx={{ mr: "auto" }}>
                <Typography sx={{ fontWeight: 600 }}>
                    ЖСПК "Зенитчик-4"
                </Typography>
                {/* Добавляем версию приложения */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontSize: "0.7rem", // Уменьшаем шрифт (~50% от body2)
                        lineHeight: 1.2,
                    }}
                >
                    v{process.env.REACT_APP_VERSION}
                </Typography>
            </Box>
        </Stack>
    );
};
