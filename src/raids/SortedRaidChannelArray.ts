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
     * Removed the given raid channel from the array
     * @param event The channel to remove
     * @returns Whether something was removed
     */
    public remove(channel: RaidEventChannel): boolean {
        const index = this.items.indexOf(channel);
        if (index >= 0) {
            this.items.splice(index, 1);
        }
        return index >= 0;
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
