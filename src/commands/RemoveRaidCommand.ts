import { Message, TextChannel } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import { Logger } from "../Logger";
import { IRaidEvent } from "../raids/data/RaidEvent";
import { RtiBotGuild } from "../RtiBotGuild";
import { YesNoDialog } from "../base/prompt/YesNoDialog";
import { OfficerCommand } from "./base/OfficerCommand";

export class RemoveRaidCommand extends OfficerCommand {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["rr"],
            args: [
                {
                    default: "",
                    key: "raid_channel",
                    prompt: "Give the raid to remove (as a text channel)",
                    type: "text-channel",
                },
            ],
            description: "Removes a raid (irreversible!).",
            group: "raids",
            guildOnly: true,
            memberName: "raidremove",
            name: "raidremove",
        });
    }

    public async run(message: CommandMessage,
                     args: { raid_channel: TextChannel }): Promise<Message | Message[]> {
        const raidService = RtiBotGuild.get(message.guild).raidService;
        let event: IRaidEvent;

        if (!args.raid_channel) {
            const ev = raidService.getRaidEventOf(message.channel as TextChannel);
            if (!ev) {
                return this.onFail(message, "Please either run this command in a raid channel, or provide the channel of the raid you wish to remove.");
            }
            event = ev;
        } else {
            if (args.raid_channel.guild !== message.guild) {
                return this.onFail(message, "That channel is not in this server.");
            }
            const ev = raidService.getRaidEventOf(args.raid_channel);
            if (!ev) {
                return this.onFail(message, "The channel you provided is not a raid channel.");
            }
            event = ev;
        }

        try {
            const prompt = `You are about to remove the raid '${event.name}'. Are you sure?`;
            if (await new YesNoDialog(prompt, message.author, message.channel).run()) {
                raidService.removeRaid(event);
                return Promise.resolve([]);
            } else {
                return message.reply("Canceled.");
            }
        } catch (err) {
            Logger.LogError(Logger.Severity.Info, err);
            message.react("❌");
            return message.reply(`The command failed:\n${err}`);
        }
    }

    public onFail(message: CommandMessage, response: string) {
        message.react("❌");
        return message.reply(response);
    }
}
