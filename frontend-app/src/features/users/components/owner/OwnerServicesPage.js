import React, { useState, useEffect } from "react";
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from "@mui/material";
import axios from "axios";

const OwnerServicesPage = () => {
    const [services, setServices] = useState([]);

    useEffect(() => {
        axios.get("/api/owner/services").then((res) => setServices(res.data));
    }, []);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Мои услуги
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Услуга</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Тариф</TableCell>
                            <TableCell>Дата подключения</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell>{service.service}</TableCell>
                                <TableCell>{service.description}</TableCell>
                                <TableCell>{service.tariff} ₽</TableCell>
                                <TableCell>
                                    {new Date(
                                        service.start_date
                                    ).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default OwnerServicesPage;
