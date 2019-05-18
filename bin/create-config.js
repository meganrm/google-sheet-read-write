#!/usr/bin/env node

require('dotenv').load();
const CronJob = require('cron').CronJob;
const fs = require('fs');
const forEach = require('lodash').forEach;
var readline = require('readline');
var googleAuth = require('google-auth-library');
var Page = require('../server/aics-page');
const googleMethods = require('../server/google-methods');

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEETS_ID = '1SXXp5O7wmVM69Z9mKFRNiefd9kNEDX0ZSmnwAd3xuC0';


var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
var clientId = process.env.GOOGLE_CLIENT_ID;
var redirectUrl = process.env.GOOGLE_REDIRECT_URI_1;
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

const currentToken = {
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    token_type: 'Bearer',
    expiry_date: 1522106489761,
};

oauth2Client.credentials = currentToken;

function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            console.log('got token', token);
            oauth2Client.credentials = token;
            callback(oauth2Client);
        });
    });
}

const readSheetAndWriteConfig = () => {

    googleMethods
        .read(oauth2Client, SHEETS_ID, 'Outline!C2:AH95')
        .then(googleRows => {
            let columnNames = googleRows[0];
            let currentSection;
            let data = {};
            for (let i = 1; i < googleRows.length; i++) {
                let row = googleRows[i];

                let obj = row.reduce((acc, cur, index) => {
                    let columnName = columnNames[index];
                    acc[columnName] = cur;
                    return acc;
                }, {});
                const chapterId = obj['Chapter title']
                    .toLowerCase()
                    .replace(/\ /g, '-')
                    .replace(/\&/g, 'and')
                    .replace(/\?/g, '') || obj['chapterId'] || '0';

                if (obj['Section Title']) {
                    currentSection = obj['Section Title'];
                    data[currentSection] = {};
                    data[currentSection][chapterId] = {
                        chapterId,
                        title: obj['Chapter title'],
                        chapterIndex: obj['chapterId'].toString() || 'splash',
                        pages: [],
                    };
                } 
                console.log(chapterId)
                if (!data[currentSection][chapterId]) {
                    data[currentSection][chapterId] = {
                        chapterId,
                        chapterIndex: obj['chapterId'].toString() || 'splash',
                        title: obj['Chapter title'],
                        pages: [],
                    };
                }
          
                let page = new Page(obj, i);
                data[currentSection][chapterId].pages.push(page);
                    
            }
            let sectionNo= 1;
            forEach(data, (section, sectionName) => {
                console.log(sectionName)
                let path = `/Users/meganriel-mehan/Dropbox/allen\ inst/content-config/section-${sectionNo}-${sectionName.toLowerCase().replace(/\ /g, '-')}`;
                fs.existsSync(path) || fs.mkdirSync(path);
                
                forEach(section, (chapter) => {
                    if (chapter.chapterId !== 'explore-3d-viewer' && chapter.chapterId !== '0') {
                        out = fs.createWriteStream(`${path}/ch-${chapter.chapterIndex}-${chapter.chapterId.trim()}.json`);
                        delete chapter.chapterIndex;
                        out.write(JSON.stringify(chapter));
                        out.end();
                    }
                });
                sectionNo++;
            });
        })
        .catch(err => {
            console.log('error reading sheet:', err);
            process.exit(1);
        });
};

const cronJobReadSheet = new CronJob({
    cronTime: '0 */1 * * * *',
    onTick: function () {
        readSheetAndWriteConfig();
        console.log('checked');
    },
    start: true,
    timeZone: 'America/Los_Angeles',
});

module.exports = cronJobReadSheet;