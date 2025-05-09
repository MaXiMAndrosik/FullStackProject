import * as React from "react";
// import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
// import MuiChip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
// import { styled } from "@mui/material/styles";

import { Apartment, Groups, Payments } from "@mui/icons-material";
// import { Description } from "@mui/icons-material";

const items = [
    {
        icon: <Apartment fontSize="large" />,
        title: "Эксплуатация жилого фонда",
        description: `Полный комплекс жилищно-коммунальных услуг для 80 квартир.
      Наша система включает:
        - Контроль состояния общедомового имущества
        - Организацию текущего и капитального ремонта
        - Взаимодействие с ресурсоснабжающими организациями
        - Регулярные проверки технического состояния здания
    `,
        details: `Ежегодно мы проводим более 120 профилактических мероприятий,
      обслуживаем 5 инженерных систем и контролируем 25 видов
      общедомового оборудования. Наш дом оснащен современными
      системами учета ресурсов.
    `,
        imageLight: "url(/images/FeatureWorks.png)",
        imageDark: "url(/images/FeatureWorks.png)",
    },
    {
        icon: <Groups fontSize="large" />,
        title: "Членский учет и взаимодействие",
        description: `Комплексная система управления членством в кооперативе:
      - Ведение реестра 80 членов кооператива
      - Учет прав собственности на жилые помещения
      - Организация общих собраний и голосований
      - Электронная документация и архивирование
      - Канал оперативной связи с правлением
    `,
        details: `Система автоматизирует 95% рутинных процессов:
      от учета взносов до организации собраний.
      Члены кооператива получают персональный кабинет
      с доступом ко всей необходимой информации.
    `,
        imageLight: "url(/images/FeatureMembership.png)",
        imageDark: "url(/images/FeatureMembership.png)",
    },
    {
        icon: <Payments fontSize="large" />,
        title: "Финансовый учет и отчетность",
        description: `Прозрачная система финансового управления:
      - Начисление и учет членских взносов
      - Контроль платежей за ЖКУ
      - Формирование годового бюджета
      - Автоматическая генерация отчетов
    `,
        details: `
      Ежемесячно система обрабатывает более 200 финансовых операций.
      Каждый член кооператива имеет доступ к персональной
      финансовой истории и общим отчетам о расходах.
    `,
        imageLight: "url(/images/FeatureFinance.png)",
        imageDark: "url(/images/FeatureFinance.png)",
    },
    // {
    //     icon: <Description fontSize="large" />,
    //     title: "Документооборот",
    //     description: `Электронная система управления документами:
    //   - Хранение уставных документов
    //   - Протоколы общих собраний
    //   - Договоры с подрядчиками
    //   - Техническая документация
    //   - Архив решений правления
    // `,
    //     details: `
    //   Более 500 документов в систематизированном электронном архиве с возможностью быстрого поиска. Полное соответствие требованиям законодательства РБ.
    // `,
    //     imageLight: "url(/images/FeatureDocs.png)",
    //     imageDark: "url(/images/FeatureDocs.png)",
    // },
];

// const Chip = styled(MuiChip)(({ theme }) => ({
//     variants: [
//         {
//             props: ({ selected }) => selected,
//             style: {
//                 background:
//                     "linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))",
//                 color: "hsl(0, 0%, 100%)",
//                 borderColor: (theme.vars || theme).palette.primary.light,
//                 "& .MuiChip-label": {
//                     color: "hsl(0, 0%, 100%)",
//                 },
//                 ...theme.applyStyles("dark", {
//                     borderColor: (theme.vars || theme).palette.primary.dark,
//                 }),
//             },
//         },
//     ],
// }));

// function MobileLayout({ selectedItemIndex, handleItemClick, selectedFeature }) {
//     if (!items[selectedItemIndex]) {
//         return null;
//     }

//     return (
//         <Box
//             sx={{
//                 display: { xs: "flex", sm: "none" },
//                 flexDirection: "column",
//                 gap: 2,
//             }}
//         >
//             <Box sx={{ display: "flex", gap: 2, overflow: "auto" }}>
//                 {items.map(({ title }, index) => (
//                     <Chip
//                         size="medium"
//                         key={index}
//                         label={title}
//                         onClick={() => handleItemClick(index)}
//                         selected={selectedItemIndex === index}
//                     />
//                 ))}
//             </Box>
//             <Card variant="outlined">
//                 <Box
//                     sx={(theme) => ({
//                         mb: 2,
//                         backgroundSize: "cover",
//                         backgroundPosition: "center",
//                         minHeight: 280,
//                         backgroundImage: "var(--items-imageLight)",
//                         ...theme.applyStyles("dark", {
//                             backgroundImage: "var(--items-imageDark)",
//                         }),
//                     })}
//                     style={
//                         items[selectedItemIndex]
//                             ? {
//                                   "--items-imageLight":
//                                       items[selectedItemIndex].imageLight,
//                                   "--items-imageDark":
//                                       items[selectedItemIndex].imageDark,
//                               }
//                             : {}
//                     }
//                 />
//                 <Box sx={{ px: 2, pb: 2 }}>
//                     <Typography
//                         gutterBottom
//                         sx={{ color: "text.primary", fontWeight: "medium" }}
//                     >
//                         {selectedFeature.title}
//                     </Typography>
//                     <Typography
//                         variant="body2"
//                         sx={{ color: "text.secondary", mb: 1.5 }}
//                     >
//                         {selectedFeature.description}
//                     </Typography>
//                 </Box>
//             </Card>
//         </Box>
//     );
// }

