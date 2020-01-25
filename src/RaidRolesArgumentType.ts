import { Argument, ArgumentType, CommandMessage } from "discord.js-commando";
import { RaidRole } from "./raids/RaidEvent";

/**
 * A command argument specifying a set of raid roles
 */
export class RaidRolesArgumentType extends ArgumentType {
    public parse(val: string, msg: CommandMessage, arg: Argument): RaidRole[] {
        // format: name:quant, name:quant, ...
        const roles = val.split(",");
        return roles.map(role => {
            const fields = role.split(":").map(f => f.trim());
            return new RaidRole(
                fields[0],
                Number(fields[1]),
                []);
        });
    }

    public validate(val: string, msg: CommandMessage, arg: Argument): boolean {
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
