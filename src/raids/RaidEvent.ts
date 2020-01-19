import { GuildMember, User } from "discord.js";
import { Moment } from "moment";

/**
 * A raid schedule event
 */
export class RaidEvent {
    public constructor(public id: number,
                       public startDate: Moment,
                       public endDate: Moment,
                       public name: string,
                       public description: string,
                       public leader: User,
                       public roles: RaidRole[]) {}

    public get reqParticipants(): number {
        return this.roles.map(r => r.reqQuantity).reduce((q, acc) => q + acc, 0);
    }
    public get totalParticipants(): number {
        return this.roles.map(r => r.participants.length).reduce((q, acc) => q + acc, 0);
    }
}

/**
 * A role in a raid (e.g. healer)
 */
export class RaidRole {
    public name: string;
    public reqQuantity: number;
    public participants: RaidParticipant[];
}

/**
 * A player participating in a raid event
 */
export class RaidParticipant {
    public constructor(public user: User,
                       public registeredAt: Moment,
                       public status: "participating" | "reserve" | "removed") {}

    public render(): string {
        return this.status === "removed" ? `~~${this.user.toString()}~~` : this.user.toString();
    }
}
