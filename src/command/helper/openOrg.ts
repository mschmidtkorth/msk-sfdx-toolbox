import * as vscode from 'vscode'; // VS Code Extension API
import Utils from '../../utils/utils';

/** Opens any org. */
export function openOrg(orgName: string) {
	var utils = new Utils();

	const cp = require('child_process');
	cp.exec(
		'sfdx force:org:open -u "' + orgName + '"',
		{ cwd: utils.getPath() },
		function (output: any, error: any) {
			processOrg(output, error);
		});

	/** Further processes the input */
	function processOrg(output: string, error: string) {
		console.log(output);
		console.log(error);
		vscode.window.showInformationMessage('Org ' + orgName + ' has been opened.');
	}
}