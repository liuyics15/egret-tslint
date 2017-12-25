"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
const warnTips = {
    cls: "类名遵循【大驼峰】法，如 TextField",
    module: "模块名遵循【小写下划线】法，如 name_space",
    interface: "接口名遵循【I前缀】【大驼峰】法，如 IWatch",
    enum: "枚举名遵循【E前缀】【大驼峰】法，如 EGameType",
    var: "禁止使用【var】声明变量，使用【let】（变量）或【const】（常量）代替",
    const: "常量名遵循【C前缀】【大写下划线】法，如 C_GAME_NAME",
    let: "全局变量名遵循【g或p前缀】【小写下划线】法，如 g_scene_hall，p_res",
    let_g: "根节点全局变量名遵循【g前缀】【小写下划线】法，如 g_scene_hall",
    let_p: "模块全局变量名遵循【p前缀】【小写下划线】法，如 p_hall",
    method_s: "类静态方法名遵循【大驼峰】法，如 CreateIns()",
    method: "类方法名遵循【小驼峰】法，如 toString()",
    property_s: "类静态变量名遵循【s前缀】【小写下划线】法，如 s_instance",
    property_m: "类公共变量名遵循【m前缀】【小写下划线】法，如 m_id",
    property_p: "类私有变量名遵循【 前缀】【小写下划线】法，如 _name"
};
class Rule extends Lint.Rules.AbstractRule {
    apply(source) {
        return this.applyWithWalker(new TsEgretRule(source, this.getOptions()));
    }
}
Rule.metadata = {
    ruleName: "ts-egret",
    description: "白鹭引擎ts命名规范",
    optionsDescription: "Not configurable.",
    options: null,
    optionExamples: ["true"],
    type: "functionality",
    typescriptOnly: true
};
Rule.FAILURE_STRING = "格式有误";
exports.Rule = Rule;
class TsEgretRule extends Lint.RuleWalker {
    visitClassDeclaration(node) {
        let cName = node.name.escapedText;
        if (!assertBigCamel(cName)) {
            this.throwFailure(node, warnTips.cls);
        }
        super.visitClassDeclaration(node);
    }
    visitModuleDeclaration(node) {
        let mName;
        if (node.name["escapedText"]) {
            mName = node.name["escapedText"];
        }
        else {
            mName = node.name.text;
        }
        if (!assertLitLine(mName)) {
            this.throwFailure(node, warnTips.module);
        }
        super.visitModuleDeclaration(node);
    }
    visitInterfaceDeclaration(node) {
        let iName = node.name.escapedText;
        if (!/^I[A-Z]/.test(iName)) {
            this.throwFailure(node, warnTips.interface);
        }
        super.visitInterfaceDeclaration(node);
    }
    visitEnumDeclaration(node) {
        let eName = node.name.escapedText;
        if (!/^E[A-Z]/.test(eName)) {
            this.throwFailure(node, warnTips.enum);
        }
        super.visitEnumDeclaration(node);
    }
    visitVariableStatement(node) {
        let fullText = node.getText();
        if (/var/.test(fullText)) {
            this.throwFailure(node, warnTips.var);
        }
        else if (/const/.test(fullText)) {
            if (getVariableWorkspace(node.parent)) {
                let thisArg = this;
                node.declarationList.declarations.forEach(function (declaration) {
                    let name = declaration.name["escapedText"];
                    if (/[a-z]/.test(name) || !/^C_/.test(name)) {
                        thisArg.throwFailure(declaration, warnTips.const);
                    }
                });
            }
        }
        else {
            let spaceID = getVariableWorkspace(node.parent);
            if (spaceID) {
                let thisArg = this;
                node.declarationList.declarations.forEach(function (declaration) {
                    let name = declaration.name["escapedText"];
                    if (/[A-Z]/.test(name)) {
                        thisArg.throwFailure(declaration, warnTips.let);
                    }
                    else if (spaceID == 1 && !/^g_/.test(name)) {
                        thisArg.throwFailure(declaration, warnTips.let_g);
                    }
                    else if (spaceID == 2 && !/^p_/.test(name)) {
                        thisArg.throwFailure(declaration, warnTips.let_p);
                    }
                });
            }
        }
        super.visitVariableStatement(node);
    }
    visitMethodDeclaration(node) {
        let bPublic = true;
        let bStatic = false;
        if (node.modifiers) {
            node.modifiers.forEach(modifier => {
                switch (modifier.kind) {
                    case ts.SyntaxKind.ProtectedKeyword:
                    case ts.SyntaxKind.PrivateKeyword:
                        {
                            bPublic = false;
                        }
                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        {
                            bStatic = true;
                        }
                        break;
                }
            });
        }
        let mName = node.name["escapedText"];
        if (bStatic) {
            if (!assertBigCamel(mName)) {
                this.throwFailure(node, warnTips.method_s);
            }
        }
        else {
            if (!assertLitCamel(mName)) {
                this.throwFailure(node, warnTips.method);
            }
        }
        super.visitMethodDeclaration(node);
    }
    visitPropertyDeclaration(node) {
        let bPublic = true;
        let bStatic = false;
        if (node.modifiers) {
            node.modifiers.forEach(modifier => {
                switch (modifier.kind) {
                    case ts.SyntaxKind.ProtectedKeyword:
                    case ts.SyntaxKind.PrivateKeyword:
                        {
                            bPublic = false;
                        }
                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        {
                            bStatic = true;
                        }
                        break;
                }
            });
        }
        let pName = node.name["escapedText"];
        if (bStatic) {
            if (!/^s_/.test(pName) || /[A-Z]/.test(pName)) {
                this.throwFailure(node, warnTips.property_s);
            }
        }
        else if (bPublic) {
            if (!/^m_/.test(pName) || /[A-Z]/.test(pName)) {
                this.throwFailure(node, warnTips.property_m);
            }
        }
        else {
            if (!/^_/.test(pName) || /[A-Z]/.test(pName)) {
                this.throwFailure(node, warnTips.property_p);
            }
        }
        super.visitPropertyDeclaration(node);
    }
    throwFailure(node, tip) {
        this.addFailureAt(node.getStart(), node.getWidth(), tip);
    }
}
function getVariableWorkspace(parentNode) {
    let spaceID = 0;
    let judgeConst = false;
    if (!parentNode) {
        judgeConst = true;
        spaceID = 1;
    }
    else if (ts.isSourceFile(parentNode)) {
        spaceID = 1;
        judgeConst = true;
    }
    else if (ts.isModuleBlock(parentNode)) {
        spaceID = 2;
        judgeConst = true;
    }
    return spaceID;
}
function assertBigCamel(name) {
    if (/_/.test(name)) {
        return false;
    }
    if (/^[a-z]/.test(name)) {
        return false;
    }
    return true;
}
function assertLitCamel(name) {
    if (/_/.test(name)) {
        return false;
    }
    if (/^[A-Z]/.test(name)) {
        return false;
    }
    return true;
}
function assertLitLine(name) {
    if (/[A-Z]/.test(name)) {
        return false;
    }
    return true;
}
