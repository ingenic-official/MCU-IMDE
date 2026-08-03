"use strict";
exports.id = "src_menuconfig_MenuconfigPanel_ts";
exports.ids = ["src_menuconfig_MenuconfigPanel_ts"];
exports.modules = {

/***/ "./src/i18n/index.ts"
/*!***************************!*\
  !*** ./src/i18n/index.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Language: () => (/* binding */ Language),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getCurrentLanguage: () => (/* binding */ getCurrentLanguage),
/* harmony export */   t: () => (/* binding */ t)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// i18n 国际化支持

// 支持的语言
var Language;
(function (Language) {
    Language["ZH_CN"] = "zh-cn";
    Language["EN_US"] = "en-us"; // eslint-disable-line no-unused-vars
})(Language || (Language = {}));
// 中文文本
const zhCN = {
    'common.confirm': '确定',
    'common.cancel': '取消',
    'reset.confirmTitle': '确认重置配置',
    'reset.confirmMessage': '您确定要将所有配置重置为 Kconfig 默认值吗？这将删除当前的 .config 文件并恢复所有配置项到默认状态。此操作无法撤销。',
    'reset.confirmButton': '确认重置',
    'reset.cancelButton': '取消',
    'reset.progress.title': '正在重置配置',
    'reset.progress.clearing': '删除配置文件并恢复默认值',
    'reset.progress.loading': '重新加载配置',
    'reset.progress.complete': '重置完成',
    'reset.success': '配置已成功重置为默认值',
    'reset.failed': '重置失败',
    'discard.confirmTitle': '确认丢弃更改',
    'discard.confirmMessage': '您确定要丢弃所有未保存的更改吗？此操作无法撤销。',
    'discard.success': '已成功丢弃所有未保存的更改',
    'discard.failed': '丢弃更改失败',
    'save.success': '配置已成功保存',
    'save.failed': '保存配置失败',
    'close.unsavedTitle': '未保存的更改',
    'close.unsavedMessage': '配置编辑器中有未保存的更改，是否要在关闭前保存？',
    'close.saveButton': '是',
    'close.noSaveButton': '否',
    'close.saveSuccess': '配置已保存',
    'close.saveFailed': '保存失败，将继续关闭'
};
// 英文文本
const enUS = {
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'reset.confirmTitle': 'Confirm Reset Configuration',
    'reset.confirmMessage': 'Are you sure you want to reset all configurations to Kconfig default values? This will delete the current .config file and restore all configuration items to their default state. This action cannot be undone.',
    'reset.confirmButton': 'Confirm Reset',
    'reset.cancelButton': 'Cancel',
    'reset.progress.title': 'Resetting Configuration',
    'reset.progress.clearing': 'Deleting configuration file and restoring defaults',
    'reset.progress.loading': 'Reloading configuration',
    'reset.progress.complete': 'Reset Complete',
    'reset.success': 'Configuration successfully reset to default values',
    'reset.failed': 'Reset Failed',
    'discard.confirmTitle': 'Confirm Discard Changes',
    'discard.confirmMessage': 'Are you sure you want to discard all unsaved changes? This action cannot be undone.',
    'discard.success': 'Successfully discarded all unsaved changes',
    'discard.failed': 'Failed to discard changes',
    'save.success': 'Configuration saved successfully',
    'save.failed': 'Failed to save configuration',
    'close.unsavedTitle': 'Unsaved Changes',
    'close.unsavedMessage': 'There are unsaved changes in the configuration editor. Do you want to save before closing?',
    'close.saveButton': 'Yes',
    'close.noSaveButton': 'No',
    'close.saveSuccess': 'Configuration saved',
    'close.saveFailed': 'Save failed, will continue closing'
};
// 语言包映射
const languagePacks = {
    [Language.ZH_CN]: zhCN,
    [Language.EN_US]: enUS
};
// 获取当前语言
function getCurrentLanguage() {
    const locale = vscode__WEBPACK_IMPORTED_MODULE_0__.env.language.toLowerCase();
    if (locale.startsWith('zh')) {
        return Language.ZH_CN;
    }
    return Language.EN_US;
}
// 获取文本
function t(key) {
    const currentLanguage = getCurrentLanguage();
    const languagePack = languagePacks[currentLanguage];
    return languagePack[key] || key;
}
// 导出默认翻译函数
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (t);


/***/ },

/***/ "./src/menuconfig/ConcurrentFileProcessor.ts"
/*!***************************************************!*\
  !*** ./src/menuconfig/ConcurrentFileProcessor.ts ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConcurrentFileProcessor: () => (/* binding */ ConcurrentFileProcessor)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glob__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glob */ "./node_modules/glob/dist/esm/index.js");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



/**
 * 并发文件处理器 - 解决 880+ packages 文件串行读取性能问题
 * 这是性能优化的核心组件，将同步串行处理改为异步并发处理
 */
class ConcurrentFileProcessor {
    static DEFAULT_CONCURRENCY_LIMIT = 100; // 增加并发限制以提高性能
    static MAX_RETRIES = 3;
    static OPTIMAL_BATCH_SIZE = 200; // 优化的批次大小
    concurrencyLimit;
    fileContentCache = new Map();
    constructor(concurrencyLimit = ConcurrentFileProcessor.DEFAULT_CONCURRENCY_LIMIT) {
        this.concurrencyLimit = concurrencyLimit;
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.info(`[CONCURRENT_PROCESSOR] Initialized with concurrency limit: ${concurrencyLimit}`);
    }
    /**
     * 异步并发读取多个文件
     * @param filePaths 要读取的文件路径数组
     * @returns Promise<Map<string, string>> 文件路径到内容的映射
     */
    async readFilesAsync(filePaths) {
        const _startTime = Date.now();
        const results = new Map();
        // 创建分块处理，避免过多并发导致系统资源耗尽
        const chunks = this.chunkArray(filePaths, this.concurrencyLimit);
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            const chunk = chunks[chunkIndex];
            const chunkPromises = chunk.map(filePath => this.readSingleFileWithRetry(filePath));
            const chunkResults = await Promise.allSettled(chunkPromises);
            // 处理结果
            chunkResults.forEach((result, index) => {
                const filePath = chunk[index];
                if (result.status === 'fulfilled' && result.value !== null) {
                    results.set(filePath, result.value);
                }
                else if (result.status === 'rejected') {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`[CONCURRENT_PROCESSOR] 无法读取文件: ${filePath}`);
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.error(`[CONCURRENT_PROCESSOR] 读取错误: ${result.reason}`);
                }
            });
        }
        const totalTime = Date.now() - _startTime;
        const successCount = results.size;
        const _avgTime = successCount > 0 ? (totalTime / successCount).toFixed(1) : 0;
        return results;
    }
    /**
     * 异步解析 glob 模式并读取文件
     * @param globPattern glob 匹配模式
     * @returns Promise<Map<string, string>> 文件路径到内容的映射
     */
    async processGlobPattern(globPattern) {
        const _startTime = Date.now();
        try {
            const matchedFiles = (await (0,glob__WEBPACK_IMPORTED_MODULE_1__.glob)(globPattern, { nodir: true })).sort();
            const _globTime = Date.now() - _startTime;
            if (matchedFiles.length === 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`[CONCURRENT_PROCESSOR] Glob 模式未匹配到任何文件: ${globPattern}`);
                return new Map();
            }
            return await this.readFilesAsync(matchedFiles);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.error(`[CONCURRENT_PROCESSOR] Glob 解析失败: ${globPattern}`, error);
            return new Map();
        }
    }
    /**
     * 带重试的单文件读取
     */
    async readSingleFileWithRetry(filePath, retryCount = 0) {
        // 检查缓存
        if (this.fileContentCache.has(filePath)) {
            return this.fileContentCache.get(filePath);
        }
        try {
            const content = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filePath, 'utf8');
            // 缓存内容
            this.fileContentCache.set(filePath, content);
            return content;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            if (retryCount < ConcurrentFileProcessor.MAX_RETRIES) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`[CONCURRENT_PROCESSOR] 重试读取文件 ${filePath} (第 ${retryCount + 1} 次)`);
                await this.sleep(100 * (retryCount + 1)); // 递增延迟
                return this.readSingleFileWithRetry(filePath, retryCount + 1);
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.error(`[CONCURRENT_PROCESSOR] 读取文件失败，已达最大重试次数: ${filePath}`, error);
            return null;
        }
    }
    /**
     * 数组分块
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    /**
     * 延迟工具函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * 清理缓存
     */
    clearCache() {
        this.fileContentCache.clear();
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.info(`[CONCURRENT_PROCESSOR] 缓存已清理`);
    }
    /**
     * 获取缓存统计
     */
    getCacheStats() {
        const cacheSize = Array.from(this.fileContentCache.values())
            .reduce((total, content) => total + content.length, 0);
        return {
            cachedFiles: this.fileContentCache.size,
            cacheSize: `${(cacheSize / 1024 / 1024).toFixed(2)} MB`
        };
    }
}


/***/ },

/***/ "./src/menuconfig/ConditionEvaluator.ts"
/*!**********************************************!*\
  !*** ./src/menuconfig/ConditionEvaluator.ts ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConditionEvaluator: () => (/* binding */ ConditionEvaluator)
/* harmony export */ });
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Condition expression evaluator for Kconfig
 * Supports:
 * - Boolean operations: &&, ||, !
 * - Comparisons: =, !=, >, <, >=, <=
 * - Variable references
 * - Literal values (strings, numbers, booleans)
 */
class ConditionEvaluator {
    static MAX_RESULT_CACHE_SIZE = 20000;
    static MAX_AST_CACHE_SIZE = 5000;
    context;
    astCache = new Map();
    expressionVariableDeps = new Map();
    evaluationCache = new Map();
    contextVersion = 0;
    symbolVersions = new Map();
    constructor(context = {}) {
        this.context = context;
    }
    /**
     * Update the configuration context
     */
    updateContext(newContext) {
        let hasChanges = false;
        for (const [key, value] of Object.entries(newContext)) {
            if (!this.areValuesEqual(this.context[key], value)) {
                this.context[key] = value;
                hasChanges = true;
                this.bumpSymbolVersion(key);
            }
        }
        if (hasChanges) {
            this.contextVersion += 1;
        }
    }
    /**
     * Set a single configuration value
     */
    setValue(configName, value) {
        if (this.areValuesEqual(this.context[configName], value)) {
            return;
        }
        this.context[configName] = value;
        this.contextVersion += 1;
        this.bumpSymbolVersion(configName);
    }
    /**
     * Get a configuration value
     */
    getValue(configName) {
        return this.context[configName];
    }
    /**
     * Parse and evaluate a condition expression
     */
    evaluate(expression) {
        if (!expression || expression.trim() === '') {
            return true; // Empty condition is always true
        }
        try {
            const normalized = this.normalizeExpression(expression.trim());
            const ast = this.parseExpression(normalized);
            const deps = this.expressionVariableDeps.get(normalized) || [];
            const signature = this.buildExpressionSignature(deps);
            const cached = this.evaluationCache.get(normalized);
            if (cached && cached.signature === signature) {
                return cached.result;
            }
            const result = this.evaluateNode(ast);
            if (this.evaluationCache.size >= ConditionEvaluator.MAX_RESULT_CACHE_SIZE) {
                this.evaluationCache.clear();
            }
            this.evaluationCache.set(normalized, { signature, result });
            return result;
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_0__.Logger.warn(`Failed to evaluate condition: ${expression}. Error: ${error}`);
            return true; // Default to visible if evaluation fails
        }
    }
    setAstCache(key, node) {
        if (this.astCache.size >= ConditionEvaluator.MAX_AST_CACHE_SIZE) {
            this.astCache.clear();
            this.expressionVariableDeps.clear();
        }
        this.astCache.set(key, node);
    }
    /**
     * Parse condition expression into AST
     */
    parseExpression(expression) {
        const normalized = this.normalizeExpression(expression);
        if (normalized === '') {
            const literalTrue = {
                type: 'LITERAL',
                value: true,
                literalKind: 'boolean',
                rawValue: 'true'
            };
            this.setAstCache(normalized, literalTrue);
            this.expressionVariableDeps.set(normalized, []);
            return literalTrue;
        }
        const cached = this.astCache.get(normalized);
        if (cached) {
            return cached;
        }
        // Parse OR expressions (lowest precedence)
        const orMatch = this.findOperator(normalized, '||');
        if (orMatch) {
            const result = {
                type: 'OR',
                left: this.parseExpression(orMatch.left),
                right: this.parseExpression(orMatch.right)
            };
            this.setAstCache(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse AND expressions
        const andMatch = this.findOperator(normalized, '&&');
        if (andMatch) {
            const result = {
                type: 'AND',
                left: this.parseExpression(andMatch.left),
                right: this.parseExpression(andMatch.right)
            };
            this.setAstCache(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse NOT expressions
        if (normalized.startsWith('!')) {
            const result = {
                type: 'NOT',
                left: this.parseExpression(normalized.substring(1).trim())
            };
            this.setAstCache(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse comparison expressions
        const comparisonMatch = this.findComparison(normalized);
        if (comparisonMatch) {
            const result = {
                type: 'COMPARISON',
                left: this.parseExpression(comparisonMatch.left),
                right: this.parseExpression(comparisonMatch.right),
                operator: comparisonMatch.operator
            };
            this.setAstCache(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse literals and variables
        const literalNode = this.parseLiteral(normalized);
        this.setAstCache(normalized, literalNode);
        this.expressionVariableDeps.set(normalized, this.collectVariableDeps(literalNode));
        return literalNode;
    }
    collectVariableDeps(root) {
        const deps = new Set();
        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) {
                continue;
            }
            if (node.type === 'VARIABLE' && node.variable) {
                deps.add(node.variable);
            }
            if (node.left) {
                stack.push(node.left);
            }
            if (node.right) {
                stack.push(node.right);
            }
        }
        return Array.from(deps).sort();
    }
    buildExpressionSignature(variableNames) {
        if (!variableNames || variableNames.length === 0) {
            return 'const';
        }
        const parts = new Array(variableNames.length + 1);
        parts[0] = `v${this.contextVersion}`;
        for (let i = 0; i < variableNames.length; i++) {
            const name = variableNames[i];
            const version = this.symbolVersions.get(name) || 0;
            parts[i + 1] = `${name}:${version}`;
        }
        return parts.join('|');
    }
    bumpSymbolVersion(symbol) {
        const prev = this.symbolVersions.get(symbol) || 0;
        this.symbolVersions.set(symbol, prev + 1);
    }
    areValuesEqual(a, b) {
        return a === b;
    }
    normalizeExpression(expression) {
        if (!expression) {
            return '';
        }
        let normalized = expression.trim();
        normalized = this.removeOuterParentheses(normalized);
        return normalized;
    }
    /**
     * Remove outer parentheses if they wrap the entire expression
     */
    removeOuterParentheses(expression) {
        let trimmed = expression.trim();
        while (trimmed.startsWith('(') && trimmed.endsWith(')')) {
            let depth = 0;
            let canStrip = true;
            for (let i = 0; i < trimmed.length; i++) {
                const ch = trimmed[i];
                if (ch === '(') {
                    depth++;
                }
                else if (ch === ')') {
                    depth--;
                    if (depth === 0 && i < trimmed.length - 1) {
                        canStrip = false;
                        break;
                    }
                }
            }
            if (!canStrip) {
                break;
            }
            trimmed = trimmed.substring(1, trimmed.length - 1).trim();
        }
        return trimmed;
    }
    /**
     * Find operator at the top level (not inside parentheses)
     */
    findOperator(expression, operator) {
        // Logger.debug(`[FIND_OP] Looking for "${operator}" in "${expression}"`);
        let depth = 0;
        let lastFoundIndex = -1;
        // 从左向右扫描，正确处理括号嵌套
        for (let i = 0; i < expression.length - operator.length + 1; i++) {
            if (expression[i] === '(') {
                depth++;
                // Logger.debug(`[FIND_OP] At index ${i}, char='(', depth=${depth}`);
            }
            else if (expression[i] === ')') {
                depth--;
                // Logger.debug(`[FIND_OP] At index ${i}, char=')', depth=${depth}`);
            }
            else if (depth === 0 && expression.substring(i, i + operator.length) === operator) {
                // Logger.debug(`[FIND_OP] Found "${operator}" at index ${i}, depth=${depth}`);
                lastFoundIndex = i;
                // 继续寻找最后一个操作符（优先右结合）
            }
        }
        if (lastFoundIndex !== -1) {
            const result = {
                left: expression.substring(0, lastFoundIndex).trim(),
                right: expression.substring(lastFoundIndex + operator.length).trim()
            };
            // Logger.debug(`[FIND_OP] Split: left="${result.left}", right="${result.right}"`);
            return result;
        }
        // Logger.debug(`[FIND_OP] Operator "${operator}" not found`);
        return null;
    }
    /**
     * Find comparison operator at the top level
     */
    findComparison(expression) {
        const operators = ['!=', '>=', '<=', '=', '>', '<'];
        for (const op of operators) {
            let depth = 0;
            let lastFoundIndex = -1;
            for (let i = expression.length - op.length; i >= 0; i--) {
                if (expression[i] === ')') {
                    depth++;
                }
                else if (expression[i] === '(') {
                    depth--;
                }
                else if (depth === 0 && expression.substring(i, i + op.length) === op) {
                    lastFoundIndex = i;
                    break;
                }
            }
            if (lastFoundIndex !== -1) {
                return {
                    left: expression.substring(0, lastFoundIndex).trim(),
                    right: expression.substring(lastFoundIndex + op.length).trim(),
                    operator: op
                };
            }
        }
        return null;
    }
    /**
     * Parse literal values and variables
     */
    parseLiteral(expression) {
        expression = expression.trim();
        // String literal
        if (expression.startsWith('"') && expression.endsWith('"')) {
            return {
                type: 'LITERAL',
                value: expression.substring(1, expression.length - 1),
                literalKind: 'string',
                rawValue: expression
            };
        }
        // Number literal
        if (/^-?\d+$/.test(expression)) {
            return {
                type: 'LITERAL',
                value: parseInt(expression),
                literalKind: 'number',
                rawValue: expression
            };
        }
        // Hex literal
        if (/^0x[0-9a-fA-F]+$/.test(expression)) {
            return {
                type: 'LITERAL',
                value: parseInt(expression, 16),
                literalKind: 'hex',
                rawValue: expression
            };
        }
        // Boolean literals
        if (expression === 'm' || expression === 'M') {
            return {
                type: 'LITERAL',
                value: 'm',
                literalKind: 'tristate',
                rawValue: expression
            };
        }
        if (expression === 'y' || expression === 'true') {
            return {
                type: 'LITERAL',
                value: true,
                literalKind: expression === 'y' ? 'tristate' : 'boolean',
                rawValue: expression
            };
        }
        if (expression === 'n' || expression === 'false') {
            return {
                type: 'LITERAL',
                value: false,
                literalKind: expression === 'n' ? 'tristate' : 'boolean',
                rawValue: expression
            };
        }
        // Variable reference
        return {
            type: 'VARIABLE',
            variable: expression
        };
    }
    /**
     * Evaluate AST node
     */
    evaluateNode(node) {
        switch (node.type) {
            case 'AND':
                return this.evaluateNode(node.left) && this.evaluateNode(node.right);
            case 'OR':
                return this.evaluateNode(node.left) || this.evaluateNode(node.right);
            case 'NOT':
                return !this.evaluateNode(node.left);
            case 'COMPARISON':
                return this.evaluateComparison(node);
            case 'VARIABLE':
                return this.evaluateVariable(node.variable);
            case 'LITERAL':
                return this.toLiteral(node.value);
            default:
                _logger_logger__WEBPACK_IMPORTED_MODULE_0__.Logger.warn(`Unknown node type: ${node.type}`);
                return true;
        }
    }
    /**
     * Evaluate comparison node
     */
    evaluateComparison(node) {
        const leftValue = this.getNodeValue(node.left);
        const rightValue = this.getNodeValue(node.right);
        const { left: leftNormalized, right: rightNormalized } = this.normalizeComparisonOperands(leftValue, rightValue, node.left, node.right);
        switch (node.operator) {
            case '=':
                return leftNormalized === rightNormalized;
            case '!=':
                return leftNormalized !== rightNormalized;
            case '>':
                return this.toNumber(leftNormalized) > this.toNumber(rightNormalized);
            case '<':
                return this.toNumber(leftNormalized) < this.toNumber(rightNormalized);
            case '>=':
                return this.toNumber(leftNormalized) >= this.toNumber(rightNormalized);
            case '<=':
                return this.toNumber(leftNormalized) <= this.toNumber(rightNormalized);
            default:
                _logger_logger__WEBPACK_IMPORTED_MODULE_0__.Logger.warn(`Unknown comparison operator: ${node.operator}`);
                return true;
        }
    }
    /**
     * Get the actual value from a node
     */
    getNodeValue(node) {
        switch (node.type) {
            case 'VARIABLE':
                return this.context[node.variable];
            case 'LITERAL':
                return node.value;
            default:
                return this.evaluateNode(node);
        }
    }
    /**
     * Evaluate variable reference
     */
    evaluateVariable(variable) {
        const value = this.context[variable];
        // Logger.debug(`[EVALUATOR] Variable ${variable} = ${value} (type: ${typeof value})`);
        const result = this.toBoolean(value);
        // Logger.debug(`[EVALUATOR] toBoolean(${value}) = ${result}`);
        return result;
    }
    /**
     * Convert value to boolean
     */
    toBoolean(value) {
        if (value === undefined || value === null) {
            return false;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') {
                return false;
            }
            const lower = trimmed.toLowerCase();
            if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === 'on') {
                return true;
            }
            if (lower === 'm') {
                return true;
            }
            if (lower === 'n' || lower === 'no' || lower === 'false' || lower === 'off') {
                return false;
            }
            if (/^0x[0-9a-f]+$/i.test(trimmed)) {
                return parseInt(trimmed, 16) !== 0;
            }
            if (/^-?\d+$/.test(trimmed)) {
                return parseInt(trimmed, 10) !== 0;
            }
            return true;
        }
        return Boolean(value);
    }
    /**
     * Convert value to literal boolean
     */
    toLiteral(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        return this.toBoolean(value);
    }
    /**
     * Convert value to number
     */
    toNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'y') {
                return 2;
            }
            if (lower === 'm') {
                return 1;
            }
            if (lower === 'n') {
                return 0;
            }
            if (value.startsWith('0x')) {
                return parseInt(value, 16);
            }
            return parseInt(value) || 0;
        }
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        return 0;
    }
    normalizeComparisonValue(value, options) {
        if (value === undefined || value === null) {
            return value;
        }
        if (typeof value === 'boolean') {
            return value ? 'y' : 'n';
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (options?.forceString) {
                return trimmed;
            }
            const lower = trimmed.toLowerCase();
            if (lower === 'y' || lower === 'm' || lower === 'n') {
                return lower;
            }
            if (lower === 'true') {
                return 'y';
            }
            if (lower === 'false') {
                return 'n';
            }
            const numericCandidate = this.tryConvertStringToNumber(trimmed);
            if (numericCandidate !== null) {
                return numericCandidate;
            }
            return trimmed;
        }
        return value;
    }
    normalizeComparisonOperands(left, right, leftNode, rightNode) {
        const leftIsPlainString = this.isPlainStringValue(left);
        const rightIsPlainString = this.isPlainStringValue(right);
        const treatAsString = this.isStringLiteral(leftNode) || this.isStringLiteral(rightNode);
        const forceString = treatAsString || leftIsPlainString || rightIsPlainString;
        let leftNormalized = this.normalizeComparisonValue(left, { forceString });
        let rightNormalized = this.normalizeComparisonValue(right, { forceString });
        if (leftIsPlainString && typeof rightNormalized === 'number') {
            rightNormalized = this.numericLiteralToString(rightNode, rightNormalized);
        }
        if (rightIsPlainString && typeof leftNormalized === 'number') {
            leftNormalized = this.numericLiteralToString(leftNode, leftNormalized);
        }
        if (typeof leftNormalized === 'number' && this.isTristateString(rightNormalized)) {
            rightNormalized = this.tristateToNumber(rightNormalized);
        }
        else if (typeof rightNormalized === 'number' && this.isTristateString(leftNormalized)) {
            leftNormalized = this.tristateToNumber(leftNormalized);
        }
        return { left: leftNormalized, right: rightNormalized };
    }
    isPlainStringValue(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const trimmed = value.trim();
        const lower = trimmed.toLowerCase();
        if (lower === 'y' || lower === 'm' || lower === 'n') {
            return false;
        }
        if (lower === 'true' || lower === 'false' || lower === 'on' || lower === 'off') {
            return false;
        }
        if (this.tryConvertStringToNumber(trimmed) !== null) {
            return false;
        }
        return true;
    }
    isTristateString(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const lower = value.toLowerCase();
        return lower === 'y' || lower === 'm' || lower === 'n';
    }
    isStringLiteral(node) {
        if (!node) {
            return false;
        }
        return node.type === 'LITERAL' && node.literalKind === 'string';
    }
    numericLiteralToString(node, value) {
        if (node && node.type === 'LITERAL') {
            if (node.literalKind === 'hex' && node.rawValue) {
                return node.rawValue;
            }
            if (node.literalKind === 'number' && node.rawValue) {
                return node.rawValue;
            }
        }
        return String(value);
    }
    tryConvertStringToNumber(value) {
        if (value === '') {
            return null;
        }
        const sign = value.startsWith('-') ? -1 : 1;
        const unsigned = (value[0] === '+' || value[0] === '-') ? value.substring(1) : value;
        if (unsigned === '') {
            return null;
        }
        if (/^0[xX][0-9a-fA-F]+$/.test(unsigned)) {
            return sign * parseInt(unsigned.substring(2), 16);
        }
        if (/^0[bB][01]+$/.test(unsigned)) {
            return sign * parseInt(unsigned.substring(2), 2);
        }
        if (/^0[oO][0-7]+$/.test(unsigned)) {
            return sign * parseInt(unsigned.substring(2), 8);
        }
        if (/^0+$/.test(unsigned)) {
            return 0;
        }
        if (/^[1-9][0-9]*$/.test(unsigned)) {
            return sign * parseInt(unsigned, 10);
        }
        return null;
    }
    tristateToNumber(value) {
        const lower = value.toLowerCase();
        if (lower === 'y') {
            return 2;
        }
        if (lower === 'm') {
            return 1;
        }
        return 0;
    }
}


/***/ },

/***/ "./src/menuconfig/ExpressionParser.ts"
/*!********************************************!*\
  !*** ./src/menuconfig/ExpressionParser.ts ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExprType: () => (/* binding */ ExprType),
/* harmony export */   ExpressionParser: () => (/* binding */ ExpressionParser)
/* harmony export */ });
// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * Expression types in Kconfig
 */
/* eslint-disable no-unused-vars */
var ExprType;
(function (ExprType) {
    ExprType["SYMBOL"] = "SYMBOL";
    ExprType["STRING"] = "STRING";
    ExprType["NUMBER"] = "NUMBER";
    ExprType["AND"] = "AND";
    ExprType["OR"] = "OR";
    ExprType["NOT"] = "NOT";
    ExprType["EQUAL"] = "EQUAL";
    ExprType["UNEQUAL"] = "UNEQUAL";
    ExprType["LESS"] = "LESS";
    ExprType["LESS_EQUAL"] = "LESS_EQUAL";
    ExprType["GREATER"] = "GREATER";
    ExprType["GREATER_EQUAL"] = "GREATER_EQUAL";
})(ExprType || (ExprType = {}));
/**
 * Parser for Kconfig expressions.
 * Converts string expressions to AST and provides dependency analysis.
 *
 * This implementation matches Kconfiglib's expression handling,
 * particularly the _expr_depends_on function behavior.
 */
