import { TextChannel, GroupDMChannel, DMChannel, User, Message, Collection } from "discord.js";

// internal
interface IDialogData {
    groupId?: string;
    result: Promise<any>;
}

/**
 * Interacts with the user, and then returns some value.
 * Also ensures that conflicting dialogs aren't run at the same time.
 */
export abstract class UserDialog<T> {
    public static hasActiveDialog(user: User, channel: TextChannel | DMChannel | GroupDMChannel): boolean {
        return UserDialog.activeDialogs.get(user.id + channel.id) !== undefined;
    }

    private static readonly activeDialogs: Collection<string, IDialogData> = new Collection();

    private static getActiveDialog(user: User, channel: TextChannel | DMChannel | GroupDMChannel): IDialogData | undefined {
        return UserDialog.activeDialogs.get(user.id + channel.id);
    }

    /**
     * @param user The user to interact with
     * @param channel The channel to interact in
     * @param groupId An optional specifier for the _type_ of dialog it is. While this dialog is running,
     *                      running another one with the same group id will cause that dialog to fail automatically
     */
    public constructor(protected readonly user: User,
                       protected readonly channel: TextChannel | GroupDMChannel | DMChannel,
                       private readonly groupId?: string) { }

    /**
     * Runs the dialog and eventually returns some value.
     * Running this dialog for a user and channel where another dialog is running while cause this dialog to wait for the other to finish.
     */
    public async run(): Promise<T> {
        const activeDialog = UserDialog.getActiveDialog(this.user, this.channel);
        if (activeDialog) {
            if (this.groupId && this.groupId === activeDialog.groupId) { return Promise.reject(); }
            return activeDialog.result.then(_ => this.run(), _ => this.run());
        }
        const prm = this.doExecute();
        UserDialog.activeDialogs.set(this.user.id + this.channel.id, { groupId: this.groupId, result: prm });
        const onFinish = (val: T) => {
            UserDialog.activeDialogs.delete(this.user.id + this.channel.id);
            return val;
        };
        return prm.then(onFinish, onFinish);
    }

    protected say(msg: any): Promise<Message | Message[]> {
        return this.channel.send((`${this.user}, ${msg}`));
    }

    protected abstract async doExecute(): Promise<T>;
}
