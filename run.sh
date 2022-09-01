#!/bin/bash
echo "Dumping database"
USER="root"
PASSWORD="password"

databases=`mysql -u $USER -p$PASSWORD -e "SHOW DATABASES;" | tr -d "| " | grep -v Database`

for db in $databases; do
    echo "In loop"
    if [[ "$db" != "information_schema" ]] && [[ "$db" != "performance_schema" ]] && [[ "$db" != "mysql" ]] && [[ "$db" != _* ]] ; then
        echo "Dumping database: $db"
        mysqldump -u $USER -p$PASSWORD --databases $db > `date +%Y%m%d`.$db.sql
       # gzip $OUTPUT/`date +%Y%m%d`.$db.sql
    fi
done