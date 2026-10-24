import { useCallback, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { ToastContext } from "../lib/toast.js";

export default function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const [open, setOpen] = useState(false);

    const show = useCallback((message, severity = "success") => {
        setToast({ message, severity, key: Date.now() });
        setOpen(true);
    }, []);

    const handleClose = (_event, reason) => {
        if (reason === "clickaway") return;
        setOpen(false);
    };

    return (
        <ToastContext.Provider value={show}>
            {children}
            <Snackbar
                key={toast?.key}
                open={open}
                onClose={handleClose}
                autoHideDuration={toast?.severity === "error" ? 6000 : 3500}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleClose}
                    severity={toast?.severity || "success"}
                    variant="filled"
                    sx={{ minWidth: 260, fontWeight: 500 }}
                >
                    {toast?.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}
