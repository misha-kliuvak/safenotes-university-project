#!/bin/bash

source .env

pm2 stop $APP_NAME-$NODE_ENV

set -e

pull=false
install=pull
update_emails=false
migrate_db=false
prebuild=false

# Loop through all the command-line arguments
for arg in "$@"; do
  case "$arg" in
  --pull)
    pull=true
    ;;
  --install)
    install=true
    ;;
  --migrate-db)
    migrate_db=true
    ;;
  --update-emails)
    update_emails=true
    ;;
  --prebuild)
    prebuild=true
    ;;
  *)
    # Handle unknown or unsupported options here
    echo "Unknown option: $arg"
    ;;
  esac
done

if [ "$pull" = true ]; then
  echo "Pulling changes..."
  git pull
fi

if [ "$install" = true ]; then
  echo "Installing packages..."
  yarn install
fi

if [ "$update_emails" = true ]; then
  echo "Updating emails..."
  source ./scripts/update-emails.sh
fi

if [ "$migrate_db" = true ]; then
  echo "Run migrations..."
  yarn migrate
fi

if [ "$prebuild" = true ]; then
  rimraf dist
fi

set -e

yarn build

pm2 start ecosystem.config.js --interpreter /bin/bash
