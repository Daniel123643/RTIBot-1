import { Argument, ArgumentType, CommandMessage } from "discord.js-commando";
import { ParsedRaidRole, RaidRolesParser } from "../raids/RaidRolesParser";

/**
 * A command argument specifying a set of raid roles
 */
export class RaidRolesArgumentType extends ArgumentType {
    public parse(val: string, msg: CommandMessage, arg: Argument): ParsedRaidRole {
        return RaidRolesParser.parse(val);
    }

    public validate(val: string, msg: CommandMessage, arg: Argument): boolean {
        return RaidRolesParser.validate(val);
    }
}
