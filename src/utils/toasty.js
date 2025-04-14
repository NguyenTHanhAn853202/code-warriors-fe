import { toast } from 'react-toastify';

export const toastSuccess = (message) => {
    toast.success(message);
};
export const toastInfo = (message) => {
    toast.info(message);
};
export const toastError = (message) => {
    toast.error(message);
};
