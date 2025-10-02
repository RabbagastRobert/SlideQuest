// MAIN CONTENT

const mainContent = document.querySelector('#mainContent');

// NAVIGATION BUTTONS

const navButtons = {
    add: document.querySelector('#navAssignmentAdd'),
    active: document.querySelector('#navAssignmentsActive'),
    history: document.querySelector('#navAssignmentsHistory'),
    settings: document.querySelector('#navSettings'),
}


// NAVIGATION FUNCTIONS


/**
 * Set current selected nav button and apply styling
 * @param {keyof navButtons} button 
 */
function setSelectedNavButton(button) {
    const keys = Object.keys(navButtons);

    keys.forEach((key) => {
        if (key === button) {
            navButtons[key].classList.add('selected');
        } else {
            navButtons[key].classList.remove('selected');
        }
    });
}

// Show: Add quest
navButtons.add.addEventListener('click', () => {
    setSelectedNavButton('add');

    fetch('addQuestForm.html').then((response) => {
        response.text().then((value) => mainContent.innerHTML = value);
    }, (reason) => {
        mainContent.textContent = `Failed to load page! Reason: ${reason}`;
    })
});

// Show: Active quests
navButtons.active.addEventListener('click', () => {
    setSelectedNavButton('active');
});

// Show: Quests history
navButtons.history.addEventListener('click', () => {
    setSelectedNavButton('history');
});

// Show: Settings
navButtons.settings.addEventListener('click', () => {
    setSelectedNavButton('settings');
});
