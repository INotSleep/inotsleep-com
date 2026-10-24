import { fontMono } from "../theme/theme.js";

export const monoSx = { fontFamily: fontMono, fontSize: "0.85em" };

export function errorMessage(error, fallback) {
    return error?.response?.data?.error || error?.message || fallback;
}

/** Buttons inside a LinkCard sit above its stretched link. */
export const cardActionsSx = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: 1
};
