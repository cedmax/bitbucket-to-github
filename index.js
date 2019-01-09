require("dotenv").config();
const cloneAndPush = require("./git");
const Octokit = require("@octokit/rest");
const Bitbucket = require("bitbucket");
const octokit = new Octokit();
const bitbucket = new Bitbucket();

bitbucket.authenticate({
  type: "basic",
  username: process.env.BITBUCKET_USER,
  password: process.env.BITBUCKET_PSW,
});

octokit.authenticate({
  type: "oauth",
  token: process.env.GITHUB_TOKEN,
});

const createRepo = async name => {
  await octokit.request("POST /user/repos", {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
    data: {
      name: name,
      private: true,
    },
  });
};

const repoExists = async name => {
  const { data } = await octokit.repos.get({
    owner: process.env.GITHUB_USER,
    repo: name,
    headers: {
      "cache-control": "no-cache",
    },
  });

  try {
    const commits = await octokit.request(`GET ${data.commits_url}`);
    return true;
  } catch (e) {
    return false;
  }
};

const createReposInGithub = async repos => {
  try {
    for (var repo of repos) {
      const name = repo.name.replace(/\//g, "-");
      console.log(`now processing: ${name}`);
      try {
        const exists = await repoExists(name);
        if (exists) {
          console.log(
            `https://github.com/${
              process.env.GITHUB_USER
            }/${name} exists already, skipping`
          );
          continue;
        }
      } catch (e) {
        await createRepo(name);
      }
      cloneAndPush(name);
    }
  } catch (e) {
    console.log(e);
  }
};

const getBitbucketRepos = async () => {
  try {
    const { data } = await bitbucket.repositories.list({
      username: process.env.BITBUCKET_USER,
      pagelen: 100,
    });
    return data.values;
  } catch (e) {
    console.log(e);
  }
};

const getRelevantRepos = repos =>
  repos.filter(({ is_private }) => is_private).map(({ name }) => ({ name }));

(async () => {
  const results = await getBitbucketRepos();
  const repos = getRelevantRepos(results);
  createReposInGithub(repos);
})();
