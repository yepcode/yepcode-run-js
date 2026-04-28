import { YepCodeApi, YepCodeApiError } from "../../src/api/yepcodeApi";
import { SignedUrl, StorageObject } from "../../src/api/types";
import fs, { createWriteStream, readFileSync } from "fs";
import path from "path";
import { Readable } from "stream";

const testName = "test-run-sdk.txt";
const testFilePath = path.join(__dirname, testName);
const downloadedFile = path.join(__dirname, "./downloaded_test.json");

const apiHost = process.env.YEPCODE_API_HOST;
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
    api = new YepCodeApi({ apiHost, apiToken });
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

  describe("createSignedUrl", () => {
    it("should return a signed url with the default expiry", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await api.createObject({ name: testName, file });

      const result: SignedUrl = await api.createSignedUrl({ path: testName });

      expect(typeof result.url).toBe("string");
      expect(result.url.length).toBeGreaterThan(0);
      expect(result.path).toBe(testName);

      const expiresAt = new Date(result.expiresAt).getTime();
      const expectedExpiry = Date.now() + 3600 * 1000;
      expect(Math.abs(expiresAt - expectedExpiry)).toBeLessThan(60 * 1000);
    });

    it("should return a signed url with a custom expiry", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await api.createObject({ name: testName, file });

      const result: SignedUrl = await api.createSignedUrl({
        path: testName,
        expiresInSeconds: 60,
      });

      const expiresAt = new Date(result.expiresAt).getTime();
      const expectedExpiry = Date.now() + 60 * 1000;
      expect(Math.abs(expiresAt - expectedExpiry)).toBeLessThan(30 * 1000);
    });

    it("should return content matching the original file when fetched", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await api.createObject({ name: testName, file });

      const { url } = await api.createSignedUrl({ path: testName });

      const response = await fetch(url);
      expect(response.ok).toBe(true);
      const body = await response.text();
      expect(body).toBe(readFileSync(testFilePath, "utf8"));
    });

    it("should throw a 404 when the file does not exist", async () => {
      await expect(
        api.createSignedUrl({ path: "does-not-exist.txt" })
      ).rejects.toMatchObject({
        name: "YepCodeApiError",
        status: 404,
      } as Partial<YepCodeApiError>);
    });

    it("should throw a 400 when expiresInSeconds is out of range", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await api.createObject({ name: testName, file });

      await expect(
        api.createSignedUrl({ path: testName, expiresInSeconds: 999999 })
      ).rejects.toMatchObject({
        name: "YepCodeApiError",
        status: 400,
      } as Partial<YepCodeApiError>);
    });
  });
});
