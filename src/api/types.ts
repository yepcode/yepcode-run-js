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
  /**
   * example:
   * My Process
   */
  name: string;
  /**
   * example:
   * My Process Description
   */
  description?: string;
  /**
   * example:
   * # My Process Readme
   */
  readme?: string;
  manifest?: ProcessManifestInput;
  settings?: SettingsInput;
  script?: CreateScriptInput;
  /**
   * example:
   * [
   *   "my-tag",
   *   "my-second-tag"
   * ]
   */
  tags?: string[];
}
export interface CreateScriptInput {
  /**
   * example:
   * JAVASCRIPT
   */
  programmingLanguage?: string;
  /**
   * example:
   * const {\n  context: { parameters },\n} = yepcode;\n\nconst message = `Hello ${parameters.name}`\n\nconsole.log(message);\n\nreturn {\n  theMessage: message\n}
   */
  sourceCode?: string;
  /**
   * example:
   * {"title":"Simple form sample","description":"This is a simple sample form specification","type":"object","properties":{"oneStringField":{"title":"One string field","type":"string"},"oneIntegerField":{"title":"One integer field with range","type":"integer"},"oneBooleanField":{"title":"One boolean field","type":"boolean"}},"required":["oneStringField"]}
   */
  parametersSchema?: string;
}
export interface CreateTeamVariableInput {
  /**
   * example:
   * MY_VARIABLE
   */
  key: string;
  /**
   * example:
   * my-variable-value
   */
  value?: string;
  /**
   * example:
   * true
   */
  isSensitive?: boolean;
}
export interface DependenciesConfig {
  /**
   * Indicates if the dependencies are scoped to this specific process
   * example:
   * true
   */
  scopedToProcess?: boolean;
  /**
   * Enables auto dependency detection from source code. If enabled, newly detected dependencies will be added while preserving existing ones.
   * example:
   * true
   */
  autoDetect?: boolean;
}
export interface DependenciesConfigInput {
  /**
   * Indicates if the dependencies are scoped to this specific process
   * example:
   * true
   */
  scopedToProcess?: boolean;
  /**
   * Enables auto dependency detection from source code. If enabled, newly detected dependencies will be added while preserving existing ones.
   * example:
   * true
   */
  autoDetect?: boolean;
}
export interface ExecuteProcessInput {
  /**
   * example:
   * {"name":"YepCode"}
   */
  parameters?: string;
  /**
   * A version tag or an alias of the version
   * example:
   * ["v1.0.0","production"]
   */
  tag?: string;
  /**
   * example:
   * YepCode execution test
   */
  comment?: string;
  settings?: ExecuteProcessSettingsInput;
}
export interface ExecuteProcessSettingsInput {
  /**
   * Agent pool where to execute
   * example:
   * aws-eu-west-1
   */
  agentPoolSlug?: string;
  /**
   * URL to receive execution results upon completion (success or failure)
   * example:
   * https://my-callback-url.com/executions/results
   */
  callbackUrl?: string;
}
export interface Execution {
  /**
   * example:
   * 138f7d70-7d13-430f-9f15-a66de3ce1892
   */
  id: string;
  /**
   * example:
   * a4f0c6fd-0da8-4769-8ebb-6c0c030fdfb8
   */
  processId: string;
  /**
   * example:
   * 74c679c4-4df8-4a9c-9d06-4d62ab69ed49
   */
  scheduledId?: string;
  status: "CREATED" | "RUNNING" | "FINISHED" | "KILLED" | "REJECTED" | "ERROR";
  timeline?: ExecutionTimeline;
  /**
   * example:
   * {
   *   "name": "YepCode"
   * }
   */
  parameters?: {
    [name: string]: {
      [key: string]: any;
    };
  };
  /**
   * example:
   * jane-doe
   */
  createdBy?: string;
  createdAt?: string; // date-time
  /**
   * example:
   * Say hello to YepCode
   */
  comment?: string;
  /**
   * example:
   * Hello YepCode!
   */
  returnValue?: string;
  settings?: ExecutionSettings;
}
/**
 * Execution ID
 */
