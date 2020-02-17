import * as vscode from 'vscode'; // VS Code Extension API
import { window, workspace, commands, ExtensionContext, QuickPick, QuickInputButtons, QuickInputButton, QuickPickItem, QuickPickOptions, Uri } from 'vscode';
import cp = require('child_process'); // Provides exec()
import { exists } from 'fs';
import Utils from '../utils/utils';
import MergeProfileOrPermSet from '../utils/MergeProfileOrPermSet';
const fs = require('fs');

/**
 * Compares the local version of a Permission Set/Profile in a branch with the local version of the same in the master branch.
 * @remarks Uses Marco Zeuli's `mergeProfileOrPermSet.js` script to compare permissions.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function comparePermissions(context: vscode.ExtensionContext) {
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: 'Ensure your target branch is up to date. Files are compared locally.',
		cancellable: true
	}, (progress, token) => {
		token.onCancellationRequested(() => {
			console.log('User cancelled permission comparison.');
			return;
		});

		progress.report({ increment: 0 });

		setTimeout(() => { progress.report({ increment: 25 }); }, 1000);
		setTimeout(() => { progress.report({ increment: 50 }); }, 2000);
		setTimeout(() => { progress.report({ increment: 75 }); }, 3000);

		var p = new Promise(resolve => {
			setTimeout(() => { resolve(); }, 5000);
		});

		return p;
	});

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

				cp.exec(
					'git rev-parse --abbrev-ref HEAD',
					{ cwd: utils.getPath() },
					function (error: any, currentBranch: string) {
						cp.exec(
							`git for-each-ref --format '%(refname:short)' refs/heads/`,
							{ cwd: utils.getPath() },
							function (error: any, allBranches: any) {
								let branches = allBranches.split(/[\r\n]+/);

								branches.forEach((item: string, index: number) => {
									if (item.trim() === currentBranch.trim()) {
										branches.splice(index, 1);
									}
								});

								window.showQuickPick(branches, { placeHolder: 'Select a local branch to compare your current branch "' + currentBranch + '" with', matchOnDescription: true }).then(branchValue => {
									if (branchValue !== undefined) {
										console.log('Comparing between branch (current) ' + currentBranch + ' and (selected) ' + branchValue);

										vscode.window.setStatusBarMessage('Checking conflicts for ' + returnValue.label + ' on ' + branchValue + ' ...', 5000);

										console.log('Executing mergeProfileOrPermSet.js for ' + filePath);

										new MergeProfileOrPermSet(workspace.rootPath).run(branchValue, filePath)
											.then(res => {
												if (!res.conflicts) {
													vscode.window.showInformationMessage('SUCCESS: Files were merged successfully.', 'Open file').then(button => {
														vscode.window.setStatusBarMessage('Opened file', 5000);
														workspace.openTextDocument(filePath).then(d => {
															window.showTextDocument(d);
														});
													});
												} else {
													vscode.window.showWarningMessage('WARNING: There are some merge conflicts. Before pushing, solve them.', 'Open file', 'Next conflict').then(button => {
														vscode.window.setStatusBarMessage('Opened file', 5000);
														workspace.openTextDocument(filePath).then(d => {
															window.showTextDocument(d);
															vscode.commands.executeCommand('merge-conflict.next');
														});
														if (button === 'Next conflict') {
															vscode.commands.executeCommand('merge-conflict.next');
														}
													});
												}

												workspace.openTextDocument(filePath).then(d => {
													window.showTextDocument(d);
													vscode.commands.executeCommand('merge-conflict.next');
												});
											}).catch(err => { // via done.fail()
												vscode.window.showErrorMessage(err.message, 'Discard uncommitted files', 'Show modified files', 'OK').then(button => {
													vscode.window.setStatusBarMessage('Discard uncommitted files', 5000);
													if (button === 'Discard uncommitted files') {
														vscode.commands.executeCommand('git.cleanAll');
													} else {
														vscode.commands.executeCommand('workbench.view.scm');
													}
												});
											});
									}
								});
							});
					});
			}
		});
	});
}