class ExpressionParser {
    pos = 0;
    expr = '';
    /**
     * Parse a Kconfig expression into an AST.
     *
     * Grammar:
     * expression   := or_expr
     * or_expr      := and_expr ('||' and_expr)*
     * and_expr     := not_expr ('&&' not_expr)*
     * not_expr     := '!' not_expr | comparison
     * comparison   := primary (('=' | '!=' | '<' | '<=' | '>' | '>=') primary)?
     * primary      := '(' expression ')' | SYMBOL | STRING | NUMBER
     */
    parse(expr) {
        this.expr = expr.trim();
        this.pos = 0;
        if (!this.expr) {
            // Empty expression defaults to 'y' (always true)
            return { type: ExprType.SYMBOL, value: 'y' };
        }
        const result = this.parseOr();
        // Ensure we've consumed the entire expression
        this.skipWhitespace();
        if (this.pos < this.expr.length) {
            throw new Error(`Unexpected token at position ${this.pos}: ${this.expr.substring(this.pos)}`);
        }
        return result;
    }
    parseOr() {
        let left = this.parseAnd();
        while (this.consumeToken('||')) {
            const right = this.parseAnd();
            left = { type: ExprType.OR, left, right };
        }
        return left;
    }
    parseAnd() {
        let left = this.parseNot();
        while (this.consumeToken('&&')) {
            const right = this.parseNot();
            left = { type: ExprType.AND, left, right };
        }
        return left;
    }
    parseNot() {
        if (this.consumeToken('!')) {
            return {
                type: ExprType.NOT,
                left: this.parseNot() // Support nested NOT
            };
        }
        return this.parseComparison();
    }
    parseComparison() {
        const left = this.parsePrimary();
        // Check for comparison operators
        if (this.consumeToken('>=')) {
            return { type: ExprType.GREATER_EQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('<=')) {
            return { type: ExprType.LESS_EQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('!=')) {
            return { type: ExprType.UNEQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('=')) {
            return { type: ExprType.EQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('>')) {
            return { type: ExprType.GREATER, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('<')) {
            return { type: ExprType.LESS, left, right: this.parsePrimary() };
        }
        return left;
    }
    parsePrimary() {
        this.skipWhitespace();
        // Parenthesized expression
        if (this.expr[this.pos] === '(') {
            this.pos++;
            const node = this.parseOr();
            this.skipWhitespace();
            if (this.expr[this.pos] !== ')') {
                throw new Error(`Expected ')' at position ${this.pos}`);
            }
            this.pos++;
            return node;
        }
        // String literal
        if (this.expr[this.pos] === '"') {
            return this.parseString();
        }
        // Number or symbol
        return this.parseSymbolOrNumber();
    }
    parseString() {
        this.pos++; // Skip opening quote
        const start = this.pos;
        while (this.pos < this.expr.length && this.expr[this.pos] !== '"') {
            if (this.expr[this.pos] === '\\') {
                this.pos++; // Skip escape character
            }
            this.pos++;
        }
        if (this.pos >= this.expr.length) {
            throw new Error('Unterminated string');
        }
        const value = this.expr.substring(start, this.pos);
        this.pos++; // Skip closing quote
        return { type: ExprType.STRING, value };
    }
    parseSymbolOrNumber() {
        this.skipWhitespace();
        const start = this.pos;
        // Match symbol names (alphanumeric, underscore)
        // Kconfig symbols typically use uppercase, but we support all cases
        while (this.pos < this.expr.length &&
            /[A-Za-z0-9_]/.test(this.expr[this.pos])) {
            this.pos++;
        }
        if (this.pos === start) {
            throw new Error(`Expected symbol or number at position ${this.pos}`);
        }
        const value = this.expr.substring(start, this.pos);
        // Check if it's a number
        if (/^\d+$/.test(value)) {
            return { type: ExprType.NUMBER, value: parseInt(value, 10) };
        }
        // It's a symbol
        return { type: ExprType.SYMBOL, value };
    }
    /**
     * Check if an expression depends on a symbol.
     *
     * CRITICAL: This matches Kconfiglib's _expr_depends_on behavior:
     * - NOT operations return false (do not create dependency)
     * - This is key to proper indentation behavior
     */
    exprDependsOn(expr, symbol) {
        // Helpers for constant detection
        const isConstY = (n) => !!n && (n.type === ExprType.SYMBOL && n.value === 'y');
        const isConstM = (n) => !!n && (n.type === ExprType.SYMBOL && n.value === 'm');
        const isConstN = (n) => !!n && (n.type === ExprType.SYMBOL && n.value === 'n');
        const isSym = (n, name) => !!n && n.type === ExprType.SYMBOL && n.value === name;
        switch (expr.type) {
            case ExprType.SYMBOL:
                return expr.value === symbol;
            case ExprType.AND:
                // Only AND chain contributes dependency
                return (expr.left ? this.exprDependsOn(expr.left, symbol) : false) ||
                    (expr.right ? this.exprDependsOn(expr.right, symbol) : false);
            case ExprType.OR:
                // OR never creates dependency in Kconfiglib semantics
                return false;
            case ExprType.NOT:
                // NOT never creates dependency
                return false;
            case ExprType.EQUAL: {
                // A = y/m or y/m = A
                const L = expr.left, R = expr.right;
                if (isSym(L, symbol) && (isConstY(R) || isConstM(R)))
                    return true;
                if (isSym(R, symbol) && (isConstY(L) || isConstM(L)))
                    return true;
                return false;
            }
            case ExprType.UNEQUAL: {
                // A != n or n != A
                const L = expr.left, R = expr.right;
                if (isSym(L, symbol) && isConstN(R))
                    return true;
                if (isSym(R, symbol) && isConstN(L))
                    return true;
                return false;
            }
            case ExprType.LESS:
            case ExprType.LESS_EQUAL:
            case ExprType.GREATER:
            case ExprType.GREATER_EQUAL:
            case ExprType.STRING:
            case ExprType.NUMBER:
                return false;
            default:
                return false;
        }
    }
    /**
     * Convert an expression node back to string (for debugging).
     */
    toString(expr) {
        switch (expr.type) {
            case ExprType.SYMBOL:
                return expr.value;
            case ExprType.STRING:
                return `"${expr.value}"`;
            case ExprType.NUMBER:
                return expr.value.toString();
            case ExprType.NOT:
                return `!${expr.left ? this.toString(expr.left) : ''}`;
            case ExprType.AND:
                return `(${expr.left ? this.toString(expr.left) : ''} && ${expr.right ? this.toString(expr.right) : ''})`;
            case ExprType.OR:
                return `(${expr.left ? this.toString(expr.left) : ''} || ${expr.right ? this.toString(expr.right) : ''})`;
            case ExprType.EQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} = ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.UNEQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} != ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.LESS:
                return `${expr.left ? this.toString(expr.left) : ''} < ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.LESS_EQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} <= ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.GREATER:
                return `${expr.left ? this.toString(expr.left) : ''} > ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.GREATER_EQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} >= ${expr.right ? this.toString(expr.right) : ''}`;
            default:
                return '';
        }
    }
    consumeToken(token) {
        this.skipWhitespace();
        if (this.pos + token.length > this.expr.length) {
            return false;
        }
        // Check if the token matches at current position
        for (let i = 0; i < token.length; i++) {
            if (this.expr[this.pos + i] !== token[i]) {
                return false;
            }
        }
        // Make sure it's not part of a longer token (e.g., "=" vs "==")
        // This is especially important for operators
        if (token === '=' || token === '!' || token === '<' || token === '>') {
            const nextChar = this.expr[this.pos + token.length];
            if (nextChar === '=' || (token === '<' && nextChar === '=') || (token === '>' && nextChar === '=')) {
                return false;
            }
        }
        this.pos += token.length;
        return true;
    }
    skipWhitespace() {
        while (this.pos < this.expr.length && /\s/.test(this.expr[this.pos])) {
            this.pos++;
        }
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigMenuLoader.ts"
/*!*********************************************!*\
  !*** ./src/menuconfig/KconfigMenuLoader.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigMenuLoader: () => (/* binding */ KconfigMenuLoader)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _KconfigParser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./KconfigParser */ "./src/menuconfig/KconfigParser.ts");
/* harmony import */ var _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./KconfigSessionCache */ "./src/menuconfig/KconfigSessionCache.ts");
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.






class KconfigMenuLoader {
    workspaceFolder;
    targetFile;
    constructor(workspaceFolder, targetFile) {
        this.workspaceFolder = workspaceFolder;
        this.targetFile = targetFile;
    }
    async loadKconfigMenus() {
        // If a specific target file was provided, use it
        if (this.targetFile) {
            const targetPath = this.targetFile.fsPath;
            if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(targetPath)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.info(`Parsing specific Kconfig file: ${targetPath}`);
                try {
                    const parsedMenus = await this.parseMenusWithCache(targetPath);
                    if (parsedMenus.length === 0) {
                        throw new Error(`No menus parsed from target Kconfig file: ${targetPath}`);
                    }
                    _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.info(`Successfully parsed ${parsedMenus.length} menus from target Kconfig file`);
                    return parsedMenus;
                }
                catch (error) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.error("Failed to parse target Kconfig file", error);
                    throw error;
                }
            }
            else {
                throw new Error(`Target Kconfig file not found: ${targetPath}`);
            }
        }
        // Fallback to finding Kconfig files in the workspace
        const kconfigFiles = this.findKconfigFiles();
        if (kconfigFiles.length === 0) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.warn("No Kconfig files found, using demo menus");
            return this.createDemoMenus();
        }
        // Use the main Kconfig file (usually just "Kconfig")
        const mainKconfigFile = kconfigFiles.find(f => path__WEBPACK_IMPORTED_MODULE_1__.basename(f) === "Kconfig") || kconfigFiles[0];
        try {
            const parsedMenus = await this.parseMenusWithCache(mainKconfigFile);
            if (parsedMenus.length === 0) {
                throw new Error(`No menus parsed from Kconfig file: ${mainKconfigFile}`);
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.info(`Successfully parsed ${parsedMenus.length} menus from Kconfig files`);
            return parsedMenus;
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.error("Failed to parse Kconfig files", error);
            throw error;
        }
    }
    async parseMenusWithCache(mainKconfigFile) {
        const cache = new _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_5__.KconfigSessionCache(this.workspaceFolder.fsPath);
        const cacheKey = _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_5__.KconfigSessionCache.buildCacheKey(mainKconfigFile);
        const cachedMenus = await cache.load(cacheKey);
        if (cachedMenus && cachedMenus.length > 0) {
            if (!this.hasEmptyChoice(cachedMenus)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.info(() => `[SESSION_CACHE] Loaded ${cachedMenus.length} menus from cache: ${mainKconfigFile}`);
                return cachedMenus;
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.info(() => `[SESSION_CACHE] Discarded incomplete choice data: ${mainKconfigFile}`);
            await cache.invalidate(cacheKey);
        }
        const parser = new _KconfigParser__WEBPACK_IMPORTED_MODULE_4__.KconfigParser({
            workspaceFolder: this.workspaceFolder.fsPath,
            mainKconfigFile: mainKconfigFile
        });
        const parsedMenus = await parser.parse();
        if (parsedMenus.length > 0 && !this.hasEmptyChoice(parsedMenus)) {
            await cache.save(cacheKey, parsedMenus, parser.getParsedFiles());
        }
        return parsedMenus;
    }
    hasEmptyChoice(menus) {
        return menus.some(menu => (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.choice && (!menu.children || menu.children.length === 0)) ||
            (menu.children && menu.children.length > 0 && this.hasEmptyChoice(menu.children)));
    }
    findKconfigFiles() {
        const kconfigFiles = [];
        // Common Kconfig file names to look for
        const commonKconfigNames = [
            "Kconfig",
            "kconfig",
            "Config.in",
            "Kconfig.projbuild",
            "Kconfig.in"
        ];
        for (const filename of commonKconfigNames) {
            const filepath = path__WEBPACK_IMPORTED_MODULE_1__.join(this.workspaceFolder.fsPath, filename);
            if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(filepath)) {
                kconfigFiles.push(filepath);
            }
        }
        // Also look for Kconfig files in common subdirectories
        const commonSubdirs = ["components", "main", "src"];
        for (const subdir of commonSubdirs) {
            const subdirPath = path__WEBPACK_IMPORTED_MODULE_1__.join(this.workspaceFolder.fsPath, subdir);
            if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(subdirPath)) {
                for (const filename of commonKconfigNames) {
                    const filepath = path__WEBPACK_IMPORTED_MODULE_1__.join(subdirPath, filename);
                    if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(filepath)) {
                        kconfigFiles.push(filepath);
                    }
                }
            }
        }
        return kconfigFiles;
    }
    createDemoMenus() {
        const demoMenus = [];
        const mainMenu = {
            id: "main",
            name: "MAIN_MENU",
            title: "Main Menu",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.menu,
            isVisible: true,
            children: this.createDemoConfigItems(),
            help: "",
            range: [],
            isCollapsed: false,
            value: null,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        demoMenus.push(mainMenu);
        return demoMenus;
    }
    createDemoConfigItems() {
        const items = [];
        // Bool config example
        const boolConfig = {
            id: "bool-example",
            name: "CONFIG_EXAMPLE_BOOL",
            title: "Enable Example Feature",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: true,
            help: "This is a demo boolean configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(boolConfig);
        // String config example
        const stringConfig = {
            id: "string-example",
            name: "CONFIG_EXAMPLE_STRING",
            title: "Example String Value",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.string,
            value: "default",
            help: "This is a demo string configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(stringConfig);
        // Int config example
        const intConfig = {
            id: "int-example",
            name: "CONFIG_EXAMPLE_INT",
            title: "Example Integer Value",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.int,
            value: 100,
            range: [1, 1000],
            help: "This is a demo integer configuration option.",
            isVisible: true,
            children: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(intConfig);
        // Hex config example
        const hexConfig = {
            id: "hex-example",
            name: "CONFIG_EXAMPLE_HEX",
            title: "Example Hex Value",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.hex,
            value: "0x1000",
            help: "This is a demo hex configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(hexConfig);
        // Choice config example
        const choiceConfig = {
            id: "choice-example",
            name: "CONFIG_EXAMPLE_CHOICE",
            title: "Example Choice",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.choice,
            value: "option1",
            help: "This is a demo choice configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        // Add choice options as children
        const option1 = {
            id: "choice-option1",
            name: "CONFIG_EXAMPLE_CHOICE_OPTION1",
            title: "Option 1",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: true,
            isVisible: true,
            children: [],
            help: "",
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        const option2 = {
            id: "choice-option2",
            name: "CONFIG_EXAMPLE_CHOICE_OPTION2",
            title: "Option 2",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: false,
            isVisible: true,
            children: [],
            help: "",
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        choiceConfig.children = [option1, option2];
        items.push(choiceConfig);
        // Submenu example
        const submenu = {
            id: "submenu-example",
            name: "SUBMENU_EXAMPLE",
            title: "Example Submenu",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.menu,
            isVisible: true,
            children: this.createSubMenuItems(),
            help: "",
            range: [],
            isCollapsed: false,
            value: null,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(submenu);
        return items;
    }
    createSubMenuItems() {
        const items = [];
        const subBoolConfig = {
            id: "sub-bool-example",
            name: "CONFIG_SUB_EXAMPLE_BOOL",
            title: "Sub Example Bool",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: false,
            help: "This is a demo boolean configuration in a submenu.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(subBoolConfig);
        const subStringConfig = {
            id: "sub-string-example",
            name: "CONFIG_SUB_EXAMPLE_STRING",
            title: "Sub Example String",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.string,
            value: "submenu-default",
            help: "This is a demo string configuration in a submenu.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(subStringConfig);
        return items;
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigParser.ts"
/*!*****************************************!*\
  !*** ./src/menuconfig/KconfigParser.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigParser: () => (/* binding */ KconfigParser)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var glob__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! glob */ "./node_modules/glob/dist/esm/index.js");
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _MenuNode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MenuNode */ "./src/menuconfig/MenuNode.ts");
/* harmony import */ var _ExpressionParser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ExpressionParser */ "./src/menuconfig/ExpressionParser.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _VisibilityManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./VisibilityManager */ "./src/menuconfig/VisibilityManager.ts");
/* harmony import */ var _helpTextFormatter__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./helpTextFormatter */ "./src/menuconfig/helpTextFormatter.ts");
/* harmony import */ var _ConcurrentFileProcessor__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ConcurrentFileProcessor */ "./src/menuconfig/ConcurrentFileProcessor.ts");
/* harmony import */ var _MenuValueUtils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./MenuValueUtils */ "./src/menuconfig/MenuValueUtils.ts");
// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.











/**
 * KconfigParser - Refactored version using MenuNode tree structure.
 *
 * This implementation matches Kconfiglib's behavior:
 * 1. Builds a complete node tree including if nodes
 * 2. Flattens nodes without prompts (structural flattening)
 * 3. Removes if nodes after flattening
 * 4. Creates implicit submenus based on dependencies
 * 5. Calculates indentation dynamically through parent chain
 */
class KconfigParser {
    static SOURCE_PREFETCH_BATCH_SIZE = 16;
    static SOURCE_PREFETCH_MAX_DEPTH = 2;
    workspaceFolder;
    mainKconfigFile;
    currentId = 0;
    visibilityManager;
    exprParser;
    variables = new Map();
    srctreeRoot;
    // Performance optimization: File caching
    fileContentCache = new Map();
    expandedVariableCache = new Map();
    allParsedFiles = new Set();
    dependencyExprCache = new Map();
    scheduledPrefetchFiles = new Set();
    prefetchTasks = new Set();
    sourcePrefetchQueue = [];
    sourcePrefetchWorkerRunning = false;
    allowBackgroundPrefetch = false;
    // Performance optimization: Concurrent file processor
    concurrentProcessor;
    // File opening tracking
    fileOpenCounter = 0;
    openedFilesList = [];
    activeParsingFiles = new Set();
    /**
     * Static factory method to create a fully initialized parser
     */
    static async create(options) {
        const parser = new KconfigParser(options);
        return parser;
    }
    constructor(options) {
        this.workspaceFolder = options.workspaceFolder;
        this.mainKconfigFile = options.mainKconfigFile;
        this.visibilityManager = new _VisibilityManager__WEBPACK_IMPORTED_MODULE_7__.VisibilityManager();
        this.exprParser = new _ExpressionParser__WEBPACK_IMPORTED_MODULE_5__.ExpressionParser();
        // Initialize concurrent file processor
        this.concurrentProcessor = new _ConcurrentFileProcessor__WEBPACK_IMPORTED_MODULE_9__.ConcurrentFileProcessor(32);
        const srctreeEnv = process.env.srctree || process.env.SRCTREE;
        if (srctreeEnv) {
            this.srctreeRoot = path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(srctreeEnv)
                ? srctreeEnv
                : path__WEBPACK_IMPORTED_MODULE_1__.resolve(this.workspaceFolder, srctreeEnv);
        }
        else {
            this.srctreeRoot = path__WEBPACK_IMPORTED_MODULE_1__.dirname(this.mainKconfigFile);
        }
    }
    /**
     * Get the visibility manager instance
     */
    getVisibilityManager() {
        return this.visibilityManager;
    }
    getParsedFiles() {
        return Array.from(this.allParsedFiles);
    }
    /**
     * Main parse method - builds tree and converts to Menu array
     */
    async parse() {
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.info(() => `Starting Kconfig parsing from: ${this.mainKconfigFile}`);
        const _startTime = Date.now();
        const normalizedMain = path__WEBPACK_IMPORTED_MODULE_1__.normalize(this.mainKconfigFile);
        this.activeParsingFiles.clear();
        this.activeParsingFiles.add(normalizedMain);
        this.allParsedFiles.clear();
        this.allParsedFiles.add(normalizedMain);
        this.dependencyExprCache.clear();
        this.scheduledPrefetchFiles.clear();
        this.prefetchTasks.clear();
        this.sourcePrefetchQueue = [];
        this.sourcePrefetchWorkerRunning = false;
        this.allowBackgroundPrefetch = true;
        try {
            // Step 1: Build complete node tree (including if nodes)
            const root = await this.buildNodeTree(this.mainKconfigFile);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After buildNodeTree - structure built');
            // Step 2: Build select relationships to identify which configs are selected
            // This must be done before flattening to preserve the select information
            this.buildSelectRelationshipsInTree(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After buildSelectRelationshipsInTree - relationships built');
            // Step 3: Flatten nodes without prompts (structural operation)
            // But preserve nodes that are selected even if they have no prompt
            this.flatten(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After flatten - structure flattened');
            // Step 4: Remove if nodes (already flattened)
            this.removeIfs(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After removeIfs - conditional nodes processed');
            // Step 5: Propagate menu 'visible if' and 'depends on'
            this.propagateMenuConditions(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After propagateMenuConditions - menu conditions propagated');
            // Step 6: Create implicit submenus based on dependencies
            this.createImplicitMenus(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After createImplicitMenus - implicit menus created');
            // Step 7: Convert to Menu array with dynamic indent calculation
            const menus = this.convertToMenuArray(root);
            // Step 8: Build reverse select relationships in Menu array
            this.buildSelectRelationships(menus);
            const _endTime = Date.now();
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.info(() => `Parsing completed in ${_endTime - _startTime}ms`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.info(() => `Total menus parsed: ${menus.length}`);
            return menus;
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`Error parsing Kconfig: ${error}`);
            throw error;
        }
        finally {
            this.allowBackgroundPrefetch = false;
            this.sourcePrefetchQueue = [];
            this.activeParsingFiles.clear();
        }
    }
    /**
     * Build a complete node tree from Kconfig files.
     * This creates MenuNode objects including if nodes.
     */
    async buildNodeTree(filepath) {
        const root = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        root.is_menuconfig = true; // Root is treated as menuconfig
        root.node_type = 'menuconfig';
        // Read and parse the main file
        const lines = await this.readFile(filepath);
        await this.parseLines(lines, root, filepath);
        return root;
    }
    /**
     * Parse lines and build node tree
     */
    async parseLines(lines, parent, currentFile, startIndex = 0, endToken = null) {
        let i = startIndex;
        while (i < lines.length) {
            const line = lines[i].trim();
            // Skip empty lines and comments
            if (!line || line.startsWith('#')) {
                i++;
                continue;
            }
            // Check for end token
            // Note: endmenu/endif/endchoice might have comments after them
            if (endToken && (line === endToken || line.startsWith(endToken + ' ') || line.startsWith(endToken + '\t'))) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Found endToken '${endToken}' at line ${i} (current file: ${currentFile}), returning ${i + 1}`);
                return i + 1;
            }
            // Handle variable assignments (e.g., RTT_DIR := ../../..)
            const assignmentMatch = line.match(/^([A-Za-z0-9_]+)\s*(?::=|\+=|=)\s*(.*)$/);
            if (assignmentMatch) {
                const [, varName, rawValue] = assignmentMatch;
                const operator = line.includes(':=') ? ':='
                    : line.includes('+=') ? '+='
                        : '=';
                let value = rawValue.trim();
                if (operator === '+=') {
                    const existing = this.variables.get(varName);
                    const separator = existing && existing.value && !existing.value.endsWith(' ') ? ' ' : '';
                    const appended = existing ? `${existing.value}${separator}${value}` : value;
                    this.variables.set(varName, {
                        value: appended,
                        isRecursive: existing ? existing.isRecursive : true,
                    });
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Append variable: ${varName} += ${value} -> ${appended}`);
                }
                else {
                    if (operator === ':=') {
                        value = this.expandKconfigString(value);
                    }
                    this.variables.set(varName, {
                        value,
                        isRecursive: operator === '=',
                    });
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Set variable: ${varName} ${operator} ${value}`);
                }
                i++;
                continue;
            }
            // Handle menu-level properties: 'visible if' and 'depends on'
            // Only valid when we're inside a 'menu' block
            if (parent.node_type === 'menu') {
                if (line.startsWith('visible if ')) {
                    const cond = line.substring('visible if '.length).trim();
                    if (parent.visibility) {
                        // add parentheses if needed for OR precedence
                        parent.visibility = this.andExpr(parent.visibility, cond);
                    }
                    else {
                        parent.visibility = cond;
                    }
                    i++;
                    continue;
                }
                if (line.startsWith('depends on ')) {
                    const dep = line.substring('depends on '.length).trim();
                    if (parent.explicit_dep) {
                        parent.explicit_dep = this.andExpr(parent.explicit_dep, dep);
                    }
                    else {
                        parent.explicit_dep = dep;
                    }
                    if (parent.dep) {
                        parent.dep = this.andExpr(parent.dep, dep);
                    }
                    else {
                        parent.dep = dep;
                    }
                    // 同步写入 Menu（容器）自身的 dependsOn，便于可见性评估
                    if (parent.item) {
                        const combined = this.andExpr(parent.dep, parent.visibility || undefined) || parent.dep || '';
                        parent.item.dependsOn = combined;
                        parent.item.directDepExpr = parent.explicit_dep || dep;
                    }
                    i++;
                    continue;
                }
            }
            // Handle mainmenu statement
            if (line.startsWith('mainmenu ')) {
                const title = this.extractQuotedString(line.substring(9));
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Found mainmenu: "${title}"`);
                // Set the root node's title
                if (!parent.prompt) {
                    parent.prompt = [title, 'y'];
                    parent.item = this.createMenu({
                        name: '',
                        title: title,
                        type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.menu,
                        isMenuconfig: false, // FIX: mainmenu is NOT a menuconfig, just a title container
                        isVisible: true,
                        hasPrompt: true,
                        isMainMenu: true,
                    });
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Created mainmenu item: title="${title}", type=menu, isMenuconfig=false, isVisible=true`);
                }
                i++;
                continue;
            }
            // Handle if blocks
            if (line.startsWith('if ')) {
                const condition = line.substring(3).trim();
                // Create if node
                const ifNode = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
                ifNode.node_type = 'if';
                ifNode.item = null; // if nodes have no item
                ifNode.prompt = null; // if nodes have no prompt
                ifNode.dep = condition;
                ifNode.parent = parent;
                ifNode.filename = currentFile;
                ifNode.linenr = i + 1;
                parent.addChild(ifNode);
                // Parse if block contents recursively
                const nextIndex = await this.parseLines(lines, ifNode, currentFile, i + 1, 'endif');
                i = nextIndex;
                continue;
            }
            // Handle menu blocks
            if (line.startsWith('menu ')) {
                const title = this.extractQuotedString(line.substring(5));
                const menuNode = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
                menuNode.node_type = 'menu';
                menuNode.is_menuconfig = false; // FIX: menu is NOT menuconfig!
                menuNode.prompt = [title, 'y'];
                menuNode.filename = currentFile;
                menuNode.linenr = i + 1;
                // Create associated Menu object
                menuNode.item = this.createMenu({
                    name: '',
                    title: title,
                    type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.menu,
                    isMenuconfig: false, // FIX: menu should have isMenuconfig = false
                    isVisible: true, // Menu nodes should always be visible
                    hasPrompt: true, // Menu nodes have a title, so they have a prompt
                });
                parent.addChild(menuNode);
                // Parse menu contents
                i = await this.parseLines(lines, menuNode, currentFile, i + 1, 'endmenu');
                continue;
            }
            // Handle comment entries
            if (line.startsWith('comment ')) {
                const commentNode = await this.parseComment(lines, i, currentFile);
                if (commentNode) {
                    parent.addChild(commentNode);
                    i = commentNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            // Handle choice blocks
            if (line.startsWith('choice')) {
                // Extract choice name if present (e.g., "choice BSP_ROOTFS_TYPE" vs just "choice")
                const choiceName = line.trim() === 'choice' ? null : line.substring(6).trim();
                const choiceNode = await this.parseChoice(lines, i, currentFile, choiceName);
                if (choiceNode) {
                    parent.addChild(choiceNode);
                    i = choiceNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            // Handle config/menuconfig
            if (line.startsWith('config ') || line.startsWith('menuconfig ')) {
                const configNode = await this.parseConfig(lines, i, currentFile);
                if (configNode) {
                    parent.addChild(configNode);
                    i = configNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            // Handle source/rsource/osource/orsource directives
            if (line.startsWith('source ') || line.startsWith('rsource ') ||
                line.startsWith('osource ') || line.startsWith('orsource ')) {
                await this.parseSourceIntoParent(line, currentFile, parent);
                i++;
                continue;
            }
            i++;
        }
        return i;
    }
    /**
     * Parse a config or menuconfig item
     */
    async parseConfig(lines, startIndex, currentFile) {
        const firstLine = lines[startIndex].trim();
        const isMenuconfig = firstLine.startsWith('menuconfig ');
        const match = firstLine.match(/^(?:menu)?config\s+([A-Z0-9_]+)/);
        if (!match) {
            return null;
        }
        const _configName = match[1];
        // Debug log for config/menuconfig parsing
        if (isMenuconfig) {
        }
        const node = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        node.node_type = isMenuconfig ? 'menuconfig' : 'config';
        node.is_menuconfig = isMenuconfig;
        node.filename = currentFile;
        node.linenr = startIndex + 1;
        // Create associated Menu object
        const menu = this.createMenu({
            name: _configName,
            title: '',
            type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.bool, // Default, will be updated
            isMenuconfig: isMenuconfig,
            linenr: startIndex + 1,
        });
        node.item = menu;
        // Parse config properties
        let i = startIndex + 1;
        let hasPrompt = false;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) {
                i++;
                continue;
            }
            // Check for new top-level statement
            // We break on new config/menu/choice/if statements
            // and also on source directives. This is critical because
            // rsource/source/osource/orsource must be handled by the
            // outer parseLines() loop instead of being consumed inside
            // a config block. Otherwise files like components/libc/Kconfig
            // that contain rsource "posix/Kconfig" within a menu would be
            // swallowed by the preceding config parser and never loaded,
            // causing select relationships (e.g. RT_USING_POSIX_FS ->
            // DFS_USING_POSIX) to be missing.
            // Note: choice can be standalone (anonymous) or have a name.
            if (line.match(/^(config|menuconfig|menu|if|comment)\s/) ||
                line === 'choice' ||
                line.startsWith('choice ') ||
                line.startsWith('source ') ||
                line.startsWith('rsource ') ||
                line.startsWith('osource ') ||
                line.startsWith('orsource ')) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[CONFIG_PARSER] Breaking at top-level directive within config ${_configName}: '${line}'`);
                break;
            }
            // Break on end tokens that belong to parent scopes
            // We need to leave these for the parent parseLines to handle
            // Note: end tokens might have comments after them
            if (line === 'endif' || line === 'endmenu' || line === 'endchoice' ||
                line.startsWith('endif ') || line.startsWith('endmenu ') || line.startsWith('endchoice ')) {
                break;
            }
            // Parse type and prompt
            const typeMatch = line.match(/^(bool|tristate|string|int|hex)(?:\s+(.*))?$/);
            if (typeMatch) {
                const [, typeKeyword, rest] = typeMatch;
                menu.type = typeKeyword;
                if (rest) {
                    const promptToken = this.extractQuotedToken(rest);
                    if (promptToken) {
                        menu.title = promptToken.value;
                        let cond = 'y';
                        const after = rest.substring(promptToken.end).trim();
                        if (after.startsWith('if ')) {
                            cond = after.substring(3).trim();
                        }
                        node.prompt = [promptToken.value, cond];
                        hasPrompt = true;
                    }
                }
                i++;
                continue;
            }
            // Parse depends on
            if (line.startsWith('depends on ')) {
                const dep = line.substring(11).trim();
                // Store explicit depends on separately
                if (node.explicit_dep) {
                    node.explicit_dep = `(${node.explicit_dep}) && (${dep})`;
                }
                else {
                    node.explicit_dep = dep;
                }
                // Also add to general dependencies
                if (node.dep) {
                    node.dep = `(${node.dep}) && (${dep})`;
                }
                else {
                    node.dep = dep;
                }
                menu.dependsOn = node.dep;
                menu.directDepExpr = node.explicit_dep || dep;
            }
            const defBoolMatch = line.match(/^def_bool\s+(.+)$/);
            if (defBoolMatch) {
                const defLine = defBoolMatch[1].trim();
                const split = this.splitValueAndCondition(defLine);
                let defaultValue = split.value;
                const condition = split.condition;
                if (condition) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> def_bool "${defaultValue}" if ${condition}`);
                }
                else {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> def_bool "${defaultValue}"`);
                }
                defaultValue = this.expandDefaultValue(defaultValue);
                menu.type = _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.bool;
                if (!menu.defaults) {
                    menu.defaults = [];
                }
                menu.defaults.push({ value: defaultValue, condition });
                i++;
                continue;
            }
            // Parse default value (support: default VALUE [if CONDITION])
            if (line.startsWith('default ')) {
                const defaultLine = line.substring(8).trim();
                const split = this.splitValueAndCondition(defaultLine);
                let defaultValue = split.value;
                const condition = split.condition;
                if (condition) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> default "${defaultValue}" if ${condition}`);
                }
                else {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> default "${defaultValue}"`);
                }
                defaultValue = this.expandDefaultValue(defaultValue);
                // 收集到 defaults 列表，按照出现顺序保存（Kconfig 语义为最后一个命中的 default 生效）
                if (!menu.defaults) {
                    menu.defaults = [];
                }
                menu.defaults.push({ value: defaultValue, condition });
            }
            if (line.startsWith('option ')) {
                const optionContent = line.substring(7).trim();
                if (optionContent.startsWith('env')) {
                    const envMatch = optionContent.match(/env\s*=\s*"?([A-Za-z0-9_]+)"?/);
                    if (envMatch) {
                        menu.optionEnvVar = envMatch[1];
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[OPTION_PARSER] ${_configName} -> option env="${menu.optionEnvVar}"`);
                    }
                }
                else if (optionContent === 'defconfig_list') {
                    menu.optionDefconfigList = true;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[OPTION_PARSER] ${_configName} marked as defconfig_list`);
                }
                else if (optionContent === 'modules') {
                    menu.optionModules = true;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[OPTION_PARSER] ${_configName} marked as modules symbol`);
                }
                i++;
                continue;
            }
            // Parse select statements
            if (line.startsWith('select ')) {
                // 支持：select TARGET [if COND]
                const raw = line.substring(7).trim();
                let selectTarget = raw;
                let cond;
                const ifIdx = raw.indexOf(' if ');
                if (ifIdx > -1) {
                    selectTarget = raw.substring(0, ifIdx).trim();
                    cond = raw.substring(ifIdx + 4).trim();
                }
                if (!menu.select) {
                    menu.select = [];
                }
                menu.select.push(selectTarget);
                if (cond) {
                    if (!menu.selectConditions)
                        menu.selectConditions = {};
                    menu.selectConditions[selectTarget] = cond;
                }
                if (!node.item) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`[SELECT_PARSE] ERROR: node.item is null for ${_configName}`);
                }
            }
            if (line.startsWith('imply ')) {
                const raw = line.substring(6).trim();
                let target = raw;
                let cond;
                const ifIdx = raw.indexOf(' if ');
                if (ifIdx > -1) {
                    target = raw.substring(0, ifIdx).trim();
                    cond = raw.substring(ifIdx + 4).trim();
                }
                if (!menu.implies) {
                    menu.implies = [];
                }
                menu.implies.push(target);
                if (cond) {
                    if (!menu.implyConditions) {
                        menu.implyConditions = {};
                    }
                    menu.implyConditions[target] = cond;
                }
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[IMPLY_PARSER] ${_configName} implies ${target}${cond ? ` if ${cond}` : ''}`);
                i++;
                continue;
            }
            // Parse range
            if (line.startsWith('range ')) {
                const rangeParts = line.substring(6).trim().split(/\s+/);
                if (rangeParts.length >= 2) {
                    const min = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_10__.parseKconfigNumber)(rangeParts[0]);
                    const max = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_10__.parseKconfigNumber)(rangeParts[1]);
                    if (min !== null && max !== null) {
                        menu.range = [min, max];
                    }
                }
            }
            // Parse help text
            if (line.startsWith('help') || line.startsWith('---help---')) {
                const helpLines = [];
                i++;
                // Find the first non-blank line to determine base indentation
                let baseIndent = -1;
                while (i < lines.length) {
                    const helpLine = lines[i];
                    if (helpLine.trim()) {
                        // Found non-blank line, measure its indentation
                        baseIndent = helpLine.length - helpLine.trimStart().length;
                        helpLines.push(helpLine);
                        i++;
                        break;
                    }
                    // Skip blank lines at the start of help
                    i++;
                }
                // If we found a base indentation, continue reading help text
                if (baseIndent >= 0) {
                    while (i < lines.length) {
                        const helpLine = lines[i];
                        // Empty lines are part of help text
                        if (!helpLine.trim()) {
                            helpLines.push(helpLine);
                            i++;
                            continue;
                        }
                        // Check indentation level
                        const currentIndent = helpLine.length - helpLine.trimStart().length;
                        if (currentIndent < baseIndent) {
                            // Less indented line found - end of help text
                            break;
                        }
                        helpLines.push(helpLine);
                        i++;
                    }
                }
                menu.help = (0,_helpTextFormatter__WEBPACK_IMPORTED_MODULE_8__.formatHelpText)(helpLines.join('\n').trim());
                // Don't increment i here - we want to process the less-indented line next
                continue;
            }
            i++;
        }
        // Set visibility
        menu.hasPrompt = hasPrompt;
        if (node.dep && !menu.dependsOn) {
            menu.dependsOn = node.dep;
        }
        // For menuconfig nodes, they should always be visible as they are menu items
        // For regular config nodes, visibility depends on having a prompt
        menu.isVisible = isMenuconfig ? true : hasPrompt;
        node.nextIndex = i;
        return node;
    }
    /**
     * Parse a comment entry.
     * Supports:
     *   comment "text" [if CONDITION]
     *   depends on CONDITION
     */
    async parseComment(lines, startIndex, currentFile) {
        const firstLine = lines[startIndex].trim();
        if (!firstLine.startsWith("comment ")) {
            return null;
        }
        const title = this.extractQuotedString(firstLine.substring("comment ".length));
        const node = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        node.node_type = "comment";
        node.is_menuconfig = false;
        node.filename = currentFile;
        node.linenr = startIndex + 1;
        const menu = this.createMenu({
            name: "",
            title,
            prompt: title,
            type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.comment,
            isMenuconfig: false,
            hasPrompt: true,
            isVisible: true,
            linenr: startIndex + 1,
        });
        node.item = menu;
        let promptCond = "y";
        const promptToken = this.extractQuotedToken(firstLine.substring("comment ".length));
        if (promptToken) {
            const after = firstLine.substring("comment ".length + promptToken.end).trim();
            if (after.startsWith("if ")) {
                promptCond = after.substring(3).trim();
            }
        }
        node.prompt = [title, promptCond];
        if (promptCond !== "y") {
            node.dep = promptCond;
            menu.dependsOn = promptCond;
        }
        let i = startIndex + 1;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line || line.startsWith("#")) {
                i++;
                continue;
            }
            if (line.match(/^(config|menuconfig|menu|if|comment)\s/) ||
                line === "choice" ||
                line.startsWith("choice ") ||
                line.startsWith("source ") ||
                line.startsWith("rsource ") ||
                line.startsWith("osource ") ||
                line.startsWith("orsource ")) {
                break;
            }
            if (line === "endif" ||
                line === "endmenu" ||
                line === "endchoice" ||
                line.startsWith("endif ") ||
                line.startsWith("endmenu ") ||
                line.startsWith("endchoice ")) {
                break;
            }
            if (line.startsWith("depends on ")) {
                const dep = line.substring("depends on ".length).trim();
                node.dep = this.andExpr(node.dep, dep) ?? dep;
                menu.dependsOn = node.dep || "";
                menu.directDepExpr = dep;
                i++;
                continue;
            }
            i++;
        }
        node.nextIndex = i;
        return node;
    }
    /**
     * Parse a choice block
     */
    async parseChoice(lines, startIndex, currentFile, choiceName) {
        const node = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        node.node_type = 'choice';
        node.is_menuconfig = true; // Choices act like menuconfigs
        node.filename = currentFile;
        node.linenr = startIndex + 1;
        // Create associated Menu object
        // Use the provided choice name if available, otherwise generate one
        const menu = this.createMenu({
            name: choiceName || `choice_${this.currentId++}`,
            title: 'Choice', // Default title, will be updated if prompt is found
            type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.choice,
            isMenuconfig: true,
        });
        // Debug logging for choice parsing
        node.item = menu;
        // Parse choice block
        let i = startIndex + 1;
        let hasPrompt = false;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line === 'endchoice') {
                node.nextIndex = i + 1;
                break;
            }
            if (!line || line.startsWith('#')) {
                i++;
                continue;
            }
            // Parse prompt
            if (line.startsWith('prompt ')) {
                const promptToken = this.extractQuotedToken(line.substring('prompt '.length));
                if (promptToken) {
                    menu.title = promptToken.value;
                    let cond = 'y';
                    const after = line.substring('prompt '.length + promptToken.end).trim();
                    if (after.startsWith('if ')) {
                        cond = after.substring(3).trim();
                    }
                    node.prompt = [promptToken.value, cond];
                    hasPrompt = true;
                }
                i++;
                continue;
            }
            // Parse depends on
            if (line.startsWith('depends on ')) {
                const dep = line.substring('depends on '.length).trim();
                node.dep = this.andExpr(node.dep, dep) ?? dep;
                menu.dependsOn = node.dep || '';
                menu.directDepExpr = dep;
                i++;
                continue;
            }
            // Parse default (support "default VALUE [if CONDITION]")
            if (line.startsWith('default ')) {
                const defaultLine = line.substring(8).trim();
                const split = this.splitValueAndCondition(defaultLine);
                const defaultValue = split.value;
                const condition = split.condition;
                // 收集 choice 的默认值列表，保留顺序（与 Kconfig 语义一致，后匹配覆盖先匹配）
                if (!menu.defaults) {
                    menu.defaults = [];
                }
                menu.defaults.push({ value: defaultValue, condition });
                // 不在解析阶段确定最终默认值，交由可见性管理器按语义（最后一个命中的 default 生效）评估
                i++;
                continue;
            }
            // Parse choice options (config items within choice)
            if (line.startsWith('config ')) {
                const optionNode = await this.parseConfig(lines, i, currentFile);
                if (optionNode) {
                    node.addChild(optionNode);
                    i = optionNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            if (line.startsWith('comment ')) {
                const commentNode = await this.parseComment(lines, i, currentFile);
                if (commentNode) {
                    node.addChild(commentNode);
                    i = commentNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            if (line.startsWith('source ') || line.startsWith('rsource ') ||
                line.startsWith('osource ') || line.startsWith('orsource ')) {
                await this.parseSourceIntoParent(line, currentFile, node);
                i++;
                continue;
            }
            i++;
        }
        if (node.dep) {
            menu.dependsOn = node.dep;
        }
        menu.hasPrompt = hasPrompt;
        // Choice blocks should always be visible as they are selection elements
        menu.isVisible = true;
        // Final debug logging
        return node;
    }
    // 注意：if 节点仅用于依赖传播，不应引入额外缩进层级。
    /**
     * Flatten nodes without prompts (structural flattening).
     * This matches Kconfiglib's _flatten function.
     */
    flatten(node) {
        // Use two-pass approach to avoid modifying the list while traversing
        const nodesToFlatten = [];
        // First pass: Recursively process all children and collect nodes to flatten
        let current = node.list;
        while (current) {
            // Recursively flatten children first
            if (current.list) {
                this.flatten(current);
            }
            // Collect nodes that need flattening
            if (current.shouldFlatten()) {
                nodesToFlatten.push(current);
            }
            current = current.next;
        }
        // Second pass: Flatten the collected nodes
        for (const nodeToFlatten of nodesToFlatten) {
            this.flattenNode(nodeToFlatten);
        }
    }
    /**
     * Flatten a single node by promoting its children to the parent level.
     * Updates dependencies and reconnects the node chain.
     * IMPORTANT: Preserves if block indentation levels for correct display.
     */
    flattenNode(nodeToFlatten) {
        if (!nodeToFlatten.list || !nodeToFlatten.parent) {
            return;
        }
        const parent = nodeToFlatten.parent;
        const firstChild = nodeToFlatten.list;
        // Update all children
        let child = firstChild;
        let lastChild = firstChild;
        while (child) {
            // Update parent pointer
            child.parent = parent;
            // Handle dependency merging based on the type of node being flattened
            if (nodeToFlatten.dep) {
                if (nodeToFlatten.isIfNode()) {
                    // If 节点：仅传播依赖，不产生额外缩进
                    // Store if dependency separately
                    if (child.if_dep) {
                        // Merge with existing if_dep
                        if (child.if_dep.includes('||') || nodeToFlatten.dep.includes('||')) {
                            child.if_dep = `(${child.if_dep}) && (${nodeToFlatten.dep})`;
                        }
                        else {
                            child.if_dep = `${child.if_dep} && ${nodeToFlatten.dep}`;
                        }
                    }
                    else {
                        child.if_dep = nodeToFlatten.dep;
                    }
                    // Also update general dep for visibility calculations
                    if (child.dep) {
                        if (child.dep.includes('||') || nodeToFlatten.dep.includes('||')) {
                            child.dep = `(${child.dep}) && (${nodeToFlatten.dep})`;
                        }
                        else {
                            child.dep = `${child.dep} && ${nodeToFlatten.dep}`;
                        }
                    }
                    else {
                        child.dep = nodeToFlatten.dep;
                    }
                    // 不递归增加任何 if 缩进层级
                }
                else {
                    // Non-if node flattening (rare case)
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[FLATTEN_NON_IF] Flattening non-if node, merging dep: ${nodeToFlatten.dep}`);
                    // Merge dependency conditions normally
                    if (child.dep) {
                        // Only add parentheses when necessary (e.g., when there are OR operations)
                        if (child.dep.includes('||') || nodeToFlatten.dep.includes('||')) {
                            child.dep = `(${child.dep}) && (${nodeToFlatten.dep})`;
                        }
                        else {
                            child.dep = `${child.dep} && ${nodeToFlatten.dep}`;
                        }
                    }
                    else {
                        child.dep = nodeToFlatten.dep;
                    }
                }
                // Update Menu object's dependsOn
                if (child.item) {
                    child.item.dependsOn = child.dep;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[FLATTEN] Updated menu "${child.item.title || child.item.name}" dependsOn to: ${child.dep}`);
                }
            }
            lastChild = child;
            child = child.next;
        }
        // Reconnect the node chain
        if (parent.list === nodeToFlatten) {
            // nodeToFlatten is the first child of parent
            parent.list = firstChild;
        }
        else {
            // Find the previous sibling
            let prev = parent.list;
            while (prev && prev.next !== nodeToFlatten) {
                prev = prev.next;
            }
            if (prev) {
                prev.next = firstChild;
            }
        }
        // Connect the last child to nodeToFlatten's next sibling
        lastChild.next = nodeToFlatten.next;
        // Clear the flattened node
        nodeToFlatten.list = null;
        nodeToFlatten.next = null;
    }
    /**
     * Remove if nodes after flattening.
     * This matches Kconfiglib's _remove_ifs function.
     */
    removeIfs(node) {
        // First, recursively process children
        let current = node.list;
        while (current) {
            if (current.list) {
                this.removeIfs(current);
            }
            current = current.next;
        }
        // Now remove if nodes from this level
        let prev = null;
        current = node.list;
        while (current) {
            const next = current.next;
            if (current.isIfNode()) {
                // Remove this if node from the chain
                if (prev) {
                    prev.next = next;
                }
                else {
                    node.list = next;
                }
            }
            else {
                prev = current;
            }
            current = next;
        }
    }
    /**
     * Propagate menu-level 'visible if' and 'depends on' to children.
     * - 'visible if' only influences prompts of symbols/choices (AND in)
     * - 'depends on' is propagated to child.dep and also AND into child prompts
     * This mirrors Kconfiglib's _propagate_deps + visible_if propagation.
     */
    propagateMenuConditions(root) {
        const rec = (node, inheritedVisible) => {
            // Accumulate visible-if from parent menus
            const curVisible = this.andExpr(inheritedVisible || undefined, node.node_type === 'menu' ? node.visibility || undefined : undefined);
            let child = node.list;
            while (child) {
                // Propagate 'depends on' from parent menu to child dep
                if (node.node_type === 'menu' && node.dep) {
                    child.dep = this.andExpr(child.dep || undefined, node.dep) || child.dep || node.dep;
                }
                const promptCond = child.prompt ? (child.prompt[1] || 'y') : 'y';
                const menuVisible = child.node_type === 'menu' ? child.visibility || undefined : undefined;
                const inheritedVisible = curVisible || undefined;
                let combinedCondition = this.andExpr(promptCond, inheritedVisible);
                combinedCondition = this.andExpr(combinedCondition || undefined, menuVisible);
                combinedCondition = this.andExpr(combinedCondition || undefined, child.dep || undefined);
                if (child.item && child.prompt) {
                    child.prompt = [child.prompt[0], combinedCondition || 'y'];
                }
                if (child.item) {
                    if (combinedCondition) {
                        child.item.dependsOn = combinedCondition;
                        child.item.effectiveDepExpr = combinedCondition;
                    }
                    else if (!child.item.dependsOn) {
                        child.item.dependsOn = '';
                        child.item.effectiveDepExpr = '';
                    }
                }
                const nextInherited = combinedCondition || curVisible || null;
                if (child.list)
                    rec(child, nextInherited);
                child = child.next;
            }
        };
        rec(root, null);
    }
    /**
     * Helper: AND two expressions with safe parentheses when needed.
     */
    andExpr(a, b) {
        const norm = (s) => (s && s.trim().length > 0 ? s.trim() : null);
        const A = norm(a);
        const B = norm(b);
        if (!A)
            return B;
        if (!B)
            return A;
        const wrap = (s) => (s.includes('||') ? `(${s})` : s);
        return `${wrap(A)} && ${wrap(B)}`;
    }
    /**
     * Create implicit submenus based on dependencies.
     * This matches Kconfiglib's implicit menu creation logic.
     * IMPORTANT: Only processes CONSECUTIVE nodes that depend on the current node.
     * This preserves the original file order (matching kconfiglib.py:_finalize_node).
     *
     * ENHANCED: Special handling for menuconfig nodes to ensure proper indentation
     * of dependent config items (e.g., items from "if MENUCONFIG" blocks).
     */
    createImplicitMenus(node) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[IMPLICIT_MENU] Processing node: ${node.toString()}`);
        // Process each child of this node
        let child = node.list;
        while (child) {
            // For each child, check if consecutive following siblings should become its children
            // This matches kconfiglib.py line 3587-3600
            if (child.item && child.item.name) {
                let cur = child;
                const dependencyOwners = new Set();
                if (child.item && child.item.name) {
                    dependencyOwners.add(child.item.name);
                }
                // Check consecutive nodes that immediately follow
                while (cur.next) {
                    const nextNode = cur.next;
                    // Get the dependency to check
                    // Priority: prompt condition > general dep > explicit dep
                    let dependency = null;
                    if (nextNode.prompt) {
                        const promptCond = nextNode.prompt[1];
                        if (promptCond && promptCond !== 'y') {
                            dependency = promptCond;
                        }
                    }
                    if (!dependency) {
                        dependency = nextNode.dep || nextNode.explicit_dep || null;
                    }
                    let shouldBecomeChild = false;
                    if (dependency && dependencyOwners.size > 0) {
                        try {
                            const cacheKey = dependency.trim();
                            let expr = this.dependencyExprCache.get(cacheKey);
                            if (!expr) {
                                expr = this.exprParser.parse(cacheKey);
                                this.dependencyExprCache.set(cacheKey, expr);
                            }
                            for (const owner of dependencyOwners) {
                                if (this.exprParser.exprDependsOn(expr, owner)) {
                                    shouldBecomeChild = true;
                                    break;
                                }
                            }
                        }
                        catch (error) {
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`[IMPLICIT_MENU] Failed to parse dependency expression "${dependency}": ${error}`);
                        }
                    }
                    if (shouldBecomeChild) {
                        if (nextNode.item && nextNode.item.name) {
                            dependencyOwners.add(nextNode.item.name);
                        }
                        cur = nextNode; // Move to next to continue checking
                    }
                    else {
                        // Not dependent on current block, stop checking
                        break;
                    }
                }
                // If we found consecutive dependent nodes, move them under child
                if (cur !== child) {
                    // Move nodes from child.next to cur (inclusive) under child
                    const firstDependent = child.next;
                    const lastDependent = cur;
                    const afterLast = cur.next;
                    // Update parent pointers
                    let temp = firstDependent;
                    while (temp) {
                        temp.parent = child;
                        if (temp === lastDependent)
                            break;
                        temp = temp.next;
                    }
                    // Reconnect the sibling chain
                    child.next = afterLast;
                    // Set up child's children
                    child.list = firstDependent;
                    lastDependent.next = null;
                }
            }
            // Recursively process this child's children (including newly created implicit children)
            if (child.list) {
                this.createImplicitMenus(child);
            }
            child = child.next;
        }
    }
    /**
     * Convert node tree to Menu array with proper indentation.
     * Indentation is calculated dynamically based on parent chain.
     */
    convertToMenuArray(root) {
        const menus = [];
        // Debug: Log root node status
        if (root.item) {
        }
        // If root has a mainmenu (item), handle it specially
        if (root.item && root.prompt) {
            const mainMenu = root.item;
            mainMenu.indentLevel = 0;
            mainMenu.children = [];
            mainMenu.isCollapsed = false; // Mainmenu should always be expanded
            // Process all children of the root as children of mainmenu
            let child = root.list;
            let _childCount = 0;
            while (child) {
                if (child.item) {
                    // Special handling for top-level menu items like RT-Thread Kernel
                    // These should be collapsible menu containers, not normal config items
                    if (child.item.type === 'menu' || child.item.isMenuconfig) {
                        child.item.isCollapsed = child.item.isCollapsed ?? true; // Default to collapsed
                    }
                    this.convertChildNode(child, mainMenu.children);
                    _childCount++;
                }
                child = child.next;
            }
            // Push the mainmenu itself as the top-level container with all its children
            // This will show the mainmenu title at the top of the UI
            menus.push(mainMenu);
            if (mainMenu.children.length > 0) {
            }
        }
        else {
            // No mainmenu, process children as top-level items
            this.convertNode(root, menus, true);
        }
        if (menus.length > 0) {
            if (menus[0].children) {
            }
        }
        return menus;
    }
    /**
     * Recursively convert nodes to Menu array
     */
    convertNode(node, menus, isRoot = false) {
        // Skip the root node itself
        if (!isRoot && node.item) {
            this.convertChildNode(node, menus);
        }
        else if (isRoot) {
            // For root, just process its children
            let child = node.list;
            while (child) {
                this.convertNode(child, menus, false);
                child = child.next;
            }
        }
    }
    /**
     * Convert child nodes recursively without adding to flat array
     */
    convertChildNode(node, parentChildren) {
        if (node.item) {
            const menu = node.item;
            // Calculate indentation dynamically
            menu.indentLevel = node.calculateIndent();
            // CRITICAL FIX: Set shouldIndentChildren for nodes with children
            // This is required for proper indentation in the frontend
            if (node.list) {
                // For menuconfig and config nodes with children, enable child indentation
                menu.shouldIndentChildren = true;
            }
            else {
                menu.shouldIndentChildren = false;
            }
            // Ensure isCollapsed is properly set for menuconfig items
            if (menu.isMenuconfig) {
                menu.isCollapsed = menu.isCollapsed ?? false;
            }
            // Add to parent's children array
            parentChildren.push(menu);
            // Process children as nested items
            if (node.list) {
                menu.children = [];
                let child = node.list;
                while (child) {
                    if (child.item) {
                        // Recursively process child
                        this.convertChildNode(child, menu.children);
                    }
                    child = child.next;
                }
            }
        }
    }
    // ========== Helper Methods ==========
    /**
     * Create a Menu object with default values
     */
    createMenu(options) {
        return {
            id: `menu-${this.currentId++}`,
            name: options.name || '',
            title: options.title || '',
            type: options.type || _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.bool,
            value: options.value ?? null,
            help: options.help || '',
            range: options.range || [],
            isVisible: options.isVisible ?? true,
            isCollapsed: options.isCollapsed ?? false,
            isMenuconfig: options.isMenuconfig ?? false,
            hasPrompt: options.hasPrompt ?? false,
            dependsOn: options.dependsOn || '',
            select: options.select || [],
            selectedBy: options.selectedBy || [],
            children: options.children || [],
            indentLevel: options.indentLevel ?? 0,
            isMainMenu: options.isMainMenu ?? false,
            optionEnvVar: options.optionEnvVar ?? null,
            optionDefconfigList: options.optionDefconfigList ?? false,
            optionModules: options.optionModules ?? false,
            implies: options.implies ? [...options.implies] : [],
            implyConditions: options.implyConditions ? { ...options.implyConditions } : undefined,
            autoImpliedValue: options.autoImpliedValue,
            allowedTristateValues: options.allowedTristateValues ? [...options.allowedTristateValues] : undefined,
            // Enhanced help information
            linenr: options.linenr,
            menuPath: options.menuPath,
            directDepValue: options.directDepValue,
            directDepExpr: options.directDepExpr,
            effectiveDepValue: options.effectiveDepValue,
            effectiveDepExpr: options.effectiveDepExpr,
            prompt: options.prompt || options.title || '',
            selectInfo: options.selectInfo,
            selectedByInfo: options.selectedByInfo,
            implyInfo: options.implyInfo,
        };
    }
    /**
     * Read a file and return its lines
     */
    async readFile(filepath) {
        // Check cache first
        if (this.fileContentCache.has(filepath)) {
            return this.fileContentCache.get(filepath);
        }
        try {
            const content = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filepath, 'utf-8');
            const lines = content.split('\n');
            // Cache the content
            this.fileContentCache.set(filepath, lines);
            this.scheduleSourcePrefetch(lines, filepath, 0);
            return lines;
        }
        catch (error) {
            const err = error;
            if (err && err.code === "ENOENT") {
                return [];
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Failed to read file ${filepath}: ${error}`);
            return [];
        }
    }
    /**
     * Parse source directive and return resolved file paths
     */
    async parseSource(line, currentFile, options) {
        const match = line.match(/^(source|rsource|osource|orsource)\s+(.+)$/);
        if (!match) {
            return null;
        }
        const directive = match[1];
        const sourceToken = this.extractQuotedToken(match[2]);
        let sourcePath = sourceToken ? sourceToken.value : match[2].trim();
        const optional = directive.startsWith('o');
        const isRelativeDirective = directive === 'rsource' || directive === 'orsource';
        const srctreeRoot = this.srctreeRoot;
        // Expand variables in the path
        sourcePath = this.expandVariables(sourcePath);
        // 计算解析基准路径
        const baseDir = path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(sourcePath)
            ? ''
            : (isRelativeDirective ? path__WEBPACK_IMPORTED_MODULE_1__.dirname(currentFile) : srctreeRoot);
        const resolvedPattern = path__WEBPACK_IMPORTED_MODULE_1__.join(baseDir, sourcePath);
        // 判断是否包含通配符
        if ((0,glob__WEBPACK_IMPORTED_MODULE_2__.hasMagic)(sourcePath)) {
            try {
                const files = this.deduplicateSourceFiles((await (0,glob__WEBPACK_IMPORTED_MODULE_2__.glob)(resolvedPattern, { nodir: true }))
                    .map(file => path__WEBPACK_IMPORTED_MODULE_1__.normalize(file))
                    .sort((a, b) => a.localeCompare(b)));
                if (files.length === 0 && !optional && !options?.suppressWarnings) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Source directive matched zero files: ${resolvedPattern}`);
                    return null;
                }
                return { files, optional };
            }
            catch (error) {
                if (!optional && !options?.suppressWarnings) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Failed to glob ${resolvedPattern}: ${error}`);
                }
                return null;
            }
        }
        else {
            // Single file
            const normalizedPath = path__WEBPACK_IMPORTED_MODULE_1__.normalize(resolvedPattern);
            return { files: this.deduplicateSourceFiles([normalizedPath]), optional };
        }
    }
    async parseSourceIntoParent(line, currentFile, parent) {
        const sourceResult = await this.parseSource(line, currentFile);
        if (!sourceResult) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Source directive failed: ${line}`);
            return;
        }
        const sourceFiles = this.deduplicateSourceFiles(sourceResult.files);
        await this.preloadSourceFiles(sourceFiles, line);
        for (const sourceFile of sourceFiles) {
            const normalizedSource = path__WEBPACK_IMPORTED_MODULE_1__.normalize(sourceFile);
            if (this.activeParsingFiles.has(normalizedSource)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Detected recursive source include, skipping: ${normalizedSource}`);
                continue;
            }
            this.fileOpenCounter++;
            this.openedFilesList.push({
                index: this.fileOpenCounter,
                file: normalizedSource,
                directive: line,
                time: new Date(),
            });
            this.allParsedFiles.add(normalizedSource);
            const sourceLines = await this.readFile(normalizedSource);
            if (sourceLines.length === 0) {
                if (!sourceResult.optional) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Source file not found or empty: ${normalizedSource}`);
                }
                continue;
            }
            this.activeParsingFiles.add(normalizedSource);
            try {
                await this.parseLines(sourceLines, parent, normalizedSource);
            }
            finally {
                this.activeParsingFiles.delete(normalizedSource);
            }
        }
    }
    collectSourceDirectives(lines) {
        if (!lines || lines.length === 0) {
            return [];
        }
        const directives = [];
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (line &&
                (line.startsWith("source ") || line.startsWith("rsource ") || line.startsWith("osource ") || line.startsWith("orsource ")) &&
                !line.includes("$(")) {
                directives.push(line);
            }
        }
        return directives;
    }
    scheduleSourcePrefetch(lines, currentFile, depth) {
        if (!this.allowBackgroundPrefetch) {
            return;
        }
        if (!lines || lines.length === 0 || depth >= KconfigParser.SOURCE_PREFETCH_MAX_DEPTH) {
            return;
        }
        const directives = this.collectSourceDirectives(lines);
        if (directives.length === 0) {
            return;
        }
        const task = (async () => {
            const nextDepth = depth + 1;
            for (const directive of directives) {
                const sourceResult = await this.parseSource(directive, currentFile, { suppressWarnings: true });
                if (!sourceResult || !sourceResult.files || sourceResult.files.length === 0) {
                    continue;
                }
                for (const sourceFile of sourceResult.files) {
                    const normalized = path__WEBPACK_IMPORTED_MODULE_1__.normalize(sourceFile);
                    if (this.fileContentCache.has(normalized)) {
                        continue;
                    }
                    if (this.scheduledPrefetchFiles.has(normalized)) {
                        continue;
                    }
                    this.scheduledPrefetchFiles.add(normalized);
                    this.sourcePrefetchQueue.push({ filePath: normalized, depth: nextDepth });
                }
            }
            this.ensureSourcePrefetchWorker();
        })().catch((error) => {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugSource(() => `[SOURCE_PREFETCH] Failed to schedule prefetch for ${currentFile}: ${error}`);
        });
        this.prefetchTasks.add(task);
        task.finally(() => {
            this.prefetchTasks.delete(task);
        }).catch(() => undefined);
    }
    ensureSourcePrefetchWorker() {
        if (this.sourcePrefetchWorkerRunning || !this.allowBackgroundPrefetch) {
            return;
        }
        const task = (async () => {
            this.sourcePrefetchWorkerRunning = true;
            try {
                while (this.allowBackgroundPrefetch && this.sourcePrefetchQueue.length > 0) {
                    const batch = this.sourcePrefetchQueue.splice(0, KconfigParser.SOURCE_PREFETCH_BATCH_SIZE);
                    const filePaths = batch.map((entry) => entry.filePath);
                    const depthByFile = new Map();
                    for (const entry of batch) {
                        const previousDepth = depthByFile.get(entry.filePath);
                        if (previousDepth === undefined || entry.depth < previousDepth) {
                            depthByFile.set(entry.filePath, entry.depth);
                        }
                    }
                    const preloaded = await this.concurrentProcessor.readFilesAsync(filePaths);
                    if (!this.allowBackgroundPrefetch) {
                        break;
                    }
                    for (const [filePath, content] of preloaded.entries()) {
                        if (this.fileContentCache.has(filePath)) {
                            continue;
                        }
                        const lines = content.split("\n");
                        this.fileContentCache.set(filePath, lines);
                        const currentDepth = depthByFile.get(filePath) ?? KconfigParser.SOURCE_PREFETCH_MAX_DEPTH;
                        if (currentDepth < KconfigParser.SOURCE_PREFETCH_MAX_DEPTH) {
                            this.scheduleSourcePrefetch(lines, filePath, currentDepth);
                        }
                    }
                }
            }
            finally {
                this.sourcePrefetchWorkerRunning = false;
                if (this.allowBackgroundPrefetch && this.sourcePrefetchQueue.length > 0) {
                    this.ensureSourcePrefetchWorker();
                }
            }
        })();
        this.prefetchTasks.add(task);
        task.finally(() => {
            this.prefetchTasks.delete(task);
        }).catch(() => undefined);
    }
    deduplicateSourceFiles(files) {
        if (!files || files.length <= 1) {
            return files;
        }
        const seen = new Set();
        const deduped = [];
        for (const file of files) {
            const normalized = path__WEBPACK_IMPORTED_MODULE_1__.normalize(file);
            if (seen.has(normalized)) {
                continue;
            }
            seen.add(normalized);
            deduped.push(normalized);
        }
        return deduped;
    }
    async preloadSourceFiles(files, directive) {
        if (!files || files.length <= 1) {
            return;
        }
        const uncachedFiles = files.filter(file => !this.fileContentCache.has(file));
        if (uncachedFiles.length <= 1) {
            return;
        }
        try {
            const preloaded = await this.concurrentProcessor.readFilesAsync(uncachedFiles);
            preloaded.forEach((content, filePath) => {
                if (!this.fileContentCache.has(filePath)) {
                    const lines = content.split('\n');
                    this.fileContentCache.set(filePath, lines);
                    this.scheduleSourcePrefetch(lines, filePath, 1);
                }
            });
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SOURCE_PRELOAD] Preloaded ${preloaded.size}/${uncachedFiles.length} files for directive: ${directive}`);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Failed to preload source files for directive "${directive}": ${error}`);
        }
    }
    /**
     * Extract quoted string from a line
     */
    extractQuotedString(line) {
        const token = this.extractQuotedToken(line);
        return token ? token.value : line.trim();
    }
    extractQuotedToken(line) {
        const start = line.indexOf('"');
        if (start === -1) {
            return null;
        }
        let value = '';
        let escaped = false;
        for (let i = start + 1; i < line.length; i++) {
            const ch = line[i];
            if (escaped) {
                value += this.decodeKconfigEscape(ch);
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') {
                return { value, start, end: i + 1 };
            }
            value += ch;
        }
        return null;
    }
    decodeKconfigEscape(ch) {
        switch (ch) {
            case '"':
            case '\\':
                return ch;
            case 'n':
                return '\n';
            case 't':
                return '\t';
            default:
                return `\\${ch}`;
        }
    }
    splitValueAndCondition(text) {
        const ifIndex = this.findTopLevelIfSeparator(text);
        if (ifIndex === -1) {
            return { value: text.trim() };
        }
        return {
            value: text.substring(0, ifIndex).trim(),
            condition: text.substring(ifIndex + 4).trim(),
        };
    }
    findTopLevelIfSeparator(text) {
        let depth = 0;
        let inString = false;
        let escaped = false;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (inString) {
                if (ch === '\\') {
                    escaped = true;
                }
                else if (ch === '"') {
                    inString = false;
                }
                continue;
            }
            if (ch === '"') {
                inString = true;
                continue;
            }
            if (ch === '(') {
                depth++;
                continue;
            }
            if (ch === ')') {
                depth = Math.max(0, depth - 1);
                continue;
            }
            if (depth === 0 && text.substring(i, i + 4) === ' if ') {
                return i;
            }
        }
        return -1;
    }
    /**
     * Expand variables in a string (e.g., $(RTT_DIR)/Kconfig -> ../../.../Kconfig)
     */
    expandVariables(str) {
        return this.expandKconfigString(str);
    }
    expandDefaultValue(value) {
        if (!value) {
            return value;
        }
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            const inner = value.substring(1, value.length - 1);
            const expanded = this.expandKconfigString(inner);
            return `${value[0]}${expanded}${value[value.length - 1]}`;
        }
        return this.expandKconfigString(value);
    }
    expandKconfigString(value, visited = new Set()) {
        if (!value) {
            return value;
        }
        const replace = (match, p1, p2) => {
            const varName = (p1 || p2 || '').trim();
            if (!varName) {
                return '';
            }
            if (visited.has(varName)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Detected recursive variable expansion for ${varName}`);
                return '';
            }
            visited.add(varName);
            let resolved = this.resolveVariable(varName, visited);
            visited.delete(varName);
            if (resolved === undefined) {
                resolved = '';
            }
            return resolved;
        };
        return value.replace(/\$\(([^)]+)\)|\$([A-Za-z_][A-Za-z0-9_]*)/g, replace);
    }
    resolveVariable(varName, visited) {
        if (varName === "PKGS_DIR") {
            const envValue = (process.env.PKGS_DIR || "").trim();
            if (envValue) {
                return envValue;
            }
        }
        const variable = this.variables.get(varName);
        if (variable) {
            if (variable.isRecursive) {
                return this.expandKconfigString(variable.value, visited);
            }
            return variable.value;
        }
        if (varName === 'srctree' || varName === 'SRCTREE') {
            return this.srctreeRoot;
        }
        const envValue = process.env[varName];
        if (envValue !== undefined) {
            return envValue;
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Variable ${varName} not found during expansion, defaulting to empty string`);
        return '';
    }
    /**
     * Build select relationships in the node tree.
     * This identifies which configs are selected and marks them accordingly.
     * Must be called before flattening to preserve selected configs.
     */
    buildSelectRelationshipsInTree(root) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('[SELECT_RELATIONSHIPS] Building select relationships in tree...');
        // First pass: collect all nodes with their names
        const nodeMap = new Map();
        const collectNodes = (node) => {
            if (node.item && node.item.name) {
                nodeMap.set(node.item.name, node);
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Collected node: ${node.item.name}`);
            }
            let child = node.list;
            while (child) {
                collectNodes(child);
                child = child.next;
            }
        };
        collectNodes(root);
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Collected ${nodeMap.size} nodes with names`);
        // Second pass: mark nodes that are selected
        const markSelectedNodes = (node) => {
            if (node.item && node.item.select) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Processing select statements for ${node.item.name}: [${node.item.select.join(', ')}]`);
                for (const selectTarget of node.item.select) {
                    const targetNode = nodeMap.get(selectTarget);
                    if (targetNode && targetNode.item) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Found target node ${selectTarget}, marking as selected by ${node.item.name}`);
                        // Mark the target as being selected
                        if (!targetNode.item.selectedBy) {
                            targetNode.item.selectedBy = [];
                        }
                        if (!targetNode.item.selectedBy.includes(node.item.name)) {
                            targetNode.item.selectedBy.push(node.item.name);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Added selectedBy relationship: ${selectTarget} is selected by ${node.item.name}`);
                        }
                        // If the target has no prompt but is selected, mark it for special handling
                        if (!targetNode.prompt && targetNode.item.selectedBy.length > 0) {
                            // This node should not have its children flattened
                            // because it needs to maintain its if block structure
                            targetNode.item.isImplicitContainer = true;
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Marked ${selectTarget} as implicit container (no prompt but selected)`);
                        }
                    }
                    else {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] WARNING: Select target ${selectTarget} not found in node map for selector ${node.item.name}`);
                    }
                }
            }
            let child = node.list;
            while (child) {
                markSelectedNodes(child);
                child = child.next;
            }
        };
        markSelectedNodes(root);
        // Log final select relationships
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('[SELECT_RELATIONSHIPS] Final select relationships:');
        for (const [name, node] of nodeMap) {
            if (node.item && node.item.selectedBy && node.item.selectedBy.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS]   ${name} is selected by: [${node.item.selectedBy.join(', ')}]`);
            }
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('[SELECT_RELATIONSHIPS] Select relationships building completed');
    }
    /**
     * Build reverse select relationships (selectedBy) in Menu array.
     * This is called after converting to Menu array for compatibility.
     */
    buildSelectRelationships(menus) {
        const allMenus = this.flattenMenus(menus);
        // Build menu map for quick lookup
        const menuMap = new Map();
        for (const menu of allMenus) {
            if (menu.name) {
                menuMap.set(menu.name, menu);
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Mapped menu: ${menu.name} (has select: ${menu.select.length > 0})`);
            }
        }
        // Build selectedBy relationships
        let selectRelationshipsFound = 0;
        for (const menu of allMenus) {
            if (menu.select.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Processing ${menu.name} select targets: [${menu.select.join(', ')}]`);
                for (const selectTarget of menu.select) {
                    const targetMenu = menuMap.get(selectTarget);
                    if (targetMenu) {
                        if (!targetMenu.selectedBy.includes(menu.name)) {
                            targetMenu.selectedBy.push(menu.name);
                            selectRelationshipsFound++;
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Added relation: ${selectTarget} selected by ${menu.name}`);
                        }
                    }
                    else {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`[MENU_SELECT_RELATIONSHIPS] WARNING: Select target ${selectTarget} not found for selector ${menu.name}`);
                        // Special warning for DFS_USING_POSIX
                        if (selectTarget === 'DFS_USING_POSIX') {
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`[MENU_SELECT_RELATIONSHIPS] *** ERROR: DFS_USING_POSIX not found in menu map! ***`);
                        }
                    }
                }
            }
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Built ${selectRelationshipsFound} select relationships`);
    }
    /**
     * Flatten menu hierarchy to get all menus.
     */
    flattenMenus(menus) {
        const result = [];
        for (const menu of menus) {
            result.push(menu);
            if (menu.children && menu.children.length > 0) {
                result.push(...this.flattenMenus(menu.children));
            }
        }
        return result;
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigServer.ts"
/*!*****************************************!*\
  !*** ./src/menuconfig/KconfigServer.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigServer: () => (/* binding */ KconfigServer)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "events");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MenuValueUtils */ "./src/menuconfig/MenuValueUtils.ts");
/* harmony import */ var _KconfigMenuLoader__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./KconfigMenuLoader */ "./src/menuconfig/KconfigMenuLoader.ts");
/* harmony import */ var _MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./MenuTransferSerializer */ "./src/menuconfig/MenuTransferSerializer.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _VisibilityManager__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./VisibilityManager */ "./src/menuconfig/VisibilityManager.ts");
/* harmony import */ var _fileWatcher__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./fileWatcher */ "./src/menuconfig/fileWatcher.ts");
/* harmony import */ var _KconfigWriter__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./KconfigWriter */ "./src/menuconfig/KconfigWriter.ts");
// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.












