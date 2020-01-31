import { PathLike, writeFile, readFile, exists, existsSync, mkdirSync } from "fs";
import * as path from "path";
import { Logger } from "../../Logger";
import AsyncLock = require("async-lock");
import { IDataStore } from "./DataStore";

/**
 * Stores and loads data to/from json files.
 */
export class JsonDataStore implements IDataStore {
    private lock: AsyncLock = new AsyncLock();
    constructor(private directory: PathLike) {
        if (!existsSync(directory)) {
            mkdirSync(directory);
        }
    }

    public async write(recordName: string, toSave: any): Promise<void> {
        return this.genericWrite(recordName, toSave, "w");
    }

    public async append(recordName: string, toSave: any): Promise<void> {
        return this.genericWrite(recordName, toSave, "a");
    }

    public async read(recordName: string): Promise<any> {
        const inFile = this.getFileName(recordName);
        return new Promise((resolve, reject) => {
            readFile(inFile, (err, data) => {
                if (err) {
                    Logger.Log(Logger.Severity.Warn, "Error reading json file: " + err);
                    reject(err);
                } else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    }

    private getFileName(basename: string): string {
        return path.join(this.directory.toString(), basename + ".json");
    }

    private genericWrite(basename: string, obj: any, flag: string): Promise<void> {
            return this.lock.acquire("write", () => {
                const outFile = this.getFileName(basename);
                const json = JSON.stringify(obj);
                writeFile(outFile, json + "\n", { flag }, (err) => {
                    if (err) {
                        Logger.Log(Logger.Severity.Error, "Error writing json file: " + err);
                        throw err;
                    }
                });
            });
    }
}
