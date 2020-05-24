import { CommandMessage, CommandoClient } from "discord.js-commando";
import { Logger } from "../Logger";
import { RaidEvent } from "../raids/data/RaidEvent";
import { RtiBotGuild } from "../RtiBotGuild";
import { OfficerCommand } from "./base/OfficerCommand";
import { TextChannel, Message, User } from "discord.js";

export class KickParicipantCommand extends OfficerCommand {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["rk"],
            args: [
                {
                    key: "user_mention",
                    prompt: "Give the user to kick (as a discord mention)",
                    type: "user",
                },
                {
                    default: "",
                    key: "raid_channel",
                    prompt: "Give the raid to kick the user from (as a text channel)",
                    type: "text-channel",
                },
            ],
            description: "Kicks/removes a user from a raid.",
            group: "raids",
            guildOnly: true,
            memberName: "raidkick",
            name: "raidkick",
        });
    }

    public async run(message: CommandMessage,
                     args: { user_mention: User,
                             raid_channel: TextChannel,
                             }): Promise<Message | Message[]> {
        const raidService = RtiBotGuild.get(message.guild).raidEventService;
        let event: RaidEvent;
        let channel: TextChannel;

        if (!args.raid_channel) {
            const ev = raidService.getRaidEventOf(message.channel as TextChannel);
            if (!ev) {
                return this.onFail(message, "Please either run this command in a raid channel, or provide the channel of the raid you wish to remove.");
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
        try {
            await message.guild.fetchMember(args.user_mention);
        } catch (e) {
            Logger.Log(Logger.Severity.Warn, `User '${args.user_mention.username}' not in ${message.guild.name} referenced in ${message.channel.id}.`);
            return this.onFail(message, "That user does not seem to be in this server.");
        }

        const status = event.getParticipationStatusOf(args.user_mention);
        if (status !== "participating" && status !== "reserve") {
            return this.onFail(message, "That user is not registered for this event.");
        }

        raidService.kickRaidParticipant(channel, args.user_mention, message.author);
        return this.onSuccess(message);
    }
}
