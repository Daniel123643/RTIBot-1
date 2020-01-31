import { User, Snowflake } from "discord.js";
import { IRaidRole, RaidRole } from "./RaidRole";
import { IRaidParticipant } from "./RaidParticipant";
import moment = require("moment");

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
        return event.roles.map(r => RaidRole.getNumActiveParticipants(r)).reduce((q, acc) => q + acc, 0);
    }
    export function getParticipationStatus(event: IRaidEvent, user: User): "participating" | "removed" | undefined {
        return event.roles.flatMap((role: IRaidRole) => role.participants)
                          .find((part: IRaidParticipant) => part.userId === user.id)
                          ?.status;
    }
    export function register(event: IRaidEvent, user: User, role: IRaidRole) {
        event.roles.forEach(r => {
            const i = r.participants.findIndex(part => part.userId === user.id);
            if (i > -1) { r.participants.splice(i, 1); }
        });
        role.participants.push({
            registeredAt: moment().unix(),
            status: "participating",
            userId: user.id,
        });
    }
    export function deregister(event: IRaidEvent, user: User) {
        event.roles.flatMap(r => r.participants)
                   .filter(p => p.userId === user.id)
                   .forEach(p => p.status = "removed");
    }
}
