import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';

function ForgotPassword({ open, handleClose }) {
  return (
      <Dialog
          open={open}
          onClose={handleClose}
          slotProps={{
              paper: {
                  component: "form",
                  onSubmit: (event) => {
                      event.preventDefault();
                      handleClose();
                  },
                  sx: { backgroundImage: "none" },
              },
          }}
      >
          <DialogTitle>Сбросить пароль</DialogTitle>
          <DialogContent
              sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "100%",
              }}
          >
              <DialogContentText>
                  Введите адрес электронной почты вашей учетной записи, и мы
                  вышлем вам ссылку для сброса пароля.
              </DialogContentText>
              <OutlinedInput
                  autoFocus
                  required
                  margin="dense"
                  id="email"
                  name="email"
                  label="Email address"
                  placeholder="Адрес электронной почты"
                  type="email"
                  fullWidth
              />
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3 }}>
              <Button onClick={handleClose}>Отменить</Button>
              <Button variant="contained" type="submit">
                  Продолжить
              </Button>
          </DialogActions>
      </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
