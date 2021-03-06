import { unix } from "moment";
import { Snowflake } from "discord.js";
import moment = require("moment");
import { Util } from "../../Util";

enum LogEntryType {
    CREATED,
    CLEARED,
    REGISTERED,
    MOVED,
    UNREGISTERED,
    KICKED,
}

type LogEntry = [number, LogEntryType, any];

/**
 * Keeps track of changes made to a raid event
 */
export class RaidEventLog {
    public static deserialize(obj: object): RaidEventLog {
        return new RaidEventLog(obj["entries"]);
    }

    private static readonly RESERVE_SUFFIX = " (reserve)";


    private readonly entries: LogEntry[];

    public constructor(entries?: LogEntry[]) {
        this.entries = entries ? entries : [];
    }

    public get formattedEntries(): string[] {
        return this.entries.map(entry => this.formatEntry(entry));
    }

    public addEntryCreated(creator: Snowflake) {
        this.entries.push([moment().unix(), LogEntryType.CREATED, creator]);
    }
    public addEntryCleared(issuer: Snowflake) {
        this.entries.push([moment().unix(), LogEntryType.CLEARED, issuer]);
    }
    public addEntryRegistered(user: Snowflake, roleName: string, isReserve: boolean) {
        this.entries.push([moment().unix(), LogEntryType.REGISTERED, { user, roleName, isReserve }]);
    }
    public addEntryMoved(user: Snowflake, roleName: string, isReserve: boolean) {
        this.entries.push([moment().unix(), LogEntryType.MOVED, { user, roleName, isReserve }]);
    }
    public addEntryUnregistered(user: Snowflake, roleName: string, isReserve: boolean) {
        this.entries.push([moment().unix(), LogEntryType.UNREGISTERED, { user, roleName, isReserve }]);
    }
    public addEntryKicked(kicked: Snowflake, issuer: Snowflake) {
        this.entries.push([moment().unix(), LogEntryType.KICKED, { kicked, issuer }]);
    }

    private formatEntry([time, type, data]: LogEntry): string {
        const timestamp = unix(time).format("DD/MM HH:mm");
        let entryString: string;
        switch (type) {
            case LogEntryType.CREATED:
                entryString = `Raid *created* by ${Util.toMention(data)}`;
                break;
            case LogEntryType.CLEARED:
                entryString = `All registrations *cleared* by ${Util.toMention(data)}`;
                break;
            case LogEntryType.REGISTERED:
                entryString = `${Util.toMention(data["user"])} *registered* as ${data["roleName"]}`;
                if (data["isReserve"]) { entryString += RaidEventLog.RESERVE_SUFFIX; }
                break;
            case LogEntryType.MOVED:
                entryString = `${Util.toMention(data["user"])} *changed* role to ${data["roleName"]}`;
                if (data["isReserve"]) { entryString += RaidEventLog.RESERVE_SUFFIX; }
                break;
            case LogEntryType.UNREGISTERED:
                entryString = `${Util.toMention(data["user"])} *unregistered* from ${data["roleName"]}`;
                if (data["isReserve"]) { entryString += RaidEventLog.RESERVE_SUFFIX; }
                break;
            case LogEntryType.KICKED:
                entryString = `${Util.toMention(data["kicked"])} *kicked* from the raid by ${Util.toMention(data["issuer"])}`;
                break;
            default:
                entryString = "Unrecognized log entry";
                break;
        }

        return `[${timestamp}] ${entryString}`;
    }
}
