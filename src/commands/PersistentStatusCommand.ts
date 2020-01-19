import { Message, MessageEmbed } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import * as moment from "moment";
import * as os from "os";
import { PersistentView } from "../base/PersistentView";

export class PersistentStatusCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ["permstatus"],
            description: "Prints status information in a periodically updating message.",
            group: "admin",
            memberName: "permanentstatus",
            name: "permanentstatus",
        });
    }

    public run(message: CommandoMessage,
               args: string | object | string[],
               fromPattern: boolean): Promise<Message | Message[]> {
        PersistentView.createInChannel(message.channel, this.getStatusContent()).then((view) => {
            setInterval(() => {
                view.setContent(this.getStatusContent());
            }, 60000);
        });
        return Promise.reject();
    }

    private getStatusContent(): MessageEmbed {
        const uptime = os.uptime();
        const load = os.loadavg()[1];  // use 5 min avg
        const rel = os.release();
        const time = moment.utc().format("HH:mm");

        return new MessageEmbed()
            .setColor("#00ff00")
            .setTitle("Bot Status")
            .setDescription("Ok!")
            .addField("Uptime", moment.duration(uptime, "seconds").humanize(), true)
            .addField("Average Load", load.toFixed(4), true)
            .addField("Kernel", rel, true)
            .setFooter("Last updated " + time + " UTC");
    }
}
