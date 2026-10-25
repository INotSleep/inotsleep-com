import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import LanguageSelect from "../components/LanguageSelect.jsx";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { ConfirmDialog, FormDialog } from "../components/dialogs.jsx";
import { usePermissions } from "../lib/auth.js";
import { useToast } from "../lib/toast.js";
import { errorMessage, monoSx } from "../lib/utils.js";
import { pickLanguage, useI18nLanguages } from "../lib/queries.js";
import { languageName } from "../lib/languages.js";
import { useDocumentTitle, withSite } from "../lib/title.js";

const EMPTY_ROW = { key: "", type: "string", description: "" };

function keyTypeOf(keyRow, value) {
    const raw = String(keyRow?.value_type ?? keyRow?.valueType ?? keyRow?.type ?? "").toLowerCase();
    if (raw === "list" || raw === "array") return "list";
    if (raw === "string") return "string";
    return Array.isArray(value) ? "list" : "string";
}

function ValuePreview({ value }) {
    if (Array.isArray(value)) {
        return (
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                {value.map((line, idx) => (
                    <Typography key={idx} component="li" variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {line}
                    </Typography>
                ))}
            </Box>
        );
    }
    return (
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {value}
        </Typography>
    );
}

export default function ManageI18nProject() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const toast = useToast();
    const { t } = useTranslation("i18n");
    useDocumentTitle(withSite(t("title")));
    const { canManage, canUpload } = usePermissions();

    const langsQuery = useI18nLanguages();
    const languages = langsQuery.data;
    const lang = pickLanguage(languages, searchParams.get("lang"), "en_us");

    const setLang = (code) =>
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set("lang", code);
                return next;
            },
            { replace: true }
        );

    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: ["i18n-project", slug, lang],
        enabled: Boolean(slug) && Boolean(languages),
        queryFn: async () => {
            const base = `/api/i18n/projects/${encodeURIComponent(slug)}`;
            const [keysRes, trRes] = await Promise.all([
                axios.get(`${base}/keys`),
                axios.get(`${base}/translations`, { params: { lang } })
            ]);
            return {
                project: keysRes.data.project,
                keys: keysRes.data.keys || [],
                translations: trRes.data.translations || {}
            };
        },
        placeholderData: (prev) => (prev?.project?.slug === slug ? prev : undefined)
    });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["i18n-project", slug] });
        queryClient.invalidateQueries({ queryKey: ["i18n-progress"] });
    };

    const [search, setSearch] = useState("");
    const keys = useMemo(() => {
        const all = data?.keys || [];
        const q = search.trim().toLowerCase();
        return q ? all.filter((k) => k.key_name.toLowerCase().includes(q)) : all;
    }, [data, search]);

    // ---- add keys ----
    const [addOpen, setAddOpen] = useState(false);
    const [addRows, setAddRows] = useState([EMPTY_ROW]);
    const [addError, setAddError] = useState("");

    const addKeysMutation = useMutation({
        mutationFn: (payload) => axios.post(`/api/i18n/projects/${encodeURIComponent(slug)}/keys`, payload),
        onSuccess: (_res, payload) => {
            refresh();
            setAddOpen(false);
            setAddRows([EMPTY_ROW]);
            toast(t("keys_added", { count: payload.keys.length }));
        },
        onError: (e) => setAddError(errorMessage(e, t("add_keys_failed")))
    });

    const submitAddKeys = () => {
        const prepared = addRows
            .map((row) => ({
                key: row.key.trim(),
                type: row.type,
                description: row.description.trim() || null
            }))
            .filter((row) => row.key.length > 0);

        if (prepared.length === 0) {
            setAddError(t("add_keys_no_valid_lines"));
            return;
        }
        addKeysMutation.mutate({ keys: prepared });
    };

    const changeRow = (index, field, value) => {
        setAddError("");
        setAddRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    // ---- import yaml ----
    const [importOpen, setImportOpen] = useState(false);
    const [importLang, setImportLang] = useState(lang);
    const [importYaml, setImportYaml] = useState("");
    const [importError, setImportError] = useState("");

    const importMutation = useMutation({
        mutationFn: () =>
            axios.post(`/api/i18n/projects/${encodeURIComponent(slug)}/import`, {
                language: importLang,
                yaml: importYaml
            }),
        onSuccess: () => {
            refresh();
            setImportOpen(false);
            setImportYaml("");
            toast(t("import_done", { lang: languageName(importLang) }));
        },
        onError: (e) => setImportError(errorMessage(e, t("import_yaml_failed")))
    });

    const submitImport = () => {
        if (!importYaml.trim()) {
            setImportError(t("import_yaml_empty"));
            return;
        }
        importMutation.mutate();
    };

    const loadYamlFile = async (file) => {
        if (!file) return;
        setImportError("");
        setImportYaml(await file.text());
    };

    // ---- edit ----
    const [editKey, setEditKey] = useState(null); // key row, kept while the dialog closes
    const [editOpen, setEditOpen] = useState(false);
    const [editDescription, setEditDescription] = useState("");
    const [editString, setEditString] = useState("");
    const [editLines, setEditLines] = useState([""]);
    const [editError, setEditError] = useState("");
    const editIsList = editKey ? keyTypeOf(editKey, data?.translations[editKey.key_name]) === "list" : false;

    const openEdit = (keyRow) => {
        const current = data.translations[keyRow.key_name];
        const isList = keyTypeOf(keyRow, current) === "list";

        setEditKey(keyRow);
        setEditOpen(true);
        setEditDescription(keyRow.description || "");
        setEditError("");
        if (isList) {
            const items = Array.isArray(current)
                ? current.map((v) => (v != null ? String(v) : ""))
                : typeof current === "string" && current ? current.split(/\r?\n/) : [];
            setEditLines(items.length ? items : [""]);
        } else {
            setEditString(
                typeof current === "string" ? current : Array.isArray(current) ? current.join("\n") : ""
            );
        }
    };

    const editMutation = useMutation({
        mutationFn: (body) => axios.post(`/api/i18n/projects/${encodeURIComponent(slug)}/translations`, body),
        onSuccess: (_res, body) => {
            refresh();
            setEditOpen(false);
            toast(t("translation_saved", { key: body.key }));
        },
        onError: (e) => setEditError(errorMessage(e, t("update_translation_failed")))
    });

    const submitEdit = () => {
        let value = editString;
        if (editIsList) {
            value = editLines.filter((s) => s.trim().length > 0);
            if (value.length === 0) {
                setEditError(t("edit_list_empty"));
                return;
            }
        }
        editMutation.mutate({
            key: editKey.key_name,
            language: lang,
            value,
            description: editDescription
        });
    };

    // ---- delete (cannot be undone: removes the key with all its translations) ----
    const [deleteKey, setDeleteKey] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteMutation = useMutation({
        mutationFn: (keyRow) => axios.delete(`/api/i18n/projects/${encodeURIComponent(slug)}/keys/${keyRow.id}`),
        onSuccess: (_res, keyRow) => {
            refresh();
            setDeleteOpen(false);
            toast(t("key_deleted", { key: keyRow.key_name }));
        },
        onError: (e) => {
            setDeleteOpen(false);
            toast(errorMessage(e, t("delete_key_failed")), "error");
        }
    });

    const back = { to: "/i18n", label: t("title") };

    if (langsQuery.isPending || isPending) return <LoadingState minHeight="50vh" />;

    if (langsQuery.isError || isError) {
        if (error?.response?.status === 404) {
            return <Navigate to={`/404?path=/i18n/${slug}/manage`} replace />;
        }
        return (
            <>
                <PageHeader title={slug} back={back} />
                <ErrorState error={langsQuery.error || error} onRetry={langsQuery.isError ? langsQuery.refetch : refetch} />
            </>
        );
    }

    const totalKeys = data.keys.length;

    return (
        <>
            <PageHeader
                title={data.project.name}
                back={back}
                actions={
                    <>
                        {canUpload && (
                            <Button
                                variant="outlined"
                                startIcon={<UploadFileOutlinedIcon />}
                                onClick={() => {
                                    setImportLang(lang);
                                    setImportError("");
                                    setImportOpen(true);
                                }}
                            >
                                {t("import_yaml")}
                            </Button>
                        )}
                        {canManage && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setAddError("");
                                    setAddOpen(true);
                                }}
                            >
                                {t("add_keys")}
                            </Button>
                        )}
                    </>
                }
            />

            <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                <LanguageSelect
                    label={t("language")}
                    languages={languages}
                    value={lang}
                    onChange={setLang}
                    sx={{ width: { sm: 240 } }}
                />
                {totalKeys > 0 && (
                    <TextField
                        size="small"
                        placeholder={t("search_keys")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && setSearch("")}
                        sx={{ flex: 1, maxWidth: { sm: 360 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: search && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearch("")} aria-label={t("clear_search")}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                )}
            </Stack>

            {totalKeys === 0 ? (
                <EmptyState
                    title={t("no_keys_yet")}
                    action={
                        canManage && (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
                                {t("add_keys")}
                            </Button>
                        )
                    }
                />
            ) : keys.length === 0 ? (
                <EmptyState title={t("nothing_found")} />
            ) : (
                <Paper sx={{ overflow: "hidden" }}>
                    {keys.map((k, index) => {
                        const value = data.translations[k.key_name];
                        const isList = keyTypeOf(k, value) === "list";

                        return (
                            <Box
                                key={k.id}
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    px: { xs: 2, md: 2.5 },
                                    py: 2,
                                    borderTop: index === 0 ? "none" : "1px solid",
                                    borderColor: "divider",
                                    transition: "background-color .15s",
                                    "&:hover": { bgcolor: "action.hover" }
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                        <Typography variant="subtitle2" sx={{ ...monoSx, fontSize: "0.85rem", wordBreak: "break-all" }}>
                                            {k.key_name}
                                        </Typography>
                                        {isList && <Chip size="small" label={t("type_list")} />}
                                        {value === undefined && (
                                            <Chip size="small" label={t("status_untranslated")} color="warning" variant="outlined" />
                                        )}
                                    </Stack>
                                    {k.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                            {k.description}
                                        </Typography>
                                    )}
                                    {value !== undefined && (
                                        <Box sx={{ mt: 1 }}>
                                            <ValuePreview value={value} />
                                        </Box>
                                    )}
                                </Box>

                                {canManage && (
                                    <Stack direction="row" alignItems="flex-start" gap={0.5} sx={{ flexShrink: 0 }}>
                                        <Tooltip title={t("edit")}>
                                            <IconButton onClick={() => openEdit(k)} aria-label={t("edit")}>
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t("delete")}>
                                            <IconButton
                                                onClick={() => {
                                                    setDeleteKey(k);
                                                    setDeleteOpen(true);
                                                }}
                                                aria-label={t("delete")}
                                                sx={{ "&:hover": { color: "error.main" } }}
                                            >
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                )}
                            </Box>
                        );
                    })}
                </Paper>
            )}

            <FormDialog
                open={addOpen}
                title={t("add_keys")}
                onClose={() => setAddOpen(false)}
                onSubmit={submitAddKeys}
                submitLabel={t("add")}
                pending={addKeysMutation.isPending}
                maxWidth="md"
            >
                {addRows.map((row, index) => (
                    <Stack key={index} direction={{ xs: "column", md: "row" }} gap={1.5} alignItems={{ md: "flex-start" }}>
                        <TextField
                            autoFocus={index === addRows.length - 1}
                            size="small"
                            label={t("key_name")}
                            placeholder="namespace.section.key"
                            value={row.key}
                            onChange={(e) => changeRow(index, "key", e.target.value)}
                            InputProps={{ sx: monoSx }}
                            sx={{ flex: 2 }}
                        />
                        <TextField
                            select
                            size="small"
                            label={t("value_type")}
                            value={row.type}
                            onChange={(e) => changeRow(index, "type", e.target.value)}
                            sx={{ width: { md: 150 } }}
                        >
                            <MenuItem value="string">{t("value_type_string")}</MenuItem>
                            <MenuItem value="list">{t("value_type_list")}</MenuItem>
                        </TextField>
                        <TextField
                            size="small"
                            label={t("description")}
                            value={row.description}
                            onChange={(e) => changeRow(index, "description", e.target.value)}
                            sx={{ flex: 3 }}
                        />
                        {addRows.length > 1 && (
                            <Tooltip title={t("remove")}>
                                <IconButton
                                    aria-label={t("remove")}
                                    onClick={() => setAddRows((prev) => prev.filter((_, i) => i !== index))}
                                    sx={{ alignSelf: { xs: "flex-end", md: "center" } }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                ))}
                <Box>
                    <Button startIcon={<AddIcon />} onClick={() => setAddRows((prev) => [...prev, EMPTY_ROW])}>
                        {t("add_one_more_key")}
                    </Button>
                </Box>
                {addError && (
                    <Typography variant="body2" color="error">
                        {addError}
                    </Typography>
                )}
            </FormDialog>

            <FormDialog
                open={importOpen}
                title={t("import_yaml")}
                onClose={() => setImportOpen(false)}
                onSubmit={submitImport}
                submitLabel={t("import")}
                pending={importMutation.isPending}
                maxWidth="md"
            >
                <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
                    <LanguageSelect
                        label={t("import_yaml_language_label")}
                        languages={languages}
                        value={importLang}
                        onChange={setImportLang}
                        sx={{ width: 240 }}
                    />
                    <Button component="label" variant="outlined" startIcon={<UploadFileOutlinedIcon />}>
                        {t("choose_file")}
                        <input
                            hidden
                            type="file"
                            accept=".yml,.yaml,text/yaml"
                            onChange={(e) => {
                                loadYamlFile(e.target.files?.[0]);
                                e.target.value = "";
                            }}
                        />
                    </Button>
                </Stack>
                <TextField
                    autoFocus
                    multiline
                    minRows={10}
                    maxRows={20}
                    value={importYaml}
                    onChange={(e) => {
                        setImportYaml(e.target.value);
                        setImportError("");
                    }}
                    placeholder={t("import_yaml_placeholder")}
                    inputProps={{ "aria-label": "YAML", spellCheck: false }}
                    InputProps={{ sx: monoSx }}
                    error={Boolean(importError)}
                    helperText={importError || " "}
                />
            </FormDialog>

            <FormDialog
                open={editOpen}
                title={
                    <Box component="span" sx={{ ...monoSx, fontSize: "1rem", wordBreak: "break-all" }}>
                        {editKey?.key_name}
                    </Box>
                }
                onClose={() => setEditOpen(false)}
                onSubmit={submitEdit}
                pending={editMutation.isPending}
                maxWidth="md"
            >
                <TextField
                    label={t("description")}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    multiline
                    maxRows={3}
                />
                {editIsList ? (
                    <Stack gap={1}>
                        {editLines.map((item, index) => (
                            <Stack key={index} direction="row" gap={0.5} alignItems="flex-start">
                                <TextField
                                    autoFocus={index === 0}
                                    fullWidth
                                    multiline
                                    maxRows={8}
                                    size="small"
                                    label={t("translation_line", { lang: languageName(lang), index: index + 1 })}
                                    value={item}
                                    onChange={(e) => {
                                        setEditError("");
                                        setEditLines((prev) => prev.map((v, i) => (i === index ? e.target.value : v)));
                                    }}
                                />
                                {editLines.length > 1 && (
                                    <Tooltip title={t("remove_line")}>
                                        <IconButton
                                            aria-label={t("remove_line")}
                                            onClick={() => setEditLines((prev) => prev.filter((_, i) => i !== index))}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                        ))}
                        <Box>
                            <Button startIcon={<AddIcon />} onClick={() => setEditLines((prev) => [...prev, ""])}>
                                {t("add_line")}
                            </Button>
                        </Box>
                    </Stack>
                ) : (
                    <TextField
                        autoFocus
                        multiline
                        minRows={3}
                        label={t("translation_in", { lang: languageName(lang) })}
                        value={editString}
                        onChange={(e) => setEditString(e.target.value)}
                    />
                )}
                {editError && (
                    <Typography variant="body2" color="error">
                        {editError}
                    </Typography>
                )}
            </FormDialog>

            <ConfirmDialog
                open={deleteOpen}
                title={t("delete_key_confirm", { key: deleteKey?.key_name })}
                confirmLabel={t("delete")}
                pending={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteKey)}
                onClose={() => setDeleteOpen(false)}
            />
        </>
    );
}
