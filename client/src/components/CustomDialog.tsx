import React, { ReactNode } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


// open : логическое значение, определяющее, следует ли отображать диалог или нет.
// children : реквизит для получения дочерних элементов компонента. Дочерние элементы отображаются в содержимом диалога.
// title : Название диалога.
// contentText : Сообщение, которое будет отображаться в диалоговом окне.
// handleContinue : Функция, вызываемая при нажатии кнопки «Продолжить»

// Define an interface for the props
interface CustomDialogProps {
  open: boolean;
  children?: ReactNode;
  title: string;
  contentText: string;
  handleContinue: () => void; // assuming handleContinue is a function with no return value
}

const CustomDialog: React.FC<CustomDialogProps> = ({ open, children, title, contentText, handleContinue }) => {
  return (
    <Dialog open={open}> {/*dialog container*/}
      <DialogTitle>{title}</DialogTitle>
      <DialogContent> {/* Main body of modal/dialog */}
        <DialogContentText> {/* main text */}
          {contentText}
        </DialogContentText>
        {children} {/* Other content */}
      </DialogContent>
      <DialogActions> {/* Dialog action buttons */}
        {/* Force users to make input without option to cancel */}
        {/* <Button onClick={handleClose}>Cancel</Button> */}
        <Button onClick={handleContinue}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomDialog;
