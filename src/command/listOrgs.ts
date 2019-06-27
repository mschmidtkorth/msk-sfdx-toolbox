import * as vscode from 'vscode'; // VS Code Extension API
import { window, workspace, commands, ExtensionContext, QuickPick, QuickInputButtons, QuickInputButton, QuickPickItem, QuickPickOptions } from 'vscode';
import child_process = require('child_process'); // Provides exec()
import Utils from '../utils/utils';
import { validateChanges } from './validateChanges';
import { openOrg } from './helper/openOrg';
import { deleteOrg } from './helper/deleteOrg';

export enum OrgType { Scratch = 'Scratch Orgs', DevHub = 'Dev Hubs', ScratchDev = 'Scratch Orgs and Dev Hubs' }
export enum Operation { Open, Delete, Validate }
/**
 * Provides a QuickPick with all available Scratch Org and Dev Hub instances incl. their expiration date.
 * @author Michael Schmidt-Korth <mschmidtkorth@salesforce.com>
 */
export function listAllOrgs(type: OrgType, operation: Operation, context: vscode.ExtensionContext) {
	var utils = new Utils();

	vscode.window.setStatusBarMessage('Loading all ' + type.valueOf() + '...', 5000);

	const Cache = require('vscode-cache');
	let mskCache = new Cache(context);

	utils.refreshCacheIfOrgsChanged(mskCache);

	const cp = require('child_process');
	// force:auth:list is faster than force:org:list, but does not (yet) return the type of an org (DevHub, Scratch Org)
	if (!mskCache.has('orgList')) {
		console.log('Org list has not been cached, retrieving...');
		cp.exec(
			'sfdx force:org:list --json',
			{ cwd: utils.getPath() },
			function (error: any, output: any) {
				listOrgs(output, error);
			});
	} else {
		console.log('Org list has been cached.');
		listOrgs('', '');
	}
	/** List all Scratch Orgs and Dev Hubs. */
	function listOrgs(output: string, error: string) {
		console.log('Getting all usernames...');
		var userAlias: string[] = [];
		var userAliasAssociative: {
			label: string;
			description: string;
			detail: string;
		}[] = [{ label: '', description: '', detail: '' }]; // This is an object which is returned by Array.map(). We only need to instantiate it here as we might need to retrieve it from cache.

		if (mskCache.has('orgList')) {
			console.log('Retrieving cached org list (simple)...');

			userAlias = mskCache.get('orgList');
		} else {
			console.log('Retrieving org list (simple)...');
			const jsonOutput = JSON.parse(output);

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
				mskCache.put('orgList', userAlias);
			} else {
				vscode.window.showErrorMessage('No Scratch Orgs found.');
			}
		}

		if (mskCache.has('orgListAssociative')) {
			console.log('Retrieving cached org list (associative)...');
			userAliasAssociative = mskCache.get('orgListAssociative');
		} else {
			console.log('Retrieving org list (associative)...');
			// Create an associative array from userAlias
			/*var*/ userAliasAssociative = userAlias.map(function (value, key, array) {
				var userAliasElements = userAlias[key].split('#');
				return {
					label: ((userAliasElements[0] == 'ScratchOrg') ? '$(gear) ' : '$(home) ') + userAliasElements[1],
					description: userAliasElements[2],
					detail: userAliasElements[3]
				};
			});
			mskCache.put('orgListAssociative', userAliasAssociative);
		}

		console.log('Displaying usernames...');
		window.showQuickPick(userAliasAssociative, { placeHolder: 'Select an org to open', matchOnDescription: true }).then(returnValue => {
			if (returnValue != null) { // Otherwise error "returnValue is possibly 'undefined'"
				let orgName = returnValue.description.replace('$(gear) ', '').replace('$(home) ', '');

				if (operation === Operation.Delete) {
					vscode.window.setStatusBarMessage('Deleting org ' + orgName + '...', 5000);
					deleteOrg(orgName);
				} else if (operation === Operation.Validate) {
					vscode.window.setStatusBarMessage('Validating against org ' + orgName + '...', 5000);
					validateChanges(orgName);
				} else {
					vscode.window.setStatusBarMessage('Opening org ' + orgName + '...', 5000);
					openOrg(orgName);
				}
			}
		});
	}
}