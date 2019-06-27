import * as vscode from 'vscode'; // VS Code Extension API
import path = require('path');
import { Md5 } from 'ts-md5/dist/md5';

/**
 * Provides common helper functions.
 * @author Michael Schmidt-Korth
 */
export default class Utils {
	/** Extract file name from path. */
	getFileName(file: string): string {
		var forwardSlash = file.lastIndexOf("/");
		var backSlash = file.lastIndexOf("\\");
		if (forwardSlash === -1 && backSlash === -1) {
			return file;
		}

		return file.substring((forwardSlash > backSlash) ? forwardSlash + 1 : backSlash + 1);
	}

	/** Retrieve the working directory. */
	getPath() {
		var PATH: any;
		if (typeof vscode.workspace.getConfiguration('msk') == 'undefined') {
			PATH = vscode.workspace.rootPath; // e.g. '/Users/mschmidtkorth/SFDX/Hilti/evolution'
		} else {
			const mskConfig = vscode.workspace.getConfiguration('msk');
			PATH = mskConfig.get('defaultWorkingDirectory');
		}

		return PATH;
	}

	/** Calculate difference in days between dates. */
	calculateDayDifference(date: Date): number {
		var diff = Math.abs(new Date().getTime() - date.getTime());

		return Math.ceil(diff / (1000 * 3600 * 24));
	}

	/** Generates MD5 hash from a list of files and flushes the cache if the hash changed - i.e. a new Org has been created, deleted, modified (inside or outside of VS Code) and we need to re-build our cache.
	Alternative options to expire the cache:
	- Time-based, e.g.every 15 minutes (parameter to mskCache.put(key, timeInSeconds)).
	- Listening to org:create is not possible as it may run inside or outside of VSC
	*/
	// Minor issue: If orgs have been changed, cache will be cleared but asynchronously, so listOrgs will for the first time after flushing still show the cached results.
	// Mac/Unix: ~/.sfdx, Windows: %USERPROFILE%\.sfdx

	// findfiles in home with contains @ - only then add it to our list to be hashed
	refreshCacheIfOrgsChanged(mskCache: any) {
		let previousHash = mskCache.get('orgListHash');

		// todo fs.exists async
		let sfdxPath = path.join(require('os').homedir(), '/.sfdx/');
		//		path.join(this.getPath(), '/.sfdx/orgs/')

		const fs = require('fs');
		fs.readdir(sfdxPath, function (err: Error, files: string[] | Buffer[]) {
			let cleanedFiles: string[] = [];
			for (let file of files) {
				if (file.toString().includes('@')) // sfdx homedir folder contains other files as well
					cleanedFiles.push(file.toString());
			}

			// Hash the list of files
			mskCache.put('orgListHash', Md5.hashStr(cleanedFiles.toString()));

			let currentHash = mskCache.get('orgListHash');

			// If undefined, first execution of listOrgs()
			if (typeof previousHash !== 'undefined' && previousHash !== currentHash) {
				console.log('Orgs have changed (' + previousHash + ' vs. ' + currentHash + '), flushing cache...');
				mskCache.flush();
			}
		});
	}
}