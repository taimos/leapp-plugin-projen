import { join } from 'path';
import { typescript, TextFile, Task, SampleFile } from 'projen';

export interface LeappPluginConfig {
  readonly supportedOS?: string[];
  readonly supportedSessions?: string[];
}

export interface LeappPluginProjectOptions extends typescript.TypeScriptProjectOptions {
  readonly pluginConfig?: LeappPluginConfig;
}

/**
 * Leapp plugin project
 *
 * @pjid leapp-plugin
 */
export class LeappPluginProject extends typescript.TypeScriptProject {

  public readonly deployTask: Task;

  constructor(options: LeappPluginProjectOptions) {
    super({
      ...options,
      keywords: ['leapp-plugin', ...options.keywords ?? []],
      devDeps: [
        'ts-loader',
        'webpack',
        'webpack-cli',
        ...options.devDeps ?? [],
      ],
      deps: [
        '@noovolari/leapp-core',
        ...options.deps ?? [],
      ],
      sampleCode: false,
    });

    this.gitignore.exclude('plugin.js');
    this.package.addField('files', ['plugin.js']);
    this.package.addField('leappPlugin', {
      supportedOS: options.pluginConfig?.supportedOS ?? [
        'mac',
        'windows',
        'linux',
      ],
      supportedSessions: options.pluginConfig?.supportedSessions ?? [
        'awsIamRoleFederated',
        'awsIamRoleChained',
        'awsSsoRole',
        'awsIamUser',
        'aws',
        'azure',
      ],
    });

    const webpackConfig = new TextFile(this, 'webpack.config.js');
    webpackConfig.addLine(`const path = require('path');

module.exports = {
  mode: 'none',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname),
    filename: 'plugin.js',
    library: {
      type: 'commonjs2',
    },
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
`);

    new SampleFile(this, join(this.srcdir, 'index.ts'), { sourcePath: join(__dirname, '..', 'samplecode', 'plugin.ts.sample') });
    new SampleFile(this, join(this.testdir, 'index.test.ts'), { sourcePath: join(__dirname, '..', 'samplecode', 'test.ts.sample') });

    this.projectBuild.compileTask.reset('webpack --config webpack.config.js');

    this.deployTask = this.addTask('deploy');
    this.deployTask.spawn(this.buildTask);
    this.deployTask.exec(`mkdir -p ~/.Leapp/plugins/${options.name} && cp plugin.js package.json ~/.Leapp/plugins/${options.name}/`);
  }

}