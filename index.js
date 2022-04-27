import axios from 'axios';
import fs from 'fs';
import express from 'express';
import 'dotenv/config'

const app = express();
const port = process.env.PORT || '3000';

app.get('/',function(req,res) {
    res.sendFile('frontend/index.html', { root: '.' });
});
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

async function getEvents() {
    console.log("getting events");
    
    const repoURL = process.env.REPOSITORY_URL.split('/');
    const org = repoURL.at(-3);
    const repo = repoURL.at(-2);
    const res = await axios({
        method: 'get',
        url: `https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@api.github.com/repos/${org}/${repo}/events`,
    });

    fs.writeFile('./events.json', JSON.stringify(res.data), {flag: 'w+'}, () => {});
}

getEvents();

setInterval(() => {
    getEvents();
}, 60 * 1000);