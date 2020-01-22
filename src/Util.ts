export namespace Util {
    /**
     * Converts a string to a valid text channel name, e.g. "Hello, world!" becomes "hello-world"
     * @param str The string to convert
     */
    export function toTextChannelName(str: string) {
        str = str.trim();
        str = str.toLowerCase();
        str = str.replace(/\s+/, "-");
        str = str.replace(/[^a-z0-9-]/, "");
        return str;
    }

    /**
     * Resolves an array of promises sequentially, so that order is deterministic
     */
    export async function resolvePromisesSeq<T>(promises: Array<Promise<T>>): Promise<void> {
        for (const prom of promises) {
            await prom;
        }
    }
}
