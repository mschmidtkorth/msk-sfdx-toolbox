#!/bin/bash

#############################################################################################
#
# Used to merge a single file from current branch with the version in another branch
# Usage:
#   bash mergePermissionSet.sh OTHER_BRANCH PATH_TO_PERMISSION_SET
#
#############################################################################################

# checks command exit status. If exit status is not 0 then print the error message and exit
function check_exit_status {
    local exitStatus=$1
    local message="$2"

    if [ $exitStatus -ne 0 ]; then
        echo "$message"
        exit 1
    fi
}

# Checks that branch exists
function isBranchNameValid {
    local branchName="$1"

    git branch -r | grep -q "${branchName}" || git branch | grep -q "$branchName"

    check_exit_status $? "Error: branch does not exists!"
}

function isBranchClean {
    local dirty=`git status -s | wc -l`;
    if [ $dirty -ne 0 ]; then
        echo "Error: your workspace contains changes that haven't been committed."
        echo -e "\tPlease either commit or discard them."
        exit 1
    fi
}

# checks if file is a file
function isPermissionSet {
    local fileName="$1"

    # checks file is actually a file
    echo "$fileName" | grep -q "permissionset-meta\.xml$"

    return $?
}

# checks if file is a profile
function isProfile {
    local fileName="$1"

    # checks file is actually a file
    echo "$fileName" | grep -q "profile-meta\.xml$"

    return $?
}

# checks user is on the project root directory
function isOnProjectRootDirectory {
    test -f sfdx-project.json

    check_exit_status $? "Error: To run this script you have to be on the project root directory"
}

# print current branch
function getCurrentBranch {
    git rev-parse --abbrev-ref HEAD
}

# checkout the specified branch
function checkoutBranch {
    local branch="$1"

    # fetch all branches
    git fetch --all -q

    check_exit_status $? "Error: Git fetch failed!"

    git checkout -q "$branch"

    check_exit_status $? "Error: Git checkout ${branch} failed!"

    if [ "$2" = "pull" ]; then
        git pull -q

        check_exit_status $? "Error: Git pull failed!"
    fi
}

# move the file in the temporary folder used for the merge
function copyFileInTmpDirectory {
    local file="$1"

    if [ ! -d $TMP_DIR ]; then
        mkdir $TMP_DIR

        check_exit_status $? "Error: Impossible to create the tmp folder!"
    fi

    cp "$file" $TMP_DIR/

    check_exit_status $? "Error: Impossible to copy file in the merge folder!"
}

# checks for npm modules
function checksNodeModules {
    if [ ! -d node_modules/ ]; then
        echo "Installing required node modules. This might take a while..."
        npm install
        echo -e "\n\nInstallation completed.\n"
    fi
}

function deleteMergeDirectory {
    rm -rf $TMP_DIR
}

# executes the merge between the two versions
function executeMerge {
    local ours="$1"
    local fileName=`basename "$ours"`
    local theirs="${TMP_DIR}/${fileName}"

    if isPermissionSet "$ours" || isProfile "$ours"; then
        node utils/mergePermSetOrProfile/main.js "$theirs" "$ours"
    else
        echo "File has to be either a Profile or a Permission set"
        exit 1
    fi
}

# global variables
OTHER_BRANCH="$1"                   # target branch
FILE="$2"                       # file to merge
CURRENT_BRANCH=`getCurrentBranch`   # current branch
TMP_DIR="tmp"                       # temporary directory

# runs initial checks

if [ ! -f "$FILE" ]; then
    echo "ERROR: $FILE is not a valid file"
    exit 1
fi

isOnProjectRootDirectory

isBranchNameValid "$OTHER_BRANCH"

isBranchClean

# install npm modules if needed
checksNodeModules

# checkout the other branch
checkoutBranch "$OTHER_BRANCH" "pull"

# makes a copy of the permset we want to merge
copyFileInTmpDirectory "$FILE"

# go back to the original branch, where we want to do the merge
checkoutBranch "$CURRENT_BRANCH"

# execute the merge script
executeMerge "$FILE"

# remove merge directory
deleteMergeDirectory