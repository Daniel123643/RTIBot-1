import { Snowflake } from "discord.js";
import { Util } from "../../Util";

/**
 * A player participating in a raid event
 */
export interface IRaidParticipant {
    userId: Snowflake;
    registeredAt: number;
    status: "participating" | "reserve" | "removed";
}

export namespace RaidParticipant {
    export function render(participant: IRaidParticipant): string {
        const mention = Util.toMention(participant.userId);
        return participant.status === "removed" ? `~~${mention}~~` : mention;
    }
}
