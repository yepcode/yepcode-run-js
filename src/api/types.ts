export interface YepCodeApiConfig {
  authUrl?: string;
  apiHost?: string;
  timeout?: number;
  accessToken?: string;
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  teamId?: string;
}

export interface CreateProcessInput {
  name: string;
  description?: string;
  readme?: string;
  manifest?: ProcessManifestInput;
  settings?: SettingsInput;
  script?: CreateScriptInput;
  tags?: string[];
}
export interface CreateScriptInput {
  programmingLanguage?: string;
  sourceCode?: string;
  parametersSchema?: string;
}
export interface CreateTeamVariableInput {
  key: string;
  value?: string;
  isSensitive?: boolean;
}
export interface DependenciesConfig {
  scopedToProcess?: boolean;
  autoDetect?: boolean;
}
export interface DependenciesConfigInput {
  scopedToProcess?: boolean;
  autoDetect?: boolean;
}
export interface ExecuteProcessInput {
  parameters?: string;
  tag?: string;
  comment?: string;
  settings?: ExecuteProcessSettingsInput;
}
export interface ExecuteProcessSettingsInput {
  agentPoolSlug?: string;
  callbackUrl?: string;
}
export interface Execution {
  id: string;
  processId: string;
  scheduledId?: string;
  status: "CREATED" | "RUNNING" | "FINISHED" | "KILLED" | "REJECTED" | "ERROR";
  timeline?: ExecutionTimeline;
  parameters?: {
    [name: string]: {
      [key: string]: any;
    };
  };
  comment?: string;
  returnValue?: string;
  settings?: ExecutionSettings;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}
export interface ExecutionId {
  executionId: string;
}
export interface ExecutionLogsPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  data?: LogEntry[];
}
export interface ExecutionSettings {
  timeout?: number;
  agentPoolSlug?: string;
}
export interface ExecutionTimeline {
  explanation?: string;
  events?: ExecutionTimelineEvent[];
}
export interface ExecutionTimelineEvent {
  status: "CREATED" | "RUNNING" | "FINISHED" | "KILLED" | "REJECTED" | "ERROR";
  timestamp: string;
  explanation?: string;
}
export interface ExecutionsPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  data?: Execution[];
}
export interface FormsConfigInput {
  enabled?: boolean;
}
export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}
export interface Process {
  id: string;
  name: string;
  slug: string;
  description?: string;
  readme?: string;
  manifest?: ProcessManifest;
  parametersSchema?: {
    [name: string]: {
      [key: string]: any;
    };
  };
  programmingLanguage?: "JAVASCRIPT" | "PYTHON";
  sourceCode?: string;
  webhook?: ProcessWebhook;
  settings?: ProcessSettings;
  tags?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}
export interface ProcessFormsConfig {
  enabled?: boolean;
}
export interface ProcessManifest {
  dependencies?: {
    [name: string]: string;
  };
}
export interface ProcessManifestInput {
  dependencies?: {
    [name: string]: string;
  };
}
export interface ProcessPublicationConfig {
  enabled?: boolean;
  token?: string;
}
export interface ProcessSettings {
  formsConfig?: ProcessFormsConfig;
  publicConfig?: ProcessPublicationConfig;
  dependencies?: DependenciesConfig;
}
export interface ProcessWebhook {
  enabled?: boolean;
  username?: string;
  password?: string;
}
export interface ProcessesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;

  total?: number;
  data?: Process[];
}
export interface PublicationConfigInput {
  enabled?: boolean;
  token?: string;
}
export interface Schedule {
  id: string;
  processId: string;
  comment?: string;
  parameters?: {
    [name: string]: {
      [key: string]: any;
    };
  };
  paused?: boolean;
  type?: "PERIODIC" | "ONE_TIME";
  cron?: string;
  dateTime?: string;
  settings?: ScheduleSettings;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}
export interface ScheduleSettings {
  allowConcurrentExecutions?: boolean;
  agentPoolSlugs?: string[];
}
export interface ScheduledProcessInput {
  cron?: string;
  dateTime?: string;
  allowConcurrentExecutions?: boolean;
  input?: ExecuteProcessInput;
}
export interface SchedulesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;

  total?: number;
  data?: Schedule[];
}
export interface SettingsInput {
  formsConfig?: FormsConfigInput;
  publicConfig?: PublicationConfigInput;
  dependencies?: DependenciesConfigInput;
}
export interface TeamVariable {
  id: string;
  key: string;
  value?: string;
  isSensitive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}
export interface TeamVariablesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;

  total?: number;
  data?: TeamVariable[];
}
export interface UpdateProcessInput {
  name: string;
  slug: string;
  description?: string;
  readme?: string;
  script?: UpdateScriptInput;
  webhook?: WebhookInput;
  settings?: SettingsInput;
  manifest?: ProcessManifestInput;
  tags?: string[];
}
export interface UpdateScriptInput {
  sourceCode?: string;
  parametersSchema?: string;
}
export interface UpdateTeamVariableInput {
  key: string;
  value?: string;
}
export interface WebhookInput {
  enabled?: boolean;
  username?: string;
  password?: string;
}

export interface VersionedProcess {
  id: string;
  programmingLanguage: "JAVASCRIPT" | "PYTHON";
  sourceCode: string;
  parametersSchema: string;
  readme: string;
  comment?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PublishProcessInput {
  tag: string;
  comment?: string;
}

export interface VersionedProcessesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;

  total?: number;
  data?: VersionedProcess[];
}

export interface VersionedProcessAlias {
  id: string;
  name: string;
  versionId: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface VersionedProcessAliasInput {
  name: string;
  versionId: string;
}

export interface VersionedProcessAliasesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  data?: VersionedProcessAlias[];
}

export interface Module {
  id: string;
  name: string;
  programmingLanguage?: "JAVASCRIPT" | "PYTHON";
  sourceCode?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateModuleInput {
  name: string;
  script?: {
    programmingLanguage?: string;
    sourceCode?: string;
  };
}

export interface UpdateModuleInput {
  name?: string;
  script?: {
    programmingLanguage?: string;
    sourceCode?: string;
  };
}

export interface ModulesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  data?: Module[];
}

export interface VersionedModule {
  id: string;
  programmingLanguage: "JAVASCRIPT" | "PYTHON";
  sourceCode: string;
  comment?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PublishModuleInput {
  tag: string;
  comment?: string;
}

export interface VersionedModulesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  data?: VersionedModule[];
}

export interface VersionedModuleAlias {
  id: string;
  name: string;
  versionId: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface VersionedModuleAliasInput {
  name: string;
  versionId: string;
}

export interface VersionedModuleAliasesPaginatedResult {
  hasNextPage?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  data?: VersionedModuleAlias[];
}
