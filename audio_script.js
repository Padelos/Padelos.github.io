const backgroundMusic = document.getElementById('backgroundMusic');
const playButton = document.getElementById('playButton');

function playBackgroundMusicForDuration(durationInSeconds) {
    backgroundMusic.play();

    setTimeout(() => {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }, durationInSeconds * 1000);
}

playButton.addEventListener('click', () => {
    playBackgroundMusicForDuration(30); // Adjust the duration as needed
});