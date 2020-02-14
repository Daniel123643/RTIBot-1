import { IDataStore } from "../../base/data_store/DataStore";
import { Guild } from "discord.js";
import { IRaidComposition } from "./RaidComposition";
import { Logger } from "../../Logger";

/**
 * Persists raid comps
 */
export class RaidCompositionStore {
    private static readonly RECORD_NAME = "compositions";

    public constructor(private dataStore: IDataStore, private guild: Guild) { }

    /**
     * Saves raid comps
     */
    public saveCompositions(compositions: IRaidComposition[]): Promise<void> {
        return this.dataStore.write(RaidCompositionStore.RECORD_NAME, compositions);
    }

    /**
     * Loads any previously saved raid comps
     */
    public async loadCompositions(): Promise<IRaidComposition[]> {
        const results: IRaidComposition[] = await this.dataStore.read(RaidCompositionStore.RECORD_NAME);
        Logger.Log(Logger.Severity.Info, `Loaded ${results.length} raid channels for ${this.guild.name}.`);
        return results;
    }

}
