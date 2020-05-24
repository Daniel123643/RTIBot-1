import { Snowflake } from "discord.js";
import { Util } from "../../Util";
import moment = require("moment");

export type ParticipationStatus = "participating" | "reserve" | "removed";

/**
 * A player participating in a raid event
 */
export class RaidParticipant {
    public static deserialize(obj: object): RaidParticipant {
        return new RaidParticipant(obj["_userId"], obj["_registeredAt"], obj["status"]);
    }

    constructor(private readonly _userId: Snowflake,
                private readonly _registeredAt: number,
                public status: ParticipationStatus) {}

    /**
     * The discord id of the participant.
     */
    public get userId() {
        return this._userId;
    }

    /**
     * The time when the participant was first registered.
     */
    public get registeredAt(): moment.Moment {
        return moment(this._registeredAt);
    }

    public render(): string {
        const mention = Util.toMention(this._userId);
        return this.status === "removed" ? `~~${mention}~~` : mention;
    }
}
