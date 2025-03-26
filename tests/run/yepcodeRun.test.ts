import { YepCodeRun } from "../../src";

describe("run", () => {
  const yepCodeRun = new YepCodeRun();
  const options = {
    removeOnDone: true,
    onLog: () => {},
    onFinish: () => {},
    onError: () => {},
  };

  it("should run JavaScript code", async () => {
    const code = `return { message: "Hello, World!" }`;

    const execution = await yepCodeRun.run(code, {
      language: "javascript",
      ...options,
    });
    await execution.waitForDone();

    expect(execution.returnValue.message).toBe("Hello, World!");
  });

  it("should run Python code", async () => {
    const code = `return { "message": "Hello, World!" }`;

    const execution = await yepCodeRun.run(code, {
      language: "python",
      ...options,
    });
    await execution.waitForDone();

    expect(execution.returnValue.message).toBe("Hello, World!");
  });

  it("should run auto-detected language", async () => {
    const code = `return { message: "I'm javascript code", foo: undefined }`;

    const execution = await yepCodeRun.run(code, options);
    await execution.waitForDone();

    expect(execution.returnValue.message).toBe("I'm javascript code");
  });

  it("should trigger onLog event", async () => {
    const logs: string[] = [];
    const code = `print("Hello, World!")`;

    const execution = await yepCodeRun.run(code, {
      language: "python",
      ...options,
      onLog: (logEntry) => {
        logs.push(logEntry.message);
      },
    });
    await execution.waitForDone();

    expect(logs).toContain("Hello, World!");
  });

  it("should trigger onFinish event", async () => {
    let finishValue: any = null;
    const code = `return { message: "Hello, World!" }`;

    const execution = await yepCodeRun.run(code, {
      language: "javascript",
      ...options,
      onFinish: (returnValue) => {
        finishValue = returnValue;
      },
    });
    await execution.waitForDone();

    expect(finishValue).toEqual({ message: "Hello, World!" });
  });

  it("should trigger onError event", async () => {
    let errorMessage: string | undefined;
    const code = `throw new Error("I'm an error")`;

    const execution = await yepCodeRun.run(code, {
      language: "javascript",
      ...options,
      onError: (error) => {
        errorMessage = error.message;
      },
    });
    await execution.waitForDone();

    expect(errorMessage).toContain("Error: I'm an error");
  });
});
