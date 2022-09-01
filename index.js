const express = require('express');
const { exec, execSync } = require("child_process");
const cron = require('node-cron');
const AWS = require('aws-sdk')
const fs = require('fs')
const app = express();
const { zip } = require('zip-a-folder')
const mysqldump = require('mysqldump')


// cron.schedule('* * * * *', async () => {
console.log("Enter in cron")

exec('sudo mysql -u root -pMind@1234 -h13.235.179.4 -e "SHOW DATABASES;" | tr -d "| " | grep -v Database', async (error, stdout, stderr) => {
    let dbArr = []
    stdout = stdout.split('\n')
    console.log(stdout, "stdout")
    dbArr.push(stdout)
    console.log(dbArr, "dbarr")
    if (error) {
        console.log("mysqlDump error: ", error)
    }
    console.log("Dump done !!!")
    if (stderr) {
        AWS.config.update({
            accessKeyId: 'AKIARFWSRSLTCTSTEG45',
            secretAccessKey: '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'
        })
        const s3 = new AWS.S3()
        let deleteParams = {
            Bucket: 'mysql-dump-2022-09-01',
            Delimiter: '/',
        };

        await s3.listObjects(deleteParams, async function (err, data) {
            if (err) {
                return 'listing issue :- ' + err.message
            } else {
                data.Contents.forEach(function (obj, index) {
                    date_file = new Date(obj.LastModified).getTime();
                    const today = new Date();
                    const beforserven = today.setDate(today.getDate())
                    if (beforserven > date_file) {
                        new Promise((resolve, reject) => {
                            const params = {
                                Bucket: 'mysql-dump-2022-09-01',
                                Key: `${obj.Key}`,
                            }
                            s3.deleteObject(params, (err, data) => {
                                if (data) {
                                    console.log("deleted old one !")
                                    resolve()
                                }
                                reject(err)
                            })
                        })
                    }
                })
            }
        })

        await zip('./zip', './pack.zip')

        const file = "./pack.zip";
        const fileStream = fs.createReadStream(file);

        const timestamp = Date.now()

        await new Promise((resolve, reject) => {

            const params = {
                Bucket: 'mysql-dump-2022-09-01',
                Key: `${timestamp}.zip`,
                Body: fileStream
            };
            s3.upload(params, (s3Err, data) => {
                if (s3Err) throw s3Err
                console.log(`File uploaded successfully at ${data} with name ${timestamp}`)
                execSync('rm -rf ./zip/*')
                execSync('rm -rf pack.zip')
                return resolve(data)
            });
        })
    }

});



app.listen(3000, () => {
    console.log("server running on port 3000")
})
