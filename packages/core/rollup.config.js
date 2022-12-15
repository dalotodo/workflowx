// @file: rollup.config.js
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

const config = [
    {
        input: './src/index.ts',
        output: { dir: 'dist' },
        external: ['rxjs'],
        plugins: [typescript(), terser()]
    },
    {
        input: "./dist/types/index.d.ts",
        output: [{ file: "./dist/index.d.ts", format: "es" }],
        plugins: [dts()],
    },

]

export default config;

