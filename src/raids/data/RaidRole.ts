import { RaidParticipant } from "./RaidParticipant";
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

    /**
     * Gets the number of participants needed for this role.
     */
    public get numRequiredParticipants(): number {
        return this._requiredParticipants;
    }

    /**
     * Gets the number of active participants registered to this role, e.g. participants
     * who have not been removed.
     */
    public get numActiveParticipants(): number {
        return this._participants.filter(p => p.status !== "removed").length;
    }

    /**
     * Gets all participants, sorted by registration time (with removed participants at the end).
     */
    public get participantsSorted(): RaidParticipant[] {
        return this._participants.sort((p1, p2) => {
            if (p1.status !== p2.status) {
                return p1.status === "participating" ? -1 : 1;
            }
            return p1.registeredAt.isBefore(p2.registeredAt) ? -1 : 1;
        });
    }

    /**
     * Deregisters a user from this role (sets their status to "removed"),
     * if the user is registered to it.
     * @returns Whether the user was registered to this role
     */
    public unregister(user: User): boolean {
        const participant = this._participants.find(p => p.userId === user.id);
        if (participant) {
            participant.status = "removed";
        }
        return participant !== undefined;
    }

    /**
     * Register a user to participate as this role.
     */
    public register(user: User) {
        this._participants.push(new RaidParticipant(
            user.id,
            moment().unix(),
            "participating"));
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
