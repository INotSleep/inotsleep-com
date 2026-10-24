import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export function startLogin() {
    const redirectAfter =
        window.location.pathname + window.location.search + window.location.hash;
    window.location.href =
        "/api/oauth/start?redirect_after=" + encodeURIComponent(redirectAfter || "/");
}

/** Current user or `null` when signed out. */
export function useCurrentUser() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            try {
                const res = await axios.get("/api/auth/me");
                return res.data?.user || null;
            } catch (err) {
                if (err?.response?.status === 401) return null;
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000
    });
}

export function usePermissions() {
    const { data: user } = useCurrentUser();

    const { data = [] } = useQuery({
        queryKey: ["permissions", user?.id],
        enabled: Boolean(user),
        queryFn: async () => {
            const res = await axios.get("/api/permissions");
            return Array.isArray(res.data) ? res.data : [];
        },
        staleTime: 5 * 60 * 1000
    });

    const perms = user ? data : [];
    return {
        canManage: perms.includes("i18n.manage"),
        canModerate: perms.includes("i18n.moderate"),
        canUpload: perms.includes("i18n.upload")
    };
}
