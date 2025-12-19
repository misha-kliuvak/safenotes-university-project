source .env

pm2 logs api-$NODE_ENV --lines 200
