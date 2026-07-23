#!/bin/bash
# backup.sh
# Creates a database backup dump

BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
FILE_NAME="aicounsellor_backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

echo "Starting database backup..."

# Assuming container name is aicounsellor-db
docker exec aicounsellor-db pg_dump -U aicounsellor -d aicounsellor_prod | gzip > $BACKUP_DIR/$FILE_NAME

echo "Backup saved to $BACKUP_DIR/$FILE_NAME"

# Optional: Delete backups older than 7 days
# find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
