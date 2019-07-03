const fs = require('fs');
const path = require('path');
const ASQ = require('asynquence');
const simpleGit = require('simple-git');
const utils = require('../../scripts/commons/fs-utils');
const GenericMerger = require('../../scripts/mergePermSetOrProfile/mergers/GenericMerger');

export default class MergeProfileOrPermSet {
  repoPath;
  
  constructor(repoPath) {
    this.repoPath = repoPath;
  }

  run(branch, filePath) {

    return new Promise((resolve, reject) => {
      let currentBranch = '';
      let git = simpleGit(this.repoPath);
      const TMP_DIR = path.join(this.repoPath, 'tmp');

      ASQ(42)
        .then(function isBranchNameValid(done) {
          git.branch(function(error, res) {
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
          git.status(function(error, res) {
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
          git.checkout(branch, function(err, res) {
            if (err) {
              done.fail(err);
            } else {
              done();
            }
          });
        })
        .then(function pull(done) {
          git.pull(function(err, res) {
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
          git.checkout(currentBranch, function(err, res) {
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

          const merger = new GenericMerger(theirsJson, oursJson);

          const mergeResult = merger.mergeTheirsIntoOurs();

          oursJson = merger.getMergeResult();

          await utils.convertJsonToXmlAndWriteToFile(oursJson, filePath);

          done(theirsPath, mergeResult);
        })
        .then(function removeTmpDir(done, theirsPath, mergeResult) {
          fs.unlinkSync(theirsPath);
          fs.rmdirSync(TMP_DIR);
          resolve({
            conflicts: mergeResult
          });
          done();
        })
        .or(function(err) {
          // goes back on current branch
          if (currentBranch) {
            git.checkout(currentBranch);
          }

          if (typeof err === 'string') {
            reject(new Error(err));
          } else {
            reject(err);
          }
        });
    });
  }
}
