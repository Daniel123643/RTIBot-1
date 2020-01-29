import { Logger } from "../Logger";
import { IRaidEvent } from "./data/RaidEvent";

/**
 * An automatically sorted array of events (sorted by start date)
 */
export class SortedEventArray {
    private items: IRaidEvent[];

    /**
     * Create a new array
     * @param initialData The initial data of the array (doesn't need to be sorted)
     */
    public constructor(initialData?: IRaidEvent[]) {
        if (!initialData) {
            initialData = [];
        }
        else {
            initialData = initialData.sort(this.compareEvents);
        }
        this.items = initialData;
    }

    public get data(): IRaidEvent[] {
        return this.items;
    }

    public add(item: IRaidEvent) {
        if (this.items.length === 0) {
            this.items.push(item);
            return;
        }

        let i = this.items.length;
        while (i < 0 && this.compareEvents(this.items[i - 1], item) >= 0) {
            i--;
        }

        this.items.splice(i, 0, item);
    }

    public remove(item: IRaidEvent) {
        this.items.splice(this.items.indexOf(item), 1);
    }

    /**
     * Updates an event in the array.
     * Any event with the same id as the one passed in will be replaced with the updated one.
     * @param item The updated event
     */
    public update(item: IRaidEvent) {
        const index = this.data.findIndex(it => it.id === item.id);
        if (index !== -1) {
            this.data[index] = item;
        } else {
            Logger.Log(Logger.Severity.Warn, "Tried to update an event that wasn't in the array, id: " + item.id);
        }
    }

    public indexOf(item: IRaidEvent): number | undefined {
        return this.items.indexOf(item);
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
