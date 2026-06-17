// Minimal mock for vscode types used by diagnostics.ts
export enum DiagnosticSeverity { Error = 0, Warning = 1, Information = 2, Hint = 3 }
export class Range { constructor(public startLine: number, public startCol: number, public endLine: number, public endCol: number) {} }
export class Uri { static file(p: string): any { return { fsPath: p }; } }
export class Diagnostic { source?: string; constructor(public range: Range, public message: string, public severity: DiagnosticSeverity) {} }
