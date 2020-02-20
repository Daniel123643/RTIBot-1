import { OfficerCommand } from "./base/OfficerCommand";
import { CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, TextChannel, RichEmbed } from "discord.js";
import { RtiBotGuild } from "../RtiBotGuild";
import { Util } from "../Util";

export class BroadcastCommand extends OfficerCommand {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["bc"],
            args: [
                {
                    key: "message",
                    prompt: "Give the message to send to the participants.",
                    type: "string",
                },
            ],
            description: "Pings all participants of a raid with a message.",
            group: "raids",
            guildOnly: true,
            memberName: "broadcast",
            name: "broadcast",
        });
    }

    public async run(message: CommandMessage,
                     args: { message: string }): Promise<Message | Message[]> {
        const raidService = RtiBotGuild.get(message.guild).raidEventService;
        const ev = raidService.getRaidEventOf(message.channel as TextChannel);
        if (!ev) {
            return this.onFail(message, "Please run this command in a raid channel.");
        }
        const users = ev.roles.flatMap(role => role.participants.filter(p => p.status !== "removed").map(p => p.userId));
        if (message.author.id === ev.leaderId) {
            const i = users.indexOf(ev.leaderId);
            if (i > -1) { users.splice(i,  1); }
        } else if (users.indexOf(ev.leaderId) === -1) {
            users.push(ev.leaderId);
        }
        const msg = `${message.author} says:\n${args.message}\n\n${users.map(uId => Util.toMention(uId)).join()}`;
        message.channel.send(msg);
        message.react("✅");
        return message.delete(5000);
    }

    public onFail(message: CommandMessage, response: string) {
        message.react("❌");
        return message.reply(response);
    }
}
