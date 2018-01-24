## Technologies

Ceci est une application [Electron](https://electronjs.org/), [React](https://reactjs.org/), [Redux](https://redux.js.org/).

Le code repose sur le template [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate). Certaines choses ont été virées (flow, notamment).

## Problèmes rencontrés

- https://github.com/webpack/webpack/issues/5931
- Je suis obligé de commenter ```new MinifyPlugin(),``` dans ```webpack.config.renderer.prod.js```, pour l'instant...
- NPM & Windows :
	- https://github.com/nodejs/node-gyp/blob/master/README.md
	- https://stackoverflow.com/questions/33896511/npm-install-fails-with-node-gyp