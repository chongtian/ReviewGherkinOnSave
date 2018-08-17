import { IReviewMessage } from '../IReviewMessage';

export function scenarioShouldReferToVstsTestCase(gherkinDocument: any): Array<IReviewMessage> {
    let results: Array<IReviewMessage> = [];
    let feature = gherkinDocument.feature;

    if (feature.children) {

        let testCaseIds: Array<string> = [];

        feature.children.forEach((scenario: any) => {

            if (scenario.type === 'ScenarioOutline' || scenario.type === 'Scenario') {
                let title: string = scenario.name;
                let regex_testcase = /^\s*TC\d{5,}\s*-\s/;

                let match = title.match(regex_testcase);
                if (match === null || match.length < 1) {
                    results.push({
                        line: scenario.location.line,
                        type: 1,
                        message: `Scenario is not referred to VSTS Test Case.`
                    });
                } else {

                    if (testCaseIds.indexOf(match[0].trim()) < 0) {
                        testCaseIds.push(match[0].trim());
                    } else {
                        results.push({
                            line: scenario.location.line,
                            type: 1,
                            message: `Scenario is already referred to VSTS Test Case.`
                        });
                    }
                }
            }

        });
    }
    return results;
}