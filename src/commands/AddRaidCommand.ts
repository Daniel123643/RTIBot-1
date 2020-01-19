import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import moment = require("moment");
import { Logger } from "../Logger";
import { RaidEvent, RaidRole } from "../raids/RaidEvent";
import { RtiBotGuild } from "../RtiBotGuild";

export class AddRaidCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["ra"],
            args: [
                {
                    key: "date",
                    parse: (date: string) => moment(date, "D/M"),
                    prompt: "Give a date for the raid.",
                    type: "string",
                    validate: (date: string) => moment(date, "D/M").isValid(),
                },
                {
                    key: "starttime",
                    parse: (date: string) => moment(date, "HH:mm"),
                    prompt: "Give a starting time for the raid.",
                    type: "string",
                    validate: (date: string) => moment(date, "HH:mm").isValid(),
                },
                {
                    key: "name",
                    prompt: "Give a name for the raid.",
                    type: "string",
                },
                {
                    key: "description",
                    prompt: "Give a description for the raid.",
                    type: "string",
                },
                {
                    key: "roles",
                    prompt: "Give the roles for the raid (e.g. 'Chronomancer:🧠:2, Condi DPS:🔥:5, ...').",
                    type: "roles",
                },
                {
                    default: 2,
                    key: "hours",
                    min: 0,
                    prompt: "Give a duration in hours for the raid.",
                    type: "float",
                },
            ],
            description: "Adds a new raid to the schedule",
            examples: ["`!raidadd 15/3 20:00 'W4 training' 'Handkiter plays dps on other bosses' 'Chronomancer:🧠:1, DPS:🔥:5, Druid:🐅:2, Banner Warrior:⚔️:1, Handkiter:👋:1'`"],
            group: "raids",
            guildOnly: true,
            memberName: "raidadd",
            name: "raidadd",
        });
    }

    public async run(message: CommandoMessage,
                     args: { name: string,
                             description: string,
                             date: moment.Moment,
                             starttime: moment.Moment,
                             roles: RaidRole[],
                             hours: number }): Promise<Message | Message[]> {
        const startDate = args.date;
        startDate.hours(args.starttime.hours());
        startDate.minutes(args.starttime.minutes());
        const endDate = startDate.clone();
        endDate.add(args.hours, "hours");

        const raidEvent = new RaidEvent(
            0,
            startDate,
            endDate,
            args.name,
            args.description,
            message.author,
            args.roles,
        );

        try {
            await RtiBotGuild.get(message.guild).raidService.addRaid(raidEvent);
            message.react("✅");
            return message.delete(5000); // TODO: check permissions
        } catch (err) {
            Logger.LogError(Logger.Severity.Info, err);
            message.react("❌");
            return message.reply(`The command failed:\n${err}`);
        }
    }
}