export interface ExecutionId {
  executionId: string;
}
export interface ExecutionLogsPaginatedResult {
  /**
   * example:
   * false
   */
  hasNextPage?: boolean;
  /**
   * example:
   * 0
   */
  page?: number; // int32
  /**
   * example:
   * 10
   */
  limit?: number; // int32
  /**
   * example:
   * 1
   */
  total?: number; // int64
  data?: LogEntry[];
}
export interface ExecutionSettings {
  /**
   * Timeout in milliseconds
   * example:
   * 10000
   */
  timeout?: number; // int64
  /**
   * Agent pool where the execution was executed
   * example:
   * aws-eu-west-1
   */
  agentPoolSlug?: string;
}
export interface ExecutionTimeline {
  explanation?: string;
  events?: ExecutionTimelineEvent[];
}
export interface ExecutionTimelineEvent {
  status: "CREATED" | "RUNNING" | "FINISHED" | "KILLED" | "REJECTED" | "ERROR";
  timestamp: string; // date-time
  explanation?: string;
}
export interface ExecutionsPaginatedResult {
  /**
   * example:
   * false
   */
  hasNextPage?: boolean;
  /**
   * example:
   * 0
   */
  page?: number; // int32
  /**
   * example:
   * 10
   */
  limit?: number; // int32
  /**
   * example:
   * 1
   */
  total?: number; // int64
  data?: Execution[];
}
export interface FormsConfigInput {
  /**
   * example:
   * true
   */
  enabled?: boolean;
}
export interface LogEntry {
  timestamp: string; // date-time
  /**
   * example:
   * INFO
   */
  level: string;
  /**
   * example:
   * Hello YepCode!
   */
  message: string;
}
export interface Process {
  /**
   * example:
   * a4f0c6fd-0da8-4769-8ebb-6c0c030fdfb8
   */
  id: string;
  /**
   * example:
   * Hello World!
   */
  name: string;
  /**
   * example:
   * hello-world
   */
  slug: string;
  /**
   * example:
   * A sample process to show how YepCode works
   */
  description?: string;
  /**
   * example:
   * # Hello World!
   */
  readme?: string;
  manifest?: ProcessManifest;
  /**
   * example:
   * jane-doe
   */
  createdBy?: string;
  createdAt?: string; // date-time
  /**
   * example:
   * jane-doe
   */
  updatedBy?: string;
  updatedAt?: string; // date-time
  /**
   * example:
   * {
   *   "name": {
   *     "type": "string"
   *   }
   * }
   */
  parametersSchema?: {
    [name: string]: {
      [key: string]: any;
    };
  };
  programmingLanguage?: "JAVASCRIPT" | "PYTHON";
  /**
   * example:
   * const {\n  context: { parameters },\n} = yepcode;\n\nconst message = `Hello ${parameters.name}`\n\nconsole.log(message);\n\nreturn {\n  theMessage: message\n}
   */
  sourceCode?: string;
  webhook?: ProcessWebhook;
  settings?: ProcessSettings;
  /**
   * example:
   * [
   *   "my-tag",
   *   "my-second-tag"
   * ]
   */
  tags?: string[];
}
export interface ProcessFormsConfig {
  /**
   * example:
   * true
   */
  enabled?: boolean;
}
export interface ProcessManifest {
  /**
   * example:
   * {
   *   "@yepcode-sdk": "1.0.0"
   * }
   */
  dependencies?: {
    [name: string]: string;
  };
}
export interface ProcessManifestInput {
  /**
   * example:
   * {
   *   "@yepcode-sdk": "1.0.0"
   * }
   */
  dependencies?: {
    [name: string]: string;
  };
}
export interface ProcessPublicationConfig {
  /**
   * example:
   * true
   */
  enabled?: boolean;
  /**
   * example:
   * my-public-token
   */
  token?: string;
}
export interface ProcessSettings {
  formsConfig?: ProcessFormsConfig;
  publicConfig?: ProcessPublicationConfig;
  dependencies?: DependenciesConfig;
}
export interface ProcessWebhook {
  /**
   * example:
   * true
   */
  enabled?: boolean;
  /**
   * example:
   * username
   */
  username?: string;
  /**
   * example:
   * password
   */
  password?: string;
}
export interface ProcessesPaginatedResult {
  /**
   * example:
   * false
   */
  hasNextPage?: boolean;
  /**
   * example:
   * 0
   */
  page?: number; // int32
  /**
   * example:
   * 10
   */
  limit?: number; // int32
  /**
   * example:
   * 1
   */
  total?: number; // int64
  data?: Process[];
}
export interface PublicationConfigInput {
  /**
   * example:
   * true
   */
  enabled?: boolean;
  /**
   * example:
   * my-public-token
   */
  token?: string;
}
export interface Schedule {
  /**
   * example:
   * 138f7d70-7d13-430f-9f15-a66de3ce1852
   */
  id: string;
  /**
   * example:
   * jane-doe
   */
  createdBy?: string;
  createdAt?: string; // date-time
  /**
   * example:
   * jane-doe
   */
  updatedBy?: string;
  updatedAt?: string; // date-time
  /**
   * example:
   * a4f0c6fd-0da8-4769-8ebb-6c0c030fdfb8
   */
  processId: string;
  /**
   * example:
   * Daily execution
   */
  comment?: string;
  /**
   * example:
   * {
   *   "message": "Hello YepCode!"
   * }
   */
  parameters?: {
    [name: string]: {
      [key: string]: any;
    };
  };
  /**
   * example:
   * false
   */
  paused?: boolean;
  type?: "PERIODIC" | "ONE_TIME";
  /**
   * example:
   * 0 0 6 * * SUN
   */
  cron?: string;
  dateTime?: string; // date-time
  settings?: ScheduleSettings;
}
export interface ScheduleSettings {
  allowConcurrentExecutions?: boolean;
  /**
   * example:
   * [
   *   "aws-eu-west-1",
   *   "azure-us-east-1"
   * ]
   */
  agentPoolSlugs?: string[];
}
export interface ScheduledProcessInput {
  /**
   * example:
   * 0 0 6 * * SUN
   */
  cron?: string;
  dateTime?: string; // date-time
  /**
   * example:
   * true
   */
  allowConcurrentExecutions?: boolean;
  input?: ExecuteProcessInput;
}
export interface SchedulesPaginatedResult {
  /**
   * example:
   * false
   */
  hasNextPage?: boolean;
  /**
   * example:
   * 0
   */
  page?: number; // int32
  /**
   * example:
   * 10
   */
  limit?: number; // int32
  /**
   * example:
   * 1
   */
  total?: number; // int64
  data?: Schedule[];
}
export interface SettingsInput {
  formsConfig?: FormsConfigInput;
  publicConfig?: PublicationConfigInput;
  dependencies?: DependenciesConfigInput;
}
export interface TeamVariable {
  /**
   * example:
   * 138f7d70-7d13-430f-9f15-a66de3ce1852
   */
  id: string;
  /**
   * example:
   * MY_VARIABLE
   */
  key: string;
  /**
   * example:
   * MY_VALUE
   */
  value?: string;
  /**
   * example:
   * true
   */
  isSensitive?: boolean;
  /**
   * example:
   * jane-doe
   */
  createdBy?: string;
  createdAt?: string; // date-time
}
export interface TeamVariablesPaginatedResult {
  /**
   * example:
   * false
   */
  hasNextPage?: boolean;
  /**
   * example:
   * 0
   */
  page?: number; // int32
  /**
   * example:
   * 10
   */
  limit?: number; // int32
  /**
   * example:
   * 1
   */
  total?: number; // int64
  data?: TeamVariable[];
}
export interface UpdateProcessInput {
  /**
   * example:
   * My Process
   */
  name: string;
  /**
   * example:
   * my-process
   */
  slug: string;
  /**
   * example:
   * My Process Description
   */
  description?: string;
  /**
   * example:
   * # My Process Readme
   */
  readme?: string;
  script?: UpdateScriptInput;
  webhook?: WebhookInput;
  settings?: SettingsInput;
  manifest?: ProcessManifestInput;
  /**
   * example:
   * [
   *   "my-tag",
   *   "my-second-tag"
   * ]
   */
  tags?: string[];
}
export interface UpdateScriptInput {
  /**
   * example:
   * const {\n  context: { parameters },\n} = yepcode;\n\nconst message = `Hello ${parameters.name}`\n\nconsole.log(message);\n\nreturn {\n  theMessage: message\n}
   */
  sourceCode?: string;
  /**
   * example:
   * {"title":"Simple form sample","description":"This is a simple sample form specification","type":"object","properties":{"oneStringField":{"title":"One string field","type":"string"},"oneIntegerField":{"title":"One integer field with range","type":"integer"},"oneBooleanField":{"title":"One boolean field","type":"boolean"}},"required":["oneStringField"]}
   */
  parametersSchema?: string;
}
export interface UpdateTeamVariableInput {
  /**
   * example:
   * MY_VARIABLE
   */
  key: string;
  /**
   * example:
   * my-variable-value
   */
  value?: string;
}
export interface WebhookInput {
  /**
   * example:
   * true
   */
  enabled?: boolean;
  /**
   * example:
   * username
   */
  username?: string;
  /**
   * example:
   * password
   */
  password?: string;
}
