import { DMChannel, GroupDMChannel, TextChannel } from "discord.js";
import { IRaidEvent } from "./data/RaidEvent";
import { RaidEventView } from "./RaidEventView";

export class RaidEventChannel {
    public static async createInChannel(channel: TextChannel | DMChannel | GroupDMChannel, event: IRaidEvent) {
        const controller = await RaidEventView.createInChannel(channel, event);
        controller.message.pin();
        return new RaidEventChannel(channel, controller);
    }

    private constructor(private _channel: TextChannel | DMChannel | GroupDMChannel,
                        private eventView: RaidEventView) {
        // TODO: set permissions?
    }

    public get channel(): TextChannel | DMChannel | GroupDMChannel {
        return this._channel;
    }

    public get view(): RaidEventView {
        return this.eventView;
    }
}
