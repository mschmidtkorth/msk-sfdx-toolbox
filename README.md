# MSK sfdx Toolbox

[![sfdx](https://img.shields.io/badge/cli-sfdx-brightgreen.svg)](https://developer.salesforce.com/tools/sfdxcli)
[![sfdx](https://vsmarketplacebadge.apphb.com/version-short/mischmiko.msk-sfdx-toolbox.svg)](https://marketplace.visualstudio.com/items?itemName=mischmiko.msk-sfdx-toolbox)
[![sfdx](https://img.shields.io/github/issues-raw/mschmidtkorth/msk-sfdx-toolbox.svg)](https://github.com/mschmidtkorth/msk-sfdx-toolbox/issues)
[![sfdx](https://img.shields.io/badge/license-MOZ-brightgreen.svg)](https://github.com/mschmidtkorth/msk-sfdx-toolbox/blob/master/LICENSE)

Simplifies development with Salesforce DX.

## Features

- **>MSK: Open Org** *Open any Scratch Org, Sandbox or Dev Hub in the browser or display its expiration date.* This allows you to quickly switch between all authorized orgs.
- **>MSK: Open Current File In Org** *Show the currently opened file in your Salesforce org via your browser (e.g. `Account-Account Layout.layout-meta.xml` opens the Page Layout Editor).* This allows you to quickly confirm how the XML files is represented in the Salesforce org.
- **>MSK: Delete Scratch Org** *Delete any Scratch Org.*
- **>MSK: Compare Permissions** *Intelligently compare Permission Sets or Profiles between your current branch and the `master` branch and generate a merge file.* This allows you to check for conflicts and provide a merged file before pushing your changes (uses `mergeProfileOrPermSet.sh`).
- **>MSK: Validate Changes** *Validate your local changes against any Scratch Org or Sandbox.* This allows you to check your changes before pushing them to remote.

<!-- Image:
\!\[feature X\]\(images/feature-x.png\)
> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

<!-- ## Known Issues
Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Setup

1. Open *Command Palette > Preferences: Open Settings (UI)*
2. Search for "MSK"
3. Configure `Default Compare Script Directory` and `Default Working Directory`
4. Execute any command via *Command Palette > MSK*
5. **>MSK: Open Current File In Org** and **>MSK: Compare Permissions** can also be executed via the right-click context menu for any open file.

## Requirements

- **>MSK: Compare Permissions** Install `mergeProfileOrPermSet.sh`.

## Other Notes

Logo taken from [Salesforce](https://partners.salesforce.com/s/education/general/Salesforce_DX).
