import { YepCodeApi } from "../../src/api/yepcodeApi";
import { ProcessesPaginatedResult } from "../../src/api/types";

const apiHost = process.env.YEPCODE_API_HOST;
const apiToken = process.env.YEPCODE_API_TOKEN;

let api: YepCodeApi;

describe("YepCodeApi", () => {
  beforeAll(async () => {
    api = new YepCodeApi({ apiHost, apiToken });
  });

  describe("processes", () => {
    it("should return a paginated list of processes", async () => {
      const result: ProcessesPaginatedResult = await api.getProcesses();

      expect(result).toHaveProperty("hasNextPage");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should return a paginated list of processes with a tag", async () => {
      const result: ProcessesPaginatedResult = await api.getProcesses({
        tags: ["yc-run"],
      });

      expect(result).toHaveProperty("hasNextPage");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
