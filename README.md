# YepCode Run

A powerful serverless runtime and SDK for executing code in secure sandboxes, with a complete platform for building, managing, and monitoring your script executions.

Built on top of [YepCode Cloud](https://yepcode.io/), the enterprise platform that enables seamless script execution for AI agents, data processing, API integrations, and automation workflows.

## Try it Now!

Ready to see it in action? Visit our 🎮 [interactive playground](https://yepcode.io/run) (no registration required) where you can:

- Test code execution in real-time
- Experiment with different languages and packages
- Learn through hands-on examples

## Why YepCode Run?

Running arbitrary code in production environments presents significant challenges around security, scalability, and infrastructure management. This is especially critical when dealing with **AI-generated code** from LLMs, where code execution needs to be both secure and reliable at scale and may also need to install external dependencies.

YepCode Run eliminates these complexities by providing enterprise-grade sandboxing, automatic scaling, and comprehensive security measures out of the box - allowing you to focus on your code instead of infrastructure concerns.

## 🚀 Features

- 🚀 **Instant Code Execution** - Run JavaScript and Python code in secure sandboxes without any setup
- 🔒 **Enterprise-Ready Platform** - Full suite of tools for building, deploying and monitoring processes
- 🔄 **Built for Integration** - Perfect for AI agents, data processing, API integrations and automation workflows
- 📊 **Complete Observability** - Monitor executions, manage credentials, and audit changes in one place
- 🛠️ **Developer Experience** - Write code in our web IDE or use our API/SDK to integrate with your apps
- 📦 **Package Freedom** - Use any external dependency with automatic package detection or specify exact versions using `@add-package` annotations

## 🔧 Installation

```bash
npm install @yepcode/run
```

## 🔑 Get your YepCode API token

You can get your YepCode API token from the [YepCode Cloud](https://cloud.yepcode.io) platform under `Settings` > `API credentials`.

This token may be provided to the `YepCodeRun`, `YepCodeEnv` or `YepCodeApi` constructor, or set in the `YEPCODE_API_TOKEN` environment variable.

```env
YEPCODE_API_TOKEN=your-api-token
```

## 💻 Usage

### ⚡ Code Execution

The `YepCodeRun` class provides flexible code execution capabilities:

```js
const { YepCodeRun } = require('@yepcode/run');

const runner = new YepCodeRun({
  apiToken: 'your-api-token' // We'll try to read it from the YEPCODE_API_TOKEN environment variable
});

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

### 🔐 Environment Variables

You may use environment variables in your code with `process.env` (JavaScript) or `os.getenv` (Python), and you may manage this environment variables in the YepCode platform ([docs here](https://yepcode.io/docs/processes/team-variables)), or using this `YepCodeEnv` class:

```js
const { YepCodeEnv } = require('@yepcode/run');

const env = new YepCodeEnv({
  apiToken: 'your-api-key'
});

// Set environment variables
await env.setEnvVar('API_KEY', 'secret-value');           // Sensitive by default
await env.setEnvVar('DEBUG', 'true', false);             // Non-sensitive variable

// Get all environment variables
const variables = await env.getEnvVars();
// Returns: [{ key: 'API_KEY', value: 'secret-value' }, { key: 'DEBUG', value: 'true' }]

// Delete an environment variable
await env.delEnvVar('API_KEY');
```

### 🌐 Direct API access

You can also directly access the full [YepCode API](https://yepcode.io/docs/api) using the `YepCodeApi` class:

```js
const { YepCodeApi } = require('@yepcode/run');

const api = new YepCodeApi({
  apiToken: 'your-api-token'
});

// Get all processes
const processes = await api.getProcesses();
```

## 📚 SDK API Reference

### ⚡ YepCodeRun

#### Methods

- `run(code: string, options?: RunOpts): Promise<Execution>`
  - `code`: Source code to execute
  - `options`:
    - `language`: Programming language ('javascript' or 'python')
    - `onLog`: Log event handler
    - `onFinish`: Success completion handler
    - `onError`: Error handler
    - `removeOnDone`: Auto-cleanup after execution. If you don't clean up, executions will be available in YepCode Cloud.
    - `parameters`: Execution parameters (see [docs](https://yepcode.io/docs/processes/input-params) for more information)
    - `manifest`: Custom process manifest (see [docs](https://yepcode.io/docs/dependencies) for more information)

- `getExecution(executionId: string): Promise<Execution>`
  - Retrieves an existing execution by ID


#### `Execution` class properties

- `executionId: string` - Unique identifier for the execution
- `logs: Array<{ timestamp: string; level: string; message: string }>` - Array of execution logs with timestamps, log levels, and messages
- `processId?: string` - ID of the associated process
- `status?: 'CREATED' | 'RUNNING' | 'FINISHED' | 'KILLED' | 'REJECTED' | 'ERROR'` - Current execution status
- `returnValue?: any` - Execution result (if completed successfully)
- `error?: string` - Error message (if execution failed)
- `timeline?: Array<{ status: ExecutionStatus; timestamp: string; explanation?: string }>` - Execution timeline events
- `parameters?: any` - Execution input parameters
- `comment?: string` - Execution comment

#### `Execution` class methods

- `isDone(): Promise<boolean>`
  - Returns whether the execution has completed (successfully or with error)

- `waitForDone(): Promise<void>`
  - Waits for the execution to complete

- `kill(): Promise<void>`
  - Terminates the execution

- `rerun(): Promise<Execution>`
  - Creates a new execution with the same configuration

### 🔐 YepCodeEnv

#### Methods

- `getEnvVars(): Promise<EnvVar[]>`
  - Returns all environment variables

- `setEnvVar(key: string, value: string, isSensitive?: boolean): Promise<void>`
  - Sets an environment variable
  - `isSensitive`: Marks variable as sensitive (defaults to true)

- `delEnvVar(key: string): Promise<void>`
  - Deletes an environment variable

## 📄 License

All rights reserved by YepCode. This package is part of the YepCode Platform and is subject to the [YepCode Terms of Service](https://yepcode.io/terms-of-use).