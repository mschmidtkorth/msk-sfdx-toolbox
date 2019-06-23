import * as vscode from 'vscode'; // VS Code Extension API
import { comparePermissions } from './command/comparePermissions'; // Import sub-module
import { openScratchOrg } from './command/openScratchOrg';
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
	context.subscriptions.push(vscode.commands.registerCommand('msk.openScratchOrg', openScratchOrg));
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() { }
