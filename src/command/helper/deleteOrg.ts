import * as vscode from 'vscode'; // VS Code Extension API
import { ProgressLocation } from 'vscode';
import Utils from '../../utils/utils';
const cp = require('child_process');

/**
 * Deletes a Scratch Org.
 * @param orgName - Name of the Scratch Org to delete.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function deleteOrg(orgName: string) {
	var utils = new Utils();

	vscode.window.showQuickPick(['No, cancel deletion.', 'YES, delete Scratch Org ' + orgName + ' permanently.'], { placeHolder: 'Do you really want to delete Scratch Org ' + orgName + '?' }).then(confirmed => {
		if (confirmed === 'YES, delete Scratch Org ' + orgName + ' permanently.') {
			console.log('Deleting org...');

			vscode.window.withProgress({
				location: ProgressLocation.Notification,
				title: 'Deleting Scratch Org...',
				cancellable: false // Cannot interrupt the sfdx command as it might already have made its way into the clouds
			}, async () => {
				await new Promise(resolve => {
					cp.exec(
						'sfdx force:org:delete -p -u "' + orgName + '"',
						{ cwd: utils.getPath() },
						function (output: any, error: any) {
							processOrg(output, error, orgName);
							resolve();
						});
				});
			});
		}
	});

	/**
	 * Further processes the input.
	 * @param output - Output of the caller.
	 * @param error - Error of the caller.
	 * @param orgName - Name of the Scratch Org.
	 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
	 */
	function processOrg(output: string, error: string, orgName: string) {
		console.log(output);
		console.log(error);
		vscode.window.showInformationMessage('Scratch Org ' + orgName + ' has been deleted.', 'OK');
	}
}