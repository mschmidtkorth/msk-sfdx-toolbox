import * as vscode from 'vscode'; // VS Code Extension API
import { window, workspace, commands, ExtensionContext, QuickPick, QuickInputButtons, QuickInputButton, QuickPickItem, QuickPickOptions, Uri } from 'vscode';
import cp = require('child_process'); // Provides exec()
import { exists } from 'fs';
import Utils from '../utils/utils';
const fs = require('fs');
const mergeProfileOrPermSet = require('../utils/mergeProfileOrPermSet.js');

/**
 * Compares the local version of a Permission Set/Profile in a branch with the local version of the same in the master branch.
 * @remarks Uses Marco Zeuli's `mergeProfileOrPermSet.js` script to compare permissions.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function comparePermissions(context: vscode.ExtensionContext) {
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

				console.log('Executing mergeProfileOrPermSet.js for ' + filePath);

				mergeProfileOrPermSet.run("master", filePath)
					.then(res => {
						if (res) {
							vscode.window.showInformationMessage('SUCCESS: files were merged correctly', 'Open file').then(button => {
								vscode.window.setStatusBarMessage('Opened file', 5000);
								workspace.openTextDocument(filePath).then(d => {
									window.showTextDocument(d);
								});
							});
						} else {
							vscode.window.showWarningMessage('WARNING: There are some merge conflicts. Before pushing solve them', 'Open file').then(button => {
								vscode.window.setStatusBarMessage('Opened file', 5000);
								workspace.openTextDocument(filePath).then(d => {
									window.showTextDocument(d);
								});
							});
						}
						
						workspace.openTextDocument(filePath).then(d => {
							window.showTextDocument(d);
						});
					}).catch(err => {
						vscode.window.showErrorMessage(err.message, 'Discard uncommitted files', 'Show modified files').then(button => {
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
}