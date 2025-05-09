import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box } from '@mui/material';

export const ExpirationDatePicker = ({
    value,
    onChange,
    label = "Действует до",
    minDate = new Date(),
    defaultMonthsOffset = 1
}) => {
    const [date, setDate] = useState(
        value || new Date(new Date().setMonth(new Date().getMonth() + defaultMonthsOffset))
    );

    const handleDateChange = (newDate) => {
        setDate(newDate);
        onChange(newDate.toISOString());
    };

    return (
            <Box sx={{ width: '100%' }}>
                <DatePicker
                    value={date}
                    onChange={handleDateChange}
                    minDate={minDate}
                    format="dd.MM.yyyy"
                    sx={{ width: '100%' }}
                />
            </Box>
    );
};