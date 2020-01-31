import { IRaidParticipant } from "./RaidParticipant";
import { User } from "discord.js";
import moment = require("moment");

/**
 * A role in a raid (e.g. healer)
 */
export interface IRaidRole {
    name: string;
    reqQuantity: number;
    participants: IRaidParticipant[];

}

export namespace RaidRole {
    export function getNumActiveParticipants(role: IRaidRole) {
        return role.participants.filter(p => p.status !== "removed").length;
    }
}
