import { LanguageDetector } from "../../src/utils/languageDetector";

describe("LanguageDetector", () => {
  describe("detectLanguage", () => {
    it("should detect JavaScript code", () => {
      const jsCode = `
        const hello = "world";
        function test(param) {
          if (param === undefined) {
            console.log("undefined param");
            return null;
          }
          return param;
        }
        const arrow = () => "test";
      `;

      expect(LanguageDetector.detectLanguage(jsCode)).toBe("javascript");
    });

    it("should detect JavaScript code 2", () => {
      const jsCode = `
    async function main() {
      return { data: "test data" }
    }

    module.exports = { main };
      `;

      expect(LanguageDetector.detectLanguage(jsCode)).toBe("javascript");
    });

    it("should detect Python code", () => {
      const pyCode = `
        def hello_world():
          print("Hello, World!")

        class MyClass:
          def __init__(self):
            self.value = 42

        for item in items:
          if item > 0:
            print(item)
          elif item == 0:
            continue
      `;

      expect(LanguageDetector.detectLanguage(pyCode)).toBe("python");
    });

    it("should return unknown language for empty code", () => {
      expect(LanguageDetector.detectLanguage("")).toBe("unknown");
    });

    it("should handle code with comments", () => {
      const jsCodeWithComments = `
        // This is a JavaScript comment
        /* Multi-line
           comment */
        const x = 1;
        console.log(x);
      `;

      const pyCodeWithComments = `
        # This is a Python comment
        def test():
          # Another comment
          print("test")
      `;

      expect(LanguageDetector.detectLanguage(jsCodeWithComments)).toBe(
        "javascript"
      );
      expect(LanguageDetector.detectLanguage(pyCodeWithComments)).toBe(
        "python"
      );
    });
  });
});
