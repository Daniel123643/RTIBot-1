import { User, Snowflake } from "discord.js";
import { IRaidRole } from "./RaidRole";
import { IRaidParticipant } from "./RaidParticipant";

/**
 * A raid schedule event
 */
export interface IRaidEvent {
    id: number;
    startDate: number;
    endDate: number;
    name: string;
    description: string;
    leaderId: Snowflake;
    roles: IRaidRole[];
}

export namespace RaidEvent {
    export function reqParticipants(event: IRaidEvent): number {
        return event.roles.map(r => r.reqQuantity).reduce((q, acc) => q + acc, 0);
    }
    export function totalParticipants(event: IRaidEvent): number {
        return event.roles.map(r => r.participants.length).reduce((q, acc) => q + acc, 0);
    }
    export function isParticipating(event: IRaidEvent, user: User): boolean {
        return event.roles.some((role: IRaidRole) => role.participants.some((part: IRaidParticipant) => part.userId === user.id));
    }
}
