import { DMChannel, GroupDMChannel, Message, MessageReaction, RichEmbed, TextChannel, User } from "discord.js";
import { utc } from "moment";
import { PersistentView } from "./base/PersistentView";
import { RaidEntry } from "./RaidEntry";

/**
 * Displays and controls a raid schedule entry
 */
export class RaidEntryController {
    public static loadFromMessage(message: Message, data: RaidEntry) {
        return new RaidEntryController(new PersistentView(message), data);
    }

    public static async createInChannel(channel: TextChannel | DMChannel | GroupDMChannel,
                                        data: RaidEntry): Promise<RaidEntryController> {
        return new RaidEntryController(await PersistentView.createInChannel(channel, "Placeholder."), data);
    }

    constructor(private view: PersistentView, private data: RaidEntry) {
        this.updateView();

        Promise.all(this.data.roles.map(role => {
            this.view.message.react(role.emojiName); // TODO: maybe make sure order is consistent
        }));

        const filter = (reaction: MessageReaction, user: User) => {
            return !user.bot;
        };
        const collector = this.view.message.createReactionCollector(filter);
        collector.on("collect", (reaction: MessageReaction, _) => {
            const role = this.data.roles.find(r => r.emojiName === reaction.emoji.name);
            if (role) {
                this.checkRoleReaction(role, reaction);
            } else {
                // TODO: check permissions (manage messages)
                for (const user of reaction.users.values()) {
                    reaction.remove(user);
                }
            }
        });
    }

    private updateView() {
        this.view.setContent(this.generateContent());
    }

    private generateContent(): RichEmbed {
        const startString = this.data.startDate.format("ddd D MMM HH:mm");
        const endString = this.data.endDate.format("HH:mm");
        const content = new RichEmbed()
            .setTitle(`${this.data.name} @ ${startString}-${endString}`)
            .setDescription(this.data.description)
            .setThumbnail("https://wiki.guildwars2.com/images/thumb/7/7a/Deimos.jpg/240px-Deimos.jpg")
            .setFooter("To register, react with the role you want to play.");
        this.data.roles.forEach(role => {
            const names = role.participants.length > 0 ? role.participants.join("\n") : "...";
            const title = `${role.emojiName} **${role.name}** (${role.participants.length}/${role.reqQuantity})`;
            content.addField(title, names, true);
        });
        return content;
    }

    private checkRoleReaction(role, reaction: MessageReaction) {
        const actualUsers = reaction.users.filter(user => !user.bot);
        // TODO: change to id based comparison
        const newUsers = actualUsers.filter(user => !role.participants.some(part => user.username === part));
        role.participants.push(newUsers.map(user => user.username));
        role.participants = role.participants.filter(part => actualUsers.some(user => user.username === part));
        this.updateView();
    }
}
