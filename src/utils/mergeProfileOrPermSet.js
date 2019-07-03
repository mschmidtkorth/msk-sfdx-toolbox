const fs = require('fs');
const path = require('path');
const ASQ = require('asynquence');
const simpleGit = require('simple-git')('./'); // assumes current workspace is a GIT repo
const utils = require('../../scripts/commons/fs-utils');
const GenericMerger = require('../../scripts/mergePermSetOrProfile/mergers/GenericMerger');

const TMP_DIR = 'tmp';

module.exports = function run(branch, filePath) {
  return new Promise((resolve, reject) => {
    let currentBranch = '';
    let mergeResult;

    ASQ(42)
      .then(function isBranchNameValid(done) {
        simpleGit.branch(function(error, res) {
          if (error) {
            done.fail(error);
          } else if (res.all.indexOf(branch) > -1) {
            currentBranch = res.current;
            done();
          } else {
            done.fail(`ERROR: ${branch} is not a valid branch`);
          }
        });
      })
      .then(function isBranchClean(done) {
        simpleGit.status(function(error, res) {
          if (error) {
            done.fail(error);
          } else if (res.isClean()) {
            done();
          } else {
            done.fail(
              "ERROR:  your workspace contains changes that haven't been committed"
            );
          }
        });
      })
      .then(function checkoutOtherBranch(done) {
        simpleGit.checkout(branch, function(err, res) {
          if (err) {
            done.fail(err);
          } else {
            done();
          }
        });
      })
      .then(function pull(done) {
        simpleGit.pull(function(err, res) {
          if (err) {
            done.fail(err);
          } else {
            done();
          }
        });
      })
      .then(function copyFileInTmpDirectory(done) {
        const fileName = path.basename(filePath);
        if (!fs.existsSync(TMP_DIR)) {
          fs.mkdirSync(TMP_DIR);
        }
        fs.copyFileSync(filePath, path.join(TMP_DIR, fileName));
        done();
      })
      .then(function goBackToPreviousBranch(done) {
        simpleGit.checkout(currentBranch, function(err, res) {
          if (err) {
            done.fail(res);
          } else {
            done();
          }
        });
      })
      .then(async function executeMerge(done) {
        const fileName = path.basename(filePath);
        const theirsPath = path.join(TMP_DIR, fileName);

        let theirsJson = await utils.readXmlFileAndConvertToJson(theirsPath);
        let oursJson = await utils.readXmlFileAndConvertToJson(filePath);

        let merger = new GenericMerger(theirsJson, oursJson);

        mergeResult = merger.mergeTheirsIntoOurs();

        oursJson = merger.getMergeResult();

        await utils.convertJsonToXmlAndWriteToFile(oursJson, filePath);

        done(theirsPath);
      })
      .then(function removeTmpDir(done, theirsPath) {
        fs.unlinkSync(theirsPath);
        fs.rmdirSync(TMP_DIR);
        resolve(mergeResult);
        done();
      })
      .or(function(err) {
        // goes back on current branch
        if (currentBranch) {
          simpleGit.checkout(currentBranch);
        }

        if (typeof err === 'string') {
          reject(new Error(err));
        } else {
          reject(err);
        }
      });
  });
};
