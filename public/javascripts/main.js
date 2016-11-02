requirejs.config({
  baseUrl: '../public/javascripts',
  paths: {
    jquery: 'jquery.min'
  }
});

requirejs(['index'], function (start) {
  start();
});
