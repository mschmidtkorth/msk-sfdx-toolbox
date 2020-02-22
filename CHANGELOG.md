# Changelog

## 1.1.8

### Fixed

- **>MSK: Open Current File In Org** Improved file handling
- Updated general notifications to disappear automatically
- Improved path handling


## 1.1.7

### Added

- New command **>MSK: Show Help for File In Org**: Show the Metadata API help for the currently opened file.

### Fixed

- **>MSK: Open Current File In Org** Command was not working when initiated via Command Palette


## 1.1.6

### Added

- **>MSK: Compare Permissions** Improved merge markers to be recognized by VS Code and added auto-jump to first marker


## 1.1.5

### Added

- **>MSK: Compare Permissions** Added selection of branch to compare with


## 1.1.4

### Modified

- Updated instructions and Readme


## 1.1.3

### Modified

- Replaced `mergeProfileOrPermSet.sh` with `mergeProfileOrPermSet.js` to make it OS-agnostic


## 1.1.0

### Added

- Bundled `mergeProfileOrPermSet.sh` with extension


## 1.0.3

### Added

- Context menu entries for **>MSK: Open Current File In Org** and **>MSK: Compare Permissions** when right-clicking a file
- View button/icon for **>MSK: Open Current File In Org** when opening a file (top right)


## 1.0.2

### Added

- New command **>MSK: Open Current File In Org**: Show the currently opened file in your Salesforce org


## 1.0.1

### Modified

- Improved user notifications
- Code cleanup


## 1.0.0

### Modified

- Code cleanup


## 0.0.5

Feature-completion.

### Modified

- Selection of any org to validate against


## 0.0.4

### Added

- New command **>MSK: Delete Scratch Org**: Delete a Scratch Org (instead of opening it)
- New command **>MSK: Validate Changes**: Validate a deployment against a Scratch Org or Sandbox


## 0.0.3

### Added

- Keyboard shortcuts and context bindings to improve UX
- Actions on notification messages
- Check for mergeProfileOrPermSet.sh

### Removed

- `msk.listPermissions` which is included in `msk.comparePermissions`


## 0.0.2

### Added

- New command **>MSK: Open Org**: Open a Scratch Orgs or Dev Hub
- Setting to define default working directory


## 0.0.1

- Initial release

### Added

- New command **>MSK: Compare Permissions**: Compare permission files between your current branch and `master`