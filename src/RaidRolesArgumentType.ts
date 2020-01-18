import { Argument, ArgumentType, CommandMessage } from "discord.js-commando";
import { RaidRole } from "./raids/RaidEvent";

/**
 * A command argument specifying a set of raid roles
 */
export class RaidRolesArgumentType extends ArgumentType {
    public parse(val: string, msg: CommandMessage, arg: Argument): RaidRole[] {
        // format: name:emoji:quant, name:emoji:quant, ...
        const roles = val.split(",");
        return roles.map(role => {
            const fields = role.split(":").map(f => f.trim());
            return {
                emojiName: fields[1],
                name: fields[0],
                participants: [],
                reqQuantity: Number(fields[2]),
            };
        });
    }

    public validate(val: string, msg: CommandMessage, arg: Argument): boolean {
        const rolesRaw = val.split(",");
        let valid = true;
        rolesRaw.map(role => {
            const fields = role.split(":").map(f => f.trim());
            if (fields.length !== 3 || isNaN(Number(fields[2]))) { valid = false; }
            return fields;
        });
        return valid;
    }
}
