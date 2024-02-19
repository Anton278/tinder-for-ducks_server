import fs from "fs";

fs.rmSync("./dist/__tests__", { recursive: true, force: true });

fs.rmSync("./dist/coverage", { recursive: true, force: true });

fs.rmSync("./dist/babel.config.js", { recursive: true, force: true });

fs.rmSync("./dist/clearDist.js", { recursive: true, force: true });

fs.rmSync("./dist/jest.config.js", { recursive: true, force: true });
