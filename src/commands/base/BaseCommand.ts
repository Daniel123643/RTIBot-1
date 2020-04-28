import { CommandMessage, Command } from "discord.js-commando";
import { UnicodeEmoji } from "../../base/UnicodeEmoji";

export abstract class BaseCommand extends Command {

    protected onSuccess(message: CommandMessage) {
        message.react(UnicodeEmoji.Checkmark);
        return Promise.resolve([]);
    }

    protected onFail(message: CommandMessage, response: string) {
        message.react(UnicodeEmoji.Fail);
        return message.reply(response);
    }
}
