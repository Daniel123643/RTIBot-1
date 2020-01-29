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
    export function register(role: IRaidRole, user: User) {
        role.participants.push({
            registeredAt: moment().unix(),
            status: "participating",
            userId: user.id,
        });
    }
}
