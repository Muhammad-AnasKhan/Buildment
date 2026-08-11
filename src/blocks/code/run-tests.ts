import vm from "node:vm";

export type CodeTest = { name: string; code: string };

export type CodeTestResult = {
  passed: boolean;
  failedTestName?: string;
  errorMessage?: string;
};

/**
 * Runs mentor-authored tests against learner JavaScript in an isolated sandbox.
 * Learner code should use CommonJS exports: `module.exports = { fnName }`.
 */
export function runCodeTests(userSource: string, tests: CodeTest[]): CodeTestResult {
  const moduleExports: Record<string, unknown> = {};
  const sandbox: vm.Context = {
    module: { exports: moduleExports },
    exports: moduleExports,
    console: {
      log: () => {},
      error: () => {},
      warn: () => {},
    },
  };

  try {
    vm.runInNewContext(
      `(function() {\n${userSource}\n})();`,
      sandbox,
      { timeout: 3000, filename: "learner-code.js" }
    );
  } catch (err) {
    return {
      passed: false,
      failedTestName: "Your code",
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }

  for (const test of tests) {
    try {
      vm.runInNewContext(
        `(function() {\n${test.code}\n})();`,
        sandbox,
        { timeout: 3000, filename: `test-${test.name.replace(/\s+/g, "-")}.js` }
      );
    } catch (err) {
      return {
        passed: false,
        failedTestName: test.name,
        errorMessage: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return { passed: true };
}
