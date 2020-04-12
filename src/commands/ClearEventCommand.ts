import { Message, TextChannel } from "discord.js";
import { CommandMessage, CommandoClient } from "discord.js-commando";
import { OfficerCommand } from "./base/OfficerCommand";
import { RtiBotGuild } from "../RtiBotGuild";
import { RaidEvent } from "../raids/data/RaidEvent";
import { Logger } from "../Logger";
import { YesNoDialog } from "../base/prompt/YesNoDialog";

export class ClearEventCommand extends OfficerCommand {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["rc"],
            args: [
                {
                    default: "",
                    key: "raid_channel",
                    prompt: "Give the raid to remove (as a text channel)",
                    type: "text-channel",
                },
            ],
            description: "Clears all pericipants from a raid (irreversible!).",
            group: "raids",
            guildOnly: true,
            memberName: "raidclear",
            name: "raidclear",
        });
    }

    public async run(message: CommandMessage,
                     args: { raid_channel: TextChannel}): Promise<Message | Message[]> {
        const raidService = RtiBotGuild.get(message.guild).raidEventService;
        let event: RaidEvent;
        let channel: TextChannel;

        if (!args.raid_channel) {
            const ev = raidService.getRaidEventOf(message.channel as TextChannel);
            if (!ev) {
                return this.onFail(message, "Please either run this command in a raid channel, or provide the channel of the raid you wish to clear.");
            }
            event = ev;
            channel = message.channel as TextChannel;
        } else {
            if (args.raid_channel.guild !== message.guild) {
                return this.onFail(message, "That channel is not in this server.");
            }
            const ev = raidService.getRaidEventOf(args.raid_channel);
            if (!ev) {
                return this.onFail(message, "The channel you provided is not a raid channel.");
            }
            event = ev;
            channel = args.raid_channel;
        }

        if (event.numActiveParticipants === 0) {
            return this.onFail(message, "The raid is already empty.");
        }

        try {
            const prompt = `You are about to clear ${event.numActiveParticipants} participants from the raid '${event.name}'. Are you sure?`;
            if (await new YesNoDialog(prompt, message.author, message.channel).run()) {
                raidService.clearRaidParticipants(channel);
                return this.onSuccess(message);
            } else {
                return message.reply("Canceled.");
            }
        } catch (err) {
            Logger.LogError(Logger.Severity.Info, err);
            return this.onFail(message, `The command failed:\n${err}`);
        }
    }
}
