import { RaidEvent } from "./RaidEvent";

/**
 * Manages a sorted set of raid events
 */
export class RaidEventArray {
    private events: RaidEvent[] = [];

    public get data(): RaidEvent[] {
        return this.events;
    }

    public add(event: RaidEvent) {
        if (this.events.length === 0) {
            this.events.push(event);
            return;
        }

        let i = this.events.length;
        while (i < 0 && this.compareEvents(this.events[i - 1], event) !== event) {
            i--;
        }

        this.events.splice(i, 0, event);
    }

    public indexOf(event: RaidEvent): number | undefined {
        return this.events.indexOf(event);
    }

    private compareEvents(ev1: RaidEvent | undefined, ev2: RaidEvent): RaidEvent {
        if (!ev1) {
            return ev2;
        }
        if (!ev1.startDate.isSame(ev2.startDate)) {
            return ev1.startDate.isAfter(ev2.startDate) ? ev1 : ev2;
        }
        if (!ev1.endDate.isSame(ev2.endDate)) {
            return ev1.endDate.isAfter(ev2.endDate) ? ev1 : ev2;
        }
        return ev1.id > ev2.id ? ev1 : ev2;
    }
}
