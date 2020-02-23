import { User, Snowflake } from "discord.js";
import { RaidRole } from "./RaidRole";
import { RaidParticipant } from "./RaidParticipant";
import moment = require("moment");
import { IRaidComposition } from "../compositions/RaidComposition";

/**
 * A raid schedule event
 */
export class RaidEvent {
    public static deserialize(obj: object): RaidEvent {
        const roles = obj["_roles"].map(roleObj => RaidRole.deserialize(roleObj));
        return new RaidEvent(obj["_startDate"], obj["_endDate"], obj["_name"], obj["_description"], obj["_leaderId"], roles);
    }

    /**
     * Create a new raid event
     * @param _startTime Unix timestamp for the start time of the event
     * @param _endTime Unix timestamp for the end time of the event
     * @param _name Visible name of the raid
     * @param _description Visible description of the raid
     * @param _leaderId Discord id of the leader (creator) of the event
     * @param _roles All roles required for the event
     */
    // TODO: make private
    constructor(private _startTime: number,
                private _endTime: number,
                private _name: string,
                private _description: string,
                private _leaderId: Snowflake,
                private _roles: RaidRole[]) {}

    public get name() {
        return this._name;
    }
    public get description() {
        return this._description;
    }
    public get leaderId() {
        return this._leaderId;
    }
    public get roles() {
        return this._roles;
    }

    public get startTime(): moment.Moment {
        return moment(this._startTime);
    }
    public get endTime(): moment.Moment {
        return moment(this._endTime);
    }

    /**
     * Gets the total number of participants needed for the event.
     */
    public get numRequiredParticipants(): number {
        return this._roles.map(r => r.numRequiredParticipants).reduce((q, acc) => q + acc, 0);
    }

    /**
     * Gets the number of active participants registered to this event, e.g. participants
     * who have not been removed.
     */
    public get numActiveParticipants(): number {
        return this._roles.map(r => r.numActiveParticipants).reduce((q, acc) => q + acc, 0);
    }

    /**
     * Checks whether a user is registered to the event, and in that case
     * returns the status of their registration.
     */
    public getParticipationStatusOf(user: User): "participating" | "removed" | undefined {
        return this._roles.flatMap((role: RaidRole) => role.participantsSorted)
                          .find((part: RaidParticipant) => part.userId === user.id)
                          ?.status;
    }

    /**
     * Register a user to participate in this event as the given role.
     * @param user The user to register
     * @param role The role to register them for
     */
    public register(user: User, role: RaidRole) {
        this._roles.forEach(r => {
            r.clearRegistration(user);
        });
        role.register(user);
    }

    /**
     * Remove any registration to this event for a user.
     */
    public deregister(user: User) {
        this._roles.forEach(role => {
            role.deregister(user);
        });
    }
}
