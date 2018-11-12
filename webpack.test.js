const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const webpackNodeExternals = require('webpack-node-externals');

const config = {

    // Inform webpack that we're building a bundle
    // for NodeJS, rather than for the browser.

    target: 'node',

    // Tell webpack  the root file of our server application.
    
    entry: {
        "BotChannelTests.mongodb": "./tests/models/BotChannelTests.mongodb.js",
        "BotTests.mongodb" : './tests/models/BotTests.mongodb.js',
        "BotTests.postgresql" : './tests/models/BotTests.postgresql.js',
        ChannelTests : './tests/models/ChannelTests.js',
        "InstanceTests.mongodb" : './tests/models/InstanceTests.mongodb.js',
        "InstanceTests.postgresql" : './tests/models/InstanceTests.postgresql.js',
        MongoDBAdapterTests : './tests/models/MongoDBAdapterTests.js',
        PostgreSQLAdapterTests : './tests/models/PostgreSQLAdapterTests.js',

        "UserTests.postgresql" : './tests/models/UserTests.postgresql.js',

        UtilsTests : "./tests/utils/UtilsTests.js"
    },

    // Tell webpack where to put the output file that is generated.

    output : {
        filename: '[name].test.js',
        path: path.resolve(__dirname, 'build/tests')
    },

    externals : [webpackNodeExternals()]

};

module.exports = merge(baseConfig, config);