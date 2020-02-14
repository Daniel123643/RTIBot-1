import { IRaidParticipant } from "./RaidParticipant";
import { User } from "discord.js";
import moment = require("moment");
import { IRaidComposition } from "../compositions/RaidComposition";

/**
 * A role in a raid (e.g. healer)
 */
export interface IRaidRole {
    name: string;
    reqQuantity: number;
    participants: IRaidParticipant[];

}

export namespace RaidRole {
    export function fromRaidComposition(comp: IRaidComposition): IRaidRole[] {
        return comp.roles.map(role => {
            return {
                name: role.name,
                participants: [],
                reqQuantity: role.reqParticipants,
            };
        });
    }

    export function getNumActiveParticipants(role: IRaidRole) {
        return role.participants.filter(p => p.status !== "removed").length;
    }
    export function getSortedParticipants(role: IRaidRole) {
        return role.participants.sort((p1, p2) => {
            if (p1.status !== p2.status) {
                return p1.status === "participating" ? -1 : 1;
            }
            return p1.registeredAt < p2.registeredAt ? -1 : 1;
        });
    }
}
