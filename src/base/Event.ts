export class Event<T> {
    private handlers: Array<((data: T) => void)> = [];

    public attach(handler: (data: T) => void) {
        if (!this.handlers.includes(handler)) {
            this.handlers.push(handler);
        }
    }

    public detach(handler: (data: T) => void) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public trigger(data: T) {
        this.handlers.forEach(handler => {
            handler(data);
        });
    }
}
