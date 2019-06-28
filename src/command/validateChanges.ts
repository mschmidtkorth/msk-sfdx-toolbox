import * as vscode from 'vscode'; // VS Code Extension API
import { window, workspace, ProgressLocation } from 'vscode';
import child_process = require('child_process'); // Provides exec()
import Utils from '../utils/utils';
import { getPriority } from 'os';

/**
 * Validates current branch of local repository against a chosen Scratch Org or Sandbox.
 * @param orgName - Name of the Scratch Org or Sandbox to validate against.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function validateChanges(orgName: string) {
	var utils = new Utils();
	const cp = require('child_process');

	// TODO Pre-select org from setting default. Requires use of createQuickPick() instead of showQuickPick(). To implement, move the following to extension.ts:
	// username = (typeof vscode.workspace.getConfiguration('msk').get('validationScratchOrg') != 'undefined') ? vscode.workspace.getConfiguration('msk').get('validationScratchOrg') : 'VALIDATE';
	// ... and pass username as an argument to listOrgs.
	let username = orgName;

	// withProgress does not support custom buttons.
	vscode.window.showInformationMessage('Validating against ' + username + '... (this may take a while). Results will be opened automatically once done. If deployment fails, verify that a Scratch Org with alias "VALIDATE" exists or change the name in your settings.', 'Open deployment results (auto-updated)').then(button => {
		workspace.openTextDocument(utils.getPath() + '/validationResult.txt').then(d => {
			window.showTextDocument(d);
		});
	});
	console.log('Validating... (this may take a while)');

	vscode.window.withProgress({
		location: ProgressLocation.Notification,
		title: 'Validating... (this may take a while)',
		cancellable: false // Cannot interrupt the sfdx command as it might already have made its way into the clouds
	}, async () => {
		await new Promise(resolve => {
			cp.exec(
				'sfdx force:source:deploy --checkonly -p "' + utils.getPath() + '/force-app/main/default" -u ' + username + ' -w 10 --loglevel=ERROR --testlevel=RunLocalTests > validationResult.txt', // Alternatively use force:mdapi:deploy --checkonly
				{ cwd: utils.getPath() },
				function (error: any, output: any) {
					if (error) { // Any result will be treated as error
						resolve();
						// Trying to access the error object will result in the script put on hold (even with try-catch) ie. we cannot capture the type of error.
						// Unfortunately, the command will always return an error, even if it executed successfully. Therefore we do not attempt to handle errors or inform the user.
						vscode.window.showInformationMessage('Deployment finished.', 'Open deployment result').then(button => {
							vscode.window.setStatusBarMessage('Opening deployment results', 5000);
							workspace.openTextDocument(utils.getPath() + '/validationResult.txt').then(d => {
								window.showTextDocument(d);
							});
						});
						workspace.openTextDocument(utils.getPath() + '/validationResult.txt').then(d => {
							window.showTextDocument(d);
						});

						/* vscode.window.showErrorMessage('Please verify that a Scratch Org with alias "' + username + '" exists or change the name in your settings.', 'OK', 'Open Settings').then(button => {
							if (button === 'Open Settings') {
								vscode.window.setStatusBarMessage('Opening Settings', 5000);
								vscode.commands.executeCommand('workbench.action.openSettings2');
								vscode.window.showInformationMessage('Search for "MSK sfdx Toolbox".')
							}
						}); */
					}
				});
		});
	});
}