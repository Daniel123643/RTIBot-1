import { Argument, ArgumentType, CommandoMessage } from "discord.js-commando";
import { RaidRole } from "./raids/RaidEvent";

/**
 * A command argument specifying a set of raid roles
 */
export class RaidRolesArgumentType extends ArgumentType {
    public parse(val: string, msg: CommandoMessage, arg: Argument): RaidRole[] {
        // format: name:quant, name:quant, ...
        const roles = val.split(",");
        return roles.map(role => {
            const fields = role.split(":").map(f => f.trim());
            return {
                name: fields[0],
                participants: [],
                reqQuantity: Number(fields[1]),
            };
        });
    }

    public validate(val: string, msg: CommandoMessage, arg: Argument): boolean {
        const rolesRaw = val.split(",");
        let valid = true;
        rolesRaw.map(role => {
            const fields = role.split(":").map(f => f.trim());
            if (fields.length !== 2 || isNaN(Number(fields[1]))) { valid = false; }
            return fields;
        });
        return valid;
    }
}
