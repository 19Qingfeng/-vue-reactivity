// development mode just build one package
const execa = require('execa');

async function build(package) {
  // nodejs call rollup build
  await execa('rollup', ['-cw', '--environment', `TARGET:${package}`], {
    stdio: 'inherit',
  });
}

build('reactivity');