class KconfigServer extends events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    static instance = null;
    serverProcess = null;
    receivedDataBuffer = "";
    kconfigMenus = [];
    defaultValues = new Map();
    workspaceFolder;
    kconfigFile;
    configFile;
    isRunning = false;
    unsavedChanges = false;
    visibilityManager;
    kconfigWriter;
    menuIndex = new Map();
    menuNameIndex = new Map();
    choiceParentByChildId = new Map();
    menuParentByChildId = new Map();
    menuStateCache = new Map();
    defaultSnapshot = [];
    constructor(options) {
        super();
        this.workspaceFolder = options.workspaceFolder;
        this.kconfigFile = options.kconfigFile;
        // If no configFile specified, default to .config in the same directory as the Kconfig file
        if (options.configFile) {
            this.configFile = options.configFile;
        }
        else {
            const kconfigDir = path__WEBPACK_IMPORTED_MODULE_1__.dirname(options.kconfigFile);
            this.configFile = path__WEBPACK_IMPORTED_MODULE_1__.join(kconfigDir, ".config");
        }
        this.visibilityManager = new _VisibilityManager__WEBPACK_IMPORTED_MODULE_9__.VisibilityManager();
        // Pass the visibility manager's evaluator to the writer so it uses the same context
        this.kconfigWriter = new _KconfigWriter__WEBPACK_IMPORTED_MODULE_11__.KconfigWriter(this.defaultValues, this.visibilityManager.getEvaluator());
    }
    static async init(options) {
        if (KconfigServer.instance) {
            KconfigServer.instance.dispose();
        }
        KconfigServer.instance = new KconfigServer(options);
        await KconfigServer.instance.start();
        return KconfigServer.instance;
    }
    static getInstance() {
        return KconfigServer.instance;
    }
    async start() {
        // For now, use a simple implementation that reads Kconfig files directly
        // In the future, this could be replaced with a Python-based Kconfig server
        // using kconfiglib or similar tools
        this.isRunning = true;
        // Load Kconfig structure using the specific file
        const targetFile = vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.file(this.kconfigFile);
        const loader = new _KconfigMenuLoader__WEBPACK_IMPORTED_MODULE_6__.KconfigMenuLoader(this.workspaceFolder, targetFile);
        this.kconfigMenus = await loader.loadKconfigMenus();
        // Initialize once without user values so conditional defaults and choice defaults
        // are captured before .config is applied.
        _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(() => `[KCONFIG_SERVER] Initializing visibility manager with ${this.kconfigMenus.length} menus`);
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.captureDefaultSnapshot(this.kconfigMenus);
        this.saveDefaultValues(this.kconfigMenus);
        this.rebuildMenuCaches();
        // Load existing config values if available
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            await this.loadConfigValues();
            this.visibilityManager.initialize(this.kconfigMenus);
            this.forceTopLevelMenusVisible(this.kconfigMenus);
        }
        this.rebuildMenuCaches();
        _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(() => `[KCONFIG_SERVER] Initialized with ${this.kconfigMenus.length} menus and visibility manager`);
        this.emit("ready", this.kconfigMenus);
    }
    getMenus() {
        return this.kconfigMenus;
    }
    async reloadFromDisk() {
        const loader = new _KconfigMenuLoader__WEBPACK_IMPORTED_MODULE_6__.KconfigMenuLoader(this.workspaceFolder, vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.file(this.kconfigFile));
        this.kconfigMenus = await loader.loadKconfigMenus();
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.captureDefaultSnapshot(this.kconfigMenus);
        this.saveDefaultValues(this.kconfigMenus);
        this.rebuildMenuCaches();
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            await this.loadConfigValues();
            this.visibilityManager.initialize(this.kconfigMenus);
            this.forceTopLevelMenusVisible(this.kconfigMenus);
        }
        this.rebuildMenuCaches();
        _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(() => "[KCONFIG_SERVER] Reloaded from disk: " + this.kconfigMenus.length + " menus");
        return this.kconfigMenus;
    }
    getVisibilityManager() {
        return this.visibilityManager;
    }
    hasUnsavedChanges() {
        return this.unsavedChanges;
    }
    getMenuDetailById(id) {
        const menu = this.menuIndex.get(id);
        if (!menu) {
            return null;
        }
        const detail = (0,_MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_7__.createMenuDetailPayload)(menu);
        if (!detail.prompt) {
            detail.prompt = menu.title || menu.name || "";
        }
        if (!detail.effectiveDepExpr && menu.dependsOn && menu.dependsOn.trim() !== "" && menu.dependsOn.trim() !== "y") {
            detail.effectiveDepExpr = menu.dependsOn;
        }
        if (detail.directDepExpr) {
            detail.directDepValue = this.visibilityManager.getEvaluator().evaluate(detail.directDepExpr) ? "met" : "not met";
        }
        if (detail.effectiveDepExpr) {
            detail.effectiveDepValue = this.visibilityManager.getEvaluator().evaluate(detail.effectiveDepExpr) ? "visible" : "hidden";
        }
        if (!detail.menuPath) {
            detail.menuPath = this.buildMenuPath(id);
        }
        detail.selectInfo = detail.selectInfo || this.describeTargets(menu.select, menu.selectConditions);
        detail.selectedByInfo = detail.selectedByInfo || this.describeList(menu.selectedBy);
        detail.implyInfo = detail.implyInfo || this.describeTargets(menu.implies, menu.implyConditions);
        return detail;
    }
    updateValue(updatedMenu) {
        this.unsavedChanges = true;
        const targetMenu = this.menuIndex.get(updatedMenu.id);
        if (!targetMenu) {
            return;
        }
        // Validate and clamp numeric-like values against range constraints.
        let newValue = updatedMenu.value;
        if (targetMenu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.int) {
            newValue = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__.normalizeIntValue)(newValue, targetMenu.range);
        }
        else if (targetMenu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.hex) {
            newValue = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__.normalizeHexValue)(newValue, targetMenu.range);
        }
        targetMenu.value = newValue;
        this.kconfigMenus = this.visibilityManager.updateValue(targetMenu.id, newValue);
        const affectedIds = this.visibilityManager.consumeLastAffectedMenuIds();
        const visibilityChanges = this.collectChangesForAffectedMenus(affectedIds);
        if (visibilityChanges.length > 0) {
            this.emit("visibilityChanged", visibilityChanges);
        }
    }
    async saveConfig() {
        try {
            const assignments = this.kconfigWriter.collectAssignments(this.kconfigMenus);
            const headerPath = await this.resolveHeaderPath();
            // 通知 FileWatcher 忽略内部写入导致的变更
            _fileWatcher__WEBPACK_IMPORTED_MODULE_10__.FileWatcher.getInstance()?.ignoreNextChange();
            await this.kconfigWriter.write({
                menus: this.kconfigMenus,
                assignments,
                configOut: this.configFile,
                headerOut: headerPath || undefined,
                configHeader: undefined,
                headerHeader: headerPath ? this.getAutoHeader() : undefined,
                saveOld: true,
            });
            this.unsavedChanges = false;
            this.emit("configSaved");
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.error("Failed to save configuration", error);
            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage(`Failed to save configuration: ${error}`);
        }
    }
    async saveDefconfig(filepath) {
        try {
            const assignments = this.kconfigWriter.collectAssignments(this.kconfigMenus);
            const defaultPath = path__WEBPACK_IMPORTED_MODULE_1__.join(path__WEBPACK_IMPORTED_MODULE_1__.dirname(this.configFile), "defconfig");
            const defconfigPath = filepath || defaultPath;
            await this.kconfigWriter.write({
                menus: this.kconfigMenus,
                assignments,
                defconfigOut: defconfigPath,
                configHeader: undefined,
                saveOld: false,
            });
            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showInformationMessage("Default configuration saved to " + defconfigPath);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.error("Failed to save defconfig", error);
            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage("Failed to save defconfig: " + error);
        }
    }
    exportConfigText() {
        const lines = [];
        const header = this.getConfigHeader();
        if (header)
            lines.push(header);
        lines.push(...this.kconfigWriter.generateConfigLines(this.kconfigMenus));
        return lines.join("\n") + (lines.length > 0 ? "\n" : "");
    }
    async resetToDefaults() {
        _fileWatcher__WEBPACK_IMPORTED_MODULE_10__.FileWatcher.getInstance()?.ignoreNextChange();
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            try {
                await fs__WEBPACK_IMPORTED_MODULE_3__.promises.unlink(this.configFile);
            }
            catch (error) {
                // deletion is best-effort
            }
        }
        this.resetMenuValuesToDefaults();
        // After resetting values, recompute visibility/read-only states
        // so that the menu tree reflects the freshly restored defaults.
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.rebuildMenuCaches();
        this.unsavedChanges = true;
        // Logger.info("[RESET] Reset to defaults completed");
        this.emit("configReset", this.kconfigMenus);
    }
    async discardChanges() {
        _fileWatcher__WEBPACK_IMPORTED_MODULE_10__.FileWatcher.getInstance()?.ignoreNextChange();
        // Reset all values to Kconfig defaults (without deleting .config)
        this.resetMenuValuesToDefaults();
        // Then re-apply .config values on top
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            await this.loadConfigValues();
        }
        this.rebuildMenuCaches();
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.unsavedChanges = false;
        this.emit("changesDiscarded", this.kconfigMenus);
    }
    resetMenuValuesToDefaults() {
        this.kconfigMenus = this.cloneMenus(this.defaultSnapshot);
        this.rebuildMenuCaches();
    }
    async loadConfigValues() {
        try {
            const configContent = await fs__WEBPACK_IMPORTED_MODULE_3__.promises.readFile(this.configFile, "utf8");
            const configLines = configContent.split("\n");
            _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(() => `[LOAD_CONFIG] Reading config file: ${this.configFile}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(() => `[LOAD_CONFIG] Total lines in config: ${configLines.length}`);
            let _processedLines = 0;
            let _skippedLines = 0;
            for (const line of configLines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) {
                    _skippedLines++;
                    continue;
                }
                // First handle commented out CONFIG lines: "# CONFIG_NAME is not set"
                if (trimmedLine.startsWith("#")) {
                    const commentMatch = trimmedLine.match(/^#\s*CONFIG_([A-Z0-9_]+)\s+is\s+not\s+set$/);
                    if (commentMatch) {
                        const _configName = commentMatch[1];
                        const updateResult = this.updateIndexedMenuValues(_configName, "n");
                        if (updateResult) {
                            _processedLines++;
                        }
                        continue;
                    }
                    _skippedLines++;
                    continue;
                }
                // Parse CONFIG_NAME=value lines
                const configMatch = trimmedLine.match(/^CONFIG_([A-Z0-9_]+)=(.+)$/);
                if (configMatch) {
                    const _configName = configMatch[1];
                    const configValue = configMatch[2];
                    const updateResult = this.updateIndexedMenuValues(_configName, configValue);
                    if (updateResult) {
                        _processedLines++;
                    }
                    continue;
                }
                _skippedLines++;
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(() => `[LOAD_CONFIG] Processed ${_processedLines} config lines, skipped ${_skippedLines} lines`);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.error("Failed to load config values", error);
        }
    }
    updateMenuValueByName(name, value) {
        return this.updateIndexedMenuValues(name, value);
    }
    async resolveHeaderPath() {
        const config = vscode__WEBPACK_IMPORTED_MODULE_2__.workspace.getConfiguration("imde.guiConfig");
        let headerPath = config.get("autoHeaderPath", "")?.trim() || "";
        if (!headerPath) {
            return null;
        }
        if (!path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(headerPath)) {
            const configDir = path__WEBPACK_IMPORTED_MODULE_1__.dirname(this.configFile);
            headerPath = path__WEBPACK_IMPORTED_MODULE_1__.join(configDir, headerPath);
        }
        await fs__WEBPACK_IMPORTED_MODULE_3__.promises.mkdir(path__WEBPACK_IMPORTED_MODULE_1__.dirname(headerPath), { recursive: true });
        return headerPath;
    }
    getConfigHeader() {
        return "#\n# Automatically generated file; DO NOT EDIT.\n#\n\n";
    }
    getAutoHeader() {
        return "/*\n * Automatically generated file; DO NOT EDIT.\n */\n\n";
    }
    saveDefaultValues(menus) {
        this.defaultValues.clear();
        const saveValues = (menus, depth = 0) => {
            for (const menu of menus) {
                if (menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.menu && menu.name) {
                    this.defaultValues.set(menu.name, menu.value);
                }
                if (menu.children) {
                    saveValues(menu.children, depth + 1);
                }
            }
        };
        saveValues(menus);
    }
    captureDefaultSnapshot(menus) {
        this.defaultSnapshot = this.cloneMenus(menus);
    }
    cloneMenus(menus) {
        return JSON.parse(JSON.stringify(menus));
    }
    /**
     * Find a menu by its symbol name in the current menu tree
     */
    findMenuByName(name) {
        const dfs = (menus) => {
            for (const m of menus) {
                if (m.name === name)
                    return m;
                if (m.children && m.children.length > 0) {
                    const found = dfs(m.children);
                    if (found)
                        return found;
                }
            }
            return null;
        };
        return dfs(this.kconfigMenus);
    }
    /**
     * Format a single config as a C #define statement
     * (deprecated: retained for backward compatibility)
     */
    /**
     * Escapes string for .config file output, matching Kconfiglib behavior
     * Backslashes must be escaped before quotes to avoid double escaping
     */
    findParentChoice(childName) {
        const byName = this.menuNameIndex.get(childName) || [];
        for (const target of byName) {
            const parentChoice = this.choiceParentByChildId.get(target.id);
            if (parentChoice) {
                return parentChoice;
            }
        }
        return null;
    }
    rebuildMenuCaches() {
        const nextIndex = new Map();
        const nextNameIndex = new Map();
        const nextChoiceParent = new Map();
        const nextParentByChildId = new Map();
        const nextState = new Map();
        const stack = this.kconfigMenus.map((menu) => ({ menu, parentId: null }));
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current || !current.menu) {
                continue;
            }
            const menu = current.menu;
            nextIndex.set(menu.id, menu);
            nextParentByChildId.set(menu.id, current.parentId);
            nextState.set(menu.id, this.snapshotMenuState(menu));
            if (menu.name) {
                const siblings = nextNameIndex.get(menu.name) || [];
                siblings.push(menu);
                nextNameIndex.set(menu.name, siblings);
            }
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.choice && menu.children && menu.children.length > 0) {
                for (const child of menu.children) {
                    nextChoiceParent.set(child.id, menu);
                }
            }
            if (menu.children && menu.children.length > 0) {
                for (let i = 0; i < menu.children.length; i++) {
                    stack.push({
                        menu: menu.children[i],
                        parentId: menu.id,
                    });
                }
            }
        }
        this.menuIndex = nextIndex;
        this.menuNameIndex = nextNameIndex;
        this.choiceParentByChildId = nextChoiceParent;
        this.menuParentByChildId = nextParentByChildId;
        this.menuStateCache = nextState;
    }
    buildMenuPath(menuId) {
        const segments = [];
        let parentId = this.menuParentByChildId.get(menuId) ?? null;
        while (parentId) {
            const parent = this.menuIndex.get(parentId);
            if (!parent) {
                break;
            }
            const label = (parent.title || parent.prompt || parent.name || "").trim();
            if (label) {
                segments.unshift(label);
            }
            parentId = this.menuParentByChildId.get(parentId) ?? null;
        }
        if (segments.length === 0) {
            return "(Top)";
        }
        return `(Top) -> ${segments.join(" -> ")}`;
    }
    describeList(values) {
        if (!values || values.length === 0) {
            return undefined;
        }
        return values.join(", ");
    }
    describeTargets(values, conditions) {
        if (!values || values.length === 0) {
            return undefined;
        }
        return values
            .map((target) => {
            const condition = conditions?.[target];
            return condition ? `${target} if ${condition}` : target;
        })
            .join(", ");
    }
    updateIndexedMenuValues(name, rawValue) {
        const targets = this.menuNameIndex.get(name);
        if (!targets || targets.length === 0) {
            return false;
        }
        for (const menu of targets) {
            this.applyConfigValueToMenu(menu, rawValue);
        }
        return true;
    }
    applyConfigValueToMenu(menu, rawValue) {
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.bool: {
                menu.value = rawValue === "y";
                menu.isDefaultValue = false;
                const parentChoice = this.choiceParentByChildId.get(menu.id);
                if (parentChoice) {
                    if (menu.value === true) {
                        parentChoice.value = menu.name;
                        parentChoice.isDefaultValue = false;
                        for (const sibling of parentChoice.children || []) {
                            if (sibling.name !== menu.name && sibling.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.bool) {
                                sibling.value = false;
                                sibling.isDefaultValue = false;
                            }
                        }
                        _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(() => `[LOAD_CONFIG] Set parent choice "${parentChoice.title || parentChoice.name}" <- ${menu.name}`);
                    }
                    else if (parentChoice.value === menu.name) {
                        parentChoice.value = null;
                        parentChoice.isDefaultValue = false;
                    }
                }
                return;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.tristate: {
                menu.value = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__.normalizeTristateValue)(rawValue);
                menu.isDefaultValue = false;
                return;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.int:
                menu.value = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__.normalizeIntValue)(rawValue, menu.range);
                menu.isDefaultValue = false;
                return;
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.hex:
                menu.value = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__.normalizeHexValue)(rawValue, menu.range);
                menu.isDefaultValue = false;
                return;
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.string:
                menu.value = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__.normalizeConfigStringValue)(rawValue);
                menu.isDefaultValue = false;
                return;
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.choice:
                menu.value = rawValue === "y" ? menu.name : null;
                menu.isDefaultValue = false;
                return;
            default:
                menu.value = rawValue;
                menu.isDefaultValue = false;
                return;
        }
    }
    forceTopLevelMenusVisible(menus) {
        menus.forEach((menu) => {
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.menu && menu.hasPrompt && (!menu.dependsOn || menu.dependsOn.trim() === "")) {
                menu.isVisible = true;
                menu.isContainerVisible = true;
            }
            if (menu.children && menu.children.length > 0) {
                this.forceTopLevelMenusVisible(menu.children);
            }
        });
    }
    snapshotMenuState(menu) {
        return {
            type: menu.type,
            value: menu.value,
            isVisible: menu.isVisible,
            isContainerVisible: menu.isContainerVisible,
            isReadonly: menu.isReadonly,
            readonlyReason: menu.readonlyReason,
            selectedBy: menu.selectedBy ? [...menu.selectedBy] : undefined,
            autoSelectedValue: menu.autoSelectedValue,
            autoImpliedValue: menu.autoImpliedValue,
        };
    }
    collectChangesForAffectedMenus(affectedIds) {
        const visibilityChanges = [];
        for (const id of affectedIds) {
            const menu = this.menuIndex.get(id);
            if (!menu) {
                continue;
            }
            const before = this.menuStateCache.get(id);
            const current = this.snapshotMenuState(menu);
            const valueDiff = !before || !this.areMenuValuesEqual(before.value, current.value, current.type);
            const visibilityDiff = !before || (before.isVisible !== current.isVisible ||
                before.isContainerVisible !== current.isContainerVisible ||
                before.isReadonly !== current.isReadonly ||
                before.readonlyReason !== current.readonlyReason ||
                this.arrayChanged(before.selectedBy, current.selectedBy) ||
                before.autoSelectedValue !== current.autoSelectedValue ||
                before.autoImpliedValue !== current.autoImpliedValue);
            if (!before || visibilityDiff || valueDiff) {
                visibilityChanges.push({
                    id: menu.id,
                    isVisible: current.isVisible,
                    isContainerVisible: current.isContainerVisible,
                    isReadonly: current.isReadonly,
                    readonlyReason: current.readonlyReason,
                    selectedBy: current.selectedBy ? [...current.selectedBy] : undefined,
                    autoSelectedValue: current.autoSelectedValue,
                    autoImpliedValue: current.autoImpliedValue,
                    value: valueDiff || !before ? menu.value : undefined
                });
            }
            this.menuStateCache.set(id, current);
        }
        return visibilityChanges;
    }
    areMenuValuesEqual(previous, current, type) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_5__.areMenuValuesEqual)(previous, current, type);
    }
    arrayChanged(a, b) {
        if (!a && !b) {
            return false;
        }
        if (!a || !b) {
            return true;
        }
        if (a.length !== b.length) {
            return true;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return true;
            }
        }
        return false;
    }
    dispose() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
        this.isRunning = false;
        this.removeAllListeners();
        if (KconfigServer.instance === this) {
            KconfigServer.instance = null;
        }
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigWriter.ts"
/*!*****************************************!*\
  !*** ./src/menuconfig/KconfigWriter.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigWriter: () => (/* binding */ KconfigWriter)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ConditionEvaluator */ "./src/menuconfig/ConditionEvaluator.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _MenuValueUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MenuValueUtils */ "./src/menuconfig/MenuValueUtils.ts");





class KconfigWriter {
    evaluator;
    defaultValues;
    constructor(defaultValues, evaluator) {
        this.defaultValues = defaultValues;
        this.evaluator = evaluator || new _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_2__.ConditionEvaluator();
    }
    /**
     * Update the configuration context for dependency evaluation
     */
    updateContext(context) {
        this.evaluator.updateContext(context);
    }
    collectAssignments(menus) {
        const assignments = [];
        const visited = new Set();
        const traverse = (items) => {
            for (const item of items) {
                if (item.name && !visited.has(item.name) && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.menu && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.choice) {
                    visited.add(item.name);
                    if (this.shouldSkipSymbol(item)) {
                        continue;
                    }
                    const assignment = this.serializeMenuValue(item);
                    if (assignment) {
                        assignments.push(assignment);
                    }
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                }
            }
        };
        traverse(menus);
        return assignments;
    }
    async write(options) {
        const assignments = options.assignments ?? this.collectAssignments(options.menus);
        if (options.configOut) {
            await this.writeConfigFile(options.configOut, options.menus, options.configHeader, options.saveOld !== false);
        }
        if (options.headerOut) {
            await this.writeHeaderFile(options.headerOut, options.menus, options.headerHeader);
        }
        if (options.defconfigOut) {
            await this.writeDefconfigFile(options.defconfigOut, assignments, options.configHeader);
        }
    }
    async writeConfigFile(filename, menus, header, saveOld = true) {
        const lines = this.generateConfigLines(menus);
        let content = header ? header : "";
        if (lines.length > 0) {
            if (content && !content.endsWith("\n")) {
                content += "\n";
            }
            content += lines.join("\n");
            if (!content.endsWith("\n")) {
                content += "\n";
            }
        }
        await this.writeFileIfChanged(filename, content, saveOld);
    }
    async writeHeaderFile(filename, menus, header) {
        const lines = this.generateHeaderLines(menus);
        let content = header ? header : "";
        if (lines.length > 0) {
            if (content && !content.endsWith("\n")) {
                content += "\n";
            }
            content += lines.join("\n");
            if (!content.endsWith("\n")) {
                content += "\n";
            }
        }
        await this.writeFileIfChanged(filename, content, false);
    }
    async writeDefconfigFile(filename, assignments, header) {
        const lines = assignments.map((assignment) => this.formatDefconfigLine(assignment)).filter((line) => line.length > 0);
        let content = header ? header : "";
        if (lines.length > 0) {
            if (content && !content.endsWith("\n")) {
                content += "\n";
            }
            content += lines.join("\n");
            if (!content.endsWith("\n")) {
                content += "\n";
            }
        }
        await this.writeFileIfChanged(filename, content, false);
    }
    generateConfigLines(menus) {
        const lines = [];
        const visited = new Set();
        const stack = [{
                items: menus,
                index: 0,
                printedHeader: false,
                contentStartIndex: lines.length,
                hasChildNodes: menus.length > 0
            }];
        let afterEndComment = false;
        while (stack.length > 0) {
            const frame = stack[stack.length - 1];
            if (frame.index >= frame.items.length) {
                stack.pop();
                if (frame.parentMenu &&
                    frame.printedHeader &&
                    frame.parentTitle &&
                    (lines.length > frame.contentStartIndex ||
                        frame.hasChildNodes)) {
                    lines.push(`# end of ${frame.parentTitle}`);
                    afterEndComment = true;
                }
                continue;
            }
            const item = frame.items[frame.index++];
            if (item.type === _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.menu) {
                const title = this.getMenuTitle(item);
                const shouldPrintMenu = this.shouldPrintMenuHeader(item) && !!title;
                if (shouldPrintMenu && title) {
                    if (lines.length === 0 || lines[lines.length - 1] !== "") {
                        lines.push("");
                    }
                    lines.push("#");
                    lines.push(`# ${title}`);
                    lines.push("#");
                    afterEndComment = false;
                }
                const children = item.children && item.children.length > 0 ? item.children : [];
                stack.push({
                    items: children,
                    index: 0,
                    parentMenu: item,
                    parentTitle: title,
                    printedHeader: shouldPrintMenu && !!title,
                    contentStartIndex: lines.length,
                    hasChildNodes: children.length > 0
                });
                continue;
            }
            if (item.type === _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.choice) {
                const children = item.children && item.children.length > 0 ? item.children : [];
                if (children.length > 0) {
                    stack.push({
                        items: children,
                        index: 0,
                        printedHeader: false,
                        contentStartIndex: lines.length,
                        hasChildNodes: children.length > 0
                    });
                }
                continue;
            }
            if (item.name && !visited.has(item.name)) {
                visited.add(item.name);
                if (this.shouldSkipSymbol(item)) {
                    if (item.children && item.children.length > 0) {
                        stack.push({
                            items: item.children,
                            index: 0,
                            printedHeader: false,
                            contentStartIndex: lines.length,
                            hasChildNodes: item.children.length > 0
                        });
                    }
                    continue;
                }
                if (!this.shouldWriteToConfig(item)) {
                    if (item.children && item.children.length > 0) {
                        stack.push({
                            items: item.children,
                            index: 0,
                            printedHeader: false,
                            contentStartIndex: lines.length,
                            hasChildNodes: item.children.length > 0
                        });
                    }
                    continue;
                }
                if (afterEndComment) {
                    if (lines.length === 0 || lines[lines.length - 1] !== "") {
                        lines.push("");
                    }
                    afterEndComment = false;
                }
                const line = this.formatConfigLine(item);
                if (line) {
                    lines.push(line);
                }
            }
            if (item.children && item.children.length > 0) {
                stack.push({
                    items: item.children,
                    index: 0,
                    printedHeader: false,
                    contentStartIndex: lines.length,
                    hasChildNodes: item.children.length > 0
                });
            }
        }
        return lines;
    }
    getMenuTitle(menu) {
        if (!menu) {
            return "";
        }
        const title = menu.title && menu.title.trim().length > 0 ? menu.title.trim() : undefined;
        if (title) {
            return title;
        }
        const prompt = menu.prompt && menu.prompt.trim().length > 0 ? menu.prompt.trim() : undefined;
        if (prompt) {
            return prompt;
        }
        return menu.name ? menu.name.trim() : "";
    }
    shouldPrintMenuHeader(menu) {
        if (!menu) {
            return false;
        }
        if (menu.isMainMenu) {
            return false;
        }
        if (!this.isDependencySatisfied(menu.dependsOn)) {
            return false;
        }
        const title = this.getMenuTitle(menu);
        return title.length > 0;
    }
    isDependencySatisfied(dependsOn) {
        if (!dependsOn) {
            return true;
        }
        const trimmed = dependsOn.trim();
        if (trimmed === "" || trimmed === "y") {
            return true;
        }
        return this.evaluator.evaluate(trimmed);
    }
    /**
     * Check if a configuration item should be written to the config file.
     * Matches Kconfiglib's _write_to_conf behavior: only write if dependencies are satisfied.
     *
     * From Kconfiglib:
     * - _write_to_conf is set to (vis != 0) where vis is the visibility
     * - visibility is determined by evaluating the dependency expression
     * - If visibility is 0 (n), the config is not written
     */
    shouldWriteToConfig(menu) {
        if (menu.hasPrompt === false) {
            return this.shouldWritePromptless(menu);
        }
        const depsSatisfied = this.isDependencySatisfied(menu.dependsOn);
        if (!depsSatisfied) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.debugWriter(`Skipping ${menu.name} due to unsatisfied dependencies: ${menu.dependsOn || 'none'}`);
        }
        return depsSatisfied;
    }
    shouldWritePromptless(menu) {
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate:
                return this.toTristate(menu.value) !== "n";
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string:
                return this.hasActiveDefault(menu);
            default:
                return false;
        }
    }
    hasActiveDefault(menu) {
        if (!menu.defaults || menu.defaults.length === 0) {
            return false;
        }
        for (const def of menu.defaults) {
            if (!def.condition || def.condition.trim().length === 0) {
                return true;
            }
            try {
                if (this.evaluator.evaluate(def.condition)) {
                    return true;
                }
            }
            catch (_) {
                continue;
            }
        }
        return false;
    }
    shouldSkipSymbol(menu) {
        if (!menu) {
            return false;
        }
        if (menu.optionDefconfigList) {
            return true;
        }
        if (menu.optionEnvVar) {
            return true;
        }
        return false;
    }
    generateHeaderLines(menus) {
        const lines = [];
        const visited = new Set();
        const traverse = (items) => {
            for (const item of items) {
                if (item.name && !visited.has(item.name) && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.menu && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.choice) {
                    visited.add(item.name);
                    if (this.shouldSkipSymbol(item)) {
                        continue;
                    }
                    const entry = this.formatHeaderLines(item);
                    lines.push(...entry);
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                }
            }
        };
        traverse(menus);
        return lines;
    }
    formatConfigLine(menu) {
        const prefix = "CONFIG_" + menu.name;
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = this.toTristate(menu.value);
                if (value === "n") {
                    return `# ${prefix} is not set`;
                }
                return `${prefix}=${value}`;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int: {
                const value = this.normalizeIntValue(menu);
                return value === null ? "" : `${prefix}=${value}`;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex: {
                const value = this.normalizeHexValue(menu);
                return value ? `${prefix}=${value}` : "";
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string: {
                const value = this.normalizeStringValue(menu);
                return value === null ? "" : `${prefix}="${this.escapeString(value)}"`;
            }
            default:
                return "";
        }
    }
    formatHeaderLines(menu) {
        const prefix = "CONFIG_" + menu.name;
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = this.toTristate(menu.value);
                if (value === "y") {
                    return [`#define ${prefix} 1`];
                }
                if (value === "m") {
                    return [`#define ${prefix}_MODULE 1`];
                }
                return [];
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int: {
                const value = this.normalizeIntValue(menu);
                return value === null ? [] : [`#define ${prefix} ${value}`];
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex: {
                const value = this.normalizeHexValue(menu);
                return value ? [`#define ${prefix} ${value}`] : [];
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string: {
                const value = this.normalizeStringValue(menu);
                return value === null ? [] : [`#define ${prefix} "${this.escapeString(value)}"`];
            }
            default:
                return [];
        }
    }
    formatDefconfigLine(assignment) {
        const prefix = "CONFIG_" + assignment.name;
        switch (assignment.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = assignment.value;
                if (value === "n") {
                    return `# ${prefix} is not set`;
                }
                return `${prefix}=${value}`;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int:
                return `${prefix}=${assignment.value}`;
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex:
                return `${prefix}=${assignment.value}`;
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string:
                return `${prefix}="${this.escapeString(String(assignment.value))}"`;
            default:
                return "";
        }
    }
    serializeMenuValue(menu) {
        if (!menu.name) {
            return null;
        }
        if (this.shouldSkipSymbol(menu)) {
            return null;
        }
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = this.toTristate(menu.value);
                const defaultRaw = this.defaultValues.get(menu.name);
                const defaultValue = this.toTristate(defaultRaw);
                if (value === defaultValue) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int: {
                const value = this.normalizeIntValue(menu);
                const defaultValue = this.normalizeDefaultInt(this.defaultValues.get(menu.name));
                if (value === null && defaultValue === null) {
                    return null;
                }
                if (value !== null && defaultValue !== null && value === defaultValue) {
                    return null;
                }
                if (value === null) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex: {
                const value = this.normalizeHexValue(menu);
                const defaultValue = this.normalizeDefaultHex(this.defaultValues.get(menu.name));
                if (!value && !defaultValue) {
                    return null;
                }
                if (value && defaultValue && value.toLowerCase() === defaultValue.toLowerCase()) {
                    return null;
                }
                if (!value) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string: {
                const value = this.normalizeStringValue(menu);
                const defaultValue = this.normalizeDefaultString(this.defaultValues.get(menu.name));
                if (value === null && defaultValue === null) {
                    return null;
                }
                if (value !== null && defaultValue !== null && value === defaultValue) {
                    return null;
                }
                if (value === null) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            default:
                return null;
        }
    }
    normalizeIntValue(menu) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_4__.normalizeIntValue)(menu.value, menu.range);
    }
    normalizeHexValue(menu) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_4__.normalizeHexValue)(menu.value, menu.range);
    }
    normalizeStringValue(menu) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_4__.normalizeConfigStringValue)(menu.value);
    }
    normalizeDefaultInt(value) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_4__.normalizeIntValue)(value);
    }
    normalizeDefaultHex(value) {
        const normalized = (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_4__.normalizeHexValue)(value);
        return normalized || null;
    }
    normalizeDefaultString(value) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_4__.normalizeConfigStringValue)(value);
    }
    toTristate(value) {
        if (value === true || value === "y" || value === "Y" || value === 2) {
            return "y";
        }
        if (value === "m" || value === "M" || value === 1) {
            return "m";
        }
        return "n";
    }
    escapeString(value) {
        return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }
    async writeFileIfChanged(filename, content, saveOld) {
        let existing = null;
        try {
            existing = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filename, "utf8");
        }
        catch (_) {
            existing = null;
        }
        if (existing === content) {
            return;
        }
        if (saveOld && existing !== null) {
            await this.saveOldFile(filename, existing);
        }
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(filename, content, "utf8");
    }
    async saveOldFile(filename, content) {
        const backupPath = `${filename}.old`;
        try {
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(backupPath, content, "utf8");
        }
        catch (_) {
            // Ignore backup errors to match kconfiglib behavior
        }
    }
}


