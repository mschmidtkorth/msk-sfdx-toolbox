const fs = require('fs');
const path = require('path');
const ASQ = require('asynquence');
const simpleGit = require('simple-git');
const utils = require('../../scripts/commons/fs-utils');
const GenericMerger = require('../../scripts/mergePermSetOrProfile/mergers/GenericMerger');

export default class MergeProfileOrPermSet {
  repoPath: (string | undefined);

  constructor(repoPath: string | undefined) {
    this.repoPath = repoPath;
  }

  run(branch: string, filePath: string): Promise<{ conflicts: any }> {

    return new Promise((resolve, reject) => {
      let currentBranch = '';
      let git = simpleGit(this.repoPath);
      const TMP_DIR = path.join(this.repoPath, 'tmp');

      ASQ(42)
        .then(function isBranchNameValid(done: any) {
          git.branch(function (error: any, res: any) {
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
        .then(function isBranchClean(done: any) {
          git.status(function (error: any, res: any) {
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
        .then(function checkoutOtherBranch(done: any) {
          git.checkout(branch, function (err: any, res: any) {
            if (err) {
              done.fail(err);
            } else {
              done();
            }
          });
        })
        .then(function pull(done: any) {
          git.pull(function (err: any, res: any) {
            if (err) {
              done.fail(err);
            } else {
              done();
            }
          });
        })
        .then(function copyFileInTmpDirectory(done: any) {
          const fileName = path.basename(filePath);
          if (!fs.existsSync(TMP_DIR)) {
            fs.mkdirSync(TMP_DIR);
          }
          fs.copyFileSync(filePath, path.join(TMP_DIR, fileName));
          done();
        })
        .then(function goBackToPreviousBranch(done: any) {
          git.checkout(currentBranch, function (err: any, res: any) {
            if (err) {
              done.fail(res);
            } else {
              done();
            }
          });
        })
        .then(async function executeMerge(done: any) {
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
        .then(function removeTmpDir(done: any, theirsPath: string, mergeResult: any) {
          fs.unlinkSync(theirsPath);
          fs.rmdirSync(TMP_DIR);
          resolve({
            conflicts: mergeResult
          });
          done();
        })
        .or(function (err: any) {
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
