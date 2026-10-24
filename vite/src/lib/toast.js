import { createContext, useContext } from "react";

export const ToastContext = createContext(() => {});

/** Returns `toast(message, severity = "success")`. */
export function useToast() {
    return useContext(ToastContext);
}
