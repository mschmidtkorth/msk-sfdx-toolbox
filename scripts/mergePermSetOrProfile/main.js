/**
 * Executes logic to merge two permission sets.
 * Takes two input parameters where the first is the source permission set
 * and the second is the target one.
 *
 * Usage:
 *      node permSetMain.js PATH_TO_SOURCE_PERM_SET PATH_TO_DEST_PERM_SET
 */
const utils = require("../commons/fs-utils.js");
const sfdcMergers = require("./mergers.js");

/**
 * Executes the logic to merge two permission sets. All permissions from
 * the source will be merged into the destination one.
 * In case merge conflicts happen, a warning message will be displayed to the user.
 * @param {String} theirsPath Path of the source permission set
 * @param {String} oursPath Path of the destination permission set
 */
async function run(theirsPath, oursPath) {
  let theirsJson = await utils.readXmlFileAndConvertToJson(theirsPath);
  let oursJson = await utils.readXmlFileAndConvertToJson(oursPath);
  let merger;

  if (
    theirsJson.hasOwnProperty("PermissionSet") &&
    oursJson.hasOwnProperty("PermissionSet")
  ) {
    // both files are permission set
    merger = new sfdcMergers.PermissionSetMerger(theirsJson, oursJson);
  } else if (
    theirsJson.hasOwnProperty("Profile") &&
    oursJson.hasOwnProperty("Profile")
  ) {
    // both files are profile
    merger = new sfdcMergers.ProfileMerger(theirsJson, oursJson);
  } else {
    throw new Error(
      "Files must of of same type! Valid types are Profile or Permission Set"
    );
  }

  if (merger.mergeTheirsIntoOurs()) {
    // conflicts!
    console.log(
      "WARNING: There are some merge conflicts. Before pushing solve them."
    );
  } else {
    console.log("SUCCESS: permission sets merged successfully.");
  }

  oursJson = merger.getMergeResult();

  await utils.convertJsonToXmlAndWriteToFile(oursJson, oursPath);
}

// checks input parameters
if (process.argv.length < 4) {
  throw new Error("You have to specify a Source file and a Target file");
}

run(process.argv[2], process.argv[3]);