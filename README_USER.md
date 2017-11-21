# Le Collaboratoire 2

## Notes à destination de l'utilisateur·trice

Vous devez placer un fichier nommé ```collaboratoire2-config.yml```dans votre répertoire ```home```, contenant :

	pictures_directories:
  	- /un/premier/répertoire
  	- /un/deuxième/répertoire

Vous pouvez ainsi lister autant de répertoires de votre disque dur que vous le souhaitez. Au démarrage, l'application parcourt chacune de ces répertoires récursivement pour y trouver des images (au format JPEG).

<!--
## Notes à destination du développeur ou de la développeuse

Application reposant sur [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate) + :
	
	yarn add -D electron-rebuild node-loader

	yarn add chance config-yaml electron-logger fast-exif fs-extra image-file image-size klaw-sync react-svg-pan-zoom react-virtualized sharp styled-components xlsx moment

Problème d'installation d'Electron sous Linux :

	npm install -g electron --unsafe-perm=true --allow-root

Recompiler sharp :

	./node_modules/.bin/electron-rebuild

NPM & Windows :

	https://github.com/nodejs/node-gyp/blob/master/README.md
	https://stackoverflow.com/questions/33896511/npm-install-fails-with-node-gyp

Problèmes que je me suis tapés :

- https://github.com/webpack/webpack/issues/5931
- Je suis obligé de commenter ```new MinifyPlugin(),``` dans ```webpack.config.renderer.prod.js```, pour l'instant...
-->