import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DeleteModalProps {
    id: string;
    title: string;
    url: string;
    onClose: () => void;
    onDeleteSuccess: () => void; // Callback to update the UI on success
    setToast: (toast: { open: boolean; message: string; severity: 'success' | 'error' }) => void; // Toast handler
}

export default function DeletModal({ id, title, url, onClose, onDeleteSuccess, setToast }: DeleteModalProps) {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const deleteHandler = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/${url}`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setToast({
          open: true,
          message: `${title.charAt(0).toUpperCase() + title.slice(1)} deleted successfully!`,
          severity: 'success',
        });
        onDeleteSuccess(); // Trigger UI update
        handleClose();
      } else {
        const errorData = await response.json();
        setToast({
          open: true,
          message: errorData.message || `Failed to delete ${title}.`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setToast({
        open: true,
        message: `An error occurred while deleting ${title}.`,
        severity: 'error',
      });
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete this {title.charAt(0).toUpperCase() + title.slice(1)}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. Deleting this {title} will permanently remove it from the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={deleteHandler} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}