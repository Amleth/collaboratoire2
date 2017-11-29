# Le Collaboratoire 2

## Notes à destination de l'utilisateur·trice

Vous devez placer un fichier nommé ```collaboratoire2-config.yml```dans votre répertoire ```home```, contenant :

	pictures_directories:
  	- /un/premier/répertoire
  	- /un/deuxième/répertoire

Ainsi, si vous êtes sous Mac, et que votre compte utilisateur·trice se nomme ```dominique```, vous devrez créer le fichier ```collaboratoire2-config.yml```dans le dossier ```/Users/dominique/```. Un exemple de fichier pour Mac est disponible [ici](https://raw.githubusercontent.com/Amleth/collaboratoire2/master/users/mac/collaboratoire2-config.yml).

Si vous êtes sous Windows, le fichier de configuration devra être placé dans le dossier ```C:\Users\dominique```. Un exemple de fichier pour Windows est disponible [ici](https://github.com/Amleth/collaboratoire2/blob/master/users/win/collaboratoire2-config.yml).

Vous pouvez ainsi lister autant de répertoires de votre disque dur que vous le souhaitez. Au démarrage, l'application parcourt chacun de ces répertoires récursivement pour y trouver des images (au format JPEG).