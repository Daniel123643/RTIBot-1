import { Message, RichEmbed } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import * as ms from "ms";
import * as os from "os";

export class StatusCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            description: "Prints some information about the bot and bot server.",
            group: "admin",
            memberName: "status",
            name: "status",
        });
    }

    public run(message: CommandMessage,
               args: string | object | string[],
               fromPattern: boolean): Promise<Message | Message[]> {
        const uptime = os.uptime();
        // const uptimeD = Math.floor(uptime / 24*600);
        // const uptimeH = Math.floor(uptime / 60);
        const uptimeS = uptime % 60;
        const load = os.loadavg()[1];  // use 5 min avg
        const rel = os.release();

        const embed = new RichEmbed()
                .setColor("#00ff00")
                .setTitle("Bot Status")
                .setDescription("Ok!")
                .addField("Uptime", ms(uptime * 1000), true)
                .addField("Average Load", load.toFixed(4), true)
                .addField("Kernel", rel, true);
        return message.say(embed);
    }
}
