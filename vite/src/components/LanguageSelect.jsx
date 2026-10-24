import { Box, MenuItem, TextField } from "@mui/material";
import "flag-icons/css/flag-icons.min.css";
import { ambiguousLanguages, languageFlag, languageName } from "../lib/languages.js";
import { monoSx } from "../lib/utils.js";

function LanguageLabel({ code, withRegion, showCode }) {
    return (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, minWidth: 0, width: "100%" }}>
            <Box
                component="span"
                className={`fi fi-${languageFlag(code)}`}
                sx={{ flexShrink: 0, width: "1.33em !important", lineHeight: "1em", borderRadius: "3px", boxShadow: "0 0 0 1px rgba(127,127,127,0.25)" }}
            />
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {languageName(code, withRegion)}
            </Box>
            {showCode && (
                <Box component="span" sx={{ ...monoSx, ml: "auto", pl: 2, color: "text.secondary" }}>
                    {code}
                </Box>
            )}
        </Box>
    );
}

/** Select for translation languages: flag and native name, code in the list. */
export default function LanguageSelect({ languages = [], value, onChange, label, sx }) {
    const ambiguous = ambiguousLanguages(languages);

    return (
        <TextField
            select
            size="small"
            label={label}
            value={languages.includes(value) ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            sx={{ minWidth: 180, ...sx }}
            SelectProps={{
                renderValue: (code) => <LanguageLabel code={code} withRegion={ambiguous.has(code)} />
            }}
        >
            {languages.map((code) => (
                <MenuItem key={code} value={code} sx={{ minWidth: 240 }}>
                    <LanguageLabel code={code} withRegion={ambiguous.has(code)} showCode />
                </MenuItem>
            ))}
        </TextField>
    );
}
