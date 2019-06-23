import * as vscode from 'vscode'; // VS Code Extension API
import { window, workspace, commands, ExtensionContext, QuickPick, QuickInputButtons, QuickInputButton, QuickPickItem, QuickPickOptions } from 'vscode';
import child_process = require('child_process'); // Provides exec()
import Utils from '../utils/utils';

/**
 * Provides a lists of all available Scratch Org and Dev Hub instances incl. their expiration date. Selected instance will be opened in the browser.
 * @author Michael Schmidt-Korth <mschmidtkorth@salesforce.com>
 */
export function openScratchOrg() {
	var utils = new Utils();

	vscode.window.setStatusBarMessage('Loading all Scratch Orgs...', 5000);

	const cp = require('child_process');
	// force:auth:list is faster than force:org:list, but does not (yet) return the type of an org (DevHub, Scratch Org)
	// TODO Retrieve orgs from VSC sfdx plugin's cache?
	cp.exec(
		'sfdx force:org:list --json',
		{ cwd: utils.getPath() },
		function (error: any, output: any) {
			listOrgs(output, error);
		});

	/** List all Scratch Orgs and Dev Hubs. */
	function listOrgs(output: string, error: string) {
		const jsonOutput = JSON.parse(output);

		console.log('Getting all usernames');
		var userAlias: string[] = [];
		if (jsonOutput.status === 0) {
			// All orgs could be stored in associative array if needed
			for (var i = 0; i < jsonOutput.result.nonScratchOrgs.length; i++) { // Dev Hubs
				var alias = jsonOutput.result.nonScratchOrgs[i].alias;
				userAlias.push(
					'DevHub#' +
					((typeof alias !== 'undefined') ? alias : '') + '#' +
					jsonOutput.result.nonScratchOrgs[i].username);
			}
			for (var i = 0; i < jsonOutput.result.scratchOrgs.length; i++) { // Scratch Orgs
				if (!jsonOutput.result.scratchOrgs[i].isExpired) {
					var alias = jsonOutput.result.scratchOrgs[i].alias;
					userAlias.push(
						'ScratchOrg#' +
						((typeof alias !== 'undefined') ? alias : '') + '#' +
						jsonOutput.result.scratchOrgs[i].username + '#' +
						jsonOutput.result.scratchOrgs[i].devHubUsername + ' [' + utils.calculateDayDifference(new Date(jsonOutput.result.scratchOrgs[i].expirationDate)) + 'd]');
				}
			}
		} else {
			vscode.window.showErrorMessage('No Scratch Orgs found.');
		}
		// Create an associative array from userAlias
		var userAliasAssociative = userAlias.map(function (value, key, array) {
			var userAliasElements = userAlias[key].split('#');
			return {
				label: ((userAliasElements[0] == 'ScratchOrg') ? '$(gear) ' : '$(home) ') + userAliasElements[1], // Prominent label
				description: userAliasElements[2], // Less prominent label
				detail: userAliasElements[3]
			};
		});

		console.log('Displaying usernames...');
		window.showQuickPick(userAliasAssociative, { placeHolder: 'Select an org to open', matchOnDescription: true }).then(returnValue => {
			if (returnValue != null) { // Otherwise error "returnValue is possibly 'undefined'"
				let orgName = returnValue.description.replace('$(gear) ', '').replace('$(home) ', '');
				vscode.window.setStatusBarMessage('Opening org ' + orgName + '...', 5000);

				const cp = require('child_process');
				cp.exec(
					'sfdx force:org:open -u "' + orgName + '"',
					{ cwd: utils.getPath() },
					function (output: any, error: any) {
						openOrg(output, error);
					});
			}
		});

		/** Opens an org and performs other future activities. */
		function openOrg(output: string, error: string) {
			console.log(output);
			console.log(error);
		}

	}
}