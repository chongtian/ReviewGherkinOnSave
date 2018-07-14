import { IReviewMessage } from '../IReviewMessage';

export function scenarioShouldReferToUserStoryOrBug(gherkinDocument: any): Array<IReviewMessage> {

    let results: Array<IReviewMessage> = [];
    let feature = gherkinDocument.feature;
    let comments = gherkinDocument.comments;

    //get all # Stories: and # Bugs:
    let references: Array<number> = [];
    
    if (comments) {
        comments.forEach((comment: any) => {
            if (comment.type === 'Comment') {
                let regex = /\s*(Stories:|Bugs:)\s*\d{5,}/gi;
                let commentText = comment.text;
                if (regex.test(commentText)) {
                    references.push(comment.location.line);
                }
            }
        });
    }

    if (feature.children) {
        feature.children.forEach((scenario: any) => {
            if (scenario.type === 'ScenarioOutline' || scenario.type === 'Scenario') {

                //get the line of the first step
                if (scenario.steps) {
                    let scenarioLine = scenario.location.line;
                    let firstStepLine = scenario.steps[0].location.line;
                    if (!hasReference(references, scenarioLine, firstStepLine)) {
                        results.push({
                            line: scenarioLine,
                            type: 1,
                            message: `Scenario is not referred to User Story or Bug.`
                        });
                    }
                }
            }
        });
    }
    return results;
}

function hasReference(commentLines: Array<number>, scenarioLine: number, firstStepLine: number): boolean {

    let ret = false;

    if (!commentLines) {
        return false;
    }

    for (let i = 0; i < commentLines.length; i++) {
        if (scenarioLine < commentLines[i]) {
            if ( firstStepLine > commentLines[i]) {
                ret = true;
            }
            break;
        }
    }

    return ret;

}