import { ParticipationStatus, RaidParticipant } from "./RaidParticipant";
import moment = require("moment");
import { IRaidComposition } from "../compositions/RaidComposition";
import { User } from "discord.js";

/**
 * A role in a raid (e.g. healer)
 */
export class RaidRole {
    public static deserialize(obj: object): RaidRole {
        const participants = obj["_participants"].map(pObj => RaidParticipant.deserialize(pObj));
        return new RaidRole(obj["_name"], obj["_requiredParticipants"], participants);
    }

    public static fromRaidComposition(comp: IRaidComposition): RaidRole[] {
        return comp.roles.map(role => {
            return new RaidRole(
                role.name,
                role.reqParticipants,
                []);
        });
    }

    /**
     * Create a new role.
     * @param _name The name of the role
     * @param _requiredParticipants The required number of participants taking this role
     * @param _participants The players taking this role
     */
    private constructor(private readonly _name: string,
                        private readonly _requiredParticipants: number,
                        private _participants: RaidParticipant[]) {}

    public get name() {
        return this._name;
    }

    public get participants() {
        return this._participants;
    }

    /**
     * Gets the number of participants needed for this role.
     */
    public get numRequiredParticipants(): number {
        return this._requiredParticipants;
    }

    /**
     * Gets the number of active participants registered to this role, e.g. participants
     * with status "participating"
     */
    public get numActiveParticipants(): number {
        return this._participants.filter(p => p.status === "participating").length;
    }

    /**
     * Gets all participants with a given status, sorted by registration time.
     */
    public getParticipantsByStatus(status: ParticipationStatus): RaidParticipant[] {
        const filtered = this._participants.filter(participant => participant.status === status);
        return filtered.sort((p1, p2) => {
            if (p1.status !== p2.status) {
                return p1.status === "participating" ? -1 : 1;
            }
            return p1.registeredAt < p2.registeredAt ? -1 : 1;
        });
    }

    /**
     * Creates a participant from the given user and sets its status.
     * If the user is already a participant, just sets its status.
     */
    public createOrUpdateParticipant(user: User, status: ParticipationStatus) {
        const participant = this._participants.find(p => p.userId === user.id);
        if (participant) {
            participant.status = status;
            participant.registeredAt = moment().unix();
        } else {
            this._participants.push(new RaidParticipant(
                user.id,
                moment().unix(),
                status));
        }
    }

    /**
     * Completely clears/removes a user/participant from this role.
     */
    public clearRegistration(user: User) {
        const i = this._participants.findIndex(part => part.userId === user.id);
        if (i > -1) { this._participants.splice(i, 1); }
    }

    /**
     * Completely clears/removes all participants from this role.
     */
    public clearAll() {
        this._participants = [];
    }
}
