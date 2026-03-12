/**
 * Simple store to share data between screens without full backend round-trips.
 * Particularly useful for immediate UI updates after editing a post.
 */
class PostStore {
    private captions: Record<string, string> = {};

    setCaption(id: string, caption: string) {
        this.captions[id] = caption;
    }

    getCaption(id: string): string | undefined {
        return this.captions[id];
    }

    clear(id: string) {
        delete this.captions[id];
    }
}

export const postStore = new PostStore();
