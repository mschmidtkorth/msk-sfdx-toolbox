import * as vscode from 'vscode'; // VS Code Extension API
import { window, workspace, commands, ExtensionContext, QuickPick, QuickInputButtons, QuickInputButton, QuickPickItem, QuickPickOptions } from 'vscode';
import child_process = require('child_process'); // Provides exec()
import Utils from '../utils/utils';
import { validateChanges } from './validateChanges';


export enum OrgType { Scratch = 'Scratch Orgs', DevHub = 'Dev Hubs', ScratchDev = 'Scratch Orgs and Dev Hubs' };
export enum Operation { Open, Delete, Validate };
/**
 * Provides a QuickPick with all available Scratch Org and Dev Hub instances incl. their expiration date.
 * @author Michael Schmidt-Korth <mschmidtkorth@salesforce.com>
 */
export function listAllOrgs(type: OrgType, operation: Operation) {
	var utils = new Utils();

	vscode.window.setStatusBarMessage('Loading all ' + type.valueOf() + '...', 5000);

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

		console.log('Getting all usernames...');
		var userAlias: string[] = [];
		if (jsonOutput.status === 0) {
			if (type === OrgType.DevHub || type === OrgType.ScratchDev) {
				// All orgs could be stored in associative array if needed
				for (var i = 0; i < jsonOutput.result.nonScratchOrgs.length; i++) { // Dev Hubs
					var alias = jsonOutput.result.nonScratchOrgs[i].alias;
					userAlias.push(
						'DevHub#' +
						((typeof alias !== 'undefined') ? alias : '') + '#' +
						jsonOutput.result.nonScratchOrgs[i].username);
				}
			}
			if (type === OrgType.Scratch || type === OrgType.ScratchDev) {
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
			}
		} else {
			vscode.window.showErrorMessage('No Scratch Orgs found.');
		}
		// Create an associative array from userAlias
		var userAliasAssociative = userAlias.map(function (value, key, array) {
			var userAliasElements = userAlias[key].split('#');
			return {
				label: ((userAliasElements[0] == 'ScratchOrg') ? '$(gear) ' : '$(home) ') + userAliasElements[1],
				description: userAliasElements[2],
				detail: userAliasElements[3]
			};
		});

		console.log('Displaying usernames...');
		window.showQuickPick(userAliasAssociative, { placeHolder: 'Select an org to open', matchOnDescription: true }).then(returnValue => {
			if (returnValue != null) { // Otherwise error "returnValue is possibly 'undefined'"
				let orgName = returnValue.description.replace('$(gear) ', '').replace('$(home) ', '');

				if (operation === Operation.Delete) {
					vscode.window.setStatusBarMessage('Deleting org ' + orgName + '...', 5000);
					deleteOrg(orgName); // TODO Move to separate file
				} else if (operation === Operation.Validate) {
					vscode.window.setStatusBarMessage('Validating against org ' + orgName + '...', 5000);
					validateChanges(orgName); // validateChanges.ts
				} else {
					vscode.window.setStatusBarMessage('Opening org ' + orgName + '...', 5000);
					openOrg(orgName); // TODO Move to separate file
				}
			}
		});
	}

	/** Opens any org. */
	function openOrg(orgName: string) {
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
			window.showInformationMessage('Org ' + orgName + ' has been opened.');
		}
	}

	/** Deletes a Scratch Org. */
	function deleteOrg(orgName: string) {
		const cp = require('child_process');

		window.showQuickPick(['YES, delete this Scratch Org ' + orgName + ' permanently.'], { placeHolder: 'Do you really want to delete Scratch Org ' + orgName + '?' }).then(confirmed => {
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
			window.showInformationMessage('Scratch Org ' + orgName + ' has been deleted.');
		}
	}
}