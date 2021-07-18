import path from 'path';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import clear from 'rollup-plugin-delete';

const baseDir = path.resolve(__dirname, 'packages');
const packageName = process.env.TARGET;
const packageDir = path.resolve(baseDir, packageName);

const pkg = require(resolve('package.json'));

const options = pkg.buildOptions;

const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${packageName}.ems-bundle.js`),
    sourcemap: true,
    format: 'es',
  },
  cjs: {
    file: resolve(`dist/${packageName}.cjs.js`),
    sourcemap: true,
    format: 'cjs',
  },
  global: {
    file: resolve(`dist/${packageName}.global.js`),
    sourcemap: true,
    name: options.name,
    format: 'iife', // vue3源码中采用的是立即执行函数而非umd
  },
};

const output = options.formats.map((key) => outputConfig[key]);

export default {
  input: resolve('src/index.ts'),
  output,
  plugins: [
    json(),
    // 优先解析ts 之后在解析nodeResolve插件 解析第三方引用
    ts({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
    nodeResolve(),
    clear({
      targets: resolve('dist/*'),
    }),
  ],
};

function resolve(target) {
  return path.resolve(packageDir, target);
}
