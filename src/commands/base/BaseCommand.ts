import { CommandMessage, Command } from "discord.js-commando";

export abstract class BaseCommand extends Command {

    protected onSuccess(message: CommandMessage) {
        message.react("✅");
        return Promise.resolve([]);
    }

    protected onFail(message: CommandMessage, response: string) {
        message.react("❌");
        return message.reply(response);
    }
}
