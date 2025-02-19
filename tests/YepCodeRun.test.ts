import { YepCodeRun, YepCodeEnv, Execution } from "../src";
import crypto from "crypto";

const randomHex = () => crypto.randomBytes(2).toString("hex");

describe("YepCodeRun tests", () => {
  let yepCodeEnv: YepCodeEnv;
  let yepCodeRun: YepCodeRun;

  beforeAll(async () => {
    yepCodeEnv = new YepCodeEnv();
    yepCodeRun = new YepCodeRun();
    await yepCodeEnv.setEnvVar("WORLD_ENV_VAR", "World", false);
  });

  afterAll(async () => {
    await yepCodeEnv.delEnvVar("WORLD_ENV_VAR");
  });

  it("should manage env vars", async () => {
    const envVarName = `ENV_VAR_NAME_${randomHex()}`;
    const envVarValue = `ENV_VAR_VALUE_${randomHex()}`;
    const envVarValue2 = `ENV_VAR_VALUE_2_${randomHex()}`;
    await yepCodeEnv.setEnvVar(envVarName, envVarValue, false);
    expect(
      (await yepCodeEnv.getEnvVars()).find(
        (envVar) => envVar.key === envVarName
      )?.value
    ).toEqual(envVarValue);
    await yepCodeEnv.setEnvVar(envVarName, envVarValue2, false);
    expect(
      (await yepCodeEnv.getEnvVars()).find(
        (envVar) => envVar.key === envVarName
      )?.value
    ).toEqual(envVarValue2);
    await yepCodeEnv.delEnvVar(envVarName);
    expect(
      (await yepCodeEnv.getEnvVars()).find(
        (envVar) => envVar.key === envVarName
      )
    ).toBeUndefined();
  });

  it("should run a JavaScript code", async () => {
    const execution = await yepCodeRun.run(
      `async function main() {
    // Your code here
    const message = \`Hello, \${process.env.WORLD_ENV_VAR}!\`
    console.log(message)
    return { message }
}

module.exports = {
  main,
};`,
      { removeOnDone: true }
    );
    await execution.waitForDone();
    expect(execution.status).toBe("FINISHED");
    expect(execution.returnValue.message).toBe("Hello, World!");
  });

  it("should run a Python code", async () => {
    const execution = await yepCodeRun.run(
      `import os

def main():
    # Your code here
    message = f"Hello, {os.getenv("WORLD_ENV_VAR")}!"
    print(message)
    return {"message": message}`,
      { removeOnDone: true }
    );
    await execution.waitForDone();
    expect(execution.status).toBe("FINISHED");
    expect(execution.returnValue.message).toBe("Hello, World!");
  });

  it("should trigger onLog event", async () => {
    const logs: string[] = [];
    const execution = await yepCodeRun.run(
      `async function main() {
  console.log("Log message 1")
  console.log("Log message 2")
  return { success: true }
}

module.exports = { main };`,
      {
        removeOnDone: true,
        onLog: (logEntry) => {
          logs.push(logEntry.message);
        },
      }
    );

    await execution.waitForDone();
    expect(logs).toContain("Log message 1");
    expect(logs).toContain("Log message 2");
  });

  it("should trigger onFinish event with return value", async () => {
    let finishValue: any = null;
    const execution = await yepCodeRun.run(
      `async function main() {
  return { data: "test data" }
}

module.exports = { main };`,
      {
        removeOnDone: true,
        onFinish: (returnValue) => {
          finishValue = returnValue;
        },
      }
    );

    await execution.waitForDone();
    expect(finishValue).toEqual({ data: "test data" });
  });

  it("should trigger onError event when execution fails", async () => {
    let errorMessage: string | undefined;
    const execution = await yepCodeRun.run(
      `async function main() {
  throw new Error("Test error");
}

module.exports = { main };`,
      {
        removeOnDone: true,
        onError: (error) => {
          errorMessage = error.message;
        },
      }
    );

    await execution.waitForDone();
    expect(errorMessage).toContain("Test error");
  });

  it("should handle all events in Python code", async () => {
    const logs: string[] = [];
    let finishValue: any = null;

    const execution = await yepCodeRun.run(
      `def main():
    print("Log message 1")
    print("Log message 2")
    return {"data": "python test"}`,
      {
        language: "python",
        removeOnDone: true,
        onLog: (logEntry) => {
          logs.push(logEntry.message);
        },
        onFinish: (returnValue) => {
          finishValue = returnValue;
        },
      }
    );

    await execution.waitForDone();
    expect(logs).toContain("Log message 1");
    expect(logs).toContain("Log message 2");
    expect(finishValue).toEqual({ data: "python test" });
  });
});
