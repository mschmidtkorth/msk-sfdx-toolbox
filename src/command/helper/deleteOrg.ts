import * as vscode from 'vscode'; // VS Code Extension API
import Utils from '../../utils/utils';

/** Deletes a Scratch Org. */
export function deleteOrg(orgName: string) {
	const cp = require('child_process');
	var utils = new Utils();

	vscode.window.showQuickPick(['No, cancel deletion.', 'YES, delete Scratch Org ' + orgName + ' permanently.'], { placeHolder: 'Do you really want to delete Scratch Org ' + orgName + '?' }).then(confirmed => {
		if (confirmed === 'YES, delete Scratch Org ' + orgName + ' permanently.') {
			console.log('Deleting org...')
			vscode.window.setStatusBarMessage('Deleting Scratch Org', 5000)
			cp.exec(
				'sfdx force:org:delete -p -u "' + orgName + '"',
				{ cwd: utils.getPath() },
				function (output: any, error: any) {
					processOrg(output, error, orgName);
				});
		}
	});

	/** Further processes the input */
	function processOrg(output: string, error: string, orgName: string) {
		console.log(output);
		console.log(error);
		vscode.window.showInformationMessage('Scratch Org ' + orgName + ' has been deleted.');
	}
}