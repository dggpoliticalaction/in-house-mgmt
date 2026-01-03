#!/usr/bin/env bash
set -e

echo "Starting container…"

# Optional DB creation
if [ "${RUN_CREATE_DB}" = "1" ] || [ "${RUN_CREATE_DB}" = "true" ]; then
    echo "running create_db.py"
    python database_creation/create_database.py
else
    echo "skipping database creation"
fi

echo "Starting server server..."

exec python dggcrm/manage.py runserver 0.0.0.0:8080
