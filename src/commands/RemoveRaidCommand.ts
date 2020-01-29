import { Message, TextChannel } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import { Logger } from "../Logger";
import { IRaidEvent } from "../raids/data/RaidEvent";
import { RtiBotGuild } from "../RtiBotGuild";
import { YesNoPrompt } from "../base/prompt/PromptHelpers";

export class RemoveRaidCommand extends Command {
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
            const ev = raidService.getRaidEventOf(message.channel);
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
            if (await new YesNoPrompt(prompt, message.author, message.channel).run()) {
                await raidService.removeRaid(event);
                message.react("✅");
                return message.delete(5000); // TODO: check permissions
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
