#!/bin/sh
./CLEAN.sh ; env DEBUG_PROD=true npm run package ; open ./release/mac/Collaboratoire2.app/