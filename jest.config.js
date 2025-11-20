// jest.config.js
export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup/database.js"],
  testMatch: [
    "**/__tests__/**/*.test.{js,jsx}",
    "**/?(*.)+(spec|test).{js,jsx}",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/index.js",
    "!src/server.js",
    "!src/**/*.test.{js,jsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 10000,
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: [
        "<rootDir>/__tests__/{api,integration,database,business-logic,error-handling,auth,interactions}/**/*.test.js",
      ],
    },
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/components/**/*.test.jsx"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/setup/jsdom-setup.js"],
    },
  ],
};
