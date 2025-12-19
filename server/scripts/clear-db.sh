#!/bin/bash
# The script works only on remote server

source .env

set -e

echo "Database name: is $DB_DATABASE"

echo "REVOKE CONNECT ON DATABASE postgres FROM PUBLIC;" | sudo -u postgres psql
echo "DROP DATABASE IF EXISTS $DB_DATABASE" | sudo -u postgres psql
echo "CREATE DATABASE $DB_DATABASE;" | sudo -u postgres psql
