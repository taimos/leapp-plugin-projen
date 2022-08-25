const { cdk, javascript, github, DevEnvironmentDockerImage } = require('projen');

const project = new cdk.JsiiProject({
  name: '@taimos/projen-leapp-plugin',
  authorAddress: 'info@taimos.de',
  authorName: 'Thorsten Hoeger',
  authorOrganization: true,
  copyrightOwner: 'Taimos GmbH',
  copyrightPeriod: '2020',
  repository: 'https://github.com/taimos/leapp-plugin-projen.git',
  defaultReleaseBranch: 'main',
  peerDeps: [
    'projen',
  ],
  devDeps: [
    'projen',
  ],
  license: 'Apache-2.0',
  licensed: true,
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
  gitpod: true,
  autoApproveUpgrades: true,
  autoApproveOptions: { allowedUsernames: ['hoegertn', 'taimos-projen[bot]'], secret: 'GITHUB_TOKEN' },
  githubOptions: {
    projenCredentials: github.GithubCredentials.fromApp(),
  },
});

project.gitpod.addDockerImage(DevEnvironmentDockerImage.fromImage('taimos/gitpod'));
project.gitpod.addCustomTask({
  init: 'yarn install --check-files --frozen-lockfile',
  command: 'npx projen build',
});

project.synth();