import * as vscode from 'vscode'; // VS Code Extension API
import { ProgressLocation } from 'vscode';
import cp = require('child_process'); // Provides exec()
import { exists } from 'fs';
import Utils from '../../utils/utils';

/**
 * Shows the currently opened file in the browser / org.
 * @param orgName - Name of the org to open the file in.
 * @param filePath - Name of the file to open.
 * @param context - The extenion's context.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function openFileInOrg(orgName: string, filePath: string, context: vscode.ExtensionContext) {
	console.log('Received file to open: ' + filePath);
	var utils = new Utils();

	const componentLinks = require(context.extensionPath + '/src/config/componentLinks.json');

	const fileNameExt = utils.getFileName(filePath);
	console.log('File Name (full name): ' + fileNameExt);
	let file: string;
	if (fileNameExt.includes('.') && fileNameExt.split('.').length <= 3) { // Opportunity.workflow-meta.xml
		file = fileNameExt.split('.')[0];
	} else if (fileNameExt.includes('.') && fileNameExt.split('.').length > 3) { // Account.actionName.quickAction-meta.xml
		file = fileNameExt.split('.')[0] + '.' + fileNameExt.split('.')[1];
	} else { // MyClass.cls
		file = fileNameExt;
	}
	console.log('File Name (API name): ' + file);

	let parentParentFolder = filePath.split('/').slice(-3)[0]; // e.g. fields are in /object/Account/fields/f1.xml, and we need to retrieve "Account"

	let type: string;
	if (filePath.includes('-') && filePath.split('.').length <= 3) { // X.permissionset-meta.xml
		type = filePath.split('/').slice(-1)[0].split('.')[1].split('-')[0]; // utils.getFolderName(filePath); // Easier to retrieve type from extension than folder, as we have files in sub-subfolders
	} else if (filePath.split('.').length > 3) { // path/Account.ActionName.quickAction-meta.xml
		type = filePath.split('/').slice(-1)[0].split('.')[2].split('-')[0];
	} else { // X.cls
		type = filePath.split('/').slice(-1)[0].split('.')[1];
	}
	console.log('File Type (Object Name) = ' + type);

	if (componentLinks[type] === undefined) {
		vscode.window.showErrorMessage('Cannot open this file, please open it manually.', 'OK', 'Open Org').then(button => {
			vscode.window.setStatusBarMessage('Opening org ' + orgName + '...', 5000);
			if (button === 'Open Org') {
				openFile('/', 'org');
			}
		});
	} else {
		// Some files have different names than their API name - instead of parsing the file and retrieving the <name>, we use a simple list of replacements.
		if (componentLinks[type].exceptions !== undefined) {
			let exceptions = componentLinks[type].exceptions;
			for (var i = 0; i < exceptions.length; i++) {
				if (file in exceptions[i]) {
					console.log('Replaced ' + file + ' with ' + exceptions[i][file]);
					file = exceptions[i][file];
				}
			}
		}

		if (componentLinks[type].object === undefined) { // Simple link, does not require getting Id
			console.log('Opening: ' + componentLinks[type].link.replace('{%s}', file));

			openFile(componentLinks[type].link.replace('{%s}', file), file, filePath);
		} else {
			vscode.window.withProgress({
				location: ProgressLocation.Notification,
				title: 'Retrieving ' + file + '...',
				cancellable: false // Cannot interrupt the sfdx command as it might already have made its way into the clouds
			}, async (progress, token) => {
				await new Promise(resolve => {
					token.onCancellationRequested(() => {
						console.log("User canceled."); // TODO Cancelling will not interrupt - process.exit() would kill the overall extension host, return does not do anything here. How to stop current extension process?
						resolve();
						return;
					});

					/* Generate the Query */
					let query = generateQuery(componentLinks);
					const api = (componentLinks[type].api !== undefined && componentLinks[type].api === 'tooling') ? ' -t' : '';
					console.log('Query: ' + query);
					cp.exec(
						'sfdx force:data:soql:query --json -q "' + query + '"' + api + ' -u "' + orgName + '"',
						{ cwd: utils.getPath() },
						function (error: any, output: any) {
							let response: any;
							try {
								response = JSON.parse(output);
							} catch (e) {
								if (error.message.includes('ENOTFOUND')) {
									console.log(error);
									vscode.window.showErrorMessage('Could not connect to Salesforce.', 'OK');
								} else {
									console.log(error);
									vscode.window.showErrorMessage('Something went wrong.', 'OK');
								}
							}

							/* Generate the Link */
							if (response.status === 0 && response.result.totalSize > 0) {
								let link = generateLink(componentLinks, response);

								console.log('Opening: ' + link);
								openFile(link, file);
								resolve();
							} else if (response.status === 0 && response.result.totalSize === 0 && type === 'field') {
								// Standard fields cannot be queried (return 0), we need to pass their Name.
								// Small issue: size == 0 also happens if the field does not yet exist in the org, in that scenario we would incorrectly redirect,
								let link = componentLinks[type].link
									.replace('{%obj}', parentParentFolder)
									.replace('{%id}', file);

								console.log('Opening: ' + link);
								openFile(link, file);
								resolve();
							} else {
								vscode.window.showErrorMessage('Could not open file. Either it does not exist on your org or it cannot be opened directly.', 'OK');
								resolve();
							}
						});
				});
			});
		}
	}

	/**
	 * Open a file in Salesforce.
	 * @param output - Output of the calling function.
	 * @param error - Error of the calling function.
	 * @param path - Path of flexipage.
	 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
	 */
	function openFile(link: string, file: string, path?: string) {
		vscode.window.withProgress({
			location: ProgressLocation.Notification,
			title: 'Opening ' + file + ' in org ' + orgName + '...',
			cancellable: false // Cannot interrupt the sfdx command as it might already have made its way into the clouds
		}, async () => {
			if (path !== undefined && path.includes('flexipage')) { // Flexipages use a different command
				console.log('sfdx force: source:open -f "' + filePath + '" -u "' + orgName + '"');

				await new Promise(resolve => {
					cp.exec(
						'sfdx force:source:open -f "' + filePath + '" -u "' + orgName + '"',
						{ cwd: utils.getPath() },
						function (error: any, output: any) {
							if (error !== undefined && error !== null) {
								console.log(error);
								if (error.message.includes('ENOTFOUND')) {
									console.log(error);
									vscode.window.showErrorMessage('Could not connect to Salesforce.', 'OK');
								} else {
									console.log(error);
									vscode.window.showErrorMessage('Something went wrong.', 'OK');
								}
							}
							resolve();
						});
				});
			} else {
				console.log('sfdx force:org:open -p "' + link + '" -u "' + orgName + '"');

				await new Promise(resolve => {
					cp.exec(
						'sfdx force:org:open -p "' + link + '" -u "' + orgName + '"',
						{ cwd: utils.getPath() },
						function (error: any, output: any) {
							if (error !== undefined && error !== null) {
								console.log(error);
								if (error.message.includes('ENOTFOUND')) {
									console.log(error);
									vscode.window.showErrorMessage('Could not connect to Salesforce.', 'OK');
								} else {
									console.log(error);
									vscode.window.showErrorMessage('Something went wrong.', 'OK');
								}
							}
							resolve();
						});
				});
			}
		});
	}

	/**
	 * Generates the query to receive the Record Id.
	 * @returns SOQL query to receive a Record Id.
	 * @param componentLinks - JSON configuration for a given component.
	 */
	function generateQuery(componentLinks: any): string {
		let queryWhat: string;
		if (componentLinks[type].selectAddition === undefined) {
			queryWhat = 'Id';
		} else {
			queryWhat = 'Id, ' + componentLinks[type].selectAddition;
		}

		let queryWhere: string;
		if (componentLinks[type].queryAddition === undefined) { // Simple query
			queryWhere = ' WHERE ' + componentLinks[type].field + ' = \'' + file + '\'';
		} else if (type === 'layout') { // Account-Account Layout.layout-meta.xml, split at -
			queryWhere = ' WHERE ' + componentLinks[type].queryAddition
				.replace('{%obj}', file.split(/-(.+)/)[0])
				.replace('{%name}', file.split(/-(.+)/)[1]);
		} else if (type === 'quickAction') { // Account.MyQuick.xml, split at .
			queryWhere = ' WHERE ' + componentLinks[type].queryAddition
				.replace('{%obj}', file.split('.')[0])
				.replace('{%name}', file.split('.')[1]);
		} else if (type === 'field' || type === 'listView' || type === 'recordType' || type === 'validationRule') { // Name.xml, but we require Object and Id. Extract Name, get Object from path.
			queryWhere = ' WHERE ' + componentLinks[type].queryAddition
				.replace('{%obj}', parentParentFolder)
				.replace('{%name}', file.split('.')[0]
					.replace('__c', '')); // CustomFields need to be changed from Field__c to Field. For other types it does not matter..
		} else { // Name.flow-meta.xml
			queryWhere = ' WHERE ' + componentLinks[type].queryAddition
				.replace('{%name}', file);
		}

		return 'SELECT ' + queryWhat + ' FROM ' + componentLinks[type].object + queryWhere;
	}

	/**
	 * Generates the link to open in Salesforce.
	 * @returns URL to open.
	 * @param componentLinks - JSON configuration for a given component.
	 * @param response - JSON response from Salesforce.
	 */
	function generateLink(componentLinks: any, response: any): string {
		// Assumption for the response: Always exactly 1 response as we filter by API name
		let link = '';

		if (type === 'field' || type === 'listView' || type === 'recordType' || type === 'validationRule') { // Standard/CustomFields, ListViews, RecordTypes and ValidationRules require object and name in URL as they are in subfolders.
			console.log('Object name: ' + parentParentFolder);
			link = componentLinks[type].link
				.replace('{%obj}', parentParentFolder)
				.replace('{%id}', response.result.records[0].Id);
		} else if (type === 'quickAction') {
			link = componentLinks[type].link
				.replace('{%obj}', response.result.records[0].SobjectType)
				.replace('{%id}', response.result.records[0].Id);
		} else if (type === 'tab') { // Replace object key prefix
			link = componentLinks[type].link
				.replace('{%id}', response.result.records[0].DurableId
					.replace('0KD', '01r').substring(0, 15));
		} else {
			link = componentLinks[type].link.replace('{%id}', response.result.records[0].Id);
		}

		return link;
	}
}