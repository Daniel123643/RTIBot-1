import { TextChannel } from "discord.js";
import { Argument, ArgumentType, CommandMessage, CommandoClient } from "discord.js-commando";

export class TextChannelArgumentType extends ArgumentType {
    constructor(client: CommandoClient) {
        super(client, "text-channel");
    }

    public validate(val: string, msg: CommandMessage, arg: Argument) {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) {
            try {
                const channel = msg.client.channels.find("id", matches[1]);
                return channel && channel.type === "text";
            } catch (err) {
                return false;
            }
        }
        if (!msg.guild) { return false; }
        const search = val.toLowerCase();
        const channels = msg.guild.channels.filter(channelFilterInexact(search));
        if (channels.size === 0) { return false; }
        if (channels.size === 1) { return true; }
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) { return true; }
        return "Multiple channels found. Please be more specific.";
    }

    public parse(val: string, msg: CommandMessage): TextChannel | null {
        const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
        if (matches) {
            const channel = msg.client.channels.find("id", matches[1]);
            if (channel && channel.type === "text") { return channel as TextChannel; }
        }
        if (!msg.guild) { return null; }
        const search = val.toLowerCase();
        const channels = msg.guild.channels.filter(channelFilterInexact(search));
        if (channels.size === 0) { return null; }
        if (channels.size === 1) { return channels.first() as TextChannel; }
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.size === 1) { return exactChannels.first() as TextChannel; }
        return null;
    }
}

function channelFilterExact(search: string) {
    return chan => chan.type === "text" && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search: string) {
    return chan => chan.type === "text" && chan.name.toLowerCase().includes(search);
}
