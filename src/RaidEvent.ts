import { GuildMember } from "discord.js";
import { Moment } from "moment";

/**
 * A raid schedule event
 */
export class RaidEvent {
    public id: number;
    public startDate: Moment;
    public endDate: Moment;
    public name: string;
    public description: string;
    public roles: RaidRole[];
}

/**
 * A role in a raid (e.g. healer)
 */
export class RaidRole {
    public name: string;
    public emojiName: string;
    public reqQuantity: number;
    public participants: RaidParticipant[];
}

/**
 * A player participating in a raid event
 */
export class RaidParticipant {
    public member: GuildMember;
    public status: "participating" | "reserve" | "removed";
}
