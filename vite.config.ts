import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import { viteStaticCopy } from "vite-plugin-static-copy";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ]
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ["package.json", "manifest.json"],
    }),
    viteStaticCopy({
      targets: [{
        src: "src/content-script.js",
        dest: "src",
      }]
    }),
  ],
});
