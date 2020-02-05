import { Logger } from "../Logger";
import { IRaidEvent } from "./data/RaidEvent";
import { RaidEventChannel } from "./RaidEventChannel";
import { TextChannel } from "discord.js";

/**
 * An automatically sorted array of raid channels (sorted by event start date)
 */
export class SortedRaidChannelArray {
    private items: RaidEventChannel[];

    /**
     * Create a new array
     * @param initialData The initial data of the array (doesn't need to be sorted)
     */
    public constructor(initialData?: RaidEventChannel[]) {
        if (!initialData) {
            this.items = [];
        } else {
            this.items = initialData.sort((ch1, ch2) => this.compareEvents(ch1.event, ch2.event));
        }
    }

    public get data(): RaidEventChannel[] {
        return this.items;
    }

    public add(channel: RaidEventChannel) {
        const i = this.prospectiveIndexOf(channel.event);

        this.items.splice(i, 0, channel);
    }

    /**
     * Removed the raid channel owning a given event from the array
     * @param event The event for which to remove the channel
     * @returns The removed raid channel, if any
     */
    public removeByEvent(event: IRaidEvent): RaidEventChannel | undefined {
        const rChan = this.data.find(chan => chan.event === event);
        if (rChan) {
            this.items.splice(this.items.indexOf(rChan), 1);
        }
        return rChan;
    }

    public prospectiveIndexOf(event: IRaidEvent): number {
        if (this.items.length === 0) {
            return 0;
        }

        let i = this.items.length;
        while (i > 0 && this.compareEvents(this.items[i - 1].event, event) >= 0) {
            i--;
        }
        return i;
    }

    private compareEvents(ev1: IRaidEvent, ev2: IRaidEvent): number {
        if (ev1.startDate !== ev2.startDate) {
            return ev1.startDate < ev2.startDate ? -1 : 1;
        }
        if (ev1.endDate !== ev2.endDate) {
            return ev1.endDate < ev2.endDate ? -1 : 1;
        }
        return ev1.id < ev2.id ? -1 : 1;
    }
}
