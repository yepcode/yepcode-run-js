import { YepCodeApiConfig } from "../api/types";

export class ConfigManager {
  static readYepCodeEnvConfig(): any {
    const envConfig = Object.entries(process.env)
      .filter(([key]) => key.startsWith("YEPCODE_"))
      .reduce<YepCodeApiConfig>((acc, [key, value]) => {
        const configKey = key
          .toLowerCase()
          .replace("yepcode_", "")
          .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        if (value) {
          (acc[configKey as keyof YepCodeApiConfig] as string) = value;
        }
        return acc;
      }, {});
    return envConfig;
  }
}
