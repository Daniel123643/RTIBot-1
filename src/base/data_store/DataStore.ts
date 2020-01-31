
/**
 * Stores and loads objects between restarts.
 */
export interface IDataStore {

    /**
     * Write an object to a record.
     * @param recordName The name of the record, used to later read it
     * @param toSave The object to write
     */
    write(recordName: string, toSave: any): Promise<void>;

    /**
     * Append an object to a record. Note that appending might break the record, and is mostly meant for data dumping.
     * @param recordName The name of the record.
     * @param toSave The object to append.
     */
    append(recordName: string, toSave: any): Promise<void>;

    /**
     * Reads a previously saved record.
     * @param recordName The name of the record to read
     */
    read(recordName: string): Promise<any>;
}
