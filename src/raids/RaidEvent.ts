import { User } from "discord.js";
import { Moment } from "moment";
import moment = require("moment");

/**
 * A raid schedule event
 */
export class RaidEvent {
    constructor(public id: number,
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

    public isParticipating(user: User): boolean {
        return this.roles.some(role => role.participants.some(part => part.user === user));
    }
}

/**
 * A role in a raid (e.g. healer)
 */
export class RaidRole {
    constructor(public name: string,
                public reqQuantity: number,
                public participants: RaidParticipant[]) {}

    public register(user: User) {
        this.participants.push(new RaidParticipant(user, moment(), "participating"));
    }
}

/**
 * A player participating in a raid event
 */
export class RaidParticipant {
    constructor(public user: User,
                public registeredAt: Moment,
                public status: "participating" | "reserve" | "removed") {}

    public render(): string {
        return this.status === "removed" ? `~~${this.user.toString()}~~` : this.user.toString();
    }
}
