import { createContext, useContext, useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertOptions {
  title?: string;
  message: string;
  type?: 'info' | 'error' | 'warning' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const [isConfirm, setIsConfirm] = useState(false);

  const showAlert = (options: AlertOptions) => {
    setAlertOptions(options);
    setIsConfirm(false);
    setIsOpen(true);
  };

  const showConfirm = (options: AlertOptions) => {
    setAlertOptions(options);
    setIsConfirm(true);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setAlertOptions(null);
  };

  const handleConfirm = () => {
    alertOptions?.onConfirm?.();
    handleClose();
  };

  const handleCancel = () => {
    alertOptions?.onCancel?.();
    handleClose();
  };

  const getTitle = () => {
    if (alertOptions?.title) {
      return alertOptions.title;
    }
    
    switch (alertOptions?.type) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'success':
        return 'Success';
      default:
        return 'Information';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertOptions?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {isConfirm && (
              <AlertDialogCancel onClick={handleCancel}>
                {alertOptions?.cancelText || 'Cancel'}
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={handleConfirm}>
              {alertOptions?.confirmText || 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}