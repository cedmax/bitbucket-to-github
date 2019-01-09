# Migrate Bitbucket repos to Github private repos

Please make sure you read the [safety information](https://github.com/cedmax/bitbucket-to-github#safety-information) before proceeding: there's an edge case that could expose your private repos.

## Configuration

1. Copy `env` to `.env`

2. Go to `https://bitbucket.org/account/user/{USERNAME}/app-passwords` and create an app password with read on repositories as the only permission

3. Fill your `.env` file with the relevant bitbucket data

4. Go to `https://github.com/settings/tokens/new` and generate a new token with all the repo permissions.

5. Fill your `.env` file with the relevant github data

## Launch

You'll need node and yarn installed

`> yarn && yarn start`

## Extra

#### Advanced Configuration

If you wanted to change the email you used in bitbucket during the migration (or the name of your user) you could also fill the `OLD_EMAIL`, `CORRECT_NAME`, `CORRECT_EMAIL` in the `.env` file. [More information about this option](https://help.github.com/articles/changing-author-info/)

#### Safety Information

- The Github repos are always created as private.
- If a Github repo with the same name exists and has existing commits is left untouched.
- If a **Github repo with the same name and no previous history exists**, the Bitbucket **content gets pushed WITHOUT checking wether is private or not**.
- The Bitbucket repos don't get deleted.

#### Todo

I haven't tried it with a repo having multiple branches.
