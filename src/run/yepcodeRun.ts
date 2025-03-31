import crypto from "crypto";
import { YepCodeApi, YepCodeApiError, YepCodeApiManager } from "../api";
import { Execution } from "./execution";
import { YepCodeApiConfig } from "../api/types";
import { RunOpts, ExecutionError, Log } from "../types";
import { LanguageDetector } from "../utils/languageDetector";

export class YepCodeRun {
  private yepCodeApi: YepCodeApi;
  private PROCESS_NAME_PREFIX: string;

  constructor(config: YepCodeApiConfig = {}) {
    this.yepCodeApi = YepCodeApiManager.getInstance(config);
    this.PROCESS_NAME_PREFIX = "yepcode-run-";
  }

  getClientId(): string {
    return this.yepCodeApi.getClientId();
  }

  private _getProcessSlug(hash: string): string {
    return `${this.PROCESS_NAME_PREFIX}${hash}`;
  }

  private async createProcess({
    code,
    language,
    manifest,
  }: {
    language: string;
    code: string;
    manifest?: any;
  }): Promise<string> {
    if (!language || !code) {
      throw new Error("language and code are required");
    }

    const processSlug = this._getProcessSlug(
      crypto.createHash("sha256").update(code).digest("hex")
    );

    try {
      const existingProcess = await this.yepCodeApi.getProcess(processSlug);
      if (existingProcess) {
        return existingProcess.id;
      }
    } catch (error: any) {
      if (!(error instanceof YepCodeApiError) || error.status !== 404) {
        throw error;
      }
    }

    const process = await this.yepCodeApi.createProcess({
      name: processSlug,
      script: {
        programmingLanguage: language.toUpperCase(),
        sourceCode: code,
      },
      ...(manifest
        ? { manifest }
        : {
            settings: {
              dependencies: {
                scopedToProcess: true,
                autoDetect: true,
              },
            },
          }),
    });
    return process.id;
  }

  async run(code: string, options: RunOpts = {}): Promise<Execution> {
    const {
      language = LanguageDetector.detectLanguage(code),
      removeOnDone = false,
      manifest,
      parameters = {},
      onLog = (logEntry: Log) => {
        console.log(
          `${logEntry.timestamp} ${logEntry.level}: ${logEntry.message}`
        );
      },
      onFinish = (returnValue: any) => {
        console.log("Execution finished with return value:", returnValue);
      },
      onError = (error: ExecutionError) => {
        console.error("Execution failed with error:", error);
      },
      ...restOptions
    } = options;

    if (language === "unknown") {
      throw new Error(
        "We can't guess the language. Please specify it using the `language` option."
      );
    }

    const processId = await this.createProcess({
      language,
      code,
      manifest,
    });

    const { executionId } = await this.yepCodeApi.executeProcessAsync(
      processId,
      parameters,
      restOptions
    );

    let wrappedOnFinish = onFinish;
    let wrappedOnError = onError;
    if (removeOnDone) {
      wrappedOnFinish = (returnValue: any) => {
        this.yepCodeApi.deleteProcess(processId);
        onFinish(returnValue);
      };
      wrappedOnError = (error: ExecutionError) => {
        this.yepCodeApi.deleteProcess(processId);
        onError(error);
      };
    }

    const execution = new Execution({
      yepCodeApi: this.yepCodeApi,
      executionId,
      events: {
        onLog,
        onFinish: wrappedOnFinish,
        onError: wrappedOnError,
      },
    });
    await execution.init();
    return execution;
  }

  async getExecution(executionId: string): Promise<Execution> {
    if (!executionId) {
      throw new Error("executionId is required");
    }

    const execution = new Execution({
      yepCodeApi: this.yepCodeApi,
      executionId,
    });
    await execution.init();
    return execution;
  }
}
