import axios from 'axios';
import fs from 'fs';
import express from 'express';
import schedule from 'node-schedule'
import 'dotenv/config'

const app = express();
const port = process.env.PORT || '3000';

app.use(express.static('./public'));

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

async function getEvents() {
    console.log("getting events");
    const org = process.env.REPOSITORY_OWNER;
    const repo = process.env.REPOSITORY_NAME;
    console.log(`https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@api.github.com/repos/${org}/${repo}/events`);
    const res = await axios({
        method: 'get',
        url: `https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@api.github.com/repos/${org}/${repo}/events`,
    });
    return JSON.stringify(res.data);
}

function filterEvents(json_events) {
    console.log("filtering events");
//    TODO: filtering and format transformation
    return json_events;
}

async function writeEventsFile(json_events) {
    console.log("writing events");
    fs.writeFile('./public/events.json', JSON.stringify(json_events), {flag: 'w+'}, () => {});
}

async function processEvents() {
    const events = await getEvents();
    const filteredEvents = filterEvents(events);
    await writeEventsFile(filteredEvents)
}

const job = schedule.scheduleJob(`*/${process.env.PERIOD_SECONDS} * * * * *`, async function(){
    console.log('triggering event job');
    await processEvents();
});

job.schedule();
