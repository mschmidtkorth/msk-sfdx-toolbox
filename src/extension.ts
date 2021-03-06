import * as vscode from 'vscode'; // VS Code Extension API
import { comparePermissions } from './command/comparePermissions'; // Import sub-module
import { listAllOrgs } from './command/listOrgs'; // function
import { OrgType, Operation } from './command/listOrgs'; // Enum
import { openFileInOrg } from './command/helper/openFileInOrg'; // Import sub-module
// import { promisify } from 'util'; // Allows to use note-util's promise function with async/await to get shell commands which read immediately.
// import { OrgExplorer } from './orgExplorer';

// export declare var globalContext: vscode.ExtensionContext; // Export the context as we cannot pass it as an argument

/**
 * This method is called when the extension is activated.
 * When the extension is activated, it passes the current extension context as an argument.
 * @param context - The extenion's context.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Activated extension "msk-sfdx-toolbox".');

	/* Compares permissions between Permission Sets or Profiles. */
	// context.subscriptions.push(vscode.commands.registerCommand('msk.comparePermissions', comparePermissions));
	context.subscriptions.push(vscode.commands.registerCommand('msk.comparePermissions', function execute() { comparePermissions(context); }));

	/* Opens a Scratch Org or Dev Hub without setting it as default. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.openScratchOrg', function execute() { listAllOrgs(OrgType.ScratchDev, Operation.Open, context); }));

	/* Deletes a Scratch Org. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.deleteScratchOrg', function execute() { listAllOrgs(OrgType.Scratch, Operation.Delete, context); }));

	/* Validates local changes against Scratch Org or Sandbox. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.validateChanges', function execute() { listAllOrgs(OrgType.ScratchDev, Operation.Validate, context); }));

	/* Shows currently opened file in browser / org. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.openFileInOrg',
		function execute(uri: vscode.Uri) { // TODO Fails - only runs via context menu
			if (vscode.window.activeTextEditor === undefined) { // TODO check for valid file extension.
				vscode.window.showErrorMessage('Please open any XML file first.');
			} else {
				let path: string = (uri !== undefined) ? uri.fsPath : vscode.window.activeTextEditor.document.fileName;
				listAllOrgs(OrgType.ScratchDev, Operation.OpenFile, context, path);
			}
		}
	));

	/* Opens Metadata API Help Article for currently opened file in browser. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.showHelpForType',
		function execute(uri: vscode.Uri) {
			if (vscode.window.activeTextEditor === undefined) { // TODO check for valid file extension.
				vscode.window.showErrorMessage('Please open any XML file first.');
			} else {
				let path: string = (uri !== undefined) ? uri.fsPath : vscode.window.activeTextEditor.document.fileName;
				listAllOrgs(OrgType.ScratchDev, Operation.OpenHelp, context, path);
			}
		}
	));

	/* Sidebar */
	// new OrgExplorer(context); // Potential future implementation to list all orgs in sidebar for quick access (caching)
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() { }
