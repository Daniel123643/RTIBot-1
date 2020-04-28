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

    /**
     * Add the given raid channel to the array
     * @param channel The channel to add
     */
    public add(channel: RaidEventChannel) {
        this.items.push(channel);
        this.items = this.items.sort((ch1, ch2) => this.compareEvents(ch1.event, ch2.event));
    }

    /**
     * Remove the given raid channel from the array
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

    private compareEvents(ev1: RaidEvent, ev2: RaidEvent): number {
        if (!ev1.startTime.isSame(ev2.startTime)) {
            return ev1.startTime.isBefore(ev2.startTime) ? -1 : 1;
        }
        if (!ev1.endTime.isSame(ev2.endTime)) {
            return ev1.endTime.isBefore(ev2.endTime) ? -1 : 1;
        }
        return -1;
    }
}
