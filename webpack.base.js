module.exports = {

  // Tell webpack to run babel on every file it runs through.

  module : {
      rules : [
          
          {
              test: /\.js?$/,
              loader: 'babel-loader',
              exclude: /node_modules/,
              options: {
                  presets: [
                      'stage-0',
                      [
                          'env', { 
                              targets: { 
                                  node: 'current' 
                              }
                          }
                      ]
                  ],

                  plugins : [
                      // transform-es2015-modules-commonjs-simple evita que en la compilación del código
                      // se enumeren las variables de los módulos importados, dificultando el debugging
                      // caso de Engine y su representación renombrada Engine2_
                      ["transform-es2015-modules-commonjs-simple", {
                          "noMangle": true
                      }]
                  ]
              }
          }

      ]
  }

}