import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// Load CommonJS module
const scannerModule = require("~/sonar-qube/sonarqube-scanner");

// Confirm it exports a default function
console.log("scannerModule.default is function?", typeof scannerModule.default === "function");

// Call the scanner function via `.default`
scannerModule.default(
  {
    serverUrl: "http://localhost:9000",
    token: process.env.SONAR_TOKEN,
    options: {
      "sonar.sources": "./src",
      "sonar.projectKey": "axi-frontend",
      "sonar.projectName": "AXI Frontend",
      "sonar.projectVersion": "1.0",
      "sonar.typescript.tsconfigPaths": "tsconfig.json",
      "sonar.sourceEncoding": "UTF-8",
      "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
      "sonar.projectBaseDir": process.cwd()
    }
  },
  (error) => {
    if (error) {
      console.error("❌ SonarQube scan failed:", error);
    } else {
      console.log("✅ SonarQube scan completed successfully.");
    }
    process.exit();
  }
);
