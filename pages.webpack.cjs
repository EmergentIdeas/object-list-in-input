const path = require('path');

/* need to install:

npm i --save-dev webpack-cli node-polyfill-webpack-plugin

*/


module.exports = [{
	entry: './client-lib/index.mjs',
	// mode: 'development',
	mode: 'production',
	"devtool": 'source-map',
	experiments: {
		outputModule: true,
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'public/js'),
		library: {
			type: 'module',
		}
	},
	module: {
		rules: [
			{ test: /\.tmpl$/, use: 'tripartite/webpack-loader.mjs' }
			, { test: /\.tri$/, use: 'tripartite/webpack-loader.mjs' }
			, {
				test: /\.txt$/i,
				use: 'raw-loader',
			}
		],
	},
	stats: {
		colors: true,
		reasons: true
	}

	, externals: {
		"@webhandle/backbone-view": '@webhandle/backbone-view'
		, "@webhandle/dialog": '@webhandle/dialog'
		, "@webhandle/drag-sortable-list": "@webhandle/drag-sortable-list"
	}

}
]