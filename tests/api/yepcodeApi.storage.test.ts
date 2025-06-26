import { YepCodeApi } from "../../src/api/yepcodeApi";
import { StorageObject } from "../../src/api/types";
import fs, { createWriteStream, readFileSync } from "fs";
import path from "path";
import { Readable } from "stream";

const testName = "test-run-sdk.txt";
const testFilePath = path.join(__dirname, testName);
const downloadedFile = path.join(__dirname, "./downloaded_test.json");

const apiHost = process.env.YEPCODE_API_HOST;
const authUrl = process.env.YEPCODE_AUTH_URL;
const apiToken = process.env.YEPCODE_API_TOKEN;

let api: YepCodeApi;

const verifyDownloadedFile = async (
  result: Readable,
  downloadedFile: string,
  testFilePath: string
) => {
  const fileStream = createWriteStream(downloadedFile);
  await new Promise<void>((resolve, reject) => {
    result.pipe(fileStream).on("finish", resolve).on("error", reject);
  });
  expect(fs.existsSync(downloadedFile)).toBe(true);
  const downloadedContent = readFileSync(downloadedFile, "utf8");
  const originalContent = readFileSync(testFilePath, "utf8");
  expect(downloadedContent).toBe(originalContent);
};

describe.skip("YepCodeApi", () => {
  beforeAll(async () => {
    api = new YepCodeApi({ apiHost, authUrl, apiToken });
  });

  afterEach(async () => {
    await api.deleteObject(testName).catch(() => {});
    if (fs.existsSync(downloadedFile)) {
      fs.unlinkSync(downloadedFile);
    }
  });

  describe("getObjects", () => {
    it("should return a list of storage objects", async () => {
      const result: StorageObject[] = await api.getObjects();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("createObject", () => {
    it("should create a storage object with a File", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      const result: StorageObject = await api.createObject({
        name: testName,
        file,
      });
      expect(result).toBeDefined();
    });

    it("should create a storage object with a Blob", async () => {
      const fileBlob: Blob = new Blob([readFileSync(testFilePath)]);
      const result: StorageObject = await api.createObject({
        name: testName,
        file: fileBlob,
      });
      expect(result).toBeDefined();
    });

    it("should create a storage object with a stream", async () => {
      const stream = fs.createReadStream(testFilePath);
      const result: StorageObject = await api.createObject({
        name: testName,
        file: stream,
      });
      expect(result).toBeDefined();
    });
  });

  describe("deleteObject", () => {
    it("should delete a storage object", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await api.createObject({ name: testName, file });

      await api.deleteObject(testName);
    });
  });

  describe("getObject", () => {
    it("should get a storage object uploaded as File", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await api.createObject({ name: testName, file });

      const result: Readable = await api.getObject(testName);

      await verifyDownloadedFile(result, downloadedFile, testFilePath);
    });

    it("should get a storage object uploaded as Blob", async () => {
      const blob: Blob = new Blob([readFileSync(testFilePath)]);
      await api.createObject({ name: testName, file: blob });

      const result: Readable = await api.getObject(testName);

      await verifyDownloadedFile(result, downloadedFile, testFilePath);
    });

    it("should get a storage object uploaded as stream", async () => {
      const stream = fs.createReadStream(testFilePath);
      await api.createObject({ name: testName, file: stream });

      const result: Readable = await api.getObject(testName);

      await verifyDownloadedFile(result, downloadedFile, testFilePath);
    });
  });
});
