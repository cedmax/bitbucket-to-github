const fs = require("fs");
var rimraf = require("rimraf");
const git = require("simple-git/promise");

const BUSER = process.env.BITBUCKET_USER;
const GUSER = process.env.GITHUB_USER;

module.exports = async name => {
  const folder = fs.mkdtempSync(`.tmp-${name}`);
  try {
    await git().clone(`git@bitbucket.org:${BUSER}/${name}.git`, folder, {
      "--bare": "",
    });
    if (process.env.OLD_EMAIL) {
      await git(folder).raw([
        "filter-branch",
        "--env-filter",
        `
        OLD_EMAIL="${process.env.OLD_EMAIL}"
        CORRECT_NAME="${process.env.CORRECT_NAME}"
        CORRECT_EMAIL="${process.env.CORRECT_EMAIL}"
        
        if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
        then
            export GIT_COMMITTER_NAME="$CORRECT_NAME"
            export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
        fi
        if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
        then
            export GIT_AUTHOR_NAME="$CORRECT_NAME"
            export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
        fi
      `,
        "--tag-name-filter",
        "cat",
        "--",
        "--branches",
        "--tags",
      ]);
    }

    await git(folder).addRemote(
      "github",
      `git@github.com:${GUSER}/${name}.git`
    );

    await git(folder).push("github", "--all");
    rimraf.sync(folder);
  } catch (e) {
    console.log(e);
    rimraf.sync(folder);
  }
};
