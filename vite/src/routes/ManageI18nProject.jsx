import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Stack,
    Button,
    Chip,
    Divider,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

export default function I18nProject() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { t, i18n } = useTranslation("i18n");

    // -------------------- язык в хабе --------------------
    // 1. тащим языки с бэка
    const { data: langsData } = useQuery({
        queryKey: ["i18n-languages"],
        queryFn: async () => {
            const res = await axios.get("/api/i18n/languages");
            return Array.isArray(res.data) ? res.data : [];
        }
    });

    // нормализуем список
    const supportedLangs = useMemo(() => {
        return langsData && langsData.length > 0 ? langsData : ["en"];
    }, [langsData]);

    // 2. local state: сначала просто из URL или "en"
    const [selectedLang, setSelectedLang] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get("lang") || "en";
    });

    // 3. как только есть список языков — валидируем selectedLang + синкаем URL
    useEffect(() => {
        if (!supportedLangs || supportedLangs.length === 0) return;

        const params = new URLSearchParams(location.search);
        const urlLang = params.get("lang");

        let next = selectedLang;

        // если выбранный язык не входит в список — берём первый доступный
        if (!supportedLangs.includes(next)) {
            next = supportedLangs[0];
            setSelectedLang(next);
        }

        // если в URL другой язык — обновляем query
        if (urlLang !== next) {
            params.set("lang", next);
            navigate(
                {
                    pathname: location.pathname,
                    search: params.toString()
                },
                { replace: true }
            );
        }
    }, [selectedLang, supportedLangs, location.pathname, location.search, navigate]);


    // -------------------- права пользователя --------------------
    const {
        data: permissions,
        isError: permsError
    } = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => {
            const res = await axios.get("/api/permissions");
            return res.data || [];
        }
    });

    const canManage = permissions?.includes("i18n.manage") ?? false;
    const canUpload = permissions?.includes("i18n.upload") ?? false;

    // -------------------- данные проекта + ключи + переводы --------------------
    const {
        data,
        isPending,
        isError,
        error,
        isFetching
    } = useQuery({
        queryKey: ["i18n-project", slug, selectedLang],
        enabled: Boolean(slug),
        queryFn: async () => {
            if (!slug) throw new Error("Missing slug");

            const [keysRes, trRes] = await Promise.all([
                axios.get(`/api/i18n/projects/${encodeURIComponent(slug)}/keys`),
                axios.get(
                    `/api/i18n/projects/${encodeURIComponent(
                        slug
                    )}/translations`,
                    { params: { lang: selectedLang } }
                )
            ]);

            return {
                project: keysRes.data.project,
                keys: keysRes.data.keys || [],
                translations: trRes.data.translations || {}
            };
        }
    });

    // -------------------- диалог: добавление ключей --------------------
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addRows, setAddRows] = useState([{ key: "", description: "" }]);
    const [addError, setAddError] = useState("");

    const addKeysMutation = useMutation({
        mutationFn: async (payload) => {
            return axios.post(
                `/api/i18n/projects/${encodeURIComponent(slug)}/keys`,
                payload
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["i18n-project", slug, selectedLang]
            });
            setAddDialogOpen(false);
            setAddRows([{ key: "", description: "" }]);
            setAddError("");
        },
        onError: (e) => {
            setAddError(
                e?.response?.data?.error ||
                    e?.message ||
                    "Failed to add keys"
            );
        }
    });

    const handleAddKeysClick = () => {
        setAddDialogOpen(true);
        setAddError("");
        if (!addRows || addRows.length === 0) {
            setAddRows([{ key: "", description: "" }]);
        }
    };

    const handleAddKeysClose = () => {
        if (addKeysMutation.isPending) return;
        setAddDialogOpen(false);
        setAddError("");
    };

    const handleAddRow = () => {
        setAddRows((prev) => [...prev, { key: "", description: "" }]);
    };

    const handleRemoveRow = (index) => {
        setAddRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeRow = (index, field, value) => {
        setAddRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );
    };

    const handleAddKeysSubmit = () => {
        const prepared = addRows
            .map((row) => ({
                key: (row.key || "").trim(),
                description: (row.description || "").trim() || null
            }))
            .filter((row) => row.key.length > 0);

        if (prepared.length === 0) {
            setAddError(t("add_keys_no_valid_lines"));
            return;
        }

        addKeysMutation.mutate({ keys: prepared });
    };

    // -------------------- диалог: импорт YAML --------------------
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importLang, setImportLang] = useState(selectedLang);
    const [importYaml, setImportYaml] = useState("");
       const [importError, setImportError] = useState("");

    const importYamlMutation = useMutation({
        mutationFn: async () => {
            return axios.post(
                `/api/i18n/projects/${encodeURIComponent(slug)}/import`,
                {
                    language: importLang,
                    yaml: importYaml
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["i18n-project", slug, selectedLang]
            });
            setImportDialogOpen(false);
            setImportError("");
        },
        onError: (e) => {
            setImportError(
                e?.response?.data?.error ||
                    e?.message ||
                    "Failed to import YAML"
            );
        }
    });

    const handleImportClick = () => {
        setImportLang(selectedLang);
        setImportDialogOpen(true);
        setImportError("");
    };

    const handleImportClose = () => {
        if (importYamlMutation.isPending) return;
        setImportDialogOpen(false);
        setImportError("");
    };

    const handleImportSubmit = () => {
        if (!importYaml.trim()) {
            setImportError(t("import_yaml_empty"));
            return;
        }
        importYamlMutation.mutate();
    };

    // -------------------- диалог: редактирование перевода + описания ключа --------------------
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editKeyId, setEditKeyId] = useState(null);
    const [editKeyName, setEditKeyName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const [editValueType, setEditValueType] = useState("string"); // "string" | "list"
    const [editStringValue, setEditStringValue] = useState("");
    const [editListItems, setEditListItems] = useState([""]);
    const [editError, setEditError] = useState("");

    const updateTranslationMutation = useMutation({
        mutationFn: async ({
            keyId,
            key,
            language,
            value,
            description
        }) => {
            // 1) обновляем перевод + описание
            await axios.post(
                `/api/i18n/projects/${encodeURIComponent(slug)}/translations`,
                { key, language, value, description }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["i18n-project", slug, selectedLang]
            });
            setEditDialogOpen(false);
            setEditError("");
        },
        onError: (e) => {
            setEditError(
                e?.response?.data?.error ||
                    e?.message ||
                    "Failed to update translation"
            );
        }
    });

    // ---- Мутация удаления ключа ----
    const deleteKeyMutation = useMutation({
        mutationFn: async (keyId) => {
            return axios.delete(
                `/api/i18n/projects/${encodeURIComponent(
                    slug
                )}/keys/${keyId}`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["i18n-project", slug, selectedLang]
            });
        },
        onError: (e) => {
            // можно сделать нормальный UI, но пока минимум
            alert(
                e?.response?.data?.error ||
                    e?.message ||
                    "Failed to delete key"
            );
        }
    });

    const handleDeleteClick = (keyRow) => {
        const confirmed = window.confirm(
            t("delete_key_confirm", {
                key: keyRow.key_name
            })
        );
        if (!confirmed) return;

        deleteKeyMutation.mutate(keyRow.id);
    };

    const handleEditClick = (keyRow, translations) => {
        const keyName = keyRow.key_name;
        const current = translations[keyName];

        setEditKeyId(keyRow.id);
        setEditKeyName(keyName);
        setEditDescription(keyRow.description || "");

        if (Array.isArray(current)) {
            setEditValueType("list");
            const items = current.map((v) => (v != null ? String(v) : ""));
            setEditListItems(items.length > 0 ? items : [""]);
            setEditStringValue("");
        } else {
            setEditValueType("string");
            setEditStringValue(current != null ? String(current) : "");
            setEditListItems([""]);
        }

        setEditError("");
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        if (updateTranslationMutation.isPending) return;
        setEditDialogOpen(false);
        setEditError("");
    };

    const handleEditValueTypeChange = (e) => {
        const newType = e.target.value;
        if (newType === editValueType) return;

        if (newType === "list") {
            // конвертация строки в список (только при явном выборе)
            const items = editStringValue
                ? editStringValue.split(/\r?\n/)
                : [""];
            setEditListItems(items);
        } else {
            // конвертация списка в строку (только при явном выборе)
            const combined = editListItems.join("\n");
            setEditStringValue(combined);
        }

        setEditValueType(newType);
    };

    const handleAddListItem = () => {
        setEditListItems((prev) => [...prev, ""]);
    };

    const handleChangeListItem = (index, value) => {
        setEditListItems((prev) =>
            prev.map((item, i) => (i === index ? value : item))
        );
    };

    const handleRemoveListItem = (index) => {
        setEditListItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEditSubmit = () => {
        let value;

        if (editValueType === "string") {
            // строка как есть, с любыми переносами
            value = editStringValue;
        } else {
            const items = editListItems
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            if (items.length === 0) {
                setEditError(t("edit_list_empty"));
                return;
            }
            value = items;
        }

        updateTranslationMutation.mutate({
            keyId: editKeyId,
            key: editKeyName,
            language: selectedLang,
            value,
            description: editDescription
        });
    };

    // -------------------- loading / error --------------------
    if (isPending) {
        return (
            <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography>{t("loading_project")}</Typography>
            </Box>
        );
    }

    if (isError) {
        const axiosError = error;
        const status = axiosError?.response?.status;

        if (status === 404 || axiosError?.message?.includes?.("404")) {
            navigate(`/404?path=/i18n/${slug}`);
            return null;
        }

        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    {t("loading_error")}{" "}
                    {axiosError?.message || String(axiosError)}
                </Typography>
            </Box>
        );
    }

    if (!data) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    {t("loading_error")}: empty response
                </Typography>
            </Box>
        );
    }

    const { project, keys, translations } = data;

    // -------------------- основной контент (весь в одном Paper) --------------------
    return (
        <>
            <Paper
                sx={{
                    p: 3,
                    width: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                }}
            >
                {/* Шапка хаба */}
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2
                    }}
                >
                    <Box>
                        <Typography variant="h5" sx={{ mb: 0.5 }}>
                            {project.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            {isFetching && (
                                <Typography
                                    variant="caption"
                                    sx={{ opacity: 0.7 }}
                                >
                                    {t("refreshing")}…
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* Правый блок: выбор языка + действия */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            size="small"
                            select
                            label={t("language")}
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            {supportedLangs.map((lng) => (
                                <MenuItem key={lng} value={lng}>
                                    {lng}
                                </MenuItem>
                            ))}
                        </TextField>

                        {canManage && (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={handleAddKeysClick}
                            >
                                {t("add_keys")}
                            </Button>
                        )}
                        {canUpload && (
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleImportClick}
                            >
                                {t("import_yaml")}
                            </Button>
                        )}
                    </Stack>
                </Box>

                <Divider />

                {/* Список ключей и переводов для выбранного языка */}
                <Box
                    sx={{
                        flex: 1,
                        maxHeight: "70vh",
                        overflow: "auto"
                    }}
                >
                    {keys.length === 0 ? (
                        <Typography
                            variant="body2"
                            sx={{ opacity: 0.8, mt: 1 }}
                        >
                            {t("no_keys_yet")}
                        </Typography>
                    ) : (
                        <Stack spacing={1.5}>
                            {keys.map((k) => {
                                const value = translations[k.key_name];
                                const isArray = Array.isArray(value);

                                return (
                                    <Box
                                        key={k.id}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            borderRadius: 1,
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            p: 1.5
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            justifyContent="space-between"
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontFamily:
                                                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                                }}
                                            >
                                                {k.key_name}
                                                {" "}
                                                <Chip
                                                    size="small"
                                                    label={
                                                        value === undefined
                                                            ? t(
                                                                  "status_untranslated"
                                                              )
                                                            : isArray
                                                            ? t("type_list")
                                                            : t("type_string")
                                                    }
                                                    color={
                                                        value === undefined
                                                            ? "warning"
                                                            : "default"
                                                    }
                                                    variant={
                                                        value === undefined
                                                            ? "outlined"
                                                            : "filled"
                                                    }
                                                />
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={0.75}
                                                alignItems="center"
                                            >
                                                {canManage && (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                p: 1
                                                            }}
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    k,
                                                                    translations
                                                                )
                                                            }
                                                        >
                                                            {t("edit")}
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            sx={{
                                                                p: 1
                                                            }}
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    k
                                                                )
                                                            }
                                                        >
                                                            {t("delete")}
                                                        </Button>
                                                    </>
                                                )}
                                            </Stack>
                                        </Stack>

                                        {k.description && (
                                            <Typography
                                                variant="caption"
                                                sx={{ mt: 0.5, opacity: 0.7 }}
                                            >
                                                {k.description}
                                            </Typography>
                                        )}

                                        <Box sx={{ mt: 1 }}>
                                            {value === undefined ? (
                                                <Typography
                                                    variant="body2"
                                                    sx={{ opacity: 0.5 }}
                                                >
                                                    {t(
                                                        "no_translation_for_lang"
                                                    )}
                                                </Typography>
                                            ) : Array.isArray(value) ? (
                                                <Box
                                                    component="ul"
                                                    sx={{
                                                        pl: 2,
                                                        m: 0,
                                                        "& li": {
                                                            fontSize: "0.9rem"
                                                        }
                                                    }}
                                                >
                                                    {value.map(
                                                        (line, idx) => (
                                                            <li key={idx}>
                                                                {line}
                                                            </li>
                                                        )
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        whiteSpace: "pre-wrap"
                                                    }}
                                                >
                                                    {value}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Box>

                {permsError && (
                    <Typography variant="caption" color="warning.main">
                        {t("permissions_load_failed")}
                    </Typography>
                )}
            </Paper>

            {/* Диалог добавления ключей */}
            <Dialog open={addDialogOpen} onClose={handleAddKeysClose} fullWidth>
                <DialogTitle>{t("add_keys_title")}</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {t("add_keys_description")}
                    </Typography>

                    <Stack spacing={2}>
                        {addRows.map((row, index) => (
                            <Box
                                key={index}
                                sx={{
                                    borderRadius: 1,
                                    border: "1px solid rgba(255,255,255,0.16)",
                                    p: 1.5
                                }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ mb: 1 }}
                                >
                                    <Typography variant="subtitle2">
                                        {t("key_block", {
                                            index: index + 1
                                        })}
                                    </Typography>
                                    {addRows.length > 1 && (
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                handleRemoveRow(index)
                                            }
                                        >
                                            {t("remove")}
                                        </Button>
                                    )}
                                </Stack>

                                <Stack spacing={1.5}>
                                    <TextField
                                        label={t("key_name")}
                                        fullWidth
                                        value={row.key}
                                        onChange={(e) =>
                                            handleChangeRow(
                                                index,
                                                "key",
                                                e.target.value
                                            )
                                        }
                                        placeholder="namespace.section.key"
                                    />
                                    <TextField
                                        label={t("description")}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        maxRows={2}
                                        value={row.description}
                                        onChange={(e) =>
                                            handleChangeRow(
                                                index,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "description_placeholder"
                                        )}
                                    />
                                </Stack>
                            </Box>
                        ))}

                        <Box>
                            <Button
                                size="small"
                                variant="text"
                                onClick={handleAddRow}
                            >
                                {t("add_one_more_key")}
                            </Button>
                        </Box>

                        {addError && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{ mt: 1, display: "block" }}
                            >
                                {addError}
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddKeysClose}>{t("cancel")}</Button>
                    <Button
                        onClick={handleAddKeysSubmit}
                        disabled={addKeysMutation.isPending}
                    >
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог импорта YAML */}
            <Dialog
                open={importDialogOpen}
                onClose={handleImportClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>{t("import_yaml_title")}</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 1 }}>
                        <TextField
                            size="small"
                            select
                            label={t("import_yaml_language_label")}
                            value={importLang}
                            onChange={(e) => setImportLang(e.target.value)}
                            sx={{ minWidth: 160 }}
                        >
                            {supportedLangs.map((lng) => (
                                <MenuItem key={lng} value={lng}>
                                    {lng}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <TextField
                        multiline
                        minRows={10}
                        fullWidth
                        value={importYaml}
                        onChange={(e) => setImportYaml(e.target.value)}
                        placeholder={t("import_yaml_placeholder")}
                    />

                    {importError && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                        >
                            {importError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleImportClose}>{t("cancel")}</Button>
                    <Button
                        onClick={handleImportSubmit}
                        disabled={importYamlMutation.isPending}
                    >
                        {t("import")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог редактирования перевода + описания ключа */}
            <Dialog
                open={editDialogOpen}
                onClose={handleEditClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>{t("edit_translation_title")}</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {t("edit_translation_description", {
                            key: editKeyName,
                            lang: selectedLang
                        })}
                    </Typography>

                    {/* Key path (readonly) */}
                    <TextField
                        label={t("key_name")}
                        fullWidth
                        value={editKeyName}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                    />

                    {/* Описание ключа */}
                    <TextField
                        label={t("description")}
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder={t("description_placeholder")}
                        sx={{ mb: 2 }}
                    />

                    {/* Тип значения: строка / список */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <TextField
                            select
                            size="small"
                            label={t("value_type")}
                            value={editValueType}
                            onChange={handleEditValueTypeChange}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="string">
                                {t("value_type_string")}
                            </MenuItem>
                            <MenuItem value="list">
                                {t("value_type_list")}
                            </MenuItem>
                        </TextField>
                    </Stack>

                    {/* Значение */}
                    {editValueType === "string" ? (
                        <TextField
                            label={t("translation_value")}
                            multiline
                            minRows={4}
                            fullWidth
                            value={editStringValue}
                            onChange={(e) =>
                                setEditStringValue(e.target.value)
                            }
                            placeholder={t("edit_translation_placeholder")}
                        />
                    ) : (
                        <Stack spacing={1.5}>
                            {editListItems.map((item, index) => (
                                <Stack
                                    key={index}
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <TextField
                                        label={t("list_item_label", {
                                            index: index + 1
                                        })}
                                        fullWidth
                                        value={item}
                                        onChange={(e) =>
                                            handleChangeListItem(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                    {editListItems.length > 1 && (
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                handleRemoveListItem(index)
                                            }
                                        >
                                            {t("remove")}
                                        </Button>
                                    )}
                                </Stack>
                            ))}
                            <Box>
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={handleAddListItem}
                                >
                                    {t("add_list_item")}
                                </Button>
                            </Box>
                        </Stack>
                    )}

                    <Typography
                        variant="caption"
                        sx={{ mt: 1, display: "block", opacity: 0.8 }}
                    >
                        {t("edit_translation_hint")}
                    </Typography>

                    {editError && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                        >
                            {editError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>{t("cancel")}</Button>
                    <Button
                        onClick={handleEditSubmit}
                        disabled={updateTranslationMutation.isPending}
                    >
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}