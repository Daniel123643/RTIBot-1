import { Message, MessageReaction, ReactionCollector, User } from "discord.js";
import { Event } from "./Event";
import { UserPrompt } from "./prompt/UserPrompt";

/**
 * Uses a set of reactions as buttons on a message,
 * and provides callbacks for when a 'button' is pressed
 */
export class ReactionButtonSet {
    public buttonPressed: Event<[User, string]> = new Event();
    private collector: ReactionCollector | undefined;

    /**
     * @param message The message to attach to
     * @param emojis The emojis to use
     */
    public constructor(private message: Message, private emojis: string[]) {
        Promise.all(emojis.map(emoji => {
            return message.react(emoji);
        }));

        const filter = (reaction: MessageReaction, user: User) => {
            return !user.bot;
        };
        this.collector = message.createReactionCollector(filter);
        this.collector.on("collect", (reaction: MessageReaction, _) => {
            const em = emojis.find(emoji => emoji === reaction.emoji.name);
            if (em) {
                const user = reaction.users.filter(u => !u.bot).first();
                if (user) {
                    this.buttonPressed.trigger([user, em]);
                }
            }
            // TODO: check permissions (manage messages)
            for (const user of reaction.users.values()) {
                if (!user.bot) { reaction.remove(user); }
            }
        });
    }

    public detach() {
        if (this.collector) {
            this.collector.stop();
            this.emojis.forEach(emoji => {
                const reaction = this.message.reactions.get(emoji);
                if (reaction) {
                    for (const user of reaction.users.values()) {
                        reaction.remove(user);
                    }
                }
            });
        }
    }
}
