import axios from 'axios';
import fs from 'fs';
import express from 'express';

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
    const res = await axios({
        method: 'get',
        url: 'https://api.github.com/repos/Nerixyz/instagram_mqtt/events'
    });

    fs.writeFile('./events.json', JSON.stringify(res.data), {flag: 'w+'}, () => {});
}

getEvents();

setInterval(() => {
    getEvents();
}, 60 * 1000);