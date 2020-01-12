import { Client } from "discord.js";
import { IConfig } from "./Config";

function main() {
    console.log("Hello, world!");
    const client = new Client();
    client.once("ready", () => {
        console.log("Ready");
    });
    const config: IConfig = require("../Config.json");
    client.login(config.apiKey);
}

main();
