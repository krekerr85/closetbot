module.exports = {
    // ... другие настройки webpack ...
    module: {
      rules: [
        // ... другие правила ...
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
  };