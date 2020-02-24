import { User, Snowflake } from "discord.js";
import { RaidRole } from "./RaidRole";
import { RaidParticipant } from "./RaidParticipant";
import moment = require("moment");
import { RaidEventLog } from "./RaidEventLog";

/**
 * A raid schedule event
 */
export class RaidEvent {
    public static deserialize(obj: object): RaidEvent {
        const roles = obj["_roles"].map(roleObj => RaidRole.deserialize(roleObj));
        const log = RaidEventLog.deserialize(obj["_log"]);
        return new RaidEvent(obj["_startTime"], obj["_endTime"], obj["_name"], obj["_description"], obj["_leaderId"], roles, log);
    }

    private _log: RaidEventLog;
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
                private _roles: RaidRole[],
                private log?: RaidEventLog) {
        this._log = log ? log : new RaidEventLog();
        if (!log) { // this is a newly created event, not deserialized
            this._log.addEntryCreated(this._leaderId);
        }
    }

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
        return moment.unix(this._startTime);
    }
    public get endTime(): moment.Moment {
        return moment.unix(this._endTime);
    }

    public get logEntries(): string[] {
        return this._log.formattedEntries;
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
        this._log.addEntryRegistered(user.id, role.name);
    }

    /**
     * Remove any registration to this event for a user.
     */
    public unregister(user: User) {
        this._roles.forEach(role => {
            if (role.unregister(user)) {
                this._log.addEntryUnregistered(user.id, role.name);
            }
        });
    }

    /**
     * Clear all participants completely
     */
    public clearParticipants() {
        this.roles.forEach(role => {
            role.clearAll();
        });
    }
}
