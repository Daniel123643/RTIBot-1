import { Snowflake } from "discord.js";
import { Util } from "../../Util";

export type ParticipationStatus = "participating" | "reserve" | "removed";

/**
 * A player participating in a raid event
 */
export class RaidParticipant {
    public static deserialize(obj: object): RaidParticipant {
        return new RaidParticipant(obj["_userId"], obj["registeredAt"], obj["status"]);
    }

    constructor(private readonly _userId: Snowflake,
                public registeredAt: number,
                public status: ParticipationStatus) {}

    /**
     * The discord id of the participant.
     */
    public get userId() {
        return this._userId;
    }

    public render(): string {
        const mention = Util.toMention(this._userId);
        return this.status === "removed" ? `~~${mention}~~` : mention;
    }
}
