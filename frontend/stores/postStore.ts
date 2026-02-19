/**
 * Minimal in-memory store for pending post updates.
 * Used to pass caption edits back from the edit page to the view page.
 * TODO: Remove this when the backend is ready — the view page will just
 * re-fetch the post from the API on focus.
 */
const pendingUpdates = new Map<string, { caption?: string }>();

export const postStore = {
    setCaption: (id: string, caption: string) => {
        pendingUpdates.set(id, { ...pendingUpdates.get(id), caption });
    },
    getCaption: (id: string): string | undefined => {
        return pendingUpdates.get(id)?.caption;
    },
    clear: (id: string) => {
        pendingUpdates.delete(id);
    },
};