// MobileLayout.propTypes = {
//     handleItemClick: PropTypes.func.isRequired,
//     selectedFeature: PropTypes.shape({
//         description: PropTypes.string.isRequired,
//         icon: PropTypes.element,
//         imageDark: PropTypes.string.isRequired,
//         imageLight: PropTypes.string.isRequired,
//         title: PropTypes.string.isRequired,
//     }).isRequired,
//     selectedItemIndex: PropTypes.number.isRequired,
// };

// export { MobileLayout };

export default function Features() {
    const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

    const handleItemClick = (index) => {
        setSelectedItemIndex(index);
    };

    // const selectedFeature = items[selectedItemIndex];

    return (
        <Container id="features" sx={{ py: { xs: 4, sm: 8 } }}>
            <Box sx={{ width: { sm: "100%", md: "60%" } }}>
                <Typography
                    component="h2"
                    variant="h4"
                    gutterBottom
                    sx={{ color: "text.primary" }}
                >
                    Наша система управления
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ color: "text.secondary", mb: { xs: 2, sm: 4 } }}
                >
                    Комплексная автоматизированная система управления жилым
                    комплексом, разработанная специально для нужд ЖСПК
                    «Зенитчик-4». Платформа объединяет все аспекты управления
                    многоквартирным домом в единое цифровое пространство.
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row-reverse" },
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        flex: 1, // Занимает 50% ширины
                        minWidth: 0, // Для корректного переноса текста
                        // display: { xs: "none", sm: "flex" },
                        flexDirection: "column",
                        gap: 2,
                        height: "100%",
                    }}
                >
                    {items.map(({ icon, title, description }, index) => (
                        <Box
                            key={index}
                            component={Button}
                            onClick={() => handleItemClick(index)}
                            sx={[
                                (theme) => ({
                                    paddingLeft: 2,
                                    height: "100%",
                                    width: "100%",
                                    "&:hover": {
                                        backgroundColor: (theme.vars || theme)
                                            .palette.action.hover,
                                    },
                                }),
                                selectedItemIndex === index && {
                                    backgroundColor: "action.selected",
                                },
                            ]}
                        >
                            <Box
                                sx={[
                                    {
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "left",
                                        gap: 0,
                                        textAlign: "left",
                                        textTransform: "none",
                                        color: "text.secondary",
                                    },
                                    selectedItemIndex === index && {
                                        color: "text.primary",
                                    },
                                ]}
                            >
                                {icon}

                                <Typography variant="h6">{title}</Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        whiteSpace: "pre-line",
                                        fontSize: "0.7rem",
                                    }}
                                >
                                    {description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
                {/* <MobileLayout
                    selectedItemIndex={selectedItemIndex}
                    handleItemClick={handleItemClick}
                    selectedFeature={selectedFeature}
                /> */}
                <Box
                    sx={{
                        flex: 1, // Занимает 50% ширины
                        minWidth: 0, // Для корректного переноса текста
                        display: { xs: "none", sm: "flex" },
                        width: { xs: "100%", md: "70%" },
                        height: "var(--items-image-height)",
                    }}
                >
                    <Card
                        variant="outlined"
                        sx={{
                            height: "100%",
                            width: "100%",
                            display: { xs: "none", sm: "flex" },
                            pointerEvents: "none",
                            padding: 0,
                        }}
                    >
                        <Box
                            sx={(theme) => ({
                                m: "auto",
                                width: 420,
                                height: 500,
                                backgroundSize: "contain",
                                backgroundRepeat: "no-repeat", // Предотвращает повторение изображения
                                backgroundPosition: "center",
                                backgroundImage: "var(--items-imageLight)",
                                ...theme.applyStyles("dark", {
                                    backgroundImage: "var(--items-imageDark)",
                                }),
                            })}
                            style={
                                items[selectedItemIndex]
                                    ? {
                                          "--items-imageLight":
                                              items[selectedItemIndex]
                                                  .imageLight,
                                          "--items-imageDark":
                                              items[selectedItemIndex]
                                                  .imageDark,
                                      }
                                    : {}
                            }
                        />
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}
