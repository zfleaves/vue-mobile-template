import path from 'node:path'
import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'

import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import autoprefixer from 'autoprefixer'
import UnoCSS from 'unocss/vite'
import { viteVConsole } from 'vite-plugin-vconsole'

import viteImagemin from 'vite-plugin-imagemin'
import viteCompression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'

export default ({ command, mode }: ConfigEnv): UserConfig => {
  // eslint-disable-next-line node/prefer-global/process
  const root = process.cwd()
  const env = loadEnv(mode, root)

  return {
    base: env.VITE_APP_PUBLIC_PATH,
    // 兼容 Cli
    define: {
      'process.env.VUE_APP_API_BASE_URL': JSON.stringify(env.VITE_APP_API_BASE_URL),
      'process.env.VUE_APP_PUBLIC_PATH': JSON.stringify(env.VITE_APP_PUBLIC_PATH),
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer(),
        ],
      },
      preprocessorOptions: {
        scss: {
          // 可选：如需全局变量/混合器，用 additionalData 注入
          // additionalData: `@use "src/styles/variables" as *;`,
          api: 'modern-compiler',
        },
      },
    },
    server: {
      host: '0.0.0.0', // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
      cors: true,
      port: 8086,
      open: true,
      proxy: {
        '/v4/web': {
          target: 'https://itest.clife.net',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },

    },
    resolve: {
      alias: {
        '@/': `${path.resolve(__dirname, 'src')}/`,
        'api/': `${path.resolve(__dirname, 'src/api')}/`,
        'assets/': `${path.resolve(__dirname, 'src/assets')}/`,
        'stores/': `${path.resolve(__dirname, 'src/stores')}/`,
        'utils/': `${path.resolve(__dirname, 'src/utils')}/`,
        'views/': `${path.resolve(__dirname, 'src/views')}/`,
        'components/': `${path.resolve(__dirname, 'src/components')}/`,
        'hooks/': `${path.resolve(__dirname, 'src/hooks')}/`,
      },
    },
    plugins: [
      viteImagemin({
        gifsicle: { optimizationLevel: 3 },
        mozjpeg: { quality: 80 },
        pngquant: { quality: [0.8, 0.9] },
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      createHtmlPlugin({
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
          // 其他选项参考 html-minifier-terser
        },
      }),
      vue(),
      vueJsx(),
      visualizer({
        open: true,
        filename: 'stats.html', // 输出文件名[2,6](@ref)
      }),
      UnoCSS(),

      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      Components({
        dts: true,
        resolvers: [VantResolver()],
        types: [],
      }),

      AutoImport({
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
        ],
        imports: [
          'vue',
          'vue-router',
          'vitest',
        ],
        dts: true,
      }),

      viteVConsole({
        entry: [path.resolve('src/main.ts')],
        localEnabled: command === 'serve',
        enabled: false,
        config: {
          maxLogNumber: 1000,
          theme: 'light',
        },
      }),
    ],
    build: {
      outDir: 'dist',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // 自动分割第三方库和公共模块
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue-router'))
                return 'vendor-router'
              return 'vendor'
            }
          },
          // Static resource classification and packaging
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  }
}
