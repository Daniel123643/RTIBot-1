import { DMChannel, TextChannel } from "discord.js";
import { RaidEvent } from "./RaidEvent";
import { RaidEventController } from "./RaidEventController";

export class RaidEventChannel {
    public static async createInChannel(channel: TextChannel | DMChannel, event: RaidEvent) {
        const controller = await RaidEventController.createInChannel(channel, event);
        controller.message.pin();
        return new RaidEventChannel(channel, controller);
    }

    private constructor(private channel: TextChannel | DMChannel,
                        private eventController: RaidEventController) {
        // TODO: set permissions?
    }
}
