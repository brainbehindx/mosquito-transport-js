import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { terser } from 'rollup-plugin-terser';

function browserInjection() {
    return {
        name: 'globals-plugin',
        generateBundle(_, bundle) {
            for (const [_, chunk] of Object.entries(bundle)) {
                if (chunk.type === 'chunk') {
                    const sourceMatch = `//# sourceMappingURL=${chunk.sourcemapFileName}`;
                    const codebase = chunk.code.trim(),
                        hasSourceMap = codebase.endsWith(sourceMatch);
                    let rechunk = (hasSourceMap ? codebase.slice(0, -sourceMatch.length) : codebase).trim();

                    if (rechunk.endsWith('({});')) {
                        rechunk = rechunk.slice(0, -'({});'.length) + '(exports);';
                    } else throw 'match not found';

                    const code = `\n/**\n* @license\n*\n* The MIT License (MIT)\n* \n* Copyright ${new Date().getFullYear()} BrainbehindX Inc.\n*  \n* Permission is hereby granted, free of charge, to any person obtaining a copy\n* of this software and associated documentation files (the "Software"), to deal\n* in the Software without restriction, including without limitation the rights\n* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n* copies of the Software, and to permit persons to whom the Software is\n* furnished to do so, subject to the following conditions:\n* \n* The above copyright notice and this permission notice shall be included in\n* all copies or substantial portions of the Software.\n* \n* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE\n* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n* THE SOFTWARE.\n*/\n\n(function(global){var exports={}; ${rechunk} global.MosquitoTransport=Object.assign(global.MosquitoTransport || {}, exports);})(typeof globalThis!=='undefined'?globalThis:typeof window!=='undefined'?window:typeof global!=='undefined'?global:this);${hasSourceMap ? '\n\n' + sourceMatch : ''}`;
                    chunk.code = code;
                }
            }
        }
    };
}

function nodeInjection() {
    return {
        name: 'globals-plugin',
        generateBundle(_, bundle) {
            for (const [_, chunk] of Object.entries(bundle)) {
                if (chunk.type === 'chunk') {
                    const code = `\n/**\n* @license\n*\n* The MIT License (MIT)\n* \n* Copyright ${new Date().getFullYear()} BrainbehindX Inc.\n*  \n* Permission is hereby granted, free of charge, to any person obtaining a copy\n* of this software and associated documentation files (the "Software"), to deal\n* in the Software without restriction, including without limitation the rights\n* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n* copies of the Software, and to permit persons to whom the Software is\n* furnished to do so, subject to the following conditions:\n* \n* The above copyright notice and this permission notice shall be included in\n* all copies or substantial portions of the Software.\n* \n* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE\n* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n* THE SOFTWARE.\n*/\n\n${chunk.code}`;
                    chunk.code = code;
                }
            }
        }
    };
}

export default [{
    input: './src/index.js',
    plugins: [
        resolve({
            preferBuiltins: false,
            browser: true
        }),
        commonjs(),
        polyfillNode(), // Polyfill Node.js built-in modules
        babel({
            babelHelpers: 'bundled',
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
            ],
        }),
        browserInjection(),
        terser()
    ],
    output: {
        file: 'dist/browser/index.min.js',
        format: 'iife',
        sourcemap: true
    }
}, {
    input: './src/index.js',
    plugins: [
        resolve(),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
            ],
        }),
        nodeInjection(),
        terser()
    ],
    output: [
        {
            dir: 'dist/esm/index.min.js',
            format: 'es',
            sourcemap: true
        },
        {
            dir: 'dist/cjs/index.min.js',
            format: 'cjs',
            sourcemap: true
        }
    ]
}];