import * as Lint from "tslint";
import { EMPTY_CONFIG, IConfigurationFile } from "tslint/lib/configuration";
import * as fs from "fs";

export default class Linter {
    private config: IConfigurationFile;
    private linter: Lint.Linter;
    public constructor() {
        this.config = EMPTY_CONFIG;
        this.config.rules.clear();
        this.linter = new Lint.Linter(
            {
                fix: false,
                formatter: "json",
                formattersDirectory: undefined,
                rulesDirectory: "./lib/rules"
            },
            undefined
        );
    }

    public addRule(rule: string, options?: string[]) {
        this.config.rules.set(rule, {
            ruleArguments: [true, ...(options || [])],
            ruleName: rule
        });
    }

    public lint(source:string): Lint.LintResult {
        this.linter.lint("FileName.ts", source, this.config);
        return this.linter.getResult();
    }
}

const test = new Linter();
test.addRule("ts-egret");
let source = fs.readFileSync("./test.ts").toString();
test.lint(source);
console.log("lint over");

// describe("cls-name",cases => {
//     cases.forEach(({source,success},index) => {
//
//     });
// });