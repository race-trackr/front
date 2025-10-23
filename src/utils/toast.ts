import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message, {
    className: 'toast-success',
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    className: 'toast-error',
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    className: 'toast-loading',
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};