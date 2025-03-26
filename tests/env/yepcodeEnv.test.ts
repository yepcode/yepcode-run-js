import { YepCodeEnv } from "../../src";
import crypto from "crypto";

const randomHex = () => crypto.randomBytes(2).toString("hex");
const DEFAULT_ENV_VAR_NAME = `YC_RUN_TEST_JS`;
const DEFAULT_ENV_VAR_NAME_NEW = `YC_RUN_TEST_JS_NEW`;

const yepCodeEnv = new YepCodeEnv();

const existingEnvVar = {
  key: DEFAULT_ENV_VAR_NAME,
  value: "Hello, World!",
  isSensitive: false,
};

beforeAll(async () => {
  await yepCodeEnv.setEnvVar(
    existingEnvVar.key,
    existingEnvVar.value,
    existingEnvVar.isSensitive
  );
});

afterAll(async () => {
  await yepCodeEnv.delEnvVar(DEFAULT_ENV_VAR_NAME);
  await yepCodeEnv.delEnvVar(DEFAULT_ENV_VAR_NAME_NEW);
});

describe("setEnvVar", () => {
  it("should create a new env var", async () => {
    const envVar = {
      key: DEFAULT_ENV_VAR_NAME_NEW,
      value: "foo",
      isSensitive: false,
    };

    await yepCodeEnv.setEnvVar(envVar.key, envVar.value, envVar.isSensitive);

    const envVars = await yepCodeEnv.getEnvVars();
    expect(envVars.find(({ key }) => key === envVar.key)?.value).toEqual(
      envVar.value
    );
  });

  it("should create a new sensitive env var", async () => {
    const envVar = {
      key: DEFAULT_ENV_VAR_NAME_NEW,
      value: "foo",
      isSensitive: true,
    };

    await yepCodeEnv.setEnvVar(envVar.key, envVar.value, envVar.isSensitive);

    const envVars = await yepCodeEnv.getEnvVars();
    expect(envVars.find(({ key }) => key === envVar.key)).toBeDefined();
  });

  it("should update an existing env var", async () => {
    await yepCodeEnv.setEnvVar(
      existingEnvVar.key,
      "NEW_VALUE",
      existingEnvVar.isSensitive
    );

    const envVars = await yepCodeEnv.getEnvVars();
    expect(
      envVars.find(({ key }) => key === existingEnvVar.key)?.value
    ).toEqual("NEW_VALUE");
  });
});

describe("delEnvVar", () => {
  it("should delete an env var", async () => {
    await yepCodeEnv.delEnvVar(DEFAULT_ENV_VAR_NAME);

    const envVars = await yepCodeEnv.getEnvVars();
    expect(
      envVars.find(({ key }) => key === DEFAULT_ENV_VAR_NAME)
    ).toBeUndefined();
  });
});

describe("getEnvVars", () => {
  it("should get all env vars", async () => {
    const envVars = await yepCodeEnv.getEnvVars();

    expect(envVars.length).toBeGreaterThan(0);
  });
});
