import { IReviewMessage } from './IReviewMessage';
import { scenarioOutlineShouldHaveExamples } from './rules/scenarioOutlineShouldHaveExamples';
import { noUnusedVariables } from './rules/shouldNotHaveNoUsedParameters';
import { shouldUseAnd } from './rules/shouldUseAnd';
import { scenarioShouldReferToVstsTestCase } from './rules/scenarioShouldReferToVstsTestCase';
import { scenarioShouldReferToUserStoryOrBug } from './rules/scenarioShouldReferToUserStoryOrBug';


export function test(gherkinDocument: any, extraValidation: boolean): Array<IReviewMessage> {
    let results: Array<IReviewMessage> = [];

    results = results.concat(scenarioOutlineShouldHaveExamples(gherkinDocument));
    results = results.concat(noUnusedVariables(gherkinDocument));
    results = results.concat(shouldUseAnd(gherkinDocument));
    if (extraValidation) {
        results = results.concat(scenarioShouldReferToVstsTestCase(gherkinDocument));
        results = results.concat(scenarioShouldReferToUserStoryOrBug(gherkinDocument));
    }
    return results;
}