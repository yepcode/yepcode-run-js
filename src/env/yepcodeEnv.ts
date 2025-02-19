import {
  YepCodeApiManager,
  YepCodeApi,
  YepCodeApiConfig,
  TeamVariable,
} from "../api";
import { EnvVar } from "../types";

export class YepCodeEnv {
  private yepCodeApi: YepCodeApi;

  constructor(config: YepCodeApiConfig = {}) {
    this.yepCodeApi = YepCodeApiManager.getInstance(config);
  }

  private async _getVariable(key: string): Promise<TeamVariable | undefined> {
    const variables = await this._getVariables();
    return variables.find((v) => v.key === key);
  }

  private async _getVariables(): Promise<TeamVariable[]> {
    let page = 0;
    const limit = 100;
    let allVariables: TeamVariable[] = [];

    while (true) {
      const { hasNextPage, data: variables } =
        await this.yepCodeApi.getVariables({
          page,
          limit,
        });

      if (variables) {
        allVariables = allVariables.concat(variables);
      }

      if (!hasNextPage) {
        break;
      }

      page++;
    }

    return allVariables
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(({ id, key, value, isSensitive }) => ({
        id,
        key,
        value,
        isSensitive,
      }));
  }

  async getEnvVars(): Promise<EnvVar[]> {
    const variables = await this._getVariables();
    return variables.map(({ key, value }) => ({
      key,
      value,
    }));
  }

  async setEnvVar(
    key: string,
    value: string,
    isSensitive: boolean = true
  ): Promise<void> {
    const existingVar = await this._getVariable(key);

    if (existingVar) {
      await this.yepCodeApi.updateVariable(existingVar.id, {
        key,
        value,
      });
    } else {
      await this.yepCodeApi.createVariable({ key, value, isSensitive });
    }
  }

  async delEnvVar(key: string): Promise<void> {
    const existingVar = await this._getVariable(key);

    if (existingVar) {
      await this.yepCodeApi.deleteVariable(existingVar.id);
    }
  }
}
