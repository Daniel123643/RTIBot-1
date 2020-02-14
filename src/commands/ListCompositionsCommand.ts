import { Message, RichEmbed } from "discord.js";
import { CommandMessage, CommandoClient } from "discord.js-commando";
import { RtiBotGuild } from "../RtiBotGuild";
import { OfficerCommand } from "./base/OfficerCommand";

export class ListCompositionsCommand extends OfficerCommand {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["compositions", "comps", "cl"],
            description: "Lists all available raid compositions.",
            group: "composition",
            guildOnly: true,
            memberName: "complist",
            name: "complist",
        });
    }

    public async run(message: CommandMessage): Promise<Message | Message[]> {
        const compositionService = RtiBotGuild.get(message.guild).raidCompositionService;
        const comps = compositionService.getAllRaidCompositions();

        const embed = new RichEmbed();
        embed.setTitle("Raid compositions");
        embed.setDescription(`There are currently ${comps.length} composition(s).`);
        embed.setFooter("This message will not update automatically.");
        comps.forEach(comp => {
            const rolesString = comp.roles.map(role => `${role.name}:${role.reqParticipants}`).join(", ");
            embed.addField(comp.name, rolesString);
        });

        return Promise.resolve(message.reply(embed));
    }
}