/***/ },

/***/ "./src/menuconfig/Menu.ts"
/*!********************************!*\
  !*** ./src/menuconfig/Menu.ts ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   menuType: () => (/* binding */ menuType)
/* harmony export */ });
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var menuType;
(function (menuType) {
    menuType["string"] = "string";
    menuType["bool"] = "bool";
    menuType["tristate"] = "tristate";
    menuType["int"] = "int";
    menuType["choice"] = "choice";
    menuType["hex"] = "hex";
    menuType["menu"] = "menu";
    menuType["comment"] = "comment";
})(menuType || (menuType = {}));


/***/ },

/***/ "./src/menuconfig/MenuNode.ts"
/*!************************************!*\
  !*** ./src/menuconfig/MenuNode.ts ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuNode: () => (/* binding */ MenuNode)
/* harmony export */ });
// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * MenuNode represents a node in the Kconfig tree structure.
 * This is modeled after Kconfiglib's MenuNode class for compatibility.
 */
class MenuNode {
    // Core properties matching Kconfiglib
    item = null; // Associated menu item (config/menuconfig/choice)
    prompt = null; // [prompt text, condition]
    parent = null; // Parent node in the tree
    list = null; // First child node (linked list head)
    next = null; // Next sibling node
    dep = null; // Dependency condition expression (combined from all sources)
    explicit_dep = null; // Explicit "depends on" from config definition (not from if blocks)
    if_dep = null; // Dependency from if blocks (only affects visibility, not menu structure)
    if_indent_level = 0; // Number of if blocks this node was nested in (for indentation)
    // Menu-only: 'visible if' condition
    visibility = null; // Visibility condition for menu nodes (propagated to child prompts)
    // Node metadata
    is_menuconfig = false; // Whether this is a menuconfig node
    node_type = null;
    // Source tracking
    filename = null; // Source file where this node was defined
    linenr = 0; // Line number in source file
    // For tracking next index during parsing (temporary field)
    nextIndex;
    constructor() {
        // Initialize with null values, matching Kconfiglib's approach
    }
    /**
     * Add a child node to this node.
     * Maintains the linked list structure of children.
     */
    addChild(child) {
        child.parent = this;
        if (!this.list) {
            // First child
            this.list = child;
        }
        else {
            // Find the last child and append
            let last = this.list;
            while (last.next) {
                last = last.next;
            }
            last.next = child;
        }
    }
    /**
     * Get all children as an array.
     * Converts the linked list to an array for easier manipulation.
     */
    getChildren() {
        const children = [];
        let child = this.list;
        while (child) {
            children.push(child);
            child = child.next;
        }
        return children;
    }
    /**
     * Calculate indentation level dynamically by traversing parent chain.
     * This matches Kconfiglib's dynamic indentation calculation.
     *
     * Key rules:
     * - Start from this node and traverse up the parent chain
     * - Stop when reaching the root
     * - Count nodes that create visual hierarchy (menu, menuconfig, implicit submenus)
     * - Add extra indentation for if blocks (stored in if_indent_level)
     * - Implicit submenus are config nodes with children
     */
    calculateIndent() {
        let indent = 0;
        let parent = this.parent;
        // Traverse up the parent chain to calculate full indentation
        while (parent) {
            // Skip the root menuconfig node (mainmenu) - it doesn't contribute to indent
            if (parent.node_type === 'menuconfig' && !parent.parent) {
                parent = parent.parent;
                continue;
            }
            // Count nodes that contribute to visual hierarchy:
            // - menu nodes create one level of indentation
            // - menuconfig nodes create one level of indentation
            // - config/choice nodes with children (implicit submenus) create one level
            // Note: if nodes should already be flattened and removed at this point
            if (parent.node_type === 'menu' ||
                parent.node_type === 'menuconfig' ||
                parent.is_menuconfig ||
                parent.node_type === 'choice' ||
                (parent.node_type === 'config' && parent.list !== null)) {
                indent++;
            }
            parent = parent.parent;
        }
        // 与 Kconfiglib 一致：if 层级不产生缩进，仅作为依赖传播
        return indent;
    }
    /**
     * Check if this node should be flattened.
     * Nodes without prompts (like if nodes) should be flattened,
     * UNLESS they are selected by other configs (implicit containers).
     */
    shouldFlatten() {
        // Flatten nodes that:
        // 1. Have children (list is not null)
        // 2. Have no prompt (not visible in menu)
        // 3. Are not Choice nodes (special case in Kconfiglib)
        // 4. Are not implicit containers (configs selected by others that need to maintain structure)
        // Check if this is an implicit container (selected config without prompt)
        const isImplicitContainer = this.item &&
            this.item.isImplicitContainer === true;
        return this.list !== null &&
            this.prompt === null &&
            this.node_type !== 'choice' &&
            !isImplicitContainer;
    }
    /**
     * Check if this is an if node.
     * if nodes are recognized by having no item and node_type === 'if'.
     */
    isIfNode() {
        return this.item === null && this.node_type === 'if';
    }
    /**
     * Clone this node (shallow copy).
     * Used during tree transformations.
     */
    clone() {
        const cloned = new MenuNode();
        cloned.item = this.item;
        cloned.prompt = this.prompt;
        cloned.dep = this.dep;
        cloned.is_menuconfig = this.is_menuconfig;
        cloned.node_type = this.node_type;
        cloned.filename = this.filename;
        cloned.linenr = this.linenr;
        // Note: parent, list, next are not cloned (tree structure needs to be rebuilt)
        return cloned;
    }
    /**
     * Debug helper: Get a string representation of this node.
     */
    toString() {
        if (this.item) {
            return `MenuNode(${this.node_type}: ${this.item.name || this.item.title})`;
        }
        else if (this.node_type === 'if') {
            return `MenuNode(if: ${this.dep})`;
        }
        else {
            return `MenuNode(${this.node_type})`;
        }
    }
    /**
     * Debug helper: Print the tree structure.
     */
    printTree(indent = 0) {
        const _prefix = '  '.repeat(indent);
        let child = this.list;
        while (child) {
            child.printTree(indent + 1);
            child = child.next;
        }
    }
}


