import { IReviewMessage } from '../IReviewMessage';

export function shouldUseAnd(gherkinDocument: any): Array<IReviewMessage> {
  let results: Array<IReviewMessage> = [];
  let feature = gherkinDocument.feature;

  if (feature && feature.children) {
    feature.children.forEach((scenario: any) => {
      let previousKeyword: string = '';
      scenario.steps.forEach((step: any) => {
        if (step.keyword === 'And ') {
          return;
        }
        if (step.keyword === previousKeyword) {
          results.push({
            line: step.location.line,
            type: 2,
            message: `Step "${step.text}" should use And instead of ${step.keyword}.`
          });
        }
        previousKeyword = step.keyword;
      });
    });
  }

  return results;
}
