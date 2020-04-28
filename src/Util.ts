import { Snowflake } from "discord.js";

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
    export async function resolvePromisesSeq<T>(promiseGenerators: Array<() => Promise<T>>): Promise<void> {
        for (const promGen of promiseGenerators) {
            await promGen();
        }
    }

    /**
     * Resolves all promises, even if one fails.
     */
    export async function allSettled<T>(promises: Array<Promise<T>>): Promise<Array<{ successful: boolean, value?: T, error?: any }>> {
        return Promise.all(promises.map(prm => {
            return prm.then(v => ({ successful: true, value: v }),
                            error => ({ successful: false, error }));
        }));
    }

    export function toMention(userId: Snowflake): string {
        return `<@${userId}>`;
    }
}
