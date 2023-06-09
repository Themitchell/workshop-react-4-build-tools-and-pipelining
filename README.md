<!---
marp: true
theme: uncover
class: invert
headingDivider: 2
paginate: true
header: ![&e Tech](img/and-e-tech-logo-300.svg)
footer: 'Created with [Marp](https://marp.app) and [Github Pages](https://pages.github.com)'
backgroundImage: url('img/react-logo.svg')
backgroundPosition: 120% 120%
backgroundSize: 40%
style: |
  section,
  section code {
    font-size: 30px;
    text-align: left;
  }

  section ul,
  section ol,
  section img {
    margin-left: 0;
  }

  section.long p,
  section.long ul,
  section.long ol,
  section.long code, {
    font-size: 24px;
  }

  section .columns img {
    width: 100%;
  }

  section .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  section header img {
    height: 100px;
    width: 100px;
    float: right;
  }
--->
# React Workshop

Build tools and pipelining

# Intro

- The way we read and write code as developers is not well optimized for the browser
- To optimize for the browser we need to "massage" our code into something more manageable
- This includes but is not limited to the following:
  - Transpiling - converting code into something compatible with the browser
  - Bundling - putting all our files and libraries into a single bundled output
  - Minifying - making it as small as possible for our snailmail users
  - Packaging - putting the right assets in the right place
- This is our build process

# Enter Webpack

<div class="columns">

- Webpack is primarily a bundling tool
- We can use it as a pipelining tool to chain other build tools
- The following config imports `app.js` and creates a bundled output `app.bundle.js` in the `dist` directory
- Notice we are using commonjs `require()` not es2015 `import` in the webpack config
- By default webpack only cares about js and json files

```js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js'
  }
};
```

</div>

# How do we import modules?

- When webpack sees an import statement it will import / require the module and add it to our bundle
- If we just put all our files directly together we could run into namespace problems or collisions
- Each module is wrapped in its own namespace to avoid collisions
- Multiple module different module loaders are supported via plugins
- Only `require()` is supported out of the box
- `webpack build` will create a bundled output file including all our modules
- We can also import third part modules in the same way, like say... React

# Development server

<div class="columns">

- `webpack-dev-server`is a node server which can rebuild our application on change in development
- It can "hot" reload changed js modules and update them in our browser directly, triggering a reload
- In combination with `html-plugin-webpack` we can inject our compiled scripts into a template HTML file
- In development we can see all our files loaded individually in the console

```js
let config = {
  ...

  devServer: {
    port: 9000,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join('src', 'index.template.html'),
      inject: 'body'
    })
  ]
}
```

</div>

# Loaders

<div class="columns">

- Webpack only understands JS and JSON out of the box
- If we try to load a file Webpack doesnt understand compilation will fail with a loader error
- We need to tell Webpack how to load other types of files and convert them to a JS module
- We do this using loaders
- In the case of JSX, we use Babel to covert JSX files into valid javascript
- We use `babel-loader` to tell Webpack to use Babel to convert (transpile) `.jsx` files

```js

var config = {
  ...
  // resolve the file type
  resolve: {
    extensions: ['.js', '.json', '.jsx']
  },

  // Decide which loader to use for the file type
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader'
      }
    ]
  }
}

```

</div>

# Hold on who is Babel?

- Well Babel is a tool for converting modern JS into browser compatible JS
- Babel itself has presets
- In our Babel config file we are using `@babel/preset-react`
- `@babel/preset-react` tells Babel how to convert React constructs into something the browser understands
- Babel has a number of libraries for converting different types of modern JS features
- 2 presets of importance are `@babel/preset-env` for converting standard es2015+ features and `@babel/preset-typescript` for converting typescript

# Asset minification

<div class="columns">

- As we add more libraries our bundle gets bigger and bigger
- We can minify our code to single line with no whitespace
- We can remove code that is not used or called (tree shaking)
- We do this using the `terser-webpack-plugin`
- In Webpack 5 this is added by default to "production" builds
- In pre webpack 5 we have to ad the plugin manually

```js
const TerserPlugin = require("terser-webpack-plugin");

var config = {
  ...
}

if (ENV === 'production') {
  config.optimization = Object.assign(config.optimization || {}, {
    minimize: true,
    minimizer: [new TerserPlugin()]
  })
}
```

</div>

# Cache management

<div class="columns">

- Assets can be cached by both the browser and our server eg Varnish or Cloudfront
- We can invalidate caches by adding a unique hash per build to our bundled output filename
- Our `html-webpack-plugin` will handle placing the link to our bundled asset into our index.html
- We dont cache our index.html because its small

```js
var config = {
  ...
  output: {
    filename: 'app.[contenthash].bundle.js'
  }
};
```

</div>

# Chunks

<div class="columns">

- Application modules change often, but third party libraries do not
- Third party libraries can often be a large part of our overall output
- We often want to cache libraries separately from our application code
- Webpack allows us to split our bundle into separate chunked files

```js
var config = {
  ...
  output: {
    filename: '[name].[contenthash].bundle.js'
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/
        }
      },
    }
  }
}
```

</div>

# Source maps

<div class="columns">

- Minified, obfuscated is code near impossible to read for debugging
- Tools that report errors in production can't give us meaningful information on where errors occur
- In order to tell humans or reporting tools meaningful line numbers we can use sourcemaps to tell us where errors occured in our original code
- We can use various options for source maps depending on environment so that production source maps are only shared with error reporting tools, not users

```js
var config = {
  ...
  devtool: 'eval'
}

// Other options can be found at
// https://webpack.js.org/configuration/devtool/
```

</div>

# CSS in Javascript

- As we mentioned earlier we can import other types of files using loaders
- We can use Loaders to turn CSS into JS modules
- `css-loader` converts our css into a javascript module
- `style-loader` injects the styles into the DOM
- `postcss-loader` modifies our CSS to make it compatible with our browsers (similar to Babel for CSS)

# And a whole lot more

- Webpack is super powerful
- We can convert almost all browser asets into something Javascript in the browser
- We can pipeline our entire build process
- We can even run tests or linting tools
- We can run a development environment for local only
