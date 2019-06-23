import * as vscode from 'vscode'; // VS Code Extension API
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
}