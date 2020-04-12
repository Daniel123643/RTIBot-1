import { Message } from "discord.js";
import { CommandMessage, CommandoClient, Argument } from "discord.js-commando";
import moment = require("moment");
import { Logger } from "../Logger";
import { RaidEvent } from "../raids/data/RaidEvent";
import { RtiBotGuild } from "../RtiBotGuild";
import { RaidRole } from "../raids/data/RaidRole";
import { OfficerCommand } from "./base/OfficerCommand";
import { RaidRolesParser, ParsedRaidRole } from "../raids/RaidRolesParser";

export class AddEventCommand extends OfficerCommand {
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
                    key: "composition",
                    parse: (val: string, msg: CommandMessage, arg: Argument) => {
                        if (RaidRolesParser.validate(val)) {
                            return RaidRolesParser.parse(val);
                        }
                        return val;
                    },
                    prompt: "Give the composition for the raid. You may either specify the name of a saved composition (created with $compadd), or specify a custom one on the same format use by $compadd.",
                    type: "string",
                    validate: (val: string, msg: CommandMessage, arg: Argument) => {
                        return RaidRolesParser.validate(val)
                                || RtiBotGuild.get(msg.guild).raidCompositionService.getRaidComposition(val);
                    },
                },
                {
                    default: 2,
                    key: "hours",
                    min: 0,
                    prompt: "Give a duration in hours for the raid.",
                    type: "float",
                },
            ],
            description: "Adds a new raid to the schedule.",
            examples: ["`&raidadd 15/3 20:00 'W4 training' 'Handkiter plays dps on other bosses' MyDeimosComposition`",
                        "`&raidadd 24/12 21 'VG speedrun' 'SnowCrows members only. 3 hour run.' MyVGComposition 3`"],
            group: "raids",
            guildOnly: true,
            memberName: "raidadd",
            name: "raidadd",
        });
    }

    public async run(message: CommandMessage,
                     args: { name: string,
                             description: string,
                             date: moment.Moment,
                             starttime: moment.Moment,
                             composition: string | ParsedRaidRole,
                             hours: number }): Promise<Message | Message[]> {
        const startDate = args.date;
        startDate.hours(args.starttime.hours());
        startDate.minutes(args.starttime.minutes());
        const endDate = startDate.clone();
        endDate.add(args.hours, "hours");
        const argComp = args.composition as ParsedRaidRole;
        const composition = typeof(args.composition) === "string" ?
                                RtiBotGuild.get(message.guild).raidCompositionService.getRaidComposition(args.composition) :
                                { name: "Anomymous Composition", roles: argComp };

        if (!composition) {
            Logger.Log(Logger.Severity.Error, `Composition invalid for ${args.composition}.`);
            return this.onFail(message, "An unknown error occured using that raid composition. Try another one.");
        }

        const raidEvent = new RaidEvent(
            startDate.unix(),
            endDate.unix(),
            args.name,
            args.description,
            message.author.id,
            RaidRole.fromRaidComposition(composition));

        try {
            await RtiBotGuild.get(message.guild).raidEventService.addRaid(raidEvent);
            message.react("✅");
            return Promise.resolve([]);
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
