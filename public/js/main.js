const pull_request_opened_messages = ["Just opened a pull request 🧐", "Look at my juicy pull request! 🔥🔥"]
const pull_request_merged_messages = ["Just put out a new release! 🎉", "New version released 🔥🔥", "Just made our product better 🥳"]
const pull_request_closed_messages = ["We had to close this one 💩", "Sorry guys i made mistake 😅"]


class EventHandler {

    runParty() {
        party.confetti(document.querySelector('.event.active'), {
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

        this.updateAnimation();
    }

    async setupParty() {
        const events = await fetch('events.json').then(response => response.json());
        events.sort(function(a,b){
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        this.events = events;
        this.events.forEach((event, i) => {
            this.timelineElement.innerHTML += `
            <div class="event ${ i == 0 ? 'active' : 'inactive-' + i}" data-id="${event.id}">
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
        window.setTimeout(() => {
            if(document.querySelector('.event.inactive-2') !== null) {
                document.querySelector('.event.inactive-2').classList.add('inactive-3');
                document.querySelector('.event.inactive-3').classList.remove('inactive-2');
            }

            if(document.querySelector('.event.inactive-1') !== null) {
                document.querySelector('.event.inactive-1').classList.add('inactive-2');
                document.querySelector('.event.inactive-2').classList.remove('inactive-1');
            }

            if(document.querySelector('.event.active') !== null) {
                document.querySelector('.event.active').classList.add('inactive-1');
                document.querySelector('.event.active').classList.remove('active');
            }

            this.playSuccessSound();

            window.setTimeout(() => {
                document.querySelector('.event.new').classList.add('active');
                document.querySelector('.event.new').classList.remove('new');
                this.runParty()
            }, 800)
        }, 3000)
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
            this.addNewEvent(this.queue[0])
            this.events.push(this.queue[0])
            this.queue.shift()
        }
    }

    async getNewEvents() {
        console.log("getting new Events");
        const newEvents = await fetch('events.json').then(response => response.json());
        newEvents.forEach((newEvent) => {
            let foundEventInCurrents = false;
            this.events.forEach((currentEvent) => {
                if(newEvent.id == currentEvent.id) {
                    foundEventInCurrents = true;
                }
            })

            if(!foundEventInCurrents) {
                this.queue.push(newEvent);
            }
        });
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
        }, 3800)
    }
}


document.querySelector('#startButton').addEventListener('click', () => {
    document.querySelector('.overlay').classList.add('hidden');
    new EventHandler()
});