/***/ },

/***/ "./src/menuconfig/MenuTransferSerializer.ts"
/*!**************************************************!*\
  !*** ./src/menuconfig/MenuTransferSerializer.ts ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createInitialTransferMenus: () => (/* binding */ createInitialTransferMenus),
/* harmony export */   createMenuDetailPayload: () => (/* binding */ createMenuDetailPayload),
/* harmony export */   groupChunkTasksForBatches: () => (/* binding */ groupChunkTasksForBatches),
/* harmony export */   splitMenusForChunkedTransfer: () => (/* binding */ splitMenusForChunkedTransfer)
/* harmony export */ });
function groupChunkTasksForBatches(tasks, batchSize) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return [];
    }
    const normalizedBatchSize = Number.isFinite(batchSize) && batchSize > 0 ? Math.floor(batchSize) : 16;
    const grouped = [];
    for (let i = 0; i < tasks.length; i += normalizedBatchSize) {
        grouped.push(tasks.slice(i, i + normalizedBatchSize));
    }
    return grouped;
}
function toInitialPayload(menu, children = []) {
    return {
        id: menu.id,
        name: menu.name,
        title: menu.title,
        type: menu.type,
        value: menu.value,
        children,
        isVisible: menu.isVisible,
        isCollapsed: menu.isCollapsed,
        isMenuconfig: menu.isMenuconfig,
        hasPrompt: menu.hasPrompt,
        range: menu.range ? [...menu.range] : undefined,
        select: menu.select ? [...menu.select] : undefined,
        selectedBy: menu.selectedBy ? [...menu.selectedBy] : undefined,
        isReadonly: menu.isReadonly,
        readonlyReason: menu.readonlyReason,
        isImplicitContainer: menu.isImplicitContainer,
        isContainerVisible: menu.isContainerVisible,
        allowedTristateValues: menu.allowedTristateValues ? [...menu.allowedTristateValues] : undefined,
        autoSelectedValue: menu.autoSelectedValue,
        autoImpliedValue: menu.autoImpliedValue,
        isMainMenu: menu.isMainMenu,
        indentLevel: menu.indentLevel,
        shouldIndentChildren: menu.shouldIndentChildren,
        help: menu.help,
    };
}
function createInitialTransferMenus(menus) {
    const convert = (menu) => {
        const children = (menu.children || []).map((child) => convert(child));
        return toInitialPayload(menu, children);
    };
    return menus.map((menu) => convert(menu));
}
function createMenuDetailPayload(menu) {
    return {
        help: menu.help,
        prompt: menu.prompt,
        directDepExpr: menu.directDepExpr,
        directDepValue: menu.directDepValue,
        effectiveDepExpr: menu.effectiveDepExpr,
        effectiveDepValue: menu.effectiveDepValue,
        sourceFile: menu.sourceFile,
        sourceFiles: menu.sourceFiles ? [...menu.sourceFiles] : undefined,
        linenr: menu.linenr,
        menuPath: menu.menuPath,
        dependsOn: menu.dependsOn,
        range: menu.range ? [...menu.range] : undefined,
        defaults: menu.defaults ? menu.defaults.map((entry) => ({ ...entry })) : undefined,
        selectInfo: menu.selectInfo,
        selectedByInfo: menu.selectedByInfo,
        implyInfo: menu.implyInfo,
        select: menu.select ? [...menu.select] : undefined,
        selectedBy: menu.selectedBy ? [...menu.selectedBy] : undefined,
        implies: menu.implies ? [...menu.implies] : undefined,
    };
}
function splitMenusForChunkedTransfer(sourceMenus, chunkSize) {
    const normalizedChunkSize = Number.isFinite(chunkSize) && chunkSize > 0 ? Math.floor(chunkSize) : 20;
    const chunks = [];
    const skeletonMenus = sourceMenus.map((menu) => toInitialPayload(menu, []));
    const queue = [...sourceMenus];
    while (queue.length > 0) {
        const parentMenu = queue.shift();
        if (!parentMenu || !parentMenu.id) {
            continue;
        }
        const children = parentMenu.children || [];
        if (children.length === 0) {
            continue;
        }
        const shallowChildren = children.map((child) => toInitialPayload(child, []));
        for (let i = 0; i < shallowChildren.length; i += normalizedChunkSize) {
            const chunkChildren = shallowChildren.slice(i, i + normalizedChunkSize);
            if (chunkChildren.length > 0) {
                chunks.push({
                    parentId: parentMenu.id,
                    children: chunkChildren,
                });
            }
        }
        for (const child of children) {
            queue.push(child);
        }
    }
    return { skeletonMenus, chunks };
}


/***/ },

/***/ "./src/menuconfig/MenuValueUtils.ts"
/*!******************************************!*\
  !*** ./src/menuconfig/MenuValueUtils.ts ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TRISTATE_ORDER: () => (/* binding */ TRISTATE_ORDER),
/* harmony export */   areMenuValuesEqual: () => (/* binding */ areMenuValuesEqual),
/* harmony export */   clampNumberToRange: () => (/* binding */ clampNumberToRange),
/* harmony export */   clampTristateValue: () => (/* binding */ clampTristateValue),
/* harmony export */   getFallbackValueForType: () => (/* binding */ getFallbackValueForType),
/* harmony export */   getMenuTriStrength: () => (/* binding */ getMenuTriStrength),
/* harmony export */   isKeyword: () => (/* binding */ isKeyword),
/* harmony export */   normalizeConfigStringValue: () => (/* binding */ normalizeConfigStringValue),
/* harmony export */   normalizeHexValue: () => (/* binding */ normalizeHexValue),
/* harmony export */   normalizeIntValue: () => (/* binding */ normalizeIntValue),
/* harmony export */   normalizeTristateValue: () => (/* binding */ normalizeTristateValue),
/* harmony export */   parseKconfigNumber: () => (/* binding */ parseKconfigNumber),
/* harmony export */   stripKconfigQuotes: () => (/* binding */ stripKconfigQuotes),
/* harmony export */   unescapeKconfigString: () => (/* binding */ unescapeKconfigString)
/* harmony export */ });
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");

// ---- Numeric helpers ----
function parseKconfigNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    const sign = trimmed.startsWith("-") ? -1 : 1;
    const unsigned = trimmed[0] === "+" || trimmed[0] === "-" ? trimmed.slice(1) : trimmed;
    if (!unsigned) {
        return null;
    }
    let parsed;
    if (/^0[xX][0-9a-fA-F]+$/.test(unsigned)) {
        parsed = Number.parseInt(unsigned.slice(2), 16);
    }
    else if (/^0[bB][01]+$/.test(unsigned)) {
        parsed = Number.parseInt(unsigned.slice(2), 2);
    }
    else if (/^0[oO][0-7]+$/.test(unsigned)) {
        parsed = Number.parseInt(unsigned.slice(2), 8);
    }
    else if (/^[0-9]+$/.test(unsigned)) {
        parsed = Number.parseInt(unsigned, 10);
    }
    else {
        return null;
    }
    return Number.isNaN(parsed) ? null : sign * parsed;
}
function clampNumberToRange(value, range) {
    if (!range || range.length < 2) {
        return value;
    }
    const [min, max] = range;
    let next = value;
    if (Number.isFinite(min) && next < min) {
        next = min;
    }
    if (Number.isFinite(max) && next > max) {
        next = max;
    }
    return next;
}
function normalizeIntValue(value, range) {
    const parsed = parseKconfigNumber(value);
    return parsed === null ? null : clampNumberToRange(parsed, range);
}
function normalizeHexValue(value, range) {
    const parsed = parseHexNumber(value);
    if (parsed === null) {
        return "";
    }
    const clamped = clampNumberToRange(parsed, range);
    const sign = clamped < 0 ? "-" : "";
    return `${sign}0x${Math.abs(clamped).toString(16).toUpperCase()}`;
}
function parseHexNumber(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (/^[0-9a-fA-F]+$/.test(trimmed)) {
            return Number.parseInt(trimmed, 16);
        }
    }
    return parseKconfigNumber(value);
}
// ---- String helpers ----
function stripKconfigQuotes(value) {
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
        const quote = trimmed[0];
        if ((quote === '"' || quote === "'") && trimmed[trimmed.length - 1] === quote) {
            return trimmed.slice(1, -1);
        }
    }
    return value;
}
function unescapeKconfigString(value) {
    let result = "";
    let escaped = false;
    for (const ch of value) {
        if (escaped) {
            switch (ch) {
                case "n":
                    result += "\n";
                    break;
                case "t":
                    result += "\t";
                    break;
                case '"':
                case "\\":
                    result += ch;
                    break;
                default:
                    result += `\\${ch}`;
                    break;
            }
            escaped = false;
            continue;
        }
        if (ch === "\\") {
            escaped = true;
            continue;
        }
        result += ch;
    }
    if (escaped) {
        result += "\\";
    }
    return result;
}
function normalizeConfigStringValue(value) {
    if (value === null || value === undefined) {
        return null;
    }
    return unescapeKconfigString(stripKconfigQuotes(String(value)));
}
// ---- Tristate helpers ----
const TRISTATE_ORDER = ["n", "m", "y"];
function normalizeTristateValue(value) {
    if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "y" || lower === "m" || lower === "n") {
            return lower;
        }
        if (lower === "true" || lower === "2")
            return "y";
        if (lower === "1")
            return "m";
        return "n";
    }
    if (typeof value === "number") {
        if (value >= 2)
            return "y";
        if (value === 1)
            return "m";
        return "n";
    }
    if (typeof value === "boolean")
        return value ? "y" : "n";
    return "n";
}
function clampTristateValue(allowed, current, order = TRISTATE_ORDER) {
    const currentIndex = order.indexOf(current);
    if (currentIndex === -1)
        return allowed[0];
    for (let i = currentIndex; i < order.length; i++) {
        if (allowed.includes(order[i]))
            return order[i];
    }
    for (let i = currentIndex - 1; i >= 0; i--) {
        if (allowed.includes(order[i]))
            return order[i];
    }
    return allowed[0];
}
function getMenuTriStrength(menu) {
    if (!menu)
        return 0;
    const value = menu.value;
    if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
        if (value === true || value === "y" || value === 2)
            return 2;
        return 0;
    }
    if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
        if (value === "y" || value === true || value === 2)
            return 2;
        if (value === "m" || value === 1)
            return 1;
        return 0;
    }
    return 0;
}
// ---- Value comparison ----
function areMenuValuesEqual(a, b, type) {
    switch (type) {
        case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int:
            return parseKconfigNumber(a) === parseKconfigNumber(b);
        case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.hex:
            return normalizeHexValue(a).toLowerCase() === normalizeHexValue(b).toLowerCase();
        default:
            return a === b;
    }
}
// ---- Pure helpers ----
function isKeyword(str) {
    const keywords = new Set(["TRUE", "FALSE", "Y", "N", "M"]);
    return keywords.has(str.toUpperCase());
}
function getFallbackValueForType(type) {
    switch (type) {
        case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool: return false;
        case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate: return "n";
        case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int: return 0;
        case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.hex: return "0x0";
        case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.string: return "";
        default: return null;
    }
}


