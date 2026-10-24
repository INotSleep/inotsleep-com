import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

/** Dialog whose body is a form: Enter submits, Esc and Cancel close unless saving. */
export function FormDialog({
    open,
    title,
    onClose,
    onSubmit,
    submitLabel,
    pending = false,
    maxWidth = "sm",
    children
}) {
    const { t } = useTranslation("common");

    const handleClose = () => {
        if (!pending) onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={maxWidth}
            PaperProps={{
                component: "form",
                noValidate: true,
                onSubmit: (e) => {
                    e.preventDefault();
                    if (!pending) onSubmit();
                },
                // Ctrl+Enter submits from multiline fields too.
                onKeyDown: (e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        if (!pending) onSubmit();
                    }
                }
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Stack gap={2} sx={{ pt: 1 }}>
                    {children}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={pending} color="inherit">
                    {t("cancel")}
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={pending}
                    startIcon={pending ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {submitLabel || t("save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/** Only for actions that cannot be undone. */
export function ConfirmDialog({ open, title, confirmLabel, onConfirm, onClose, pending = false }) {
    const { t } = useTranslation("common");

    return (
        <Dialog open={open} onClose={pending ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogActions>
                <Button onClick={onClose} disabled={pending} color="inherit" autoFocus>
                    {t("cancel")}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={pending}
                    startIcon={pending ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
