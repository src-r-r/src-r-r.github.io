import typescript from '@rollup/plugin-typescript';
import { fileURLToPath } from 'node:url';

export default {
  input: 'src/assets/scripts/dgtstatic/humandate.ts',
  output: {
    file: '_site/assets/scripts/dgtstatic/humandate.js',
    format: 'es',
    name: 'HumanDate',
  },
  external: [
    "dayjs",
    /node_modules/,
    fileURLToPath
      (
        new URL
          (
            './node_modules/dayjs/index.js',
            import.meta.url
          )
      ),
  ],
  plugins: [
    typescript()
  ]
};