import { useEffect } from "react";

export const SITE_NAME = "INotSleep";

/** "Page | INotSleep", the same titles the server puts into the HTML. */
export const withSite = (title) => `${title} | ${SITE_NAME}`;

export function useDocumentTitle(title) {
    useEffect(() => {
        if (title) document.title = title;
    }, [title]);
}
