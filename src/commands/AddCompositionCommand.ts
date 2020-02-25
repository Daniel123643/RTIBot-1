import { Message } from "discord.js";
import { CommandMessage, CommandoClient } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";
import { YesNoDialog } from "../base/prompt/YesNoDialog";
import { OfficerCommand } from "./base/OfficerCommand";
import { IRaidComposition } from "../raids/compositions/RaidComposition";

export class AddCompositionCommand extends OfficerCommand {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["ca"],
            args: [
                {
                    key: "name",
                    prompt: "Give the name of the composition",
                    type: "string",
                },
                {
                    key: "roles",
                    prompt: "Give the roles for the composition (e.g. 'Chronomancer:2, Condi DPS:5, ...').",
                    type: "roles",
                },
            ],
            description: "Adds a raid composition, which can later be used to create raids",
            examples: ["!compadd MyDeimosComposition 'Tank:1, Offchrono:1, Banner Slave:1, Hand Kiter:1, Druid:2, Dps:4'"],
            group: "composition",
            guildOnly: true,
            memberName: "compadd",
            name: "compadd",
        });
    }

    public async run(message: CommandMessage,
                     args: { name: string, roles: Array<{ name: string, reqParticipants: number }>}): Promise<Message | Message[]> {
        const compositionService = RtiBotGuild.get(message.guild).raidCompositionService;
        if (compositionService.getRaidComposition(args.name)) {
            const overwrite = await new YesNoDialog(`A composition with the name '${args.name}' already exists, overwrite it?`, message.author, message.channel).run();
            if (!overwrite) { return this.onFail(message, "Canceled."); }
        }
        const composition: IRaidComposition = {
            name: args.name,
            roles: args.roles,
        };
        compositionService.addRaidComposition(composition);

        message.react("✅");
        return Promise.resolve([]);
    }

    public onFail(message: CommandMessage, response: string) {
        message.react("❌");
        return message.reply(response);
    }
}
