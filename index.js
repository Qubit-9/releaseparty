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
    return res.data;
}

function filterEvents(json_events) {
    console.log("filtering events");
    const prEvents = json_events.filter(function(event) {
        return event.type === "PullRequestEvent"
    });

    const cleanedPrEvents = prEvents.map(function(prEvent) {
        const prAction = prEvent.payload.action;
        const prMerged = prEvent.payload.pull_request.merged;

        let eventType;

        if (prAction === "opened") {
            eventType = "pull_request_opened";
        } else if (prAction === "closed" && prMerged === true) {
            eventType = "pull_request_merged";
        } else {
            return null;
        }
        return {
            id: prEvent.id,
            eventType: eventType,
            title: prEvent.payload.pull_request.title,
            subtitle: '',
            timestamp: prEvent.created_at,
            username: prEvent.actor.login ,
            name: prEvent.actor.display_login,
            profilePicUrl: prEvent.actor.avatar_url
        }
    })

    return cleanedPrEvents.filter(event => {
        return event !== null;
    });
}

function writeEventsFile(json_events) {
    console.log("writing events");
    fs.writeFileSync('./public/events.json', JSON.stringify(json_events));
}

async function processEvents() {
    const events = await getEvents();
    const filteredEvents = filterEvents(events);
    writeEventsFile(filteredEvents)
}

schedule.scheduleJob(`*/${process.env.PERIOD_SECONDS} * * * * *`, async function(){
    console.log('triggering event job');
    await processEvents();
});
