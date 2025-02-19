import { YepCodeApi } from "./yepcodeApi";
import { ConfigManager } from "../utils/configManager";
import { YepCodeApiConfig } from "./types";
import crypto from "crypto";

export class YepCodeApiManager {
  private static instances = new Map<string, YepCodeApi>();

  private static _getConfigHash(config: YepCodeApiConfig): string {
    const sortedConfig = Object.keys(config)
      .sort()
      .reduce<Record<string, any>>((obj, key) => {
        obj[key] = config[key as keyof YepCodeApiConfig];
        return obj;
      }, {});

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(sortedConfig))
      .digest("hex");
  }

  static getInstance(config: YepCodeApiConfig = {}): YepCodeApi {
    const mergedConfig = { ...ConfigManager.readYepCodeEnvConfig(), ...config };
    const configHash = this._getConfigHash(mergedConfig);

    if (!this.instances.has(configHash)) {
      this.instances.set(configHash, new YepCodeApi(mergedConfig));
    }

    return this.instances.get(configHash)!;
  }

  static clearInstances(): void {
    this.instances.clear();
  }
}
