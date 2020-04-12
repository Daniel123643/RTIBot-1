import { Guild, Collection } from "discord.js";
import { IDataStore } from "../../base/data_store/DataStore";
import { IRaidComposition } from "./RaidComposition";
import { RaidCompositionStore } from "./RaidCompositionStore";
import { Logger } from "../../Logger";

/**
 * Manages raid compositions created in a guild.
 * These can be used to create raid events.
 */
export class RaidCompositionService {
    /**
     * Creates a new instance, trying to load saved state from the provided store
     */
    public static async loadFrom(guild: Guild, dataStore: IDataStore): Promise<RaidCompositionService> {
        const compStore = new RaidCompositionStore(dataStore, guild);
        let compositions: IRaidComposition[] | undefined;
        try {
            compositions = await compStore.loadCompositions();
        } catch { }
        return new RaidCompositionService(compStore, compositions);
    }

    private readonly raidCompositions: Collection<string, IRaidComposition>;

    constructor(private readonly compositionStore: RaidCompositionStore, initialCompositions?: IRaidComposition[]) {
        this.raidCompositions = new Collection();
        if (initialCompositions) {
            initialCompositions.forEach(comp => {
                this.raidCompositions.set(comp.name.toLowerCase(), comp);
            });
        }
    }

    /**
     * Gets the composition with the given name, if any
     */
    public getRaidComposition(name: string): IRaidComposition | undefined {
        return this.raidCompositions.get(name.toLowerCase());
    }

    /**
     * Gets all compositions
     */
    public getAllRaidCompositions(): IRaidComposition[] {
        return this.raidCompositions.array();
    }

    /**
     * Adds a new composition
     */
    public addRaidComposition(comp: IRaidComposition) {
        if (this.raidCompositions.has(comp.name.toLowerCase())) {
            Logger.Log(Logger.Severity.Warn, `Overwriting composition with name '${comp.name}'.`);
        }
        this.raidCompositions.set(comp.name.toLowerCase(), comp);
        this.saveData();
    }

    /**
     * Removes a raid composition
     */
    public removeRaidComposition(name: string) {
        this.raidCompositions.delete(name.toLowerCase());
    }

    private saveData() {
        this.compositionStore.saveCompositions(this.raidCompositions.array());
    }
}
