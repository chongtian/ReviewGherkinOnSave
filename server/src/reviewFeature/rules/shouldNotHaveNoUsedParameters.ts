import { IReviewMessage } from '../IReviewMessage';

export function noUnusedVariables(gherkinDocument: any): Array<IReviewMessage> {
    let results: Array<IReviewMessage> = [];
    let feature = gherkinDocument.feature;

    if (!feature || !feature.children) {
        return results;
    }

    let stepVariableRegex = /<([^>]*)>/gu;

    feature.children.forEach((scenario: any) => {

        if (scenario.type === 'ScenarioOutline' || scenario.type === 'Scenario') {
            let examplesVariables: Array<string> = [];
            let stepVariables: Array<string> = [];

            // Collect all the entries of the examples table
            if (scenario.examples) {
                scenario.examples.forEach((example: any) => {
                    if (example.tableHeader && example.tableHeader.cells) {
                        example.tableHeader.cells.forEach((cell: any) => {
                            if (cell.value) {
                                examplesVariables.push(cell.value);
                            }
                        });
                    }
                });
            }

            // Collect all the steps that use variables
            if (scenario.steps) {
                scenario.steps.forEach((step: any) => {
                    let match;
                    while ((match = stepVariableRegex.exec(step.text)) !== null) {
                        stepVariables.push(match[1]);
                    }

                    if (step.argument) {
                        if (step.argument.rows && step.argument.type === 'DataTable') {
                            let tableText: string = '';
                            step.argument.rows.forEach((row: any) => {
                                if (row.cells) {
                                    row.cells.forEach((cell: any) => {
                                        tableText = tableText.concat(cell.value);
                                    });
                                }
                            });

                            while ((match = stepVariableRegex.exec(tableText)) !== null) {
                                stepVariables.push(match[1]);
                            }
                        }
                    }

                });
            }

            // Verify Scenario cannot have variables
            if (scenario.type === 'Scenario' && stepVariables.length) {
                results.push({
                    line: scenario.location.line,
                    type: 1,
                    message: `Scenario cannot have parameters. Use Scenario Outline instead.`
                });
            } else {
                // Verify that all the variables defined in examples are used
                if (scenario.examples) {
                    scenario.examples.forEach((example: any) => {
                        if (example.tableHeader && example.tableHeader.cells) {
                            example.tableHeader.cells.forEach((cell: any) => {
                                if (cell.value) {
                                    if (stepVariables.indexOf(cell.value) === -1) {
                                        results.push({
                                            line: cell.location.line,
                                            type: 1,
                                            message: `Examples table variable ${cell.value} is not used in any step`
                                        });
                                    }
                                }
                            });
                        }
                    });
                }

                // Verify that all the variables used in steps are defined in the examples table
                let undefinedStepVariables: Array<string> = [];
                stepVariables.forEach((stepVariable: string) => {
                    if (examplesVariables.indexOf(stepVariable) === -1) {
                        undefinedStepVariables.push(stepVariable);
                    }
                });

                if (scenario.steps && undefinedStepVariables) {
                    scenario.steps.forEach((step: any) => {

                        undefinedStepVariables.forEach((variable: string) => {
                            if (step.text.indexOf('<' + variable + '>') !== -1) {
                                results.push({
                                    line: step.location.line,
                                    type: 2,
                                    message: `Step variable ${variable} does not exist the in examples table`
                                });
                            }
                        });

                    });
                }

            }
        }

    });

    return results;
}