export class LanguageDetector {
  private static readonly jsPatterns = [
    { pattern: /undefined/g, points: 2 }, // undefined keyword
    { pattern: /console\.log( )*\(/, points: 2 }, // console.log calls
    { pattern: /(var|const|let)( )+\w+( )*=?/, points: 2 }, // Variable declarations
    { pattern: /(('|").+('|")( )*|\w+):( )*[{\[]/, points: 2 }, // Array/Object declarations
    { pattern: /===/g, points: 1 }, // === operator
    { pattern: /!==/g, points: 1 }, // !== operator
    { pattern: /function\*?(( )+[\$\w]+( )*\(.*\)|( )*\(.*\))/g, points: 1 }, // Function definition
    { pattern: /null/g, points: 1 }, // null keyword
    { pattern: /\(.*\)( )*=>( )*.+/, points: 1 }, // lambda expression
    { pattern: /(else )?if( )+\(.+\)/, points: 1 }, // if statements
    { pattern: /async( )+function/, points: 2 }, // async function
    { pattern: /module\.exports( )*=/, points: 2 }, // module.exports
  ];

  private static readonly pythonPatterns = [
    { pattern: /def( )+\w+\(.*\)( )*:/, points: 2 }, // Function definition
    { pattern: /from [\w\.]+ import (\w+|\*)/, points: 2 }, // from import
    { pattern: /class( )*\w+(\(( )*\w+( )*\))?( )*:/, points: 2 }, // class definition
    { pattern: /if( )+(.+)( )*:/, points: 2 }, // if statement
    { pattern: /elif( )+(.+)( )*:/, points: 2 }, // elif keyword
    { pattern: /else:/, points: 2 }, // else keyword
    { pattern: /for (\w+|\(?\w+,( )*\w+\)?) in (.+):/, points: 2 }, // for loop
    { pattern: /\w+( )*=( )*\w+(?!;)(\n|$)/, points: 1 }, // Variable assignment
    { pattern: /import ([[^\.]\w])+/, points: 1 }, // import statement
    { pattern: /print((( )*\(.+\))|( )+.+)/, points: 1 }, // print statement
  ];

  /**
   * Detects if the given code is JavaScript or Python
   * @param code The source code to analyze
   * @returns 'javascript', 'python', or 'unknown'
   */
  static detectLanguage(code: string): "javascript" | "python" | "unknown" {
    // Remove comments and empty lines to clean the code
    const cleanCode = code
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "") // Remove JS comments
      .replace(/#.*/g, "") // Remove Python comments
      .trim();

    if (cleanCode.length === 0) return "unknown";

    let jsScore = 0;
    let pyScore = 0;

    // Check JavaScript patterns
    this.jsPatterns.forEach(({ pattern, points }) => {
      if (pattern.test(cleanCode)) jsScore += points;
    });

    // Check Python patterns
    this.pythonPatterns.forEach(({ pattern, points }) => {
      if (pattern.test(cleanCode)) pyScore += points;
    });

    // Determine the language based on weighted scores
    if (jsScore > pyScore) return "javascript";
    if (pyScore > jsScore) return "python";
    return "unknown";
  }
}
