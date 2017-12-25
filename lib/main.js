"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lint = require("tslint");
const configuration_1 = require("tslint/lib/configuration");
const fs = require("fs");
class Linter {
    constructor() {
        this.config = configuration_1.EMPTY_CONFIG;
        this.config.rules.clear();
        this.linter = new Lint.Linter({
            fix: false,
            formatter: "json",
            formattersDirectory: undefined,
            rulesDirectory: "./lib/rules"
        }, undefined);
    }
    addRule(rule, options) {
        this.config.rules.set(rule, {
            ruleArguments: [true, ...(options || [])],
            ruleName: rule
        });
    }
    lint(source) {
        this.linter.lint("FileName.ts", source, this.config);
        return this.linter.getResult();
    }
}
exports.default = Linter;
const test = new Linter();
test.addRule("ts-egret");
let source = fs.readFileSync("./test.ts").toString();
test.lint(source);
console.log("lint over");
