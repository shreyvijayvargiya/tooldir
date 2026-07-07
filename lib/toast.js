import { toast as sonnerToast } from "sonner";

export const toast = {
	success: (message, options) => sonnerToast.success(message, options),
	error: (message, options) => sonnerToast.error(message, options),
	warning: (message, options) => sonnerToast.warning(message, options),
	info: (message, options) => sonnerToast.info(message, options),
	message: (message, options) => sonnerToast(message, options),
	promise: sonnerToast.promise,
	dismiss: sonnerToast.dismiss,
	loading: (message, options) => sonnerToast.loading(message, options),
};

export default toast;
