# Review Gherkin Feature On Save

This is the README for the extension "Review Gherkin Feature On Save".  

## Features

This extension is based on [Gherkin Parser](https://github.com/cucumber/gherkin-javascript) and verifies the following in Gherkin feature files:

1. The feature file should not have any fatal error, including:
   * Count of cells should be consistent within a Gherkin table
   * Each Gherkin line should begin with a Gherkin keyword, unless this line is part of the Feature section.
   * Should not have multiple Feature sections
   * Should not have multiple Background sections
   * Scenario should not have Examples section
2. The feature file should follow some good practices, including:
   * Scenario Outline should have Examples section
   * Scenario should not use variables(parameters) 
   * Scenario Outline should not have undefined variables
   * Should use And if the scenario has multiple Given, When, or Then steps
3. The feature file should follow extra customized guidelines
   * Scenario should refer to a VSTS Test Case
   * Scenario should refer to at least one User Story or Bug
   * Duplicate test case id is not allowed

If your feature file has errors of the first type, you must fix your feature file before check-in. Otherwise the sync tool and the Automation test cannot handle your feature file.

If your feature file has errors of the third type, you should consider fixing it. Otherwise the sync tool will not pick up your scenario(s).

## Install
This extension is not published to VS Code Marketplace. Thus, please install from local vsix file.

## How to use the extension
![](https://raw.githubusercontent.com/chongtian/reviewgherkinonsave/master/img/HowToUse.gif)
When a feature file is open, or when a feature file is saved, this extension will review the feature file. All the found problems will be listed in the PROBLEMS view.
> Tip: To open PROBELMS, press Ctrl+Shift+M

## Source codes
[GitHub](https://github.com/chongtian/reviewgherkinonsave)


