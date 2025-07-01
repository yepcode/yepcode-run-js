![YepCode Run SDK Preview](/readme-assets/cover.png)

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@yepcode/run)](https://www.npmjs.com/package/@yepcode/run)
[![NPM Downloads](https://img.shields.io/npm/dm/@yepcode/run)](https://www.npmjs.com/package/@yepcode/run)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yepcode/yepcode-run-js/ci.yml)](https://github.com/yepcode/yepcode-run-js/actions)

</div>

## What is YepCode Run?

[YepCode Run](https://yepcode.io/run) is a powerful serverless runtime that enables secure code execution in isolated sandboxes. With our comprehensive SDK and platform, you can effortlessly build, manage, and monitor your script executions. Get started quickly using our [JavaScript SDK](https://www.npmjs.com/package/@yepcode/run) or [Python SDK](https://pypi.org/project/yepcode-run).

Powered by [YepCode Cloud](https://yepcode.io/), our enterprise-grade platform delivers seamless script execution capabilities for AI agents, data processing pipelines, API integrations, and automation workflows. Focus on your code while we handle the infrastructure.

## Quick start

### 1. Installation

```bash
npm install @yepcode/run
```

**Requirements:**
- Node.js >= 18.x
- TypeScript support included (types are bundled with the package)

### 2. Get your YepCode API token

1. Sign up to [YepCode Cloud](https://cloud.yepcode.io)
2. Get your API token from your workspace under: `Settings` > `API credentials`
3. Use your API token securely in one of these ways:

   ```js
   // Option 1: Set as environment variable (Recommended)
   # .env file
   YEPCODE_API_TOKEN=your_token_here

   // Option 2: Provide directly to the constructor (Not recommended for production)
   const runner = new YepCodeRun({ apiToken: 'your_token_here' });
   ```

### 3. Execute your code

```js
const { YepCodeRun } = require('@yepcode/run');

const runner = new YepCodeRun({});

// Execute code with full options
const execution = await runner.run(
  `async function main() {
    const message = "Hello, YepCode!";
    console.log(message);
    return { message };
  }
  module.exports = { main };`,
  {
    language: 'javascript', // Optional - auto-detected if not specified
    onLog: (log) => console.log(`${log.timestamp} ${log.level}: ${log.message}`),
    onFinish: (returnValue) => console.log('Finished:', returnValue),
    onError: (error) => console.error('Error:', error)
  }
);

// Wait for execution to complete
await execution.waitForDone();

// Retrieve an existing execution
const existingExecution = await runner.getExecution('execution-id');
```

### 4. Manage Environment Variables

You may use environment variables in your code with `process.env` (JavaScript) or `os.getenv` (Python), and you may manage this environment variables in the YepCode platform ([docs here](https://yepcode.io/docs/processes/team-variables)), or using this `YepCodeEnv` class:

```js
const { YepCodeEnv } = require('@yepcode/run');

const env = new YepCodeEnv({ apiToken: '****' });
// Set environment variables
await env.setEnvVar('API_KEY', 'secret-value');           // Sensitive by default
await env.setEnvVar('DEBUG', 'true', false);             // Non-sensitive variable

// Get all environment variables
const variables = await env.getEnvVars();
// Returns: [{ key: 'API_KEY', value: 'secret-value' }, { key: 'DEBUG', value: 'true' }]

// Delete an environment variable
await env.delEnvVar('API_KEY');
```

### 5. Direct API access

You can also directly access the full [YepCode API](https://yepcode.io/docs/api) using the `YepCodeApi` class:

```js
const { YepCodeApi } = require('@yepcode/run');

const api = new YepCodeApi({ apiToken: '****' });

// Get all processes
const processes = await api.getProcesses();
```

### 6. Storage Objects

You can manage files in your YepCode workspace using the `YepCodeStorage` class. This allows you to upload, list, download, and delete files easily.

```js
const { YepCodeStorage } = require('@yepcode/run');
const fs = require('fs');

const storage = new YepCodeStorage({ apiToken: '****' });

// Upload a file (using Node.js stream)
await storage.upload('path/myfile.txt', fs.createReadStream('./myfile.txt'));

// List files
const files = await storage.list();
console.log(files);

// Download a file
const stream = await storage.download('path/myfile.txt');
stream.pipe(fs.createWriteStream('./downloaded.txt'));

// Delete a file
await storage.delete('myfile.txt');
```

## Prompt to use if you are asking LLM to write code

You can use the following prompt to ask LLM to write code that the YepCode Run SDK can execute.

You should replace the `{{task}}` and `{{envVars}}` placeholders with the actual task and environment variables names already set in your YepCode workspace.

```text
Acts as a coding agent to help the user to achieve the described task generating a standalone script in either JavaScript or Python. Do not write any explainations, just write the code.

The task to solve is:

=====
{{task}}
=====

* We support JavaScript (NodeJS v22) or Python (v3.13).
* You may use the following environment variables already set in the execution context: {{envVars}}
* Use external dependencies freely from NPM or PyPI. You should import them as usually.
  * If package name is different from the import sentence, add an anotation for us to detect them (\`// @add-package package_name\` (javascript) or \`# @add-package package_name\` (python)).
  * When possible, use binary packages to avoid compilation issues.
* Include debugging logs (\`console.log()\` in javascript or \`print()\` in python) if necessary for execution tracking and error debugging.
* Do not catch errors, let them fail the execution.
* Follow the required script structure based on the chosen language:

---------------------------------
JavaScript
----------
// @add-package package_name_1
const package_name_1 = require("package_name_1");
// @add-package package_name_2
const package_name_2 = require("package_name_2");

async function main() {
    // The generated code should go here
    return {"success": true, "data": result}
}

module.exports = { main }
---------------------------------

---------------------------------
Python
------
# @add-package package_name_1
import package_name_1
# @add-package package_name_2
from package_name_2.module import Module

def main():
    # The generated code should go here
    return {"success": True, "data": result}

---------------------------------

Important: The response should only contain the script to be executed by `python` or `node` and follow the exact structure above. Do not include any explanations neither enclosing annotations.
```

## SDK API Reference

### YepCodeRun

The main class for executing code in YepCode's runtime environment.

#### Constructor

```typescript
constructor(options?: {
  apiToken?: string;  // Optional if YEPCODE_API_TOKEN env var is set
})
```

#### Methods

##### `run(code: string, options?: RunOpts): Promise<Execution>`

Executes code in YepCode's runtime environment.

**Parameters:**
- `code`: Source code to execute (string)
- `options`: Execution options (optional)
  ```typescript
  interface RunOpts {
    language?: 'javascript' | 'python';  // Auto-detected if not specified
    onLog?: (log: LogEvent) => void;     // Log event handler
    onFinish?: (returnValue: any) => void; // Success completion handler
    onError?: (error: Error) => void;    // Error handler
    removeOnDone?: boolean;              // Auto-cleanup after execution
    parameters?: any;                    // Execution parameters
    manifest?: ProcessManifest;          // Custom process manifest
    timeout?: number;                    // Execution timeout in ms
  }

  interface LogEvent {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
  }
  ```

**Returns:** Promise<Execution>

##### `getExecution(executionId: string): Promise<Execution>`

Retrieves an existing execution by ID.

**Parameters:**
- `executionId`: Unique identifier for the execution

**Returns:** Promise<Execution>

#### `Execution` class

Represents a code execution instance.

**Properties:**
```typescript
interface Execution {
  id: string;                           // Unique identifier
  logs: LogEvent[];                     // Array of execution logs
  processId?: string;                   // ID of the associated process
  status?: ExecutionStatus;             // Current execution status
  returnValue?: any;                    // Execution result
  error?: string;                       // Error message
  timeline?: TimelineEvent[];           // Execution timeline events
  parameters?: any;                     // Execution input parameters
  comment?: string;                     // Execution comment
}

type ExecutionStatus =
  | 'CREATED'
  | 'RUNNING'
  | 'FINISHED'
  | 'KILLED'
  | 'REJECTED'
  | 'ERROR';

interface TimelineEvent {
  status: ExecutionStatus;
  timestamp: string;
  explanation?: string;
}
```

**Methods:**

###### `isDone(): Promise<boolean>`
Returns whether the execution has completed.

**Returns:** Promise<boolean>

###### `waitForDone(options?: { timeout?: number }): Promise<void>`
Waits for the execution to complete.

**Parameters:**
- `options`: Optional timeout configuration
  ```typescript
  interface WaitOptions {
    timeout?: number;  // Timeout in milliseconds
  }
  ```

**Returns:** Promise<void>

###### `kill(): Promise<void>`
Terminates the execution.

**Returns:** Promise<void>

###### `rerun(): Promise<Execution>`
Creates a new execution with the same configuration.

**Returns:** Promise<Execution>

### YepCodeEnv

Manages environment variables for your YepCode workspace.

#### Constructor

```typescript
constructor(options?: {
  apiToken?: string;  // Optional if YEPCODE_API_TOKEN env var is set
})
```

#### Methods

##### `getEnvVars(): Promise<EnvVar[]>`
Returns all environment variables.

**Returns:** Promise<EnvVar[]>
```typescript
interface EnvVar {
  key: string;
  value: string;
  isSensitive: boolean;
}
```

##### `setEnvVar(key: string, value: string, isSensitive?: boolean): Promise<void>`
Sets an environment variable.

**Parameters:**
- `key`: Variable name
- `value`: Variable value
- `isSensitive`: Whether the variable contains sensitive data (defaults to true)

**Returns:** Promise<void>

##### `delEnvVar(key: string): Promise<void>`
Deletes an environment variable.

**Parameters:**
- `key`: Variable name to delete

**Returns:** Promise<void>

### YepCodeApi

Provides direct access to the YepCode API.

#### Constructor

```typescript
constructor(options?: {
  apiToken?: string;  // Optional if YEPCODE_API_TOKEN env var is set
})
```

#### Methods

##### `getProcesses(): Promise<Process[]>`
Returns all available processes.

**Returns:** Promise<Process[]>
```typescript
interface Process {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}
```

### YepCodeStorage

Manages file storage in your YepCode workspace. Allows you to upload, list, download, and delete files using the YepCode API.

#### Constructor

```typescript
constructor(options?: {
  apiToken?: string;  // Optional if YEPCODE_API_TOKEN env var is set
})
```

#### Methods

##### `upload(filename: string, file: File | Blob | Readable): Promise<StorageObject>`
Uploads a file to YepCode storage.

- `filename`: Name to assign to the uploaded file
- `file`: The file to upload (can be a File, Blob, or Node.js Readable stream)
- **Returns:** Promise<StorageObject>

##### `list(): Promise<StorageObject[]>`
Lists all files in YepCode storage.

- **Returns:** Promise<StorageObject[]>

##### `download(filename: string): Promise<Readable>`
Downloads a file from YepCode storage as a Node.js Readable stream.

- `filename`: Name of the file to download
- **Returns:** Promise<Readable>

##### `delete(filename: string): Promise<void>`
Deletes a file from YepCode storage.

- `filename`: Name of the file to delete
- **Returns:** Promise<void>

##### `StorageObject`
```typescript
interface StorageObject {
  name: string;
  url: string;
  size?: number;
  contentType?: string;
  createdAt?: string;
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
