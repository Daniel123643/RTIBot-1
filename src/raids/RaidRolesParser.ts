export type ParsedRaidRole = Array<{ name: string, reqParticipants: number }>;

/**
 * Parses raid role strings into role names and number of required participants
 */
export namespace RaidRolesParser {
    export function parse(val: string): ParsedRaidRole {
        // format: name:quant, name:quant, ...
        const roles = val.split(",");
        return roles.map(role => {
            const fields = role.split(":").map(f => f.trim());
            return {
                name: fields[0],
                reqParticipants: Number(fields[1]),
            };
        });
    }

    export function validate(val: string): boolean {
        const rolesRaw = val.split(",");
        let valid = true;
        rolesRaw.forEach(role => {
            const fields = role.split(":").map(f => f.trim());
            if (fields.length !== 2 || isNaN(Number(fields[1]))) { valid = false; }
        });
        return valid;
    }
}
