// ENTRY POINT

loadPage('active');

// HTML ELEMENTS

const pageTitle = document.querySelector('#pageTitle');
const pageContent = document.querySelector('#pageContent');

const navButtons = {
    add: document.querySelector('#navAssignmentAdd'),
    active: document.querySelector('#navAssignmentsActive'),
    history: document.querySelector('#navAssignmentsHistory'),
    settings: document.querySelector('#navSettings'),
}

// PAGE NAVIGATION FUNCTIONS

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

/**
 * Set the current page title
 * @param {string} title 
 */
function setPageTitle(title) {
    pageTitle.textContent = title;
}

/**
 * Load the selected page
 * @param {keyof navButtons | '404'} page 
 */
function loadPage(page) {
    let path = '';
    let title = '';
    let onLoadFunc = undefined;

    switch (page) {
        case "add":
            title = 'Add new quest'
            path = 'addQuestForm.html';
            break;
        case "active":
            title = 'All active quests'
            path = 'activeQuests.html';
            onLoadFunc = displayQuests;
            break;
        case "history":
            title = 'Quests history'
            path = 'previousQuests.html';
            break;
        case "settings":
            title = 'Settings';
            path = 'settings.html';
            break;
        case "404":
        default:
            title = '404 - Page not found'
            path = '404.html';
    }

    fetch(path).then((response) => {
        if (response.status === 200) {
            setSelectedNavButton(page);
            setPageTitle(title);
            response.text().then((value) => {
                pageContent.innerHTML = value;
                if (onLoadFunc) onLoadFunc();
            });
        } else if (response.status === 404) {
            loadPage('404');
        } else {
            setSelectedNavButton(null);
            setPageTitle('An error occured!');
            pageContent.textContent = 'Failed to load page! Error: ' + response.status + ' - ' + response.statusText;
        }
    }, (reason) => {
        setPageTitle('An error occured!');
        pageContent.textContent = `Failed to load page! Reason: ${reason}`;
    });
}

// Setup navigation button event listeners
Object.keys(navButtons).forEach((key) => {
    navButtons[key].addEventListener('click', () => loadPage(key));
});


// QUEST FUNCTIONS
const initialQuestData = {
    cat1: {
        categoryName: 'Home Quests',
        items: [],
    },
    cat2: {
        categoryName: 'Work Quests',
        items: [],
    },
    cat3: {
        categoryName: 'Shopping Quests',
        items: [],
    },
    cat4: {
        categoryName: 'Event Quests',
        items: [],
    }
}

/**
 * Get quests data JSON from local storage and returs the parsed object
 */
function getQuestsData() {
    const rawData = localStorage.getItem('quests');
    const data = rawData ? JSON.parse(rawData) : initialQuestData;
    return data;
}

/**
 * Creates a new unique category id
 * @returns random id
 */
function createNewCategoryID() {
    const data = getQuestsData();

    let id = -1;
    while (id < 0 || data[id] !== undefined) {
        id = Math.floor(Math.random() * 1_000_000_000).toString(36);
    }

    return id;
}

/**
 * Add a new quest to data object and store in local storage as JSON
 * @param {string} category 
 * @param {string} description 
 */
function addQuest(category, description) {
    const data = getQuestsData();

    const allCategoryIDs = Object.keys(data);
    let categoryID = allCategoryIDs.find((id) => data[id].categoryName === category);

    if (!categoryID) categoryID = createNewCategoryID();

    if (!data[categoryID]) data[categoryID] = { categoryName: category, items: [] };

    data[categoryID].items.push({
        description: description,
        completed: false,
    });

    localStorage.setItem('quests', JSON.stringify(data));
}

function displayQuests() {
    const questListContainer = document.querySelector('#questListContainer');
    questListContainer.innerHTML = '';

    const data = getQuestsData();
    const allCategoryIDs = Object.keys(data);

    allCategoryIDs.forEach((id) => {
        const { categoryName, items } = data[id];

        const categoryNameHeading = document.createElement('h2');

        categoryNameHeading.textContent = categoryName;
        questListContainer.appendChild(categoryNameHeading);

        const questList = document.createElement('ul');
        questList.classList.add('questList');
        questListContainer.appendChild(questList);

        if (!items.length) {
            const questItem = document.createElement('li');
            questItem.textContent = 'No quests remaining in this category! Why not add a new quest?';

            questList.appendChild(questItem);
            return;
        }

        items.forEach((item) => {
            const questItem = document.createElement('li');
            questItem.textContent = item.description;

            questList.appendChild(questItem);
        });
    });
}