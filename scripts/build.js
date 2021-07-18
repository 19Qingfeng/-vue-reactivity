// build all packages
const fs = require('fs');
const path = require('path');
const execa = require('execa');

const packagesPath = path.join(__dirname, '../packages');

fs.promises
  .readdir(packagesPath)
  .then((files) => {
    return files.filter((file) =>
      fs.statSync(path.join(packagesPath, file)).isDirectory()
    );
  })
  .then((files) => {
    // 并行打包
    return runParallel(files, build);
  })
  .then(() => {
    console.log('全部打包完毕');
  });

async function build(package) {
  // nodejs call rollup build
  await execa('rollup', ['-c', '--environment', `TARGET:${package}`], {
    stdio: 'inherit',
  });
}

function runParallel(packages, iteratorFn) {
  const result = [];
  packages.forEach((package) => {
    result.push(iteratorFn(package));
  });
  return Promise.all(result);
}
