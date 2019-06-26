# MSK sfdx Toolbox
[![sfdx](https://img.shields.io/badge/cli-sfdx-brightgreen.svg)](https://developer.salesforce.com/tools/sfdxcli)
[![sfdx](https://vsmarketplacebadge.apphb.com/version-short/mischmiko.msk-sfdx-toolbox.svg)](https://marketplace.visualstudio.com/items?itemName=mischmiko.msk-sfdx-toolbox)
[![sfdx](https://img.shields.io/github/issues-raw/mschmidtkorth/msk-sfdx-toolbox.svg)](https://github.com/mschmidtkorth/msk-sfdx-toolbox/issues)
[![sfdx](https://img.shields.io/badge/license-MOZ-brightgreen.svg)](https://github.com/mschmidtkorth/msk-sfdx-toolbox/blob/master/LICENSE)

Simplifies development with Salesforce DX.

This extension is **WORK IN PROGRESS**.

## Features
- Open up any Scratch Org or Dev Hub and check their expiration date. This allows you to quickly switch between all authorized orgs.
- Delete any Scaratch Org.
- Intelligently compare Permission Sets or Profiles between your current branch and the master branch and generate a merge file (makes use of `mergeProfileOrPermSet.sh`). This allows you to check for conflicts and provide a merged file before pushing your changes.
- Validate your local changes against a default Scratch Org (alias: `VALIDATE`) or Sandbox before pushing them to remote.

<!-- Image:
\!\[feature X\]\(images/feature-x.png\)
> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

## Requirements
- Install `mergeProfileOrPermSet.sh`.

<!-- ## Known Issues
Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Other Notes
Logo taken from [Salesforce](https://partners.salesforce.com/s/education/general/Salesforce_DX).