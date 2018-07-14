/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	createConnection,
	TextDocuments,
	TextDocument,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification
} from 'vscode-languageserver';

import { review } from "./reviewFeature/reviewFeature";
import { ISettings } from './ISettings';

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we will fall back using global settings
	hasConfigurationCapability =
		capabilities.workspace && !!capabilities.workspace.configuration;
	hasWorkspaceFolderCapability =
		capabilities.workspace && !!capabilities.workspace.workspaceFolders;

	return {
		capabilities: {
			textDocumentSync: documents.syncKind
		}
	};
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(
			DidChangeConfigurationNotification.type,
			undefined
		);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});


// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ISettings = { maxNumberOfProblems: 1000, extraValidation: true };
let globalSettings: ISettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ISettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ISettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateGherkinFeatureDocument);
});

function getDocumentSettings(resource: string): Thenable<ISettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'reviewgherkinonsave'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

documents.onDidOpen(open => { validateGherkinFeatureDocument(open.document); });

documents.onDidSave(save => {
	validateGherkinFeatureDocument(save.document);
});

async function validateGherkinFeatureDocument(textDocument: TextDocument): Promise<void> {

	let settings = await getDocumentSettings(textDocument.uri);

	let diagnostics = await review(textDocument, settings);

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	//connection.console.log('received a file change event');
});

connection.onDidSaveTextDocument(_save => {
	// Monitored saving files in VSCode
	//connection.console.log('received a save file event');
})


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
