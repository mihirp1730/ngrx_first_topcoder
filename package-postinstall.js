const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const postInstallScripts = [];

/*
 * Only run `ngcc` when we have builds to compile the Angular frontend.
 * We do not need all of the frontend dependencies for backend build
 * artifacts, so `ngcc` may not exist due to `npm ci --only=production`.
 * This will only run if ngcc exists i.e. build.sh vs dist.Dockerfile
 */
postInstallScripts.push(new Promise((resolve, reject) => {
  const nodeModules = join(__dirname, 'node_modules');
  const ngcc = join(nodeModules, '.bin', /^win/.test(process.platform) ? 'ngcc.cmd' : 'ngcc');
  // If `ngcc` does not exist, then assume production install and quit.
  if (!existsSync(ngcc)) {
    return resolve();
  }
  // Otherwise `ngcc` does exist, so run it with its args and options.
  const args = ['--properties', 'es2015', 'browser', 'module', 'main', '--first-only'];
  const options = { cwd: __dirname, stdio: 'inherit' };
  spawn(ngcc, args, options)
    .on('error', (err) => reject(err))
    .on('close', (code) => code ? reject() : resolve());
}));

/*
 * Only build `server-data-packages-vendor` proto when we are in a non-
 * production environment i.e. developing/running locally, testing,
 * linting or building production images.
 */
postInstallScripts.push(new Promise((resolve, reject) => {
  const nx = /^win/.test(process.platform) ? 'nx.cmd' : 'nx';
  // If `nx` does not exist, then assume production install and quit.
  if (!existsSync(join(__dirname, 'node_modules', '.bin', nx))) {
    return resolve();
  }
  const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'
  const args = ['run', 'nx', '--', 'run', 'server-data-packages-vendor:build-proto'];
  const options = { cwd: __dirname, stdio: 'inherit' };
  spawn(npm, args, options)
    .on('error', (err) => reject(err))
    .on('close', (code) => code ? reject() : resolve());
}));

postInstallScripts.push(new Promise((resolve, reject) => {
  const nx = /^win/.test(process.platform) ? 'nx.cmd' : 'nx';
  // If `nx` does not exist, then assume production install and quit.
  if (!existsSync(join(__dirname, 'node_modules', '.bin', nx))) {
    return resolve();
  }
  const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'
  const args = ['run', 'nx', '--', 'run', 'server-opportunity-attendee:build-proto'];
  const options = { cwd: __dirname, stdio: 'inherit' };
  spawn(npm, args, options)
    .on('error', (err) => reject(err))
    .on('close', (code) => code ? reject() : resolve());
}));

// Run any provided post-install scripts, let uncaught errors bubble up.
Promise.all(postInstallScripts).then(() =>
  console.log('all postinstall scripts done')
);
