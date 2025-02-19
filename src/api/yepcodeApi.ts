import {
  YepCodeApiConfig,
  Process,
  CreateProcessInput,
  UpdateProcessInput,
  ProcessesPaginatedResult,
  ExecutionsPaginatedResult,
  Execution,
  ExecutionLogsPaginatedResult,
  Schedule,
  ScheduledProcessInput,
  SchedulesPaginatedResult,
  TeamVariable,
  CreateTeamVariableInput,
  UpdateTeamVariableInput,
  TeamVariablesPaginatedResult,
} from "./types";

export class YepCodeApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "YepCodeApiError";
  }
}

export class YepCodeApi {
  private apiHost: string;
  private clientId?: string;
  private clientSecret?: string;
  private authUrl: string;
  private teamId?: string;
  private accessToken?: string;
  private timeout: number;

  constructor(config: YepCodeApiConfig = {}) {
    const finalConfig = {
      authUrl:
        "https://cloud.yepcode.io/auth/realms/yepcode/protocol/openid-connect/token",
      apiHost: "https://cloud.yepcode.io",
      timeout: 60000,
      ...config,
    };

    if (
      !finalConfig.accessToken &&
      !finalConfig.apiToken &&
      (!finalConfig.clientId || !finalConfig.clientSecret)
    ) {
      throw new Error(
        "Invalid configuration. Please provide either: accessToken, apiToken or clientId and clientSecret."
      );
    }

    if (finalConfig.apiToken) {
      try {
        const decodedToken = Buffer.from(
          finalConfig.apiToken,
          "base64"
        ).toString();
        const { clientId, clientSecret } = JSON.parse(decodedToken);
        if (!clientId || !clientSecret) {
          throw new Error();
        }
        finalConfig.clientId = clientId;
        finalConfig.clientSecret = clientSecret;
      } catch (error) {
        throw new Error("Invalid apiToken format: " + finalConfig.apiToken);
      }
    }

    this.apiHost = finalConfig.apiHost;
    this.clientId = finalConfig.clientId;
    this.clientSecret = finalConfig.clientSecret;
    this.authUrl = finalConfig.authUrl;
    this.teamId = finalConfig.teamId;
    this.accessToken = finalConfig.accessToken;
    this.timeout = finalConfig.timeout;
    this.initTeamIdByAccessToken();
  }

  private initTeamIdByAccessToken(): void {
    if (!this.accessToken) {
      return;
    }
    const [, payload] = this.accessToken.split(".");
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64").toString()
    );
    this.teamId =
      decodedPayload.groups &&
      decodedPayload.groups.filter((group: string) => group !== "sandbox")[0];

    if (!this.teamId) {
      throw new Error("No teamId found in the access token");
    }
  }

  private getBaseURL(): string {
    return `${this.apiHost}/api/${this.teamId}/rest`;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(this.authUrl, {
        method: "POST",
        headers: {
          authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.accessToken = data.access_token;
      if (!this.accessToken) {
        throw new Error("No access token received from server");
      }
      this.initTeamIdByAccessToken();
      return this.accessToken;
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: {
      headers?: Record<string, string>;
      data?: any;
      params?: Record<string, any>;
    } = {}
  ): Promise<T> {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    if (options.data) {
      fetchOptions.body = JSON.stringify(options.data);
    }

    const url = new URL(`${this.getBaseURL()}${endpoint}`);
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      await this.getAccessToken();
      return this.request(method, endpoint, options);
    }

    if (!response.ok) {
      throw new YepCodeApiError(
        `HTTP error in endpoint ${method} ${endpoint} status: ${response.status}`,
        response.status
      );
    }

    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch (e) {
      return responseText as T;
    }
  }

  async createProcess(data: CreateProcessInput): Promise<Process> {
    return this.request("POST", "/processes", { data });
  }

  async getProcess(id: string): Promise<Process> {
    return this.request("GET", `/processes/${id}`);
  }

  async updateProcess(
    processIdentifier: string,
    data: UpdateProcessInput
  ): Promise<Process> {
    return this.request("PATCH", `/processes/${processIdentifier}`, { data });
  }

  async deleteProcess(processIdentifier: string): Promise<void> {
    return this.request("DELETE", `/processes/${processIdentifier}`);
  }

  async getProcesses(
    params: {
      keywords?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ProcessesPaginatedResult> {
    return this.request("GET", "/processes", { params });
  }

  async executeProcessAsync(
    processIdOrSlug: string,
    parameters: Record<string, any> = {},
    options: {
      initiatedBy?: string;
      tag?: string;
      comment?: string;
      settings?: any;
    } = {}
  ): Promise<{ executionId: string }> {
    const headers: Record<string, string> = {};
    if (options.initiatedBy) {
      headers["Yep-Initiated-By"] = options.initiatedBy;
    }

    return this.request("POST", `/processes/${processIdOrSlug}/execute`, {
      data: {
        parameters: JSON.stringify(parameters),
        tag: options.tag,
        comment: options.comment,
        settings: options.settings,
      },
      headers,
    });
  }

  async executeProcessSync(
    processIdOrSlug: string,
    parameters: Record<string, any> = {},
    options: {
      initiatedBy?: string;
      tag?: string;
      comment?: string;
      settings?: any;
    } = {}
  ): Promise<any> {
    const headers: Record<string, string> = {};
    if (options.initiatedBy) {
      headers["Yep-Initiated-By"] = options.initiatedBy;
    }

    return this.request("POST", `/processes/${processIdOrSlug}/execute-sync`, {
      data: {
        parameters: JSON.stringify(parameters),
        tag: options.tag,
        comment: options.comment,
        settings: options.settings,
      },
      headers,
    });
  }

  async createSchedule(
    processIdOrSlug: string,
    data: ScheduledProcessInput
  ): Promise<Schedule> {
    return this.request("POST", `/processes/${processIdOrSlug}/schedule`, {
      data,
    });
  }

  async getExecutions(
    params: {
      keywords?: string;
      processId?: string;
      status?:
        | "CREATED"
        | "RUNNING"
        | "FINISHED"
        | "KILLED"
        | "REJECTED"
        | "ERROR";
      from?: Date | string;
      to?: Date | string;
      comment?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ExecutionsPaginatedResult> {
    const sanitizedParams = {
      ...params,
      from: this.sanitizeDateParam(params.from),
      to: this.sanitizeDateParam(params.to),
    };
    return this.request("GET", "/executions", { params: sanitizedParams });
  }

  async getExecution(id: string): Promise<Execution> {
    return this.request("GET", `/executions/${id}`);
  }

  async getExecutionLogs(
    id: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<ExecutionLogsPaginatedResult> {
    return this.request("GET", `/executions/${id}/logs`, { params });
  }

  async rerunExecution(id: string): Promise<string> {
    const response = await this.request<{ executionId: string }>(
      "POST",
      `/executions/${id}/rerun`
    );
    return response.executionId;
  }

  async killExecution(id: string): Promise<void> {
    return this.request("PUT", `/executions/${id}/kill`);
  }

  async getSchedules(
    params: {
      processId?: string;
      keywords?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<SchedulesPaginatedResult> {
    return this.request("GET", "/schedules", { params });
  }

  async getSchedule(id: string): Promise<Schedule> {
    return this.request("GET", `/schedules/${id}`);
  }

  async deleteSchedule(id: string): Promise<void> {
    return this.request("DELETE", `/schedules/${id}`);
  }

  async pauseSchedule(id: string): Promise<void> {
    return this.request("PUT", `/schedules/${id}/pause`);
  }

  async resumeSchedule(id: string): Promise<void> {
    return this.request("PUT", `/schedules/${id}/resume`);
  }

  async getVariables(
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<TeamVariablesPaginatedResult> {
    return this.request("GET", "/variables", { params });
  }

  async createVariable(data: CreateTeamVariableInput): Promise<TeamVariable> {
    return this.request("POST", "/variables", { data });
  }

  async updateVariable(
    id: string,
    data: UpdateTeamVariableInput
  ): Promise<TeamVariable> {
    return this.request("PATCH", `/variables/${id}`, { data });
  }

  async deleteVariable(id: string): Promise<void> {
    return this.request("DELETE", `/variables/${id}`);
  }

  private sanitizeDateParam(date?: Date | string): string | undefined {
    if (!date) {
      return undefined;
    }
    if (date instanceof Date) {
      return date.toISOString().split(".")[0];
    }
    if (
      typeof date === "string" &&
      !date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    ) {
      throw new Error(
        "Invalid date format. It must be a valid ISO 8601 date (ie: 2025-01-01T00:00:00)"
      );
    }
    return date as string;
  }
}
