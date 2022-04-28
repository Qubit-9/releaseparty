const pull_request_opened_messages = ["just opened a pull request 🧐", "look at him, he opened a pull request 🔥🔥"]
const pull_request_merged_messages = ["just put out a new release! 🎉", "just released a new version released 🔥🔥", "just made our product better 🥳"]
const pull_request_closed_messages = ["had to close this one 💩", "made mistake 😅"]

const success_sounds = ["cheers"];
const error_sounds = ["error", "sadtrombone", "emotional_damage"];
const wow_sounds = ["wow", "tuturu"];


class EventHandler {

    runParty() {
        party.confetti(document.querySelector('.event.position-0'), {
            count: party.variation.range(50, 100)
        })
    }

    playSound(type) {
        switch(type) {
            case 'success':
                let s_audio = new Audio(`audio/${success_sounds[Math.floor(success_sounds.length * Math.random())]}.mp3`);
                s_audio.play();
                break;
            case 'wow':
                let w_audio = new Audio(`audio/${wow_sounds[Math.floor(wow_sounds.length * Math.random())]}.mp3`);
                w_audio.play();
                break;
            case 'error':
                let e_audio = new Audio(`audio/${error_sounds[Math.floor(error_sounds.length * Math.random())]}.mp3`);
                e_audio.play();
                break;
        }
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
                    <div class="time" data-timestamp="${event.timestamp}">${moment(event.timestamp).fromNow()}</div>
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
        
        window.setTimeout(() => {
            this.runParty();
            switch(event.eventType){
                case 'pull_request_opened':
                    this.playSound('wow')
                    break
                case 'pull_request_merged':
                    this.playSound('success')
                    break
                case 'pull_request_closed':
                    this.playSound('error')
                    break
                default:
                    this.playSound('success')
                    break
            }
            
        }, 1600)
    }

    async setupParty() {
        const events = await fetch('events.json?' + new Date()).then(response => response.json());
        events.sort(function(a,b){
            return new Date(a.timestamp) - new Date(b.timestamp);
        }); //getting the oldest events

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
                        <div class="time" data-timestamp="${event.timestamp}">${moment(event.timestamp).fromNow()}</div>
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

    updateTime() {
        const eventElements = document.querySelectorAll('.events');
        eventElements.forEach((eventElement) => {
            let timeElement = eventElement.querySelector(".time");
            let timeStamp = timeElement.getAttribute("data-timestamp");
            timeElement.innerHTML = moment(timeStamp).fromNow();
        });
    }

    updateAnimation() {
        this.events.forEach((event) => {
            if(event.position == -1) {
                event.position = 0;
            } else {
                event.position += 1;
                document.querySelector(`[data-id='${event.id}']`).className = `event position-${event.position > 3 ? 'hidden' : event.position}`;
            }
        });

        window.setTimeout(() => {
            document.querySelector('.event.new').classList.add('position-0');
            document.querySelector('.event.new').classList.remove('new');
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
        newEvents.sort(function(a,b){
            return new Date(a.timestamp) - new Date(b.timestamp);
        }); //getting the oldest events
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
            this.updateTime();
            this.resolveQueue();
        }, 4000)
    }
}


document.querySelector('#startButton').addEventListener('click', () => {
    document.querySelector('.overlay').classList.add('hidden');
    new EventHandler()
});