import { IReviewMessage } from './IReviewMessage';
import * as rules from './rules';
import { processFatalErrors } from './processParseError';
import {
    TextDocument,
    Diagnostic,
    DiagnosticSeverity,
} from 'vscode-languageserver';
import { ISettings } from '../ISettings';

let Gherkin = require('gherkin');

function validate(text: string, extraValidation: boolean): Array<IReviewMessage> {

    let results: Array<IReviewMessage> = [];

    let parser = new Gherkin.Parser();

    try {
        let gherkinDocument = parser.parse(text);
        results = rules.test(gherkinDocument, extraValidation);
    } catch (e) {
        if (e.errors) {
            results = processFatalErrors(e.errors);
        } else {
            results.push({ line: 0, type: 2, message: e.message });
        }
    }
    return results;
}

export async function review(textDocument: TextDocument, settings: ISettings): Promise<Diagnostic[]> {

    let diagnostics: Diagnostic[] = [];

    if (textDocument.languageId === 'feature') {
        let text = textDocument.getText();
        let extraValidation = settings.extraValidation;
        let results = validate(text, extraValidation);

        let pattern = /\r?\n/gm;
        let m: RegExpExecArray;
        let linePositions: number[] = [];
        linePositions.push(0);
        while (m = pattern.exec(text)) {
            linePositions.push(m.index);
        }
        linePositions.push(text.length - 1);

        for (let i = 0; i < Math.min(results.length, settings.maxNumberOfProblems); i++) {

            let result: IReviewMessage = results[i];
            let severity: DiagnosticSeverity;
            switch (result.type) {
                case 0:
                    severity = DiagnosticSeverity.Information;
                    break;
                case 1:
                    severity = DiagnosticSeverity.Warning;
                    break;
                case 2:
                case 3:
                default:
                    severity = DiagnosticSeverity.Error;
            }

            let diagnosic: Diagnostic = {
                severity: severity,
                range: {
                    start: textDocument.positionAt(linePositions[result.line - 1] + 2),
                    end: textDocument.positionAt(linePositions[result.line])
                },
                message: `${result.message}`,
                source: 'gherkin'
            };

            diagnostics.push(diagnosic);
        }
    }

    return diagnostics;
}