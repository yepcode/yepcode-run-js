import { YepCodeApi } from "../api/yepcodeApi";
import { ExecutionStatus, Log, ExecutionEvents, TimelineEvent } from "../types";

export class Execution {
  private yepCodeApi: YepCodeApi;
  public executionId: string;
  private events?: ExecutionEvents;

  private isPolling: boolean = true;
  private pollAttempts: number = 0;
  private pollPromise?: Promise<void>;

  public logs: Log[] = [];
  public processId?: string;
  public status?: ExecutionStatus;
  public returnValue?: any;
  public error?: string;
  public timeline?: TimelineEvent[];
  public parameters?: any;
  public comment?: string;

  private donePromise?: Promise<void>;
  private doneResolve?: () => void;

  private lastLogPoll: number = 0;
  private readonly LOG_POLL_INTERVAL: number = 2000; // Poll logs every 2 seconds

  constructor({
    yepCodeApi,
    executionId,
    events,
  }: {
    yepCodeApi: YepCodeApi;
    executionId: string;
    events?: ExecutionEvents;
  }) {
    this.yepCodeApi = yepCodeApi;
    this.executionId = executionId;
    this.events = events;
    this.donePromise = new Promise((resolve) => {
      this.doneResolve = resolve;
    });
    this.pollPromise = this._poll();
  }

  private _isDone(status?: ExecutionStatus): boolean {
    return status !== "CREATED" && status !== "RUNNING";
  }

  private _isFailed(status?: ExecutionStatus): boolean {
    return status === "ERROR" || status === "KILLED" || status === "REJECTED";
  }

  async _fetchLogs(): Promise<Log[]> {
    let page = 0;
    const limit = 100;
    let logs: Log[] = [];

    while (true) {
      const { hasNextPage, data: logEntries } =
        await this.yepCodeApi.getExecutionLogs(this.executionId, {
          page,
          limit,
        });

      logs = logs.concat(logEntries?.map((log) => ({ ...log })) ?? []);

      if (!hasNextPage) {
        break;
      }

      page++;
    }

    logs = logs.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return logs;
  }

  async isDone(): Promise<boolean> {
    if (this.isPolling && this.pollPromise) {
      await this.pollPromise;
    }
    return this._isDone(this.status);
  }

  async waitForDone(): Promise<void> {
    return this.donePromise;
  }

  private _getPollingInterval(): number {
    if (this.pollAttempts < 4) {
      return 250;
    } else if (this.pollAttempts < 12) {
      return 500;
    }
    return 1000;
  }

  private async _pollLogs(): Promise<void> {
    const currentLogs = await this._fetchLogs();
    currentLogs.forEach((log) => {
      if (!this.logs.find((l) => l.timestamp === log.timestamp)) {
        this.logs.push(log);
        this.events?.onLog?.(log);
      }
    });
  }

  private async _poll(): Promise<void> {
    this.isPolling = true;
    this.pollPromise = (async () => {
      const executionData = await this.yepCodeApi.getExecution(
        this.executionId
      );
      this.processId = executionData.processId;
      this.status = executionData.status;
      this.timeline = executionData.timeline?.events?.map((e) => ({
        ...e,
      }));
      this.parameters = executionData.parameters;
      this.comment = executionData.comment;

      // Only fetch logs if enough time has passed or if the execution is done
      let logsFetched = false;
      const now = Date.now();
      if (
        now - this.lastLogPoll >= this.LOG_POLL_INTERVAL ||
        this._isDone(this.status)
      ) {
        await this._pollLogs();
        this.lastLogPoll = now;
        logsFetched = true;
      }

      if (!this._isDone(this.status)) {
        this.pollAttempts++;
        setTimeout(this._poll.bind(this), this._getPollingInterval());
        this.isPolling = false;
        return;
      }

      if (!logsFetched) {
        await this._pollLogs();
      }

      if (executionData.returnValue) {
        try {
          this.returnValue = JSON.parse(executionData.returnValue);
        } catch (error) {
          this.returnValue = executionData.returnValue;
        }
      }

      if (this._isFailed(this.status)) {
        this.error = this.timeline?.find(
          (e) => e.status === this.status
        )?.explanation;
        if (!this.error) {
          this.error = this.logs
            .filter((log) => log.level === "ERROR")
            .pop()?.message;
        }
        this.events?.onError?.({ message: this.error });
      } else {
        this.events?.onFinish?.(this.returnValue);
      }

      this.isPolling = false;
      this.doneResolve?.();
    })();

    await this.pollPromise;
  }

  async kill(): Promise<void> {
    try {
      await this.yepCodeApi.killExecution(this.executionId);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Execution not found for id: ${this.executionId}`);
      }
      throw error;
    }
  }

  async rerun(): Promise<Execution> {
    try {
      const executionId = await this.yepCodeApi.rerunExecution(
        this.executionId
      );
      return new Execution({
        yepCodeApi: this.yepCodeApi,
        executionId,
        events: this.events,
      });
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Execution not found for id: ${this.executionId}`);
      }
      throw error;
    }
  }
}