/***/ },

/***/ "./src/menuconfig/MenuconfigPanel.ts"
/*!*******************************************!*\
  !*** ./src/menuconfig/MenuconfigPanel.ts ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuconfigPanel: () => (/* binding */ MenuconfigPanel)
/* harmony export */ });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _KconfigServer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./KconfigServer */ "./src/menuconfig/KconfigServer.ts");
/* harmony import */ var _MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MenuTransferSerializer */ "./src/menuconfig/MenuTransferSerializer.ts");
/* harmony import */ var _unsavedCloseFlow__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./unsavedCloseFlow */ "./src/menuconfig/unsavedCloseFlow.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../i18n */ "./src/i18n/index.ts");
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.









class MenuconfigPanel {
    extContext;
    static currentPanel;
    static panelSeq = 0;
    _disposed = false;
    static initialPayloadChunkSize = 120;
    static initialPayloadTaskBatchSize = 32;
    static startupSlowThresholdMs = 1500;
    static createOrShow(extensionUri, curWorkspaceFolder, context, targetFile) {
        const column = vscode__WEBPACK_IMPORTED_MODULE_2__.window.activeTextEditor
            ? vscode__WEBPACK_IMPORTED_MODULE_2__.window.activeTextEditor.viewColumn
            : undefined;
        // 检查现有面板是否仍然有效
        if (MenuconfigPanel.currentPanel && !MenuconfigPanel.currentPanel.isDisposed()) {
            try {
                MenuconfigPanel.currentPanel.panel.reveal(column);
                return;
            }
            catch (error) {
                // 如果reveal失败，说明面板已经无效，需要清理引用
                _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error('Failed to reveal existing panel, creating new one', error);
                MenuconfigPanel.currentPanel = undefined;
            }
        }
        // 创建新面板
        MenuconfigPanel.currentPanel = new MenuconfigPanel(extensionUri, column || vscode__WEBPACK_IMPORTED_MODULE_2__.ViewColumn.One, curWorkspaceFolder, targetFile, context);
    }
    isDisposed() {
        return this._disposed;
    }
    static viewType = "imdeGuiConfig";
    curWorkspaceFolder;
    panel;
    disposables = [];
    kconfigServer = null;
    targetFile;
    kconfigServerReady = false;
    pendingInitValuesRequest = false;
    initialPayloadTransferToken = 0;
    lastInitialValuesSentAt = 0;
    initializationToken = 0;
    panelId;
    panelCreatedAt = Date.now();
    kconfigServerInitDurationMs = 0;
    initialTransferSessionSeq = 0;
    disposeFlowStarted = false;
    constructor(extensionUri, column, curWorkspaceFolder, targetFile, extContext) {
        this.extContext = extContext;
        this.panelId = ++MenuconfigPanel.panelSeq;
        this.curWorkspaceFolder = curWorkspaceFolder;
        this.targetFile = targetFile;
        this.trace(`constructor start target=${targetFile?.fsPath || "(active)"}`);
        const menuconfigPanelTitle = targetFile
            ? `IMDE GUI Config - ${path__WEBPACK_IMPORTED_MODULE_0__.basename(targetFile.fsPath)}`
            : "IMDE GUI Config";
        this.panel = vscode__WEBPACK_IMPORTED_MODULE_2__.window.createWebviewPanel(MenuconfigPanel.viewType, menuconfigPanelTitle, column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.joinPath(extensionUri, "dist"),
                vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.joinPath(extensionUri, "dist", "views"),
                vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.joinPath(extensionUri, "node_modules", "@vscode", "codicons", "dist"),
            ],
        });
        const scriptPath = this.panel.webview.asWebviewUri(vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.joinPath(extensionUri, "dist", "views", "webview-bundle.js"));
        const colorThemeKind = this.mapColorThemeKind(vscode__WEBPACK_IMPORTED_MODULE_2__.window.activeColorTheme.kind);
        const savedGuiTheme = this.extContext.workspaceState.get("imde.guiThemeOverride", "");
        this.panel.webview.html = this.createMenuconfigHtml(scriptPath, colorThemeKind, savedGuiTheme);
        this.trace("webview html assigned");
        this.registerColorThemeSync();
        const menuconfigViewDict = {
            apply: "Apply",
            discard: "Discard",
            reset: "Reset",
            save: "Save",
        };
        this.panel.webview.postMessage({
            command: "load_dictionary",
            text_dictionary: menuconfigViewDict,
        });
        this.panel.onDidDispose(() => {
            void this.handlePanelDisposed();
        }, null, this.disposables);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "updateValue": {
                    const updatedMenu = JSON.parse(message.updated_value);
                    if (this.kconfigServer) {
                        this.kconfigServer.updateValue(updatedMenu);
                    }
                    else {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error(`[PANEL] KconfigServer not available for updateValue`);
                    }
                    break;
                }
                case "saveChanges":
                    if (this.kconfigServer) {
                        const ans = await vscode__WEBPACK_IMPORTED_MODULE_2__.window.showInformationMessage("Apply changes to .config and reconfigure?", { modal: true }, "Apply");
                        if (ans !== "Apply")
                            break;
                        try {
                            await this.kconfigServer.saveConfig();
                            vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage(`$(check) ${(0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('save.success')}`, 3000);
                            const configured = await vscode__WEBPACK_IMPORTED_MODULE_2__.commands.executeCommand("imde.configure");
                            if (configured === false) {
                                vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage("$(warning) Config saved but configure failed", 5000);
                            }
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage(`${(0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('save.failed')}: ${errorMessage}`);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Save configuration failed", error);
                        }
                    }
                    else {
                        vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage("$(check) Configuration saved!", 3000);
                    }
                    break;
                case "discardChanges":
                    if (this.kconfigServer) {
                        try {
                            await this.kconfigServer.discardChanges();
                            // 使用状态栏消息，3秒后自动关闭
                            vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage(`$(discard) ${(0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('discard.success')}`, 3000);
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage(`${(0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('discard.failed')}: ${errorMessage}`);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Discard changes failed", error);
                        }
                    }
                    else {
                        vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage("$(discard) Changes discarded!", 3000);
                    }
                    break;
                case "requestInitValues": {
                    this.trace(`requestInitValues received ready=${this.kconfigServerReady} hasServer=${!!this.kconfigServer}`);
                    if (!this.kconfigServerReady || !this.kconfigServer) {
                        this.pendingInitValuesRequest = true;
                        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info("[PANEL] requestInitValues received before KconfigServer is ready; request queued.");
                        break;
                    }
                    this.sendInitialValues();
                    break;
                }
                case "refreshConfig": {
                    this.trace("refreshConfig received");
                    if (!this.kconfigServer) {
                        break;
                    }
                    try {
                        const refreshedMenus = await this.kconfigServer.reloadFromDisk();
                        this.safelySendMenuData("refresh_values", refreshedMenus);
                        vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage("$(refresh) Configuration refreshed", 2000);
                    }
                    catch (error) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("refreshConfig failed", error);
                        vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage("Failed to refresh configuration");
                    }
                    break;
                }
                case "saveGuiTheme": {
                    const theme = message.theme === "light" || message.theme === "dark" ? message.theme : "";
                    await this.extContext.workspaceState.update("imde.guiThemeOverride", theme);
                    break;
                }
                case "setDefault":
                    if (this.kconfigServer) {
                        await vscode__WEBPACK_IMPORTED_MODULE_2__.window.withProgress({
                            location: vscode__WEBPACK_IMPORTED_MODULE_2__.ProgressLocation.Notification,
                            title: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('reset.progress.title'),
                            cancellable: false
                        }, async (progress) => {
                            try {
                                progress.report({ increment: 30, message: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('reset.progress.clearing') });
                                await this.kconfigServer.resetToDefaults();
                                progress.report({ increment: 60, message: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('reset.progress.loading') });
                                const resetMenus = this.kconfigServer.getMenus();
                                this.safelySendMenuData("refresh_values", resetMenus);
                                progress.report({ increment: 100, message: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('reset.progress.complete') });
                                // 使用状态栏消息，3秒后自动关闭
                                vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage(`$(refresh) ${(0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('reset.success')}`, 3000);
                            }
                            catch (error) {
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage(`${(0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)('reset.failed')}: ${errorMessage}`);
                                _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Reset to defaults failed", error);
                            }
                        });
                    }
                    break;
                case "requestMenuDetail": {
                    if (!this.kconfigServer) {
                        break;
                    }
                    const requestedId = typeof message.id === "string" ? message.id : "";
                    if (!requestedId) {
                        break;
                    }
                    try {
                        const detail = this.kconfigServer.getMenuDetailById(requestedId);
                        this.panel.webview.postMessage({
                            command: "menu_detail",
                            id: requestedId,
                            detail,
                        });
                    }
                    catch (error) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Failed to send menu detail", error);
                    }
                    break;
                }
                case "saveDefconfig": {
                    if (!this.kconfigServer)
                        break;
                    const input = await vscode__WEBPACK_IMPORTED_MODULE_2__.window.showInputBox({
                        prompt: "Save defconfig as...",
                        placeHolder: "config/g32s10/g32s10_v1_defconfig",
                        validateInput: (v) => v.trim() ? undefined : "Path is required",
                    });
                    if (input) {
                        const filepath = path__WEBPACK_IMPORTED_MODULE_0__.join(this.curWorkspaceFolder.fsPath, input.trim());
                        try {
                            const configContent = await this.kconfigServer.exportConfigText();
                            await fs__WEBPACK_IMPORTED_MODULE_1__.promises.mkdir(path__WEBPACK_IMPORTED_MODULE_0__.dirname(filepath), { recursive: true });
                            await fs__WEBPACK_IMPORTED_MODULE_1__.promises.writeFile(filepath, configContent, "utf8");
                            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showInformationMessage("Config saved: " + input.trim());
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage("Save failed: " + errorMessage);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Save defconfig failed", error);
                        }
                    }
                    break;
                }
                default:
                    _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Unrecognized command");
                    break;
            }
        });
        // Initialize KconfigServer if Kconfig file exists
        this.initializeKconfigServer();
    }
    dispose() {
        if (this._disposed) {
            return;
        }
        this.trace("dispose requested");
        try {
            this.panel.dispose();
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Error disposing panel", error);
            this.disposeInternal(true);
        }
    }
    async handlePanelDisposed() {
        if (this.disposeFlowStarted) {
            return;
        }
        this.disposeFlowStarted = true;
        this.trace("onDidDispose fired");
        try {
            await (0,_unsavedCloseFlow__WEBPACK_IMPORTED_MODULE_6__.runUnsavedCloseFlow)({
                hasUnsavedChanges: this.kconfigServer?.hasUnsavedChanges() ?? false,
                saveConfig: async () => {
                    if (!this.kconfigServer) {
                        return;
                    }
                    await this.kconfigServer.saveConfig();
                },
                showWarningMessage: async (message, options, ...items) => vscode__WEBPACK_IMPORTED_MODULE_2__.window.showWarningMessage(message, options, ...items),
                showErrorMessage: (message) => {
                    vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage(message);
                },
                setStatusBarMessage: (message, hideAfterTimeout) => {
                    if (typeof hideAfterTimeout === "number") {
                        vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage(message, hideAfterTimeout);
                        return;
                    }
                    vscode__WEBPACK_IMPORTED_MODULE_2__.window.setStatusBarMessage(message);
                },
                text: {
                    unsavedMessage: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)("close.unsavedMessage"),
                    saveButton: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)("close.saveButton"),
                    noSaveButton: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)("close.noSaveButton"),
                    saveSuccess: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)("close.saveSuccess"),
                    saveFailed: (0,_i18n__WEBPACK_IMPORTED_MODULE_8__.t)("close.saveFailed"),
                },
            });
        }
        finally {
            this.disposeInternal(false);
        }
    }
    disposeInternal(disposePanel) {
        if (this._disposed) {
            return;
        }
        this.trace(`disposeInternal disposePanel=${disposePanel}`);
        this._disposed = true;
        this.initializationToken += 1;
        this.initialPayloadTransferToken += 1;
        MenuconfigPanel.currentPanel = undefined;
        if (this.kconfigServer) {
            this.kconfigServer.dispose();
            this.kconfigServer = null;
        }
        if (disposePanel) {
            try {
                this.panel.dispose();
            }
            catch (error) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error('Error disposing panel', error);
            }
        }
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                try {
                    disposable.dispose();
                }
                catch (error) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error('Error disposing disposable', error);
                }
            }
        }
    }
    getExtensionPath() {
        // Get extension path from webview URI
        const scriptUri = this.panel.webview.asWebviewUri(vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.file(path__WEBPACK_IMPORTED_MODULE_0__.join("dummy"))).toString();
        const match = scriptUri.match(/^.*\/([a-z0-9-]+)\/dummy$/);
        if (match) {
            return path__WEBPACK_IMPORTED_MODULE_0__.dirname(path__WEBPACK_IMPORTED_MODULE_0__.dirname(scriptUri.replace(/^.*\/\//, "")));
        }
        return "";
    }
    async initializeKconfigServer() {
        const initToken = ++this.initializationToken;
        const initStartedAt = Date.now();
        try {
            this.trace("initializeKconfigServer start");
            let kconfigFile;
            // If a specific target file was provided, use it
            if (this.targetFile) {
                kconfigFile = this.targetFile.fsPath;
            }
            else {
                // Look for Kconfig file in workspace
                const kconfigPath = path__WEBPACK_IMPORTED_MODULE_0__.join(this.curWorkspaceFolder.fsPath, "Kconfig");
                const kconfigAltPath = path__WEBPACK_IMPORTED_MODULE_0__.join(this.curWorkspaceFolder.fsPath, "imde.guiConfig");
                if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(kconfigPath)) {
                    kconfigFile = kconfigPath;
                }
                else if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(kconfigAltPath)) {
                    kconfigFile = kconfigAltPath;
                }
            }
            if (kconfigFile && fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(kconfigFile)) {
                this.trace(`initializeKconfigServer init target=${kconfigFile}`);
                const server = await _KconfigServer__WEBPACK_IMPORTED_MODULE_4__.KconfigServer.init({
                    workspaceFolder: this.curWorkspaceFolder,
                    kconfigFile: kconfigFile,
                });
                if (this._disposed || initToken !== this.initializationToken) {
                    this.trace(`initializeKconfigServer stale result dropped token=${initToken}`);
                    server.dispose();
                    return;
                }
                this.kconfigServer = server;
                this.kconfigServerInitDurationMs = Date.now() - initStartedAt;
                this.trace("initializeKconfigServer init done");
                // configSaved event is now handled in the saveChanges message handler
                // No need to show duplicate notification here
                this.kconfigServer.on("configReset", (menus) => { this.safelySendMenuData("refresh_values", menus); });
                this.kconfigServer.on("changesDiscarded", (menus) => {
                    this.safelySendMenuData("refresh_values", menus);
                });
                // Listen to visibility changes
                this.kconfigServer.on("visibilityChanged", (changes) => {
                    if (!changes || changes.length === 0) {
                        return;
                    }
                    this.sendVisibilityDelta(changes);
                });
                this.kconfigServerReady = true;
                this.trace(`kconfigServer ready pendingInit=${this.pendingInitValuesRequest}`);
                if (this.pendingInitValuesRequest) {
                    this.pendingInitValuesRequest = false;
                    this.sendInitialValues();
                }
            }
        }
        catch (error) {
            this.kconfigServerInitDurationMs = Date.now() - initStartedAt;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.trace(`initializeKconfigServer failed: ${errorMsg}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Failed to initialize KconfigServer", error);
            this.panel.webview.postMessage({
                command: "load_initial_values_error",
                error: errorMsg,
            });
        }
    }
    sendInitialValues() {
        if (this._disposed || !this.kconfigServer) {
            this.trace("sendInitialValues skipped no server");
            return;
        }
        const now = Date.now();
        if (now - this.lastInitialValuesSentAt < 250) {
            this.trace("sendInitialValues throttled");
            return;
        }
        this.lastInitialValuesSentAt = now;
        this.trace("sendInitialValues dispatch");
        const getMenusStartedAt = Date.now();
        const loadedMenus = this.kconfigServer.getMenus();
        const getMenusDurationMs = Date.now() - getMenusStartedAt;
        this.setDefaultCollapsedState(loadedMenus);
        const debugConfigSection = vscode__WEBPACK_IMPORTED_MODULE_2__.workspace.getConfiguration('imde.guiConfig.debug');
        const debugConfig = {
            enabled: debugConfigSection.get('enabled', false),
            menu: debugConfigSection.get('menu', false),
            startup: debugConfigSection.get('startup', false),
            startupSlowThresholdMs: debugConfigSection.get('startupSlowThresholdMs', MenuconfigPanel.startupSlowThresholdMs)
        };
        this.safelySendMenuData("load_initial_values", loadedMenus, {
            debugConfig,
            startupMetrics: {
                sessionId: ++this.initialTransferSessionSeq,
                panelAgeMs: Date.now() - this.panelCreatedAt,
                serverInitMs: this.kconfigServerInitDurationMs,
                getMenusMs: getMenusDurationMs,
            },
        });
    }
    setDefaultCollapsedState(menus) {
        const setDefault = (menuList) => {
            menuList.forEach(menu => {
                if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.menu) {
                    menu.isCollapsed = true;
                }
                if (menu.children && menu.children.length > 0) {
                    setDefault(menu.children);
                }
            });
        };
        setDefault(menus);
    }
    /**
     * Safely send menu data to webview with error handling and optimization
     */
    safelySendMenuData(command, menus, additionalData = {}) {
        if (this._disposed) {
            this.trace(`safelySendMenuData skipped disposed command=${command}`);
            return;
        }
        this.trace(`safelySendMenuData command=${command} menus=${menus?.length || 0}`);
        if (menus.length > 0 && command === "load_initial_values") {
        }
        try {
            if (command === "load_initial_values") {
                const serializeStartedAt = Date.now();
                const { skeletonMenus, chunks } = (0,_MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_5__.splitMenusForChunkedTransfer)(menus, MenuconfigPanel.initialPayloadChunkSize);
                const serializeMs = Date.now() - serializeStartedAt;
                const chunkBatches = (0,_MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_5__.groupChunkTasksForBatches)(chunks, MenuconfigPanel.initialPayloadTaskBatchSize);
                const startupMetrics = (additionalData?.startupMetrics || {});
                const startupMeta = {
                    sessionId: typeof startupMetrics.sessionId === "number" ? startupMetrics.sessionId : ++this.initialTransferSessionSeq,
                    panelAgeMs: typeof startupMetrics.panelAgeMs === "number" ? startupMetrics.panelAgeMs : Date.now() - this.panelCreatedAt,
                    serverInitMs: typeof startupMetrics.serverInitMs === "number" ? startupMetrics.serverInitMs : this.kconfigServerInitDurationMs,
                    getMenusMs: typeof startupMetrics.getMenusMs === "number" ? startupMetrics.getMenusMs : 0,
                    serializeMs,
                    totalChunks: chunks.length,
                    totalTaskBatches: chunkBatches.length,
                };
                const restAdditionalData = { ...(additionalData || {}) };
                delete restAdditionalData.startupMetrics;
                const transferToken = ++this.initialPayloadTransferToken;
                this.trace(`initial payload begin token=${transferToken} roots=${skeletonMenus.length} chunks=${chunks.length} taskBatches=${chunkBatches.length}`);
                this.panel.webview.postMessage({
                    command: "load_initial_values_begin",
                    menus: skeletonMenus,
                    meta: {
                        totalChunks: chunks.length,
                        chunkSize: MenuconfigPanel.initialPayloadChunkSize,
                        totalTaskBatches: chunkBatches.length,
                        taskBatchSize: MenuconfigPanel.initialPayloadTaskBatchSize,
                        startup: startupMeta,
                    },
                    ...restAdditionalData
                });
                const transferStartedAt = Date.now();
                this.streamInitialPayloadChunks(chunkBatches, transferToken, 0, 0, chunks.length, startupMeta, transferStartedAt);
                return;
            }
            const messageData = {
                command,
                menus,
                ...additionalData
            };
            this.panel.webview.postMessage(messageData);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error(`Failed to send ${command} data to webview`, error);
            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage(`Failed to update configuration display. ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    streamInitialPayloadChunks(chunkBatches, transferToken, batchIndex, sentChunkCount, totalChunks, startupMeta, transferStartedAt) {
        if (this._disposed || transferToken !== this.initialPayloadTransferToken) {
            this.trace(`streamInitialPayloadChunks cancelled token=${transferToken} current=${this.initialPayloadTransferToken} disposed=${this._disposed}`);
            return;
        }
        if (batchIndex >= chunkBatches.length) {
            this.trace(`initial payload end token=${transferToken} chunks=${totalChunks}`);
            this.panel.webview.postMessage({
                command: "load_initial_values_end",
                totalChunks,
                startup: {
                    sessionId: startupMeta.sessionId,
                    streamMs: Date.now() - transferStartedAt,
                    panelToEndMs: Date.now() - this.panelCreatedAt,
                },
            });
            return;
        }
        const currentBatch = chunkBatches[batchIndex];
        const chunkPayload = currentBatch.map((chunk, localIndex) => ({
            parentId: chunk.parentId,
            menus: chunk.children,
            chunkIndex: sentChunkCount + localIndex + 1,
            totalChunks,
        }));
        this.panel.webview.postMessage({
            command: "load_initial_values_batch",
            chunks: chunkPayload,
            batchIndex: batchIndex + 1,
            totalBatches: chunkBatches.length,
        });
        if (batchIndex + 1 < chunkBatches.length) {
            setTimeout(() => {
                this.streamInitialPayloadChunks(chunkBatches, transferToken, batchIndex + 1, sentChunkCount + currentBatch.length, totalChunks, startupMeta, transferStartedAt);
            }, 0);
            return;
        }
        this.trace(`initial payload end token=${transferToken} chunks=${totalChunks}`);
        this.panel.webview.postMessage({
            command: "load_initial_values_end",
            totalChunks,
            startup: {
                sessionId: startupMeta.sessionId,
                streamMs: Date.now() - transferStartedAt,
                panelToEndMs: Date.now() - this.panelCreatedAt,
            },
        });
    }
    trace(message) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.debug(() => `[PANEL:${this.panelId}] ${message}`);
    }
    sendVisibilityDelta(changes) {
        if (this._disposed) {
            this.trace("sendVisibilityDelta skipped disposed");
            return;
        }
        try {
            this.panel.webview.postMessage({
                command: "visibility_delta",
                changes
            });
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Failed to send visibility delta", error);
        }
    }
    mapColorThemeKind(kind) {
        switch (kind) {
            case vscode__WEBPACK_IMPORTED_MODULE_2__.ColorThemeKind.Light:
            case vscode__WEBPACK_IMPORTED_MODULE_2__.ColorThemeKind.HighContrastLight:
                return "light";
            case vscode__WEBPACK_IMPORTED_MODULE_2__.ColorThemeKind.Dark:
            case vscode__WEBPACK_IMPORTED_MODULE_2__.ColorThemeKind.HighContrast:
            default:
                return "dark";
        }
    }
    registerColorThemeSync() {
        const disposable = vscode__WEBPACK_IMPORTED_MODULE_2__.window.onDidChangeActiveColorTheme((theme) => {
            const mapped = this.mapColorThemeKind(theme.kind);
            try {
                this.panel.webview.postMessage({
                    command: "color_theme_changed",
                    themeKind: mapped,
                });
            }
            catch (error) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Failed to notify webview about color theme change", error);
            }
        });
        this.disposables.push(disposable);
    }
    createMenuconfigHtml(scriptPath, colorThemeKind, savedGuiTheme) {
        const nonce = this.getNonce();
        const sanitizedColorKind = colorThemeKind.replace(/"/g, "&quot;");
        const sanitizedSavedTheme = savedGuiTheme === "light" || savedGuiTheme === "dark" ? savedGuiTheme : "";
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; font-src ${this.panel.webview.cspSource}; img-src ${this.panel.webview.cspSource} https: data:; connect-src ${this.panel.webview.cspSource};">
            <title>IMDE GUI Config</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100vh;
                overflow: hidden;
              }
              #menuconfig {
                width: 100%;
                height: 100%;
              }
            </style>
            </head>
            <body>
              <div id="menuconfig">Loading...</div>
              <script nonce="${nonce}">window.__KCONFIG_VSCODE_COLOR_THEME__ = "${sanitizedColorKind}";window.__IMDE_GUI_THEME_OVERRIDE__ = "${sanitizedSavedTheme}";</script>
              <script nonce="${nonce}" src="${scriptPath}"></script>
            </body>
        </html>`;
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}


/***/ },

/***/ "./src/menuconfig/VisibilityManager.ts"
/*!*********************************************!*\
  !*** ./src/menuconfig/VisibilityManager.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VisibilityManager: () => (/* binding */ VisibilityManager)
/* harmony export */ });
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ConditionEvaluator */ "./src/menuconfig/ConditionEvaluator.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./MenuValueUtils */ "./src/menuconfig/MenuValueUtils.ts");
// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.




/**
 * Manages dynamic visibility of menu items based on condition evaluation
 */
class VisibilityManager {
    evaluator;
    dependencies = new Map();
    configValues = {};
    allMenus = [];
    menuById = new Map();
    menuParentByChildId = new Map();
    menuByName = new Map();
    menusByName = new Map();
    modulesSymbolName = null;
    dependencyClampCache = new Map();
    lastAffectedMenuIds = new Set();
    constructor() {
        this.evaluator = new _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_1__.ConditionEvaluator();
    }
    tristateOrder = ['n', 'm', 'y'];
    /**
     * Initialize the visibility manager with menu data
     */
    initialize(menus) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Initializing with ${menus.length} menus`);
        this.allMenus = menus;
        this.rebuildIndexes(menus);
        this.modulesSymbolName = this.detectModulesSymbolName(menus);
        this.buildDependencyGraph(menus);
        this.extractConfigValues(menus);
        this.dependencyClampCache.clear();
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Config values before context update:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  BSP_USING_UART: ${this.configValues['BSP_USING_UART']}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  BSP_USING_UART0: ${this.configValues['BSP_USING_UART0']}`);
        this.evaluator.updateContext(this.configValues);
        // 在可见性计算前，先应用 config 的默认值（含条件）与 choice 的默认值
        // 这样可保证诸如 “default y if RT_USING_SMART” 按语义生效
        this.applyConfigDefaults();
        const choiceChanges = new Set();
        this.applyChoiceDefaults(choiceChanges);
        if (choiceChanges.size > 0) {
            choiceChanges.forEach((itemId) => {
                this.propagateDefaultsFrom(itemId);
            });
        }
        // 依赖约束会限制符号的最大取值，需在处理 select 之前先行收敛
        this.enforceDependencyBounds();
        // Process initial select statements for enabled configs
        this.processInitialSelectStatements();
        // Apply imply constraints based on current selections
        this.applyImplyConstraints();
        // Sync allowed tristate ranges with latest state
        this.updateTristateAllowedValues();
        // select 可能修改符号状态，需再次根据依赖进行收敛
        this.enforceDependencyBounds();
        this.updateAllVisibility();
        this.lastAffectedMenuIds = this.collectAllMenuIds();
        // Update readonly states after initialization
        this.updateReadonlyStates();
        // 特例调试：初始化后输出 FDT 相关状态
        const _fdt = this.findMenuByName('RT_USING_FDT');
        const _fdtlib = this.findMenuByName('RT_USING_FDTLIB');
        if (_fdt || _fdtlib) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(() => `[FDT_DEBUG] Initialize: RT_USING_FDT=${_fdt ? _fdt.value : 'N/A'}, RT_USING_FDTLIB=${_fdtlib ? _fdtlib.value : 'N/A'}`);
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Initialization complete:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  - Dependencies: ${this.dependencies.size}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  - Config values: ${Object.keys(this.configValues).length}`);
    }
    /**
     * 依赖约束收敛：当直接依赖为假时，将符号的实际值降为禁用状态。
     * 对 bool 设置为 false，对 tristate 设置为 'n'。
     */
    enforceDependencyBounds(changedMenus) {
        const changed = changedMenus ?? new Set();
        const clamp = (menu) => {
            if (menu.name && menu.dependsOn && (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool || menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate)) {
                let depSatisfied = true;
                try {
                    depSatisfied = this.evaluator.evaluate(menu.dependsOn);
                }
                catch (error) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`Failed to evaluate dependency bound for ${menu.name}: ${menu.dependsOn}. Error: ${error}`);
                    depSatisfied = true;
                }
                const cacheKey = menu.id || menu.name;
                if (!depSatisfied) {
                    if (cacheKey && !this.dependencyClampCache.has(cacheKey)) {
                        this.dependencyClampCache.set(cacheKey, {
                            value: menu.value,
                            isDefaultValue: menu.isDefaultValue,
                            autoSelectedValue: menu.autoSelectedValue,
                        });
                    }
                    if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                        const forcedValue = false;
                        if (!this.areMenuValuesEqual(menu.value, forcedValue, menu.type)) {
                            menu.value = forcedValue;
                            this.configValues[menu.name] = forcedValue;
                            this.evaluator.setValue(menu.name, forcedValue);
                            this.markMenuAndPeersChanged(menu, changed);
                        }
                        else {
                            this.configValues[menu.name] = forcedValue;
                        }
                    }
                    else if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                        const forcedValue = 'n';
                        if (!this.areMenuValuesEqual(menu.value, forcedValue, menu.type)) {
                            menu.value = forcedValue;
                            this.configValues[menu.name] = forcedValue;
                            this.evaluator.setValue(menu.name, forcedValue);
                            this.markMenuAndPeersChanged(menu, changed);
                        }
                        else {
                            this.configValues[menu.name] = forcedValue;
                        }
                    }
                }
                else if (cacheKey && this.dependencyClampCache.has(cacheKey)) {
                    const cached = this.dependencyClampCache.get(cacheKey);
                    this.dependencyClampCache.delete(cacheKey);
                    if (cached) {
                        const restoredValue = cached.value;
                        if (!this.areMenuValuesEqual(menu.value, restoredValue, menu.type)) {
                            menu.value = restoredValue;
                            if (menu.name) {
                                this.configValues[menu.name] = restoredValue;
                                this.evaluator.setValue(menu.name, restoredValue);
                                this.markMenuAndPeersChanged(menu, changed);
                            }
                        }
                        else if (menu.name) {
                            this.configValues[menu.name] = restoredValue;
                        }
                        if (cached.isDefaultValue !== undefined) {
                            menu.isDefaultValue = cached.isDefaultValue;
                        }
                        if (cached.autoSelectedValue !== undefined) {
                            menu.autoSelectedValue = cached.autoSelectedValue;
                        }
                        // When deps become satisfied again, re-evaluate defaults
                        // for symbols that actually define defaults.
                        if (menu.defaults && menu.defaults.length > 0) {
                            const defaultReapplied = this.reapplyDefaultsForMenu(menu);
                            if (defaultReapplied) {
                                this.markMenuAndPeersChanged(menu, changed);
                            }
                        }
                    }
                }
            }
            if (menu.children) {
                menu.children.forEach(clamp);
            }
        };
        this.allMenus.forEach(clamp);
        this.evaluator.updateContext(this.configValues);
        return changed;
    }
    /**
     * 应用 choice 默认值：
     * - 按顺序评估 "default X [if COND]" 列表
     * - 选中第一个条件满足的 X；若存在无条件默认值，优先采用
     * - 若无匹配，则回退到第一个子选项
     * - 同步更新被选中子项（bool）的值到 true，其它为 false
     */
    applyChoiceDefaults(changes) {
        const process = (menu) => {
            if (menu.type === 'choice' && menu.children && menu.children.length > 0) {
                if (!this.isMenuDependencySatisfied(menu)) {
                    if (menu.value !== null) {
                        menu.value = null;
                        if (changes) {
                            changes.add(menu.id);
                        }
                    }
                    for (const child of menu.children) {
                        if (child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                            continue;
                        }
                        const disabledValue = child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate ? 'n' : false;
                        if (!this.areMenuValuesEqual(child.value, disabledValue, child.type) || this.configValues[child.name] !== disabledValue) {
                            child.value = disabledValue;
                            this.configValues[child.name] = disabledValue;
                            this.evaluator.setValue(child.name, disabledValue);
                            if (changes) {
                                changes.add(child.id);
                            }
                        }
                    }
                    return;
                }
                const selectableChildren = menu.children.filter(child => this.isChoiceOptionSelectable(child));
                const childNames = new Set(selectableChildren.map(c => c.name));
                let selectedName = null;
                let selectionSource = null;
                if (menu.isDefaultValue !== false && menu.defaults && menu.defaults.length > 0) {
                    const effectiveDefault = this.selectEffectiveDefault(menu);
                    if (effectiveDefault && typeof effectiveDefault.value === 'string' && childNames.has(effectiveDefault.value)) {
                        selectedName = effectiveDefault.value;
                        selectionSource = 'default';
                    }
                }
                // 优先：从已有子项布尔值为 true 的项反推 choice 选择（对齐 Kconfiglib 行为）
                for (const child of selectableChildren) {
                    if (selectedName) {
                        break;
                    }
                    if (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && child.value === true && childNames.has(child.name)) {
                        selectedName = child.name;
                        selectionSource = 'child';
                    }
                }
                if (selectedName) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[CHOICE_DEFAULT] 从子项值反推 choice 选择: ${selectedName}`);
                }
                if (!selectedName && menu.value && typeof menu.value === 'string' && childNames.has(menu.value)) {
                    selectedName = menu.value;
                    selectionSource = 'value';
                }
                else if (!selectedName) {
                    // 依据 defaults 列表评估，沿用 Kconfig 语义：首个命中的 default 生效
                    if (menu.defaults && menu.defaults.length > 0) {
                        const effectiveDefault = this.selectEffectiveDefault(menu);
                        if (effectiveDefault && typeof effectiveDefault.value === 'string' && childNames.has(effectiveDefault.value)) {
                            selectedName = effectiveDefault.value;
                            selectionSource = 'default';
                        }
                    }
                    // 若依然没有，则回退到第一个子项
                    if (!selectedName) {
                        selectedName = selectableChildren[0]?.name || null;
                        selectionSource = selectedName ? 'fallback' : null;
                    }
                }
                if (selectedName) {
                    if (menu.value !== selectedName) {
                        menu.value = selectedName;
                        if (changes) {
                            changes.add(menu.id);
                        }
                    }
                    if (selectionSource === 'child') {
                        menu.isDefaultValue = false;
                    }
                    else if (selectionSource === 'default' || selectionSource === 'fallback') {
                        menu.isDefaultValue = true;
                    }
                    else if (selectionSource === 'value') {
                        // 保持现状
                        if (menu.isDefaultValue === undefined) {
                            menu.isDefaultValue = false;
                        }
                    }
                }
                // 同步子项布尔值
                if (selectedName) {
                    for (const child of menu.children) {
                        const isSelected = child.name === selectedName;
                        // 仅在子项为 bool 类型时同步
                        if (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                            if (this.configValues[child.name] !== isSelected || child.value !== isSelected) {
                                this.configValues[child.name] = isSelected;
                                child.value = isSelected;
                                this.evaluator.setValue(child.name, isSelected);
                                if (selectionSource === 'child') {
                                    child.isDefaultValue = false;
                                }
                                else if (selectionSource === 'default' || selectionSource === 'fallback') {
                                    child.isDefaultValue = isSelected;
                                }
                                if (changes) {
                                    changes.add(child.id);
                                }
                            }
                        }
                    }
                }
                else {
                    for (const child of menu.children) {
                        if (child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                            continue;
                        }
                        const disabledValue = child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate ? 'n' : false;
                        if (!this.areMenuValuesEqual(child.value, disabledValue, child.type) || this.configValues[child.name] !== disabledValue) {
                            child.value = disabledValue;
                            this.configValues[child.name] = disabledValue;
                            this.evaluator.setValue(child.name, disabledValue);
                            if (changes) {
                                changes.add(child.id);
                            }
                        }
                    }
                }
            }
            if (menu.children) {
                menu.children.forEach(process);
            }
        };
        this.allMenus.forEach(process);
        // 更新上下文（以便后续 select/可见性运算使用最新 choice 选择结果）
        this.evaluator.updateContext(this.configValues);
    }
    isMenuDependencySatisfied(menu) {
        if (!menu.dependsOn || menu.dependsOn.trim() === '') {
            return true;
        }
        try {
            return this.evaluator.evaluate(menu.dependsOn);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`Failed to evaluate choice dependency for ${menu.name}: ${menu.dependsOn}. Error: ${error}`);
            return false;
        }
    }
    isChoiceOptionSelectable(child) {
        if (!child.name) {
            return false;
        }
        return this.isMenuDependencySatisfied(child);
    }
    syncChoiceChildrenFromValues(changed) {
        const localChanged = changed ?? new Set();
        const process = (menu) => {
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.choice && menu.children && menu.children.length > 0) {
                const selectedName = typeof menu.value === 'string' ? menu.value : null;
                const selectedChild = selectedName
                    ? menu.children.find(child => child.name === selectedName)
                    : undefined;
                const selectedIsSelectable = selectedChild ? this.isChoiceOptionSelectable(selectedChild) : false;
                for (const child of menu.children) {
                    if (child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                        continue;
                    }
                    const nextValue = selectedIsSelectable && child.name === selectedName
                        ? (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate ? 'y' : true)
                        : (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate ? 'n' : false);
                    if (!this.areMenuValuesEqual(child.value, nextValue, child.type) || this.configValues[child.name] !== nextValue) {
                        child.value = nextValue;
                        this.configValues[child.name] = nextValue;
                        this.evaluator.setValue(child.name, nextValue);
                        this.markMenuAndPeersChanged(child, localChanged);
                    }
                }
            }
            if (menu.children) {
                menu.children.forEach(process);
            }
        };
        this.allMenus.forEach(process);
        this.evaluator.updateContext(this.configValues);
        return localChanged;
    }
    /**
     * 解析 default 值并转换为目标类型，同时处理符号引用
     */
    parseDefaultForType(value, type) {
        if (value === undefined || value === null) {
            return value;
        }
        if (type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.choice) {
            return typeof value === 'string'
                ? value.trim().replace(/^"(.*)"$/, '$1')
                : value;
        }
        const resolved = this.resolveDefaultReference(value);
        const v = typeof resolved === 'string' ? resolved.trim() : resolved;
        switch (type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool:
                if (typeof resolved === 'boolean')
                    return resolved;
                if (typeof resolved === 'number')
                    return resolved !== 0;
                if (typeof v === 'string') {
                    const lower = v.toLowerCase();
                    if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === '1')
                        return true;
                    if (lower === 'n' || lower === 'no' || lower === 'false' || lower === '0')
                        return false;
                }
                return Boolean(resolved);
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate:
                if (typeof resolved === 'string') {
                    const lower = resolved.toLowerCase();
                    if (lower === 'y' || lower === 'm' || lower === 'n')
                        return lower;
                    if (lower === 'true')
                        return 'y';
                    if (lower === 'false')
                        return 'n';
                }
                if (typeof resolved === 'boolean') {
                    return resolved ? 'y' : 'n';
                }
                if (typeof resolved === 'number') {
                    if (resolved >= 2)
                        return 'y';
                    if (resolved === 1)
                        return 'm';
                    return 'n';
                }
                return 'n';
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int:
                return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.normalizeIntValue)(resolved) ?? 0;
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.hex:
                return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.normalizeHexValue)(resolved) || '0x0';
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.string:
                return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.normalizeConfigStringValue)(resolved) ?? '';
            default:
                return resolved;
        }
    }
    /**
     * 解析 default 中的符号引用
     */
    resolveDefaultReference(rawValue) {
        if (typeof rawValue !== 'string') {
            return rawValue;
        }
        const trimmed = rawValue.trim();
        if (/^".*"$/.test(trimmed)) {
            return rawValue;
        }
        if (/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
            if (Object.prototype.hasOwnProperty.call(this.configValues, trimmed)) {
                return this.configValues[trimmed];
            }
        }
        return rawValue;
    }
    getFallbackValueForType(type) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.getFallbackValueForType)(type);
    }
    /**
     * 返回顺序上第一条满足条件的 default 项
     */
    selectEffectiveDefault(menu) {
        if (!menu.defaults || menu.defaults.length === 0) {
            return null;
        }
        for (const def of menu.defaults) {
            let ok = true;
            if (def.condition && def.condition.trim().length > 0) {
                try {
                    ok = this.evaluator.evaluate(def.condition);
                }
                catch (e) {
                    ok = false;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_EVAL] 评估失败: ${menu.name} default if "${def.condition}" -> ${e}`);
                }
            }
            if (ok) {
                return def;
            }
        }
        return null;
    }
    areMenuValuesEqual(a, b, type) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.areMenuValuesEqual)(a, b, type);
    }
    /**
     * 应用通用 config 默认值：
     * - 按出现顺序评估 default 列表，命中的第一条立即生效
     * - 记录默认来源，便于后续依赖变动重新计算
     */
    applyConfigDefaults() {
        let updatedCount = 0;
        const process = (menu) => {
            if (!menu.name || menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu) {
                if (menu.children) {
                    menu.children.forEach(process);
                }
                return;
            }
            const hasDefaults = !!(menu.defaults && menu.defaults.length > 0);
            const shouldInit = menu.value === undefined || menu.value === null;
            const effectiveDefault = hasDefaults ? this.selectEffectiveDefault(menu) : null;
            const resolvedValue = effectiveDefault
                ? this.parseDefaultForType(effectiveDefault.value, menu.type)
                : this.getFallbackValueForType(menu.type);
            if (shouldInit) {
                menu.value = resolvedValue;
                this.configValues[menu.name] = resolvedValue;
                this.evaluator.setValue(menu.name, resolvedValue);
                menu.isDefaultValue = true;
                updatedCount++;
                if (effectiveDefault) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_APPLY] ${menu.name} <- ${JSON.stringify(resolvedValue)}${effectiveDefault.condition ? ` (if ${effectiveDefault.condition})` : ''}`);
                }
            }
            else if (menu.isDefaultValue === undefined) {
                menu.isDefaultValue = hasDefaults ? effectiveDefault !== null : false;
            }
            if (menu.children) {
                menu.children.forEach(process);
            }
        };
        this.allMenus.forEach(process);
        if (updatedCount > 0) {
            this.evaluator.updateContext(this.configValues);
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_APPLY] 已应用 ${updatedCount} 个配置项默认值`);
    }
    /**
     * 根据最新上下文尝试重新应用 default，当值发生变化时返回 true
     */
    reapplyDefaultsForMenu(menu) {
        if (!menu.name || menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu) {
            return false;
        }
        if (menu.autoSelectedValue) {
            return false;
        }
        if (menu.isDefaultValue === false) {
            return false;
        }
        const hasDefaults = !!(menu.defaults && menu.defaults.length > 0);
        const effectiveDefault = hasDefaults ? this.selectEffectiveDefault(menu) : null;
        const nextValue = effectiveDefault
            ? this.parseDefaultForType(effectiveDefault.value, menu.type)
            : this.getFallbackValueForType(menu.type);
        if (this.areMenuValuesEqual(menu.value, nextValue, menu.type)) {
            return false;
        }
        const prevValue = menu.value;
        menu.value = nextValue;
        this.configValues[menu.name] = nextValue;
        this.evaluator.setValue(menu.name, nextValue);
        menu.isDefaultValue = true;
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            this.processSelectStatements(menu, nextValue === true);
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_REAPPLY] ${menu.name}: ${JSON.stringify(prevValue)} -> ${JSON.stringify(nextValue)}${effectiveDefault?.condition ? ` (if ${effectiveDefault.condition})` : ''}`);
        return true;
    }
    propagateDefaultsFrom(configId) {
        const changed = new Set();
        const queue = [configId];
        const visited = new Set();
        let queueIndex = 0;
        while (queueIndex < queue.length) {
            const current = queue[queueIndex++];
            if (visited.has(current)) {
                continue;
            }
            visited.add(current);
            const depInfo = this.dependencies.get(current);
            if (!depInfo) {
                continue;
            }
            for (const dependentId of depInfo.dependents) {
                const dependentMenu = this.findMenuById(dependentId);
                if (!dependentMenu) {
                    continue;
                }
                const changedHere = this.reapplyDefaultsForMenu(dependentMenu);
                if (changedHere) {
                    this.markMenuAndPeersChanged(dependentMenu, changed);
                    queue.push(dependentId);
                }
            }
        }
        return changed;
    }
    /**
     * Update a configuration value and recalculate affected visibility
     */
    updateValue(configId, newValue) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Updating value for ${configId} to ${newValue}`);
        const menu = this.findMenuById(configId);
        const valueChangeSeeds = new Set();
        const needsFullVisibilityRefresh = !configId || !menu;
        // Update the value in context
        let choiceSelectionChanges = new Set();
        if (menu) {
            const _oldValue = this.configValues[menu.name];
            menu.value = newValue;
            this.configValues[menu.name] = newValue;
            this.evaluator.setValue(menu.name, newValue);
            menu.isDefaultValue = false;
            this.markMenuAndPeersChanged(menu, valueChangeSeeds);
            // 如果用户手动修改了值，清除自动选择标记
            // 这样可以确保用户手动设置的值不会被自动取消选择逻辑影响
            if (menu.autoSelectedValue !== undefined) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Clearing auto-selected flag for ${menu.name} due to user modification`);
                menu.autoSelectedValue = undefined;
                menu.autoSelectedPreviousValue = undefined;
                menu.autoSelectedPreviousWasDefault = undefined;
            }
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.choice) {
                choiceSelectionChanges = this.applyChoiceSelection(menu, newValue);
            }
            this.syncSymbolState(menu);
            // Process select statements (must be done before updating readonly states)
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                const isEnabled = newValue === true;
                this.processSelectStatements(menu, isEnabled, valueChangeSeeds);
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Updated ${menu.name} from ${_oldValue} to ${newValue}`);
            // 特例调试：当切换 RT_USING_FDT 时，打印其子项 RT_USING_FDTLIB 的状态
            if (menu.name === 'RT_USING_FDT') {
                const fdtlib = this.findMenuByName('RT_USING_FDTLIB');
                if (fdtlib) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(() => `[FDT_DEBUG] RT_USING_FDT -> ${newValue}; RT_USING_FDTLIB before visibility update: value=${fdtlib.value}, dependsOn=${fdtlib.dependsOn || 'y'}`);
                }
            }
        }
        const defaultChanges = this.propagateDefaultsFrom(configId);
        defaultChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        choiceSelectionChanges.forEach((itemId) => {
            const choiceDefaultChanges = this.propagateDefaultsFrom(itemId);
            choiceDefaultChanges.forEach(changedId => valueChangeSeeds.add(changedId));
            valueChangeSeeds.add(itemId);
        });
        const choiceChanges = new Set();
        this.applyChoiceDefaults(choiceChanges);
        choiceChanges.forEach((itemId) => {
            const choiceDefaultChanges = this.propagateDefaultsFrom(itemId);
            choiceDefaultChanges.forEach(changedId => valueChangeSeeds.add(changedId));
        });
        choiceChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        this.enforceDependencyBounds(valueChangeSeeds);
        const implyChanges = this.applyImplyConstraints();
        this.enforceDependencyBounds(valueChangeSeeds);
        const choiceSyncChanges = this.syncChoiceChildrenFromValues(valueChangeSeeds);
        choiceSyncChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        implyChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        const tristateChanges = this.updateTristateAllowedValues();
        tristateChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        const visibilityTargets = needsFullVisibilityRefresh
            ? this.collectAllMenuIds()
            : this.collectAffectedItemsFromSeeds(valueChangeSeeds);
        // Recalculate visibility for affected items
        for (const itemId of visibilityTargets) {
            this.updateItemVisibility(itemId);
        }
        // Update readonly states (must be done after select processing)
        const readonlyCandidates = needsFullVisibilityRefresh
            ? this.collectAllMenuIds()
            : this.collectReadonlyCandidateIds(visibilityTargets);
        const readonlyChanges = this.updateReadonlyStates(readonlyCandidates);
        readonlyChanges.forEach((itemId) => visibilityTargets.add(itemId));
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Visibility update completed`);
        this.lastAffectedMenuIds = new Set(visibilityTargets);
        // 特例调试：若涉及 FDT 相关配置，更新后再次输出状态
        const maybeFdt = this.findMenuByName('RT_USING_FDT');
        const maybeFdtLib = this.findMenuByName('RT_USING_FDTLIB');
        if (maybeFdt || maybeFdtLib) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(() => `[FDT_DEBUG] After updateValue(): RT_USING_FDT=${maybeFdt ? maybeFdt.value : 'N/A'}, RT_USING_FDTLIB=${maybeFdtLib ? maybeFdtLib.value : 'N/A'}`);
        }
        return this.allMenus;
    }
    consumeLastAffectedMenuIds() {
        const affected = this.lastAffectedMenuIds;
        this.lastAffectedMenuIds = new Set();
        return affected;
    }
    applyChoiceSelection(menu, newValue) {
        const changed = new Set();
        if (!menu.children || menu.children.length === 0) {
            return changed;
        }
        if (typeof newValue !== "string" || newValue.trim().length === 0) {
            return changed;
        }
        const selectedName = newValue.trim();
        const selectedChild = menu.children.find(child => child.name === selectedName);
        if (!selectedChild) {
            return changed;
        }
        menu.value = selectedName;
        menu.isDefaultValue = false;
        for (const child of menu.children) {
            if (child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                continue;
            }
            const isSelected = child.name === selectedName;
            const nextValue = isSelected;
            if (child.name) {
                const prevValue = child.value;
                if (prevValue !== nextValue || this.configValues[child.name] !== nextValue) {
                    child.value = nextValue;
                    this.configValues[child.name] = nextValue;
                    this.evaluator.setValue(child.name, nextValue);
                    this.markMenuAndPeersChanged(child, changed);
                }
            }
            child.isDefaultValue = false;
            child.autoSelectedValue = undefined;
            child.autoSelectedPreviousValue = undefined;
            child.autoSelectedPreviousWasDefault = undefined;
            this.syncSymbolState(child);
            if (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                this.processSelectStatements(child, isSelected, changed);
            }
        }
        return changed;
    }
    /**
     * Get current configuration context
     */
    getContext() {
        return { ...this.configValues };
    }
    /**
     * Get the condition evaluator instance
     */
    getEvaluator() {
        return this.evaluator;
    }
    /**
     * Build dependency graph from menu structure
     */
    buildDependencyGraph(menus) {
        this.dependencies.clear();
        const processMenu = (menu) => {
            // Register this menu in dependencies，保留已有的依赖者集合
            let depInfo = this.dependencies.get(menu.id);
            if (!depInfo) {
                depInfo = {
                    configId: menu.id,
                    dependsOn: menu.dependsOn || '',
                    dependents: new Set()
                };
                this.dependencies.set(menu.id, depInfo);
            }
            else {
                depInfo.dependsOn = menu.dependsOn || depInfo.dependsOn || '';
            }
            // If this menu has dependencies, register reverse dependencies
            if (menu.dependsOn) {
                const referencedConfigs = this.extractReferencedConfigs(menu.dependsOn);
                for (const refConfig of referencedConfigs) {
                    const referencedMenu = this.findMenuByName(refConfig);
                    if (referencedMenu) {
                        let refDepInfo = this.dependencies.get(referencedMenu.id);
                        if (!refDepInfo) {
                            refDepInfo = {
                                configId: referencedMenu.id,
                                dependsOn: referencedMenu.dependsOn || '',
                                dependents: new Set()
                            };
                            this.dependencies.set(referencedMenu.id, refDepInfo);
                        }
                        refDepInfo.dependents.add(menu.id);
                    }
                }
            }
            if (menu.defaults && menu.defaults.length > 0) {
                for (const def of menu.defaults) {
                    const refs = new Set();
                    if (def.condition && def.condition.trim().length > 0) {
                        this.extractReferencedConfigs(def.condition).forEach(name => refs.add(name));
                    }
                    if (typeof def.value === 'string' && def.value.trim().length > 0) {
                        const raw = def.value.trim().replace(/^"(.*)"$/, '$1');
                        this.extractReferencedConfigs(raw).forEach(name => refs.add(name));
                    }
                    refs.forEach(refConfig => {
                        const referencedMenu = this.findMenuByName(refConfig);
                        if (!referencedMenu) {
                            return;
                        }
                        let refDepInfo = this.dependencies.get(referencedMenu.id);
                        if (!refDepInfo) {
                            refDepInfo = {
                                configId: referencedMenu.id,
                                dependsOn: referencedMenu.dependsOn || '',
                                dependents: new Set()
                            };
                            this.dependencies.set(referencedMenu.id, refDepInfo);
                        }
                        refDepInfo.dependents.add(menu.id);
                    });
                }
            }
            // Process children recursively
            if (menu.children) {
                menu.children.forEach(processMenu);
            }
        };
        menus.forEach(processMenu);
    }
    /**
     * Extract configuration values from menu structure
     */
    extractConfigValues(menus) {
        const extractValues = (menu) => {
            // Extract all configuration values, including false and 0
            if (menu.name && menu.value !== undefined && menu.value !== null) {
                this.configValues[menu.name] = menu.value;
            }
            else if (menu.name && menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu) {
                // For config items without explicit values, only set defaults if truly needed
                // DO NOT override values that were set during parsing
                switch (menu.type) {
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool:
                        // Only set default if value is truly not set
                        this.configValues[menu.name] = false; // Default bool to false for context
                        // DO NOT modify menu.value here - it may have been set during parsing
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate:
                        this.configValues[menu.name] = 'n';
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int:
                        this.configValues[menu.name] = 0; // Default int to 0 for context
                        // DO NOT modify menu.value here
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.string:
                        this.configValues[menu.name] = ""; // Default string to empty for context
                        // DO NOT modify menu.value here
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.hex:
                        this.configValues[menu.name] = "0x0"; // Default hex to 0x0 for context
                        // DO NOT modify menu.value here
                        break;
                    default:
                        this.configValues[menu.name] = null;
                }
            }
            if (menu.children) {
                menu.children.forEach(extractValues);
            }
        };
        menus.forEach(extractValues);
    }
    /**
     * Extract referenced configuration names from a condition expression
     */
    extractReferencedConfigs(expression) {
        const configs = new Set();
        // Match configuration variable names (letters, numbers, underscores)
        const matches = expression.match(/\b[A-Z][A-Z0-9_]*\b/g);
        if (matches) {
            matches.forEach(match => {
                // Filter out keywords and operators
                if (!this.isKeyword(match)) {
                    configs.add(match);
                }
            });
        }
        return Array.from(configs);
    }
    /**
     * Check if a string is a keyword or operator
     */
    isKeyword(str) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.isKeyword)(str);
    }
    rebuildIndexes(menus) {
        this.menuById.clear();
        this.menuParentByChildId.clear();
        this.menuByName.clear();
        this.menusByName.clear();
        const stack = menus.map((menu) => ({
            menu,
            parentId: null,
        }));
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current || !current.menu) {
                continue;
            }
            const menu = current.menu;
            if (menu.id) {
                this.menuById.set(menu.id, menu);
                this.menuParentByChildId.set(menu.id, current.parentId);
            }
            if (menu.name) {
                if (!this.menuByName.has(menu.name)) {
                    this.menuByName.set(menu.name, menu);
                }
                const group = this.menusByName.get(menu.name) ?? [];
                group.push(menu);
                this.menusByName.set(menu.name, group);
            }
            if (menu.children && menu.children.length > 0) {
                for (let i = 0; i < menu.children.length; i++) {
                    stack.push({
                        menu: menu.children[i],
                        parentId: menu.id,
                    });
                }
            }
        }
    }
    /**
     * Find menu item by ID
     */
    findMenuById(id) {
        if (!id) {
            return null;
        }
        return this.menuById.get(id) ?? null;
    }
    detectModulesSymbolName(menus) {
        let detected = null;
        const traverse = (items) => {
            for (const item of items) {
                if (!item) {
                    continue;
                }
                if (!detected && item.name) {
                    if (item.optionModules) {
                        detected = item.name;
                        return;
                    }
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                    if (detected) {
                        return;
                    }
                }
            }
        };
        traverse(menus);
        if (!detected) {
            const fallback = this.findMenuByName('MODULES');
            if (fallback && fallback.name) {
                detected = fallback.name;
            }
        }
        if (!detected) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility('[MODULES] No modules symbol detected; module support disabled by default');
        }
        else {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[MODULES] Using modules symbol: ${detected}`);
        }
        return detected;
    }
    /**
     * Find menu item by configuration name
     */
    findMenuByName(name) {
        if (!name) {
            return null;
        }
        return this.menuByName.get(name) ?? null;
    }
    getMenusByName(name) {
        if (!name) {
            return [];
        }
        return this.menusByName.get(name) ?? [];
    }
    mergeSelectedByForName(name) {
        const merged = new Set();
        for (const menu of this.getMenusByName(name)) {
            if (menu.selectedBy) {
                menu.selectedBy.forEach((selector) => merged.add(selector));
            }
        }
        return Array.from(merged);
    }
    syncSymbolState(source) {
        if (!source.name) {
            return;
        }
        const group = this.getMenusByName(source.name);
        if (group.length <= 1) {
            return;
        }
        const selectedBy = this.mergeSelectedByForName(source.name);
        for (const menu of group) {
            if (menu === source) {
                continue;
            }
            menu.value = source.value;
            menu.isDefaultValue = source.isDefaultValue;
            menu.autoSelectedValue = source.autoSelectedValue;
            menu.autoSelectedPreviousValue = source.autoSelectedPreviousValue;
            menu.autoSelectedPreviousWasDefault = source.autoSelectedPreviousWasDefault;
            menu.selectedBy = [...selectedBy];
        }
    }
    normalizeTristateValue(value) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.normalizeTristateValue)(value);
    }
    clampTristateValue(allowed, current) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.clampTristateValue)(allowed, current, this.tristateOrder);
    }
    getMenuTriStrength(menu) {
        return (0,_MenuValueUtils__WEBPACK_IMPORTED_MODULE_3__.getMenuTriStrength)(menu);
    }
    setMenuStrength(menu, strength) {
        if (!menu || !menu.name) {
            return;
        }
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            const nextValue = strength > 0;
            if (menu.value !== nextValue) {
                menu.value = nextValue;
                this.configValues[menu.name] = nextValue;
                this.evaluator.setValue(menu.name, nextValue);
            }
            menu.autoImpliedValue = nextValue;
            return;
        }
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
            const nextValue = strength >= 2 ? 'y' : strength === 1 ? 'm' : 'n';
            if (menu.value !== nextValue) {
                menu.value = nextValue;
                this.configValues[menu.name] = nextValue;
                this.evaluator.setValue(menu.name, nextValue);
            }
            if (strength > 0) {
                menu.autoImpliedValue = nextValue;
            }
            return;
        }
    }
    applyImplyConstraints() {
        const impliedStrength = new Map();
        const impliedTargets = new Set();
        const changedMenus = new Set();
        const traverse = (menu) => {
            if (menu.implies && menu.implies.length > 0) {
                const sourceStrength = this.getMenuTriStrength(menu);
                if (sourceStrength > 0) {
                    for (const targetName of menu.implies) {
                        const condition = menu.implyConditions?.[targetName];
                        if (condition && !this.safeEval(condition)) {
                            continue;
                        }
                        let effectiveStrength = sourceStrength;
                        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && effectiveStrength > 0) {
                            effectiveStrength = 2;
                        }
                        const existing = impliedStrength.get(targetName) ?? 0;
                        const nextStrength = Math.max(existing, effectiveStrength);
                        impliedStrength.set(targetName, nextStrength);
                        impliedTargets.add(targetName);
                    }
                }
            }
            if (menu.children) {
                menu.children.forEach(traverse);
            }
        };
        this.allMenus.forEach(traverse);
        impliedStrength.forEach((strength, targetName) => {
            const targetMenu = this.findMenuByName(targetName);
            if (!targetMenu) {
                return;
            }
            const currentStrength = this.getMenuTriStrength(targetMenu);
            if (strength > currentStrength) {
                this.setMenuStrength(targetMenu, strength);
                if (targetMenu.id) {
                    changedMenus.add(targetMenu.id);
                }
            }
        });
        // Clear auto implied marker for items no longer implied in this pass
        const clearMarker = (menu) => {
            if (menu.autoImpliedValue !== undefined && menu.name && !impliedTargets.has(menu.name)) {
                menu.autoImpliedValue = undefined;
            }
            if (menu.children) {
                menu.children.forEach(clearMarker);
            }
        };
        this.allMenus.forEach(clearMarker);
        if (changedMenus.size > 0) {
            this.evaluator.updateContext(this.configValues);
        }
        return changedMenus;
    }
    updateTristateAllowedValues() {
        const changed = new Set();
        const modulesEnabled = this.isModulesEnabled();
        const determineAllowed = (menu) => {
            if (menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                return undefined;
            }
            const allowed = new Set(this.tristateOrder);
            if (!modulesEnabled) {
                allowed.delete('m');
            }
            const implied = menu.autoImpliedValue;
            let impliedState;
            if (typeof implied === 'string') {
                const lower = implied.toLowerCase();
                if (lower === 'y') {
                    impliedState = 'y';
                }
                else if (lower === 'm') {
                    impliedState = 'm';
                }
            }
            else if (implied === true) {
                impliedState = 'y';
            }
            if (impliedState === 'y') {
                allowed.delete('m');
            }
            else if (impliedState === 'm') {
                allowed.delete('n');
                allowed.add('m');
            }
            if (menu.isReadonly && menu.value === 'y') {
                allowed.delete('n');
                allowed.delete('m');
            }
            const sorted = this.tristateOrder.filter(v => allowed.has(v));
            return sorted.length > 0 ? sorted : undefined;
        };
        const apply = (menus) => {
            for (const menu of menus) {
                const allowed = determineAllowed(menu);
                if (allowed) {
                    menu.allowedTristateValues = allowed;
                    if (menu.name) {
                        const normalized = this.normalizeTristateValue(menu.value);
                        if (!allowed.includes(normalized)) {
                            const replacement = this.clampTristateValue(allowed, normalized);
                            if (menu.value !== replacement) {
                                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[MODULES] Adjusting ${menu.name} from ${menu.value} -> ${replacement} due to modules constraints`);
                                menu.value = replacement;
                                this.markMenuAndPeersChanged(menu, changed);
                            }
                            this.configValues[menu.name] = replacement;
                            this.evaluator.setValue(menu.name, replacement);
                            if (menu.isDefaultValue !== false) {
                                menu.isDefaultValue = true;
                            }
                        }
                    }
                }
                else if (menu.allowedTristateValues) {
                    delete menu.allowedTristateValues;
                }
                if (menu.children) {
                    apply(menu.children);
                }
            }
        };
        apply(this.allMenus);
        return changed;
    }
    isModulesEnabled() {
        if (!this.modulesSymbolName) {
            return false;
        }
        const value = this.configValues[this.modulesSymbolName];
        if (value === undefined || value === null) {
            return false;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value >= 1;
        }
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === '1') {
                return true;
            }
            if (lower === 'm' || lower === '2') {
                return true;
            }
            return false;
        }
        return false;
    }
    /**
     * Utility helpers for incremental visibility propagation.
     */
    collectAllMenuIds() {
        return new Set(this.menuById.keys());
    }
    markMenuAndPeersChanged(menu, changed) {
        if (!menu) {
            return;
        }
        if (menu.id) {
            changed.add(menu.id);
        }
        if (!menu.name) {
            return;
        }
        const peers = this.getMenusByName(menu.name);
        for (const peer of peers) {
            if (peer.id) {
                changed.add(peer.id);
            }
        }
    }
    collectAffectedItemsFromSeeds(seedIds) {
        const affected = new Set();
        const queue = [];
        let queueIndex = 0;
        const enqueue = (itemId) => {
            if (!itemId || affected.has(itemId)) {
                return;
            }
            affected.add(itemId);
            queue.push(itemId);
        };
        for (const seedId of seedIds) {
            enqueue(seedId);
        }
        while (queueIndex < queue.length) {
            const currentId = queue[queueIndex++];
            if (!currentId) {
                continue;
            }
            const depInfo = this.dependencies.get(currentId);
            if (depInfo) {
                depInfo.dependents.forEach((dependentId) => enqueue(dependentId));
            }
            const currentMenu = this.findMenuById(currentId);
            if (currentMenu?.name) {
                const peers = this.getMenusByName(currentMenu.name);
                for (const peer of peers) {
                    enqueue(peer.id);
                }
            }
            let ancestorId = this.menuParentByChildId.get(currentId) ?? null;
            while (ancestorId) {
                enqueue(ancestorId);
                ancestorId = this.menuParentByChildId.get(ancestorId) ?? null;
            }
        }
        return affected;
    }
    collectReadonlyCandidateIds(baseIds) {
        const candidates = new Set();
        const queue = [];
        let queueIndex = 0;
        const enqueueById = (id) => {
            if (!id || candidates.has(id)) {
                return;
            }
            candidates.add(id);
            queue.push(id);
        };
        const enqueueMenuAndPeers = (menu) => {
            if (!menu) {
                return;
            }
            enqueueById(menu.id);
            if (menu.name) {
                const peers = this.getMenusByName(menu.name);
                for (const peer of peers) {
                    enqueueById(peer.id);
                }
            }
        };
        for (const id of baseIds) {
            enqueueById(id);
        }
        while (queueIndex < queue.length) {
            const currentId = queue[queueIndex++];
            if (!currentId) {
                continue;
            }
            const currentMenu = this.findMenuById(currentId);
            if (!currentMenu) {
                continue;
            }
            if (currentMenu.select && currentMenu.select.length > 0) {
                for (const targetName of currentMenu.select) {
                    const targets = this.getMenusByName(targetName);
                    for (const target of targets) {
                        enqueueMenuAndPeers(target);
                    }
                }
            }
            if (currentMenu.selectedBy && currentMenu.selectedBy.length > 0) {
                for (const selectorName of currentMenu.selectedBy) {
                    const selectors = this.getMenusByName(selectorName);
                    for (const selectorMenu of selectors) {
                        enqueueMenuAndPeers(selectorMenu);
                    }
                }
            }
        }
        return candidates;
    }
    /**
     * Process select statements for all initially enabled configs
     */
    processInitialSelectStatements() {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect('[INITIAL_SELECT] Processing initial select statements...');
        let processedCount = 0;
        let enabledWithSelectCount = 0;
        const processMenu = (menu) => {
            processedCount++;
            // Process select statements for boolean configs that are effectively enabled
            if (menu.type === "bool" && this.isSelectorEffectivelyEnabled(menu) && menu.select && menu.select.length > 0) {
                enabledWithSelectCount++;
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT] Processing ${menu.name} (enabled with ${menu.select.length} select targets)`);
                this.processSelectStatements(menu, true);
            }
            else if (menu.type === "bool" && menu.select && menu.select.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT] Skipping ${menu.name} (value=${menu.value}, deps=${menu.dependsOn || '(none)'}, has ${menu.select.length} select targets but not effectively enabled)`);
            }
            // 特别处理没有 prompt 但有默认值的配置项
            if (menu.type === "bool" && !menu.hasPrompt && menu.value === undefined && menu.defaults && menu.defaults.length > 0) {
                // 评估默认值条件
                for (const defaultDef of menu.defaults) {
                    if (!defaultDef.condition) {
                        // 无条件默认值
                        menu.value = defaultDef.value;
                        this.configValues[menu.name] = defaultDef.value;
                        break;
                    }
                    else {
                        // 有条件默认值
                        try {
                            const conditionResult = this.evaluator.evaluate(defaultDef.condition);
                            if (conditionResult) {
                                menu.value = defaultDef.value;
                                this.configValues[menu.name] = defaultDef.value;
                                break;
                            }
                        }
                        catch (error) {
                            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`Failed to evaluate default condition for ${menu.name}: ${defaultDef.condition}`);
                        }
                    }
                }
                // 如果设置了值且为true，处理select语句
                if (this.isSelectorEffectivelyEnabled(menu) && menu.select && menu.select.length > 0) {
                    this.processSelectStatements(menu, true);
                }
            }
            if (menu.children) {
                menu.children.forEach(processMenu);
            }
        };
        this.allMenus.forEach(processMenu);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT] Initial select processing completed:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT]   - Total menus processed: ${processedCount}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT]   - Enabled menus with select statements: ${enabledWithSelectCount}`);
        // Update evaluator context after processing selects
        this.evaluator.updateContext(this.configValues);
    }
    /**
     * Update visibility for a specific item
     * Visibility = hasPrompt && dependency_condition
     * Non-prompt items are never visible according to Kconfig specification
     * BUT: Implicit containers (no prompt but with visible children) should allow their children to show
     */
    updateItemVisibility(itemId) {
        const menu = this.findMenuById(itemId);
        if (!menu) {
            return;
        }
        // Ensure menu and menuconfig blocks with a prompt are always treated as having a prompt
        // Some parsers or transformations may omit hasPrompt on menu nodes even
        // when they clearly have a title. Guard against that here so container
        // menus don't disappear from the UI.
        if ((menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu || menu.isMenuconfig === true) && !!menu.title && menu.hasPrompt !== true) {
            menu.hasPrompt = true;
        }
        // Debug: 专门追踪 RT_MAIN_THREAD 和 RT_USING_USER_MAIN 相关配置项
        // Special handling for implicit containers
        // Following Kconfiglib's behavior: invisible symbols with visible children are shown
        if (!menu.hasPrompt) {
            // Check if this is an implicit container (no prompt but has children that could be visible)
            if (menu.isImplicitContainer) {
                // For implicit containers, we need to check if they have visible children
                // The container itself isn't visible as a config item, but it acts as a container
                menu.isVisible = false; // The config itself is not visible
                menu.isContainerVisible = true; // But it acts as a visible container for its children
            }
            else {
                menu.isVisible = false;
                menu.isContainerVisible = false;
            }
            // Continue to evaluate dependencies for children
        }
        const depInfo = this.dependencies.get(itemId);
        if (!depInfo || !depInfo.dependsOn) {
            // If has prompt and no dependencies -> visible
            if (menu.hasPrompt) {
                menu.isVisible = true;
                menu.isContainerVisible = true;
            }
            return;
        }
        try {
            // Evaluate dependencies
            const dependencyResult = this.evaluator.evaluate(depInfo.dependsOn);
            // Visibility depends on both having a prompt and dependency evaluation
            if (menu.hasPrompt) {
                menu.isVisible = dependencyResult;
                menu.isContainerVisible = dependencyResult;
            }
            else if (menu.isImplicitContainer) {
                // No prompt but is an implicit container - check if dependencies are met
                // The config itself is not visible, but it can act as a container if dependencies are met
                menu.isVisible = false;
                menu.isContainerVisible = dependencyResult; // Container is visible if dependencies are met
            }
            else {
                // No prompt and not an implicit container
                menu.isVisible = false;
                menu.isContainerVisible = false;
            }
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`Failed to evaluate visibility for ${menu.name}: ${depInfo.dependsOn}. Error: ${error}`);
            // Default to visible if evaluation fails, but only if hasPrompt is true
            menu.isVisible = menu.hasPrompt ? true : false;
            menu.isContainerVisible = menu.hasPrompt ? true : (menu.isImplicitContainer ? true : false);
        }
    }
    /**
     * Update visibility for all items
     */
    updateAllVisibility() {
        const updateVisibility = (menu) => {
            this.updateItemVisibility(menu.id);
            if (menu.children) {
                menu.children.forEach(updateVisibility);
            }
        };
        this.allMenus.forEach(updateVisibility);
    }
    /**
     * Get dependency information for debugging
     */
    getDependencyInfo() {
        return new Map(this.dependencies);
    }
    /**
     * Check if a configuration has dependents
     */
    hasDependents(configId) {
        const depInfo = this.dependencies.get(configId);
        return depInfo ? depInfo.dependents.size > 0 : false;
    }
    /**
     * Get all dependents of a configuration
     */
    getDependents(configId) {
        const depInfo = this.dependencies.get(configId);
        return depInfo ? Array.from(depInfo.dependents) : [];
    }
    /**
     * Process select statements when a config is enabled or disabled
     */
    processSelectStatements(menu, isEnabled, changed) {
        // 依据 Kconfiglib 语义：仅当选择器自身值为 true 且直接依赖满足时，select 才生效
        const depsOk = !menu.dependsOn || this.safeEval(menu.dependsOn);
        const effectivelyEnabled = isEnabled && depsOk && menu.value === true && menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool;
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Processing select statements for ${menu.name}, enabled: ${isEnabled}, depsOk=${depsOk}, effective=${effectivelyEnabled}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Menu ${menu.name} has ${menu.select?.length || 0} select targets`);
        if (!menu.select || menu.select.length === 0) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`No select targets for ${menu.name}, returning`);
            return;
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Select targets for ${menu.name}: ${menu.select.join(', ')}`);
        for (const selectTarget of menu.select) {
            // Check if there's a condition for this select statement
            const selectCondition = menu.selectConditions?.[selectTarget];
            if (selectCondition) {
                // Evaluate the condition
                const conditionMet = this.evaluator.evaluate(selectCondition);
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Select ${selectTarget} has condition "${selectCondition}", evaluated to: ${conditionMet}`);
                if (!conditionMet) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Skipping select ${selectTarget} as condition is not met`);
                    continue;
                }
            }
            const targetMenu = this.findMenuByName(selectTarget);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Processing select target ${selectTarget}, found: ${targetMenu ? 'yes' : 'no'}`);
            if (targetMenu) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Target menu ${targetMenu.name} current selectedBy: ${targetMenu.selectedBy?.join(', ') || 'none'}`);
                if (effectivelyEnabled) {
                    // 启用选择器时的处理
                    this.addSelectRelationship(menu, targetMenu);
                    this.autoSelectTarget(targetMenu, menu, changed);
                }
                else {
                    // 禁用选择器时的处理
                    this.removeSelectRelationship(menu, targetMenu);
                    this.checkAutoDeselectTarget(targetMenu, menu, changed);
                }
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Target menu ${targetMenu.name} updated selectedBy: ${targetMenu.selectedBy?.join(', ') || 'none'}`);
            }
            else {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Select target ${selectTarget} not found for ${menu.name}`);
            }
        }
    }
    // 安全求值布尔条件（失败返回 false，避免误选）
    safeEval(expr) {
        try {
            return this.evaluator.evaluate(expr);
        }
        catch (e) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_EVAL] Failed to evaluate expression: ${expr}. Error: ${e}`);
            return false;
        }
    }
    /**
     * Add select relationship between selector and target
     */
    addSelectRelationship(selector, target) {
        if (!target.selectedBy) {
            target.selectedBy = [];
        }
        if (!target.selectedBy.includes(selector.name)) {
            target.selectedBy.push(selector.name);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Added ${selector.name} as selector for ${target.name}`);
            this.syncSymbolState(target);
        }
    }
    /**
     * Remove select relationship between selector and target
     */
    removeSelectRelationship(selector, target) {
        if (target.selectedBy) {
            const index = target.selectedBy.indexOf(selector.name);
            if (index > -1) {
                target.selectedBy.splice(index, 1);
                // Logger.info(`[SELECT_PROCESSOR] Removed ${selector.name} as selector for ${target.name}`);
                this.syncSymbolState(target);
            }
        }
    }
    /**
     * Auto-select target when selector is enabled
     */
    autoSelectTarget(target, selector, changed) {
        if (target.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Auto-selecting ${target.name} due to ${selector.name}`);
            if (target.autoSelectedValue === undefined) {
                target.autoSelectedPreviousValue = target.value;
                target.autoSelectedPreviousWasDefault = target.isDefaultValue;
            }
            const valueChanged = target.value !== true;
            // 无论当前值如何，都确保目标被选中并标记为自动选择
            target.value = true;
            target.autoSelectedValue = true; // 标记为自动选择的值
            target.isDefaultValue = false;
            this.configValues[target.name] = true;
            this.evaluator.setValue(target.name, true);
            if (valueChanged && changed) {
                this.markMenuAndPeersChanged(target, changed);
            }
            this.syncSymbolState(target);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] ${target.name} set to true and marked as auto-selected`);
            // 递归处理新选择项的 select 语句
            if (target.select && target.select.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Processing ${target.name}'s select statements recursively`);
                this.processSelectStatements(target, true, changed);
            }
        }
        else {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Skipping auto-select for ${target.name} (not bool type, is ${target.type})`);
        }
    }
    /**
     * Check if target should be auto-deselected when selector is disabled
     */
    checkAutoDeselectTarget(target, selector, changed) {
        // 检查是否还有其他活跃的选择器
        const hasOtherActiveSelectors = target.selectedBy && target.selectedBy.some(selectorName => {
            if (selectorName === selector.name)
                return false;
            const selectorMenu = this.findMenuByName(selectorName);
            return selectorMenu && selectorMenu.value === true;
        });
        // 如果没有其他活跃的选择器，且当前值是自动选择的，则取消选择
        if (!hasOtherActiveSelectors && target.autoSelectedValue) {
            const previousValue = target.autoSelectedPreviousValue;
            const previousWasDefault = target.autoSelectedPreviousWasDefault;
            const fallbackValue = this.getFallbackValueForType(target.type);
            const restoredValue = previousValue !== undefined ? previousValue : fallbackValue;
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Restoring ${target.name} to ${JSON.stringify(restoredValue)} with fallback ${JSON.stringify(fallbackValue)}`);
            const valueChanged = !this.areMenuValuesEqual(target.value, restoredValue, target.type);
            target.value = restoredValue;
            target.autoSelectedValue = undefined; // 清除自动选择标记
            target.autoSelectedPreviousValue = undefined;
            target.autoSelectedPreviousWasDefault = undefined;
            if (previousWasDefault !== undefined) {
                target.isDefaultValue = previousWasDefault;
            }
            else if (restoredValue === fallbackValue) {
                target.isDefaultValue = true;
            }
            else {
                target.isDefaultValue = false;
            }
            this.configValues[target.name] = restoredValue;
            this.evaluator.setValue(target.name, restoredValue);
            if (valueChanged && changed) {
                this.markMenuAndPeersChanged(target, changed);
            }
            // 递归处理被取消选择项的 select 语句或恢复用户选择
            if (target.select && target.select.length > 0 && target.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                const isEnabledAfterRestore = restoredValue === true;
                this.processSelectStatements(target, isEnabledAfterRestore, changed);
            }
            this.syncSymbolState(target);
        }
        else if (!hasOtherActiveSelectors && target.value === true) {
            // 如果值不是自动选择的（用户手动设置），则保留当前值但记录信息
            // Logger.info(`[SELECT_PROCESSOR] ${target.name} no longer has active selectors, but keeping user-set value`);
        }
    }
    /**
     * Update readonly states for all menu items based on selectedBy relationships
     */
    updateReadonlyStates(candidateIds) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility('[READONLY_PROCESSOR] Starting readonly states update...');
        const changed = new Set();
        let totalProcessed = 0;
        let readonlyCount = 0;
        let selectedByCount = 0;
        const processMenu = (menu) => {
            totalProcessed++;
            // Reset readonly state
            const wasReadonly = menu.isReadonly;
            const previousReadonlyReason = menu.readonlyReason;
            const previousValue = menu.value;
            menu.isReadonly = false;
            menu.readonlyReason = undefined;
            // Check if this menu has selectedBy relationships
            if (menu.selectedBy && menu.selectedBy.length > 0) {
                selectedByCount++;
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Processing ${menu.name} with selectedBy: [${menu.selectedBy.join(', ')}]`);
                // Find all active selectors
                const activeSelectors = menu.selectedBy.filter(selectorName => {
                    const selectorMenu = this.findMenuByName(selectorName);
                    const isActive = selectorMenu ? this.isSelectorEffectivelyEnabled(selectorMenu) : false;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Checking selector ${selectorName} for ${menu.name}:`);
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Found selector: ${!!selectorMenu}`);
                    if (selectorMenu) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Selector type: ${selectorMenu.type}`);
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Selector value: ${selectorMenu.value} (type: ${typeof selectorMenu.value})`);
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Selector dependsOn: ${selectorMenu.dependsOn || '(none)'}`);
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Is active (value && deps): ${isActive}`);
                    }
                    return isActive;
                });
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Active selectors for ${menu.name}: [${activeSelectors.join(', ')}]`);
                if (activeSelectors.length > 0) {
                    menu.isReadonly = true;
                    readonlyCount++;
                    // Provide detailed readonly reason
                    if (activeSelectors.length === 1) {
                        menu.readonlyReason = `此选项被 ${activeSelectors[0]} 自动选择`;
                    }
                    else {
                        menu.readonlyReason = `此选项被以下配置自动选择: ${activeSelectors.join(', ')}`;
                    }
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] ✓ ${menu.name} is now READONLY due to active selectors: ${activeSelectors.join(', ')}`);
                    // Auto-select the item if it has active selectors
                    if (menu.type === 'bool' && menu.value !== true) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Auto-selecting ${menu.name} due to select relationship`);
                        if (menu.autoSelectedValue === undefined) {
                            menu.autoSelectedPreviousValue = menu.value;
                            menu.autoSelectedPreviousWasDefault = menu.isDefaultValue;
                        }
                        menu.value = true;
                        menu.autoSelectedValue = true;
                        menu.isDefaultValue = false;
                        this.configValues[menu.name] = true;
                        this.evaluator.setValue(menu.name, true);
                    }
                }
                else {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] ${menu.name} has selectedBy but no active selectors`);
                }
            }
            // Log state changes
            if (wasReadonly !== menu.isReadonly ||
                previousReadonlyReason !== menu.readonlyReason ||
                !this.areMenuValuesEqual(previousValue, menu.value, menu.type)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] State changed for ${menu.name}: ${wasReadonly} → ${menu.isReadonly}`);
                this.markMenuAndPeersChanged(menu, changed);
            }
        };
        if (!candidateIds) {
            this.menuById.forEach((menu) => {
                processMenu(menu);
            });
        }
        else {
            candidateIds.forEach((id) => {
                const menu = this.findMenuById(id);
                if (menu) {
                    processMenu(menu);
                }
            });
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Readonly states update completed:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Total menus processed: ${totalProcessed}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Menus with selectedBy: ${selectedByCount}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Menus now readonly: ${readonlyCount}`);
        // Log specific case we're looking for
        const dfsUsingPosix = this.findMenuByName('DFS_USING_POSIX');
        if (dfsUsingPosix) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] DFS_USING_POSIX status:`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - selectedBy: [${dfsUsingPosix.selectedBy.join(', ')}]`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - isReadonly: ${dfsUsingPosix.isReadonly}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - value: ${dfsUsingPosix.value}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - readonlyReason: ${dfsUsingPosix.readonlyReason}`);
        }
        // 额外调试：关注 RT_USING_HOOKLIST 的只读与选择来源
        const hookList = this.findMenuByName('RT_USING_HOOKLIST');
        if (hookList) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] RT_USING_HOOKLIST status:`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - selectedBy: [${hookList.selectedBy.join(', ')}]`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - isReadonly: ${hookList.isReadonly}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - value: ${hookList.value}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - readonlyReason: ${hookList.readonlyReason}`);
        }
        return changed;
    }
    /**
     * Find all configs that select the given menu item
     */
    findSelectorsForItem(targetMenu) {
        const searchForSelectors = (menu) => {
            // Check if this menu selects the target
            if (menu.select && menu.select.includes(targetMenu.name)) {
                if (!targetMenu.selectedBy.includes(menu.name)) {
                    targetMenu.selectedBy.push(menu.name);
                }
            }
            // Search in children
            if (menu.children) {
                menu.children.forEach(searchForSelectors);
            }
        };
        this.allMenus.forEach(searchForSelectors);
    }
    /**
     * 判断一个带有 select 的“选择器”是否有效启用（匹配 Kconfiglib tri_value 语义的关键部分）
     * 规则：
     * - 必须是布尔类型；
     * - 其值为 true；
     * - 直接依赖（depends on/if/menu/visible if 合并后）成立。
     */
    isSelectorEffectivelyEnabled(selector) {
        if (!selector || selector.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            return false;
        }
        if (selector.value !== true) {
            return false;
        }
        try {
            if (!selector.dependsOn || selector.dependsOn.trim() === '') {
                return true;
            }
            const depsOk = this.evaluator.evaluate(selector.dependsOn);
            return !!depsOk;
        }
        catch (e) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_EVAL] Failed to evaluate dependsOn for ${selector.name}: ${selector.dependsOn}. Error: ${e}`);
            // 谨慎起见，依赖计算失败时不视为有效，避免误选中
            return false;
        }
    }
}


