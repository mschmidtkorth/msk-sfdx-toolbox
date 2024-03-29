import * as vscode from 'vscode'; // VS Code Extension API
import { ProgressLocation } from 'vscode';
import Utils from '../../utils/utils';
const cp = require('child_process');

/**
 * Opens any org.
 * @param orgName - Name of the Scratch Org or Sandbox
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export function openOrg(orgName: string) {
	var utils = new Utils();

	vscode.window.withProgress({
		location: ProgressLocation.Notification,
		title: 'Opening Scratch Org...',
		cancellable: false // Cannot interrupt the sfdx command as it might already have made its way into the clouds
	}, async () => {
		await new Promise(resolve => {
			cp.exec(
				'sfdx force:org:open -u "' + orgName + '"',
				{ cwd: utils.getPath() },
				function (output: any, error: any) {
					processOrg(output, error);
					resolve();
				});
		});
	});

	/**
	 * Further processes the input.
     * @param output - Output of the caller.
	 * @param error - Error of the caller.
	 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
	 */
	function processOrg(output: string, error: string) {
		console.log(output);
		console.log(error);
		vscode.window.setStatusBarMessage('Org ' + orgName + ' has been opened.', 5000);
	}
}