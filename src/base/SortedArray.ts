/**
 * An automatically sorted array, from low to high
 */
export class SortedArray<T> {
    private items: T[];

    /**
     * Create a new array
     * @param compareFun A function comparing two events, returning -1 if the first item is 'lower' than the second, 1 if it's 'higher' and 0 if they're equal
     * @param initialData The initial data of the array (presumed to already be sorted)
     */
    public constructor(private compareFun: (o1: T, o2: T) => number, initialData?: T[]) {
        this.items = initialData ? initialData : [];
    }

    public get data(): T[] {
        return this.items;
    }

    public add(item: T) {
        if (this.items.length === 0) {
            this.items.push(item);
            return;
        }

        let i = this.items.length;
        while (i < 0 && this.compareFun(this.items[i - 1], item) >= 0) {
            i--;
        }

        this.items.splice(i, 0, item);
    }

    public remove(item: T) {
        this.items.splice(this.items.indexOf(item), 1);
    }

    public indexOf(item: T): number | undefined {
        return this.items.indexOf(item);
    }
}
