import { RaidScheduleView } from "../RaidScheduleView";
import { Guild } from "discord.js";
import { Util } from "../../Util";
import { Logger } from "../../Logger";
import { IDataStore } from "../../base/data_store/DataStore";

/**
 * Stores and loads raid schedule views for a guild on disk.
 */
export class RaidScheduleViewStore {
    private static readonly RECORD_NAME = "schedules";

    public constructor(private dataStore: IDataStore, private guild: Guild) { }

    /**
     * Save all schedule view to the disk.
     * @param scheduleViews The schedules to save
     */
    public saveScheduleViews(scheduleViews: RaidScheduleView[]) {
        const obj = scheduleViews.map(view => view.toObj());
        return this.dataStore.write(RaidScheduleViewStore.RECORD_NAME, obj);
    }

    /**
     * Load all saved schedule view for the guild.
     */
    public async loadScheduleViews() {
        const savedData = await this.dataStore.read(RaidScheduleViewStore.RECORD_NAME);
        const promises = (savedData as object[]).map(msgData => {
            return RaidScheduleView.fromObj(this.guild, msgData);
        });
        let results = await Util.allSettled(promises);
        results = results.filter(res => {
            if (!res.successful) { Logger.Log(Logger.Severity.Warn, "Unable to load saved schedule: " + res.error); }
            return res.successful;
        });
        Logger.Log(Logger.Severity.Info, `Loaded ${results.length} schedules for ${this.guild.name}.`);
        return results.map(res => res.value!);
    }
}
