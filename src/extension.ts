import * as vscode from 'vscode'; // VS Code Extension API
import { comparePermissions } from './command/comparePermissions'; // Import sub-module
import { validateChanges } from './command/validateChanges'; // function
import { listAllOrgs } from './command/listOrgs'; // function
import { OrgType, Operation } from './command/listOrgs'; // Enum
// import { promisify } from 'util'; // Allows to use note-util's promise function with async/await to get shell commands which read immediately.

/**
 * This method is called when the extension is activated.
 * When the extension is activated, it passes the current extension context as an argument.
 * @author Michael Schmidt-Korth <mschmidtkorth@salesforce.com>
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Activated extension "msk-sfdx-toolbox".');

	/* Compares permissions between Permission Sets or Profiles. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.comparePermissions', comparePermissions));

	/* Opens a Scratch Org or Dev Hub without setting it as default. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.openScratchOrg', function execute() { listAllOrgs(OrgType.ScratchDev, Operation.Open); }));
	// context.subscriptions.push(vscode.commands.registerCommand('msk.openScratchOrg', openScratchOrg));

	/* Deletes a Scratch Org. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.deleteScratchOrg', function execute() { listAllOrgs(OrgType.Scratch, Operation.Delete); }));
	// context.subscriptions.push(vscode.commands.registerCommand('msk.deleteScratchOrg', validateChanges));

	/* Validates local changes against Scratch Org or Sandbox. */
	context.subscriptions.push(vscode.commands.registerCommand('msk.validateChanges', function execute() { listAllOrgs(OrgType.ScratchDev, Operation.Validate); }));
	//context.subscriptions.push(vscode.commands.registerCommand('msk.validateChanges', validateChanges));
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() { }
