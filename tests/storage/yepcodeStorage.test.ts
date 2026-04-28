import { YepCodeStorage } from "../../src/storage";
import { YepCodeApiError } from "../../src/api/yepcodeApi";
import { SignedUrl, StorageObject } from "../../src/api/types";
import fs, { createWriteStream, readFileSync } from "fs";
import path from "path";
import { Readable } from "stream";

const testName = "test-run-sdk.txt";
const testFilePath = path.join(__dirname, testName);
const downloadedFile = path.join(__dirname, "./downloaded_test.json");

const apiHost = process.env.YEPCODE_API_HOST;
const apiToken = process.env.YEPCODE_API_TOKEN;

let storage: YepCodeStorage;

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

describe.skip("YepCodeStorage", () => {
  beforeAll(async () => {
    storage = new YepCodeStorage({ apiHost, apiToken });
  });

  afterEach(async () => {
    await storage.delete(testName).catch(() => {});
    if (fs.existsSync(downloadedFile)) {
      fs.unlinkSync(downloadedFile);
    }
  });

  describe("getObjects", () => {
    it("should return a list of storage objects", async () => {
      const result: StorageObject[] = await storage.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return a list of storage objects with a prefix", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await storage.upload(testName, file);

      const result: StorageObject[] = await storage.list({
        prefix: "test-run",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe(testName);
    });
  });

  describe("createObject", () => {
    it("should create a storage object with a File", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      const result: StorageObject = await storage.upload(testName, file);
      expect(result).toBeDefined();
    });

    it("should create a storage object with a Blob", async () => {
      const fileBlob: Blob = new Blob([readFileSync(testFilePath)]);
      const result: StorageObject = await storage.upload(testName, fileBlob);
      expect(result).toBeDefined();
    });

    it("should create a storage object with a stream", async () => {
      const stream = fs.createReadStream(testFilePath);
      const result: StorageObject = await storage.upload(testName, stream);
      expect(result).toBeDefined();
    });
  });

  describe("deleteObject", () => {
    it("should delete a storage object", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await storage.upload(testName, file);

      await storage.delete(testName);
    });
  });

  describe("getObject", () => {
    it("should get a storage object uploaded as File", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await storage.upload(testName, file);

      const result: Readable = await storage.download(testName);

      await verifyDownloadedFile(result, downloadedFile, testFilePath);
    });

    it("should get a storage object uploaded as Blob", async () => {
      const blob: Blob = new Blob([readFileSync(testFilePath)]);
      await storage.upload(testName, blob);

      const result: Readable = await storage.download(testName);

      await verifyDownloadedFile(result, downloadedFile, testFilePath);
    });

    it("should get a storage object uploaded as stream", async () => {
      const stream = fs.createReadStream(testFilePath);
      await storage.upload(testName, stream);

      const result: Readable = await storage.download(testName);

      await verifyDownloadedFile(result, downloadedFile, testFilePath);
    });
  });

  describe("createSignedUrl", () => {
    it("should return a signed url with the default expiry", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await storage.upload(testName, file);

      const result: SignedUrl = await storage.createSignedUrl(testName);

      expect(typeof result.url).toBe("string");
      expect(result.url.length).toBeGreaterThan(0);
      expect(result.path).toBe(testName);

      const expiresAt = new Date(result.expiresAt).getTime();
      const expectedExpiry = Date.now() + 3600 * 1000;
      expect(Math.abs(expiresAt - expectedExpiry)).toBeLessThan(60 * 1000);
    });

    it("should return a signed url with a custom expiry", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await storage.upload(testName, file);

      const result: SignedUrl = await storage.createSignedUrl(testName, {
        expiresInSeconds: 60,
      });

      const expiresAt = new Date(result.expiresAt).getTime();
      const expectedExpiry = Date.now() + 60 * 1000;
      expect(Math.abs(expiresAt - expectedExpiry)).toBeLessThan(30 * 1000);
    });

    it("should throw a 404 when the file does not exist", async () => {
      await expect(
        storage.createSignedUrl("does-not-exist.txt")
      ).rejects.toMatchObject({
        name: "YepCodeApiError",
        status: 404,
      } as Partial<YepCodeApiError>);
    });

    it("should throw a 400 when expiresInSeconds is out of range", async () => {
      const file: File = new File([readFileSync(testFilePath)], testName);
      await storage.upload(testName, file);

      await expect(
        storage.createSignedUrl(testName, { expiresInSeconds: 999999 })
      ).rejects.toMatchObject({
        name: "YepCodeApiError",
        status: 400,
      } as Partial<YepCodeApiError>);
    });
  });
});
