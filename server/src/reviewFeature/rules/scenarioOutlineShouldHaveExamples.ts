import { IReviewMessage } from '../IReviewMessage';

export function scenarioOutlineShouldHaveExamples(gherkinDocument: any): Array<IReviewMessage> {
    let results: Array<IReviewMessage> = [];
    let feature = gherkinDocument.feature;
    if (feature.children) {
        feature.children.forEach((scenario: any) => {
            if (scenario.type === 'ScenarioOutline' && !scenario.examples.length) {
                results.push({
                    line: scenario.location.line,
                    type: 2,
                    message: `Scenario Outline does not have any Examples`
                });
            }
        });
    }
    return results;
}