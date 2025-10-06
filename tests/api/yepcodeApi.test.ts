import { YepCodeApi } from "../../src/api/yepcodeApi";
import { ProcessesPaginatedResult } from "../../src/api/types";

const api = new YepCodeApi();

describe("YepCodeApi", () => {
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
        tags: ["yc-run", "dummy"],
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
