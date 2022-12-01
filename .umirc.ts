export default {
  npmClient: "pnpm",
  tailwindcss: {},
  plugins: ["@umijs/plugins/dist/tailwindcss"],
  title: 'Sango上传工具',
  favicons: ["https://cdn.meiqijiacheng.com/h5-deploy/favicon.ico"],
  // Git Page相关配置
  base: process.env.NODE_ENV === 'production' ? '/SangoUploader/' : '/',
  publicPath: process.env.NODE_ENV === 'production' ? '/SangoUploader/' : '/',
  outputPath: 'docs',
};
