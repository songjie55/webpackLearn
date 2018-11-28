const webpack = require('webpack');
const path = require('path');
//extract-text-webpack-plugin插件可以吧打包在js里面的css抽出来单独引用
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//页面模板哈希值引入插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
//清除多余哈希值打包出来的文件
const CleanWebpackPlugin = require('clean-webpack-plugin');

//optimize-css-assets-webpack-plugin压缩css

function resolve(dir) {
	return path.join(__dirname, '..', dir);
}

module.exports = {
	//环境
	mode: 'production',//process.env.NODE_ENV === 'production'
	//调试工具
	devtool: 'eval-source-map',
	entry: {
		first: __dirname + '/app/main.js',
		second: __dirname + '/app/main2.js',
		third: __dirname + '/app/main3.js',
	},//入口
	output: {
		path: __dirname + '/dist',
		filename: 'js/[name]-[hash].js',
		publicPath: '',
	},
	//webpack的服务器
	devServer: {
		port: 3000,
		contentBase: './public',//本地服务i其所加载的页面所在的目录
		historyApiFallback: true,//不跳转
		inline: true,//自动刷新
		hot: true,//热更
	},
	//取消提示
	performance: {
		hints: false,
	},
	//遇到webpack不试别的模块用loader
	module: {
		rules: [
			{
				test: /(\.jsx|\.js)$/,
				loader: 'babel-loader',
				// query: {             //query也可以在.babelrc里面配置或者在package.json里面配置，一共三个地方可配置
				// 	presets: ['latest'],//需要安装最新的ES编译插件babel-preset-latest
				// },
				exclude: path.resolve(__dirname,'node_modules'), //路径必须是绝对路径,(includes里面也必须是绝对路径)屏蔽插件里面的编译，当然有时候插件里面也可能会有ES6，有时候需要对个别插件包编译一下,用以下的includes
				//include: [resolve('src'), resolve('node_modules/swiper'), resolve('node_modules/dom7')],
			},
			{
				test: /\.less$/,
				loader: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader!postcss-loader!less-loader',//postcss-loader是给浏览器兼容的样式加前缀，?importLoaders=1y因为处理的是less所以不需要给css-loader加上?importLoaders=1参数
				}),
				exclude: path.resolve(__dirname,'node_modules'),
				// loader: 'style-loader!css-loader?modules!less-loader!postcss-loader',//简写
				// !感叹号是分割符，表示两个工具都参与处理。
				// ?问号，其实跟url的问号一样，就是后面要跟参数的意思。
				//注意顺序style css最后才是Less不然会报错
			},
			{
				test:/\.html$/,
				loader:'html-loader',
				exclude:path.resolve(__dirname,'public')
			}
		],
	},
	//插件
	plugins: [
		new ExtractTextPlugin({
			filename: 'css/style.css',
			allChunks: true,
		}),//把css拿出来单独引入,不然CSS就会被写入头部的style标签里面
		new webpack.BannerPlugin('头皮发麻'),//在打包后的js头部加入注释
		new HtmlWebpackPlugin({
			inject:false,
			template: __dirname + '/public/template.html',
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true,
			},
			excludeChunks:['third'],//如果有多个入口又不想全部引入就用这个排除某个chunks
		}),
		new CleanWebpackPlugin('dist', {
			root: __dirname,
			verbose: true,
			dry: false,
		}),
		new webpack.optimize.OccurrenceOrderPlugin(),//为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID
		new webpack.HotModuleReplacementPlugin(), //热加载插件,上面webpack-dev-server里面已经开启了热更
	],
};