const { withExpoWebpack } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    return withExpoWebpack(env, argv);
};
