var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: {
		server: './src/server/index.js',
		client: './src/client/index.js',
		assets: './assets/index.js'
	},
	output: {
		path: path.resolve('./build'),
		filename: '[name].js',
		publicPath: '/'
	},
	module: {
		loaders: [
		{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel',
			query: {
				optional: ['runtime'],
				stage: 0
			}
		},
		{
			test: /\.css$/,
			loader: 'css'
		},
		{
			test: /\.json$/,
			loader: 'json'
		}
		],
		preLoaders: [
		{
			test: /\.js$/,
			loader: 'eslint',
			exclude: /(node_modules|bower_components)/
		}
		]
	},
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.js', '.json'],
		modulesDirectories: ['bower_components', 'node_modules']
	},
	plugins: [
		new webpack.ResolverPlugin([
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
		]),
		new webpack.optimize.CommonsChunkPlugin('deps', 'deps.js'),
		new webpack.ProvidePlugin({
			$: 'jquery'
		})
	]
};
