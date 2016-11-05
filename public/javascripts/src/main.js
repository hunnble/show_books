requirejs.config({
  baseUrl: '/javascripts/dist',
  paths: {
    jquery: 'jquery.min'
  }
});

requirejs(['index.min']);
