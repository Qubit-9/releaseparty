class EventHandler {

    runParty() {
        party.confetti(document.querySelector('.event'), {
            count: party.variation.range(50, 100)
        })
    }

    playSuccessSound() {
        let audio = new Audio('audio/tuturu.mp3');
        audio.play();
    }

    moveAllDown() {
        window.setTimeout(() => {
            document.querySelector('.event.inactive-2').classList.add('inactive-3');
            document.querySelector('.event.inactive-3').classList.remove('inactive-2');

            document.querySelector('.event.inactive-1').classList.add('inactive-2');
            document.querySelector('.event.inactive-2').classList.remove('inactive-1');

            document.querySelector('.event.active').classList.add('inactive-1');
            document.querySelector('.event.active').classList.remove('active');
            this.playSuccessSound();

            window.setTimeout(() => {
                document.querySelector('.event.new').classList.remove('new');
                this.runParty()
            }, 800)
        }, 3000)
    }

    constructor() {
        this.moveAllDown()
    }
}


document.querySelector('#startButton').addEventListener('click', () => {
    document.querySelector('.overlay').classList.add('hidden');
    new EventHandler()
});