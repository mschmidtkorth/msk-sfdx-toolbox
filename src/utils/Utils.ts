import * as vscode from 'vscode'; // VS Code Extension API
const path = require('path');
const fs = require('fs');
const md5 = require('ts-md5/dist/md5');
const os = require('os');

/**
 * Provides common helper functions.
 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
 */
export default class Utils {
	/**
	 * Extract file name from path.
     * @param path - Path to a file.
     * @returns `string` Name of file.
	 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
	 */
	getFileName(path: string): string {
		var forwardSlash = path.lastIndexOf("/");
		var backSlash = path.lastIndexOf("\\");
		if (forwardSlash === -1 && backSlash === -1) {
			return path;
		}

		return path.substring((forwardSlash > backSlash) ? forwardSlash + 1 : backSlash + 1);
	}

	/**
	 * Retrieve the working directory - from configuration or default.
	 * @returns `string` Path of working directory.
	 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
	 */
	getPath(): string {
		var PATH: any;
		if (typeof vscode.workspace.getConfiguration('msk') == 'undefined') {
			PATH = vscode.workspace.rootPath; // e.g. '/Users/mschmidtkorth/SFDX/Hilti/evolution'
		} else {
			const mskConfig = vscode.workspace.getConfiguration('msk');
			PATH = mskConfig.get('defaultWorkingDirectory');
		}

		return PATH.toString();
	}

	/**
	 * Calculate difference between a date and today.
     * @param date - Future data.
	 * @returns `number` Days between the date and todays.
	 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
	 */
	calculateDayDifference(date: Date): number {
		var diff = Math.abs(new Date().getTime() - date.getTime());

		return Math.ceil(diff / (1000 * 3600 * 24));
	}

	/**
	* Generate MD5 hash from a list of files and flushes the cache if the hash changed - i.e. a new Org has been  created, deleted, modified (inside or outside of VS Code) and we need to re-build our cache.
	 * @privateRemarks Alternative options to expire the cache:
	 * - Time-based, e.g.every 15 minutes (parameter to mskCache.put(key, timeInSeconds)).
	 * - Listening to org:create is not possible as it may run inside or outside of VSC
	 *
	* *Minor issue:* If orgs have been changed, cache will be cleared but asynchronously, so listOrgs will for the  first time after flushing still show the cached results.
	 * @param mskCache - Cache to use.
	 * @author Michael Schmidt-Korth mschmidtkorth(at)salesforce.com
	 */
	refreshCacheIfOrgsChanged(mskCache: any) {
		let previousHash = mskCache.get('orgListHash');

		let sfdxPath = path.join(os.homedir(), '/.sfdx/'); // SFDX config is stored ata: Mac/Unix: ~/.sfdx, Windows: %USERPROFILE%\.sfdx
		// path.join(this.getPath(), '/.sfdx/orgs/')

		fs.readdir(sfdxPath, function (err: Error, files: string[] | Buffer[]) {
			let cleanedFiles: string[] = [];
			for (let file of files) {
				if (file.toString().includes('@')) // sfdx homedir folder contains other files as well
					cleanedFiles.push(file.toString());
			}

			// Hash the list of files
			mskCache.put('orgListHash', md5.hashStr(cleanedFiles.toString()));

			let currentHash = mskCache.get('orgListHash');

			// If undefined, first execution of listOrgs()
			if (typeof previousHash !== 'undefined' && previousHash !== currentHash) {
				console.log('Orgs have changed (' + previousHash + ' vs. ' + currentHash + '), flushing cache...');
				mskCache.flush();
			}
		});
	}
}