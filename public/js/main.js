const pull_request_opened_messages = ["Just opened a pull request 🧐", "Look at my juicy pull request! 🔥🔥"]
const pull_request_merged_messages = ["Just put out a new release! 🎉", "New version released 🔥🔥", "Just made our product better 🥳"]
const pull_request_closed_messages = ["We had to close this one 💩", "Sorry guys i made mistake 😅"]


class EventHandler {

    runParty() {
        party.confetti(document.querySelector('.event.position-0'), {
            count: party.variation.range(50, 100)
        })
    }

    playSuccessSound() {
        let audio = new Audio('audio/tuturu.mp3');
        audio.play();
    }

    addNewEvent(event) {
        this.timelineElement.innerHTML += `
        <div class="event new" data-id="${event.id}">
            <div class="user">
                <div class="profilePictureWrapper">
                    <div class="profilePicture" style="background-image: url(${event.profilePicUrl})"></div>
                </div>
                <div class="profileInfoWrapper">
                    <div class="profileName">${event.name}</div>
                    <div class="profileUserName">@${event.username}</div>
                    <div class="time">${event.timestamp}</div>
                </div>
            </div>
            <div class="eventContent">
                <div class="eventText">
                    ${this.parseEventText(event.eventType, event.title)}
                </div>
                <div class="branchText">
                    ${event.title}
                </div>
            </div>
        </div>
        `
        window.setTimeout(() => {
            this.updateAnimation();
        }, 400)
        
    }

    async setupParty() {
        const events = await fetch('events.json').then(response => response.json());
        events.sort(function(a,b){
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        events.forEach((event, i) => {
            event.position = i;
        })

        this.events = events.slice(0,3);
        this.events.forEach((event, i) => {
            this.timelineElement.innerHTML += `
            <div class="event ${ 'position-' + event.position }" data-id="${event.id}">
                <div class="user">
                    <div class="profilePictureWrapper">
                        <div class="profilePicture" style="background-image: url(${event.profilePicUrl})"></div>
                    </div>
                    <div class="profileInfoWrapper">
                        <div class="profileName">${event.name}</div>
                        <div class="profileUserName">@${event.username}</div>
                        <div class="time">${event.timestamp}</div>
                    </div>
                </div>
                <div class="eventContent">
                    <div class="eventText">
                        ${this.parseEventText(event.eventType, event.title)}
                    </div>
                    <div class="branchText">
                        ${event.title}
                    </div>
                </div>
            </div>
            `;
        })
    }

    updateAnimation() {
        this.events.forEach((event) => {
            if(event.position == -1) {
                event.position = 0;
            } else {
                event.position += 1;
                console.log(event.id);
                console.log(this.events);
                document.querySelector(`[data-id='${event.id}']`).className = `event position-${event.position > 3 ? 'hidden' : event.position}`;
            }
        });

        this.playSuccessSound();

        window.setTimeout(() => {
            document.querySelector('.event.new').classList.add('position-0');
            document.querySelector('.event.new').classList.remove('new');
            this.runParty()
        }, 800)
    }

    parseEventText(eventType, eventTitle) {
        switch(eventType){
            case 'pull_request_opened':
                return pull_request_opened_messages[Math.floor(Math.random() * pull_request_opened_messages.length)];
            case 'pull_request_merged':
                return pull_request_merged_messages[Math.floor(Math.random() * pull_request_merged_messages.length)];
            case 'pull_request_closed':
                return pull_request_closed_messages[Math.floor(Math.random() * pull_request_closed_messages.length)];
            default:
                return "doesn't know what is happening 🤔";
        }
    }

    async resolveQueue() {
        if(this.queue.length >= 1) {
            const newEvent = this.queue[0];
            newEvent.position = -1;
            this.events.push(newEvent)
            this.queue.shift()
            this.addNewEvent(newEvent)
        }
    }

    async getNewEvents() {
        const newEvents = await fetch('events.json').then(response => response.json());
        newEvents.forEach((newEvent) => {
            if(!this.inQueue(newEvent.id) && !this.inEvents(newEvent.id)) {
                this.queue.push(newEvent);
            }
        });
    }

    inQueue(eventId) {
        for(let i = 0; i < this.queue.length; i += 1) {
            if (this.queue[i].id == eventId) return true
        }

        return false
    }

    inEvents(eventId) {
        for(let i = 0; i < this.events.length; i += 1) {
            if (this.events[i].id == eventId) return true
        }

        return false
    }

    constructor() {
        this.events = [];
        this.queue = [];
        this.timelineElement = document.querySelector('.timeline');
        this.setupParty()
        setInterval(() => {
            this.getNewEvents();
        }, 5000)

        setInterval(() => {
            this.resolveQueue();
        }, 4000)
    }
}


document.querySelector('#startButton').addEventListener('click', () => {
    document.querySelector('.overlay').classList.add('hidden');
    new EventHandler()
});