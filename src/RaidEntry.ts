import { Emoji, ReactionEmoji } from "discord.js";
import { Moment } from "moment";

export class RaidEntry {
    public id: number;
    public startDate: Moment;
    public endDate: Moment;
    public name: string;
    public description: string;
    public roles: Array<{
        name: string,
        emoji: string,
        reqQuantity: number,
        participants: string[],
    }>;
}
