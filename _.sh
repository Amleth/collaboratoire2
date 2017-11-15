#!/bin/sh
DEBUG_PROD=true npm run package
sudo cp ./release/*.zip /Users/snakeplissken/Desktop/
sudo cp /Users/amleth/collaboratoire2-config.yml /Users/snakeplissken/
