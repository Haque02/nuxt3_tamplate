// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      'tailwindcss': {},
      'autoprefixer': {},
    },
  },


  modules: ['@tdesign-vue-next/nuxt'],
  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true
      }
    }
  },
})
