import { IReviewMessage } from './IReviewMessage';

export function processFatalErrors(errors: Array<any>): Array<IReviewMessage> {
    let results: Array<IReviewMessage> = [];
    if (errors.length > 1) {
        let result = getFormatedTaggedBackgroundError(errors);
        errors = result.errors;
        results = result.errorMsgs;
    }
    errors.forEach(function (error) {
        results.push(getFormattedFatalError(error));
    });
    return results;
}

function getFormatedTaggedBackgroundError(errors: Array<any>) {
    let results: Array<IReviewMessage> = [];
    let index = 0;
    if (errors[0].message.indexOf('got \'Background') > -1 &&
        errors[1].message.indexOf('expected: #TagLine, #ScenarioLine, #ScenarioOutlineLine, #Comment, #Empty') > -1) {

        results.push({
            line: errors[0].message.match(/\((\d+):.*/)[1],
            type: 3,
            message: 'Tags on Backgrounds are dissallowed',
        });

        index = 2;
        for (let i = 2; i < errors.length; i++) {
            if (errors[i].message.indexOf('expected: #TagLine, #ScenarioLine, #ScenarioOutlineLine, #Comment, #Empty') > -1) {
                index = i;
            } else {
                break;
            }
        }
    }
    return { errors: errors.slice(index, errors.length), errorMsgs: results };
}

function getFormattedFatalError(error: any): IReviewMessage {
    let result: IReviewMessage;
    let errorMsg: string;

    let regex_testExamples = /expected:.*got \'Examples:\'/gi;
    let regex_testTable = /expected: #EOF, #TableRow,.*#TagLine, #ExamplesLine, #ScenarioLine, #ScenarioOutlineLine, #Comment, #Empty, got \'/gi;
    let regex_testKeyword = /expected: #EOF, #TableRow, #DocStringSeparator, #StepLine, #TagLine, .*#ScenarioLine, #ScenarioOutlineLine, #Comment, #Empty, got \'(?!Examples)/gi;

    let errorLine = error.message.match(/\((\d+):.*/)[1];

    if (error.message.indexOf('got \'Background') > -1) {
        errorMsg = 'Multiple "Background" definitions in the same file are disallowed';
    } else if (error.message.indexOf('got \'Feature') > -1) {
        errorMsg = 'Multiple "Feature" definitions in the same file are disallowed';
    } else if (regex_testExamples.test(error.message)) {
        errorMsg = 'Cannot use "Examples" in a "Scenario", use a "Scenario Outline" instead';
    } else if (regex_testKeyword.test(error.message)) {
        //line does not begin with Gherkin keyword   
        errorMsg = 'Steps should begin with "Given", "When", "Then", "And" or "But".';
    } else if (regex_testTable.test(error.message)) {
        // invalid dataTable
        errorMsg = 'inconsistent cell count within the table';
    }
    else {
        errorMsg = error.message;
    }

    result = { line: errorLine, type: 3, message: errorMsg };

    return result;
}