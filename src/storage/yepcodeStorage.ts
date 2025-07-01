import { YepCodeApi } from "../api";
import { StorageObject, YepCodeApiConfig } from "../api/types";
import { Readable } from "stream";

export class YepCodeStorage {
  private api: YepCodeApi;

  constructor(config: YepCodeApiConfig = {}) {
    this.api = new YepCodeApi(config);
  }

  async upload(
    filename: string,
    file: File | Blob | Readable
  ): Promise<StorageObject> {
    return this.api.createObject({ name: filename, file });
  }

  async list(): Promise<StorageObject[]> {
    return this.api.getObjects();
  }

  async download(filename: string): Promise<Readable> {
    return this.api.getObject(filename);
  }

  async delete(filename: string): Promise<void> {
    await this.api.deleteObject(filename);
  }
}