/***/ },

/***/ "./src/menuconfig/helpTextFormatter.ts"
/*!*********************************************!*\
  !*** ./src/menuconfig/helpTextFormatter.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatBulletPoint: () => (/* binding */ formatBulletPoint),
/* harmony export */   formatEndBulletPoint: () => (/* binding */ formatEndBulletPoint),
/* harmony export */   formatHelpText: () => (/* binding */ formatHelpText),
/* harmony export */   formatLinkText: () => (/* binding */ formatLinkText),
/* harmony export */   formatNewLine: () => (/* binding */ formatNewLine),
/* harmony export */   formatRedText: () => (/* binding */ formatRedText)
/* harmony export */ });
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const middleTextBulletRegex = /(\n\n-)[\s\S]*(\n)/g;
const middleRegex = /(\n\n-)[\s\S]*?(\n\n)/g;
const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const redTextRegex = /``(.*?)``/g;
const bulletPointStart = "\n\n-";
const bulletPointRegex = /\n-/g;
const newLineRegex = /\n\n/g;
function formatRedText(htmlString) {
    // Replaces ``function-name`` with <span>function-name</span>
    if (htmlString && htmlString.match(redTextRegex) !== null) {
        let newHtmlString = htmlString;
        const matches = htmlString.match(redTextRegex);
        matches.forEach((match) => {
            const newMatch = `<span>${match.substr(2, match.length - 4)}</span>`;
            newHtmlString = newHtmlString.replace(match, newMatch);
        });
        return newHtmlString;
    }
    return htmlString;
}
function formatLinkText(htmlString) {
    // Replace links with <a href="link">link</a>
    if (htmlString && htmlString.match(linkRegex) !== null) {
        let newHtmlString = htmlString;
        const linkMatches = htmlString.match(linkRegex);
        linkMatches.forEach((link) => {
            const newLink = `<a href="${link}">${link}</a>`;
            newHtmlString = newHtmlString.replace(link, newLink);
        });
        return newHtmlString;
    }
    return htmlString;
}
function formatBulletPoint(htmlString) {
    // Middle of text list of bullet points case
    if (htmlString) {
        let newHtmlString = htmlString;
        const middleMatch = htmlString.match(middleRegex);
        if (middleMatch &&
            middleRegex.test(htmlString) &&
            middleRegex.lastIndex !== htmlString.length &&
            htmlString.lastIndexOf("\n-") < middleRegex.lastIndex) {
            const bulletPointMatches = htmlString.match(middleRegex);
            bulletPointMatches.forEach((bulletPoint) => {
                const replacement = `${bulletPoint
                    .replace(bulletPointStart, "<ul><li>")
                    .replace(bulletPointRegex, "</li><li>")}</li></ul>`;
                newHtmlString = newHtmlString.replace(bulletPoint, replacement);
            });
            return newHtmlString;
        }
    }
    return htmlString;
}
function formatEndBulletPoint(htmlString) {
    // End of text list of bullet points case
    if (htmlString &&
        htmlString.indexOf(bulletPointStart) > 0 &&
        (htmlString.match(middleTextBulletRegex) === null ||
            (middleTextBulletRegex.test(htmlString) &&
                middleTextBulletRegex.lastIndex === htmlString.length))) {
        const newHtmlString = `${htmlString
            .replace(bulletPointStart, "<ul><li>")
            .replace(bulletPointRegex, "</li><li>")}</li></ul>`;
        return newHtmlString;
    }
    return htmlString;
}
function formatNewLine(htmlString) {
    if (htmlString) {
        return htmlString.replace(newLineRegex, "<br><br>");
    }
    return htmlString;
}
function formatHelpText(helpString) {
    let newHelp = formatBulletPoint(helpString);
    newHelp = formatEndBulletPoint(newHelp);
    newHelp = formatRedText(newHelp);
    newHelp = formatLinkText(newHelp);
    newHelp = formatNewLine(newHelp);
    return newHelp;
}


/***/ },

/***/ "./src/menuconfig/unsavedCloseFlow.ts"
/*!********************************************!*\
  !*** ./src/menuconfig/unsavedCloseFlow.ts ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   runUnsavedCloseFlow: () => (/* binding */ runUnsavedCloseFlow)
/* harmony export */ });
async function runUnsavedCloseFlow(options) {
    if (!options.hasUnsavedChanges) {
        return;
    }
    const saveItem = {
        title: options.text.saveButton,
        isCloseAffordance: false,
    };
    const noSaveItem = {
        title: options.text.noSaveButton,
        isCloseAffordance: true,
    };
    const decision = await options.showWarningMessage(options.text.unsavedMessage, { modal: true }, saveItem, noSaveItem);
    if (decision !== saveItem) {
        return;
    }
    try {
        await options.saveConfig();
        options.setStatusBarMessage(`$(check) ${options.text.saveSuccess}`, 3000);
    }
    catch {
        options.showErrorMessage(options.text.saveFailed);
    }
}


/***/ }

};
;
//# sourceMappingURL=src_menuconfig_MenuconfigPanel_ts.js.map