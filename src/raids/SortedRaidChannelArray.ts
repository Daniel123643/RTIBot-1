import { RaidEvent } from "./data/RaidEvent";
import { RaidEventChannel } from "./RaidEventChannel";

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
    public removeByEvent(event: RaidEvent): RaidEventChannel | undefined {
        const rChan = this.data.find(chan => chan.event === event);
        if (rChan) {
            this.items.splice(this.items.indexOf(rChan), 1);
        }
        return rChan;
    }

    public prospectiveIndexOf(event: RaidEvent): number {
        if (this.items.length === 0) {
            return 0;
        }

        let i = this.items.length;
        while (i > 0 && this.compareEvents(this.items[i - 1].event, event) >= 0) {
            i--;
        }
        return i;
    }

    private compareEvents(ev1: RaidEvent, ev2: RaidEvent): number {
        if (ev1.startTime.isSame(ev2.startTime)) {
            return ev1.startTime.isBefore(ev2.startTime) ? -1 : 1;
        }
        if (ev1.endTime.isSame(ev2.endTime)) {
            return ev1.endTime.isBefore(ev2.endTime) ? -1 : 1;
        }
        return -1;
    }
}
