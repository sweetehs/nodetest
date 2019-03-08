module.exports = {
  devServer: {
    disableHostCheck: true,
    proxy: {
      '/*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  publicPath: '/dist',
};
