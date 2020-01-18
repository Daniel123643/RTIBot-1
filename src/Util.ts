export namespace Util {
    /**
     * Converts a string to a valid text channel name, e.g. "Hello, world!" becomes "hello-world"
     * @param str The string to convert
     */
    export function toTextChannelName(str: string) {
        str = str.trim();
        str = str.toLowerCase();
        str = str.replace(/\s+/, "-");
        str = str.replace(/[^a-z0-9-]/, "");
        return str;
    }
}