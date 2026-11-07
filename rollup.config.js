import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: {
    resources: 'src/assets/scripts/dgtstatic/resources.ts',
  },
  output: {
    dir: '_site/assets/scripts/dgtstatic',
    entryFileNames: '[name].js',
    format: 'es',
  },
  plugins: [
    nodeResolve(),
    typescript()
  ]
};
