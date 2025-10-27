export interface EnvVar {
  key: string;
  value?: string;
}

export interface ExecutionEvents {
  onLog?: (log: Log) => Promise<any> | any;
  onFinish?: (returnValue: any) => Promise<any> | any;
  onError?: (error: ExecutionError) => Promise<any> | any;
}

export interface RunOpts extends ExecutionEvents {
  language?: string;
  removeOnDone?: boolean;
  manifest?: any;
  parameters?: any;
  initiatedBy?: string;
  tag?: string;
  comment?: string;
  settings?: any;
}

export interface ExecutionError {
  message?: string;
}

export interface TimelineEvent {
  status: ExecutionStatus;
  timestamp: string;
  explanation?: string;
}

export interface ExecutionData {
  processId: string;
  status: ExecutionStatus;
  timeline: TimelineEvent[];
  parameters: Record<string, any>;
  comment?: string;
  returnValue?: any;
  logs: Log[];
  error?: ExecutionError;
}

export type ExecutionStatus =
  | "CREATED"
  | "QUEUED"
  | "DEQUEUED"
  | "RUNNING"
  | "FINISHED"
  | "KILLED"
  | "REJECTED"
  | "ERROR";

export interface Log {
  timestamp: string;
  level: string;
  message: string;
}
