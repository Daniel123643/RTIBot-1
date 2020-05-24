import { Snowflake, RichEmbed, TextChannel, DMChannel, GroupDMChannel } from "discord.js";

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
     * Sends an embed with a single short message.
     * @param channel The channel to send in
     * @param content The message content
     */
    export async function sendPrettyMessage(channel: TextChannel | DMChannel | GroupDMChannel, content: string) {
        const embed = new RichEmbed();
        embed.setDescription(content);
        return channel.send(embed);
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
