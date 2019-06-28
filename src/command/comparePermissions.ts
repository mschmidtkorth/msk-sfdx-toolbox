import * as vscode from 'vscode'; // VS Code Extension API
import { window, workspace, commands, ExtensionContext, QuickPick, QuickInputButtons, QuickInputButton, QuickPickItem, QuickPickOptions, Uri } from 'vscode';
import cp = require('child_process'); // Provides exec()
import { exists } from 'fs';
import Utils from '../utils/utils';
const fs = require('fs');

/**
 * Compares the local version of a Permission Set/Profile in a branch with the local version of the same in the master branch.
 * @remarks Uses Marco Zeuli's `mergeProfileOrPermSet.sh` script to compare permissions.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function comparePermissions() {
	vscode.window.showInformationMessage('Ensure your master branch is up to date. Files are compared locally.', 'OK');
	var utils = new Utils();

	// Path is relative to the workspace directory
	workspace.findFiles('{**/*.profile-meta.xml,**/*.permissionset-meta.xml}').then(files => {
		console.log('Found the following permission files:\n' + files);
		var displayFiles = files.map(file => {
			return {
				label: (utils.getFileName(file.fsPath).includes('profile-meta')) ? '$(person-filled) ' + utils.getFileName(file.fsPath) : '$(organization-filled) ' + utils.getFileName(file.fsPath), // Prominent label
				description: file.fsPath, // Less prominent label
				filePath: file.fsPath
			};
		});
		if (displayFiles.length === 0) {
			console.error('No permission files found.');
			vscode.window.showErrorMessage('No permission files found. Have you added the project folder to your workspace? Stopping.', 'OK');
		}
		window.showQuickPick(displayFiles, { placeHolder: 'Select a permission file', matchOnDescription: true }).then(returnValue => {
			if (typeof returnValue !== 'undefined') {
				const filePath = returnValue.filePath;
				vscode.window.setStatusBarMessage('Checking conflicts for ' + returnValue.label + ' ...', 5000);

				console.log('Executing mergeProfileOrPermSet.sh for ' + filePath);

				let compareScriptPath;
				// Attempt to use the user-specified directory. If it fails, attempt to use the relative path to the working directory. If it fails, throw error.
				try {
					compareScriptPath = vscode.workspace.getConfiguration('msk').get('defaultCompareScriptDirectory') + '/mergeProfileOrPermSet.sh';
					fs.accessSync(compareScriptPath + '/mergeProfileOrPermSet.sh'); // Continues if no error, throws exception if error
				} catch (e) {
					console.log('mergeProfileOrPermSet.sh not found at user-specified directory "' + compareScriptPath + '". Checking directory relative to working dir.');
					try {
						compareScriptPath = utils.getPath() + '/utils/mergeProfileOrPermSet.sh';
						fs.accessSync(utils.getPath() + '/utils/mergeProfileOrPermSet.sh');
					} catch (e) {
						console.error('mergeProfileOrPermSet.sh not found at "' + compareScriptPath + '".');
						vscode.window.showErrorMessage('mergeProfileOrPermSet.sh not found. Please check your working directory or update your default directory. Stopping.', 'Open working directory', 'Open Settings').then(button => {
							if (button === 'Open Settings') {
								vscode.window.setStatusBarMessage('Opening Settings', 5000);
								vscode.commands.executeCommand('workbench.action.openSettings2');
								vscode.window.showInformationMessage('Search for "MSK sfdx Toolbox".');
							} else {
								vscode.window.setStatusBarMessage('Opening working directory', 5000);
								vscode.commands.executeCommand('vscode.openFolder', Uri.file(utils.getPath() + '/'), true);
							}
						});
					}
				}

				cp.exec( // No progress indicator as command executes quickly
					'bash "' + compareScriptPath + '" master ' + '"' + filePath + '"',
					{ cwd: utils.getPath() },
					function (error: any, output: any) { // Beware: Always returned in this sequence, do not use output,error
						processFile(output, error, filePath);
					});
			}
		});

		/**
		 * Processes the result file of `mergeProfileOrPermSet.sh`.
		 * @param output - Output of the script.
		 * @param error - Error of the script.
		 * @param file - Processed permission file.
		 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
		 */
		function processFile(output: string, error: string, filePath: string) {
			// Even if mergeProfileOrPermSet.sh executes successfully (0), it may still throw an exception explicitly - however, in Marco's code he does not throw a failure but simply outputs 'Error: ', therefore we should also recognize such outputs as errors.
			if (output && output.substr(0, 5) !== 'Error' && output.substr(0, 7) !== 'WARNING') {
				console.log('Command has finished:' + output);
				vscode.window.showInformationMessage(output, 'Open file').then(button => {
					vscode.window.setStatusBarMessage('Opened file', 5000);
					workspace.openTextDocument(filePath).then(d => {
						window.showTextDocument(d);
					});
				});

				workspace.openTextDocument(filePath).then(d => {
					window.showTextDocument(d);
				});
			} else if (output.substr(0, 7) === 'WARNING') {
				// e.g.  WARNING: There are some merge conflicts. Before pushing solve them.
				console.log('Warning executing command:' + output);
				vscode.window.showWarningMessage(output, 'Open file').then(button => {
					vscode.window.setStatusBarMessage('Opened file', 5000);
					workspace.openTextDocument(filePath).then(d => {
						window.showTextDocument(d);
					});
				});

				workspace.openTextDocument(filePath).then(d => {
					window.showTextDocument(d);
				});
			} else if (output.substr(0, 5) === 'Error') {
				// e.g.  Error: your workspace contains changes that haven't been committed
				console.log('Soft error executing command:' + output);
				vscode.window.showErrorMessage(output, 'Discard uncommitted files', 'Show modified files').then(button => {
					vscode.window.setStatusBarMessage('Discard uncommitted files', 5000);
					if (button === 'Discard uncommitted files') {
						vscode.commands.executeCommand('git.cleanAll');
					} else {
						vscode.commands.executeCommand('workbench.view.scm');
					}
				});
			} else {
				console.error('Hard error executing command:' + error);
				vscode.window.showErrorMessage(error, 'OK');
			}
		}
	});
}