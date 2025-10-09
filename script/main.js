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
    let onLoadFunc = undefined; // Function to be called after page has loaded

    // Only the pages in this switch statement will be allowed to load
    switch (page) {
        case "add":
            title = 'Add new quest'
            path = 'addQuestForm.html';
            onLoadFunc = setupAddQuestForm;
            break;
        case "active":
            title = 'All active quests'
            path = 'activeQuests.html';
            onLoadFunc = displayActiveQuests;
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

    // Async loading of html file. Will show page contents or an error message if it fails to load.
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

// When no data is stored, this is the data that will be used initially
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
        // Random number value. Converted to base36
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

    // Find category
    const allCategoryIDs = Object.keys(data);
    let categoryID = allCategoryIDs.find((id) => data[id].categoryName === category);

    // If category doesn't exist, create it
    if (!categoryID) categoryID = createNewCategoryID();

    if (!data[categoryID]) data[categoryID] = { categoryName: category, items: [] };

    // Add item to category
    data[categoryID].items.push({
        description: description,
        completed: false,
    });

    // Store quest data
    localStorage.setItem('quests', JSON.stringify(data));
}

/**
 * Adds html elements to show active quests
 */
function displayActiveQuests() {
    // Elements
    const questListContainer = document.querySelector('#questListContainer');
    questListContainer.innerHTML = '';

    // Data
    const data = getQuestsData();
    const allCategoryIDs = Object.keys(data);

    // For each category, add items in category
    allCategoryIDs.forEach((id) => {
        const { categoryName, items } = data[id];

        // Add category heading
        const categoryNameHeading = document.createElement('h2');

        categoryNameHeading.textContent = categoryName;
        questListContainer.appendChild(categoryNameHeading);

        // Add quest list 
        const questList = document.createElement('ul');
        questList.classList.add('questList');
        questListContainer.appendChild(questList);

        // Show a message if category contains no items
        if (!items.length) {
            const questItem = document.createElement('li');
            questItem.textContent = 'No quests remaining in this category! Why not add a new quest?';

            questList.appendChild(questItem);
            return;
        }

        // Add each item in category
        items.forEach((item) => {
            const questItem = document.createElement('li');
            questItem.textContent = item.description;

            questList.appendChild(questItem);
        });
    });
}

function setupAddQuestForm() {
    // Elements
    const addQuestForm = document.querySelector('#addQuestForm');

    const questCategorySelector = addQuestForm.querySelector('#questCategory');
    const newCategoryOption = questCategorySelector.options.item(0)

    const newCategoryInputLabel = addQuestForm.querySelector('#newCategoryNameLabel');
    const newCategoryInput = addQuestForm.querySelector('#newCategoryName');

    const questDescriptionText = addQuestForm.querySelector('#questDescription');

    const cancelButton = addQuestForm.querySelector('#cancel');
    const addQuestButton = addQuestForm.querySelector('#addQuest');

    const questErrorDiv = document.querySelector('#addQuestErrorMessage');

    // Data
    const data = getQuestsData();
    const allCategoryIDs = Object.keys(data);

    // Add categories to catergory selector
    allCategoryIDs.forEach((id) => {
        const categoryName = data[id].categoryName;

        const option = document.createElement('option');
        option.textContent = categoryName;
        option.value = id;

        // Add category before New Category option
        questCategorySelector.options.add(option, newCategoryOption);
    })

    // Select the first category
    questCategorySelector.options.selectedIndex = 0;

    // Show / hide category name input
    questCategorySelector.addEventListener('change', (e) => {
        if (e.target.value === '__NEW__CATEGORY__') {
            newCategoryInputLabel.classList.remove('hidden');
            newCategoryInput.classList.remove('hidden');
        } else {
            newCategoryInputLabel.classList.add('hidden');
            newCategoryInput.classList.add('hidden');
        }
    });

    // Cancel button returns user to active quests page
    cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        loadPage('active');
    });

    // Add quest button is clicked
    addQuestButton.addEventListener('click', (e) => {
        e.preventDefault();

        // Get values from form
        const selectedCategory = questCategorySelector.options.item(questCategorySelector.options.selectedIndex).textContent;
        const isNewCategorySelected = newCategoryOption.selected;
        const newCategoryName = newCategoryInput.value.trim();
        const description = questDescriptionText.value.trim();

        // Validate data before adding quest
        if (isNewCategorySelected && !newCategoryName.length) {
            questErrorDiv.textContent = '** Name of new category can\'t be empty!';
            questErrorDiv.classList.remove('hidden');
            return;
        } else if (!description.length) {
            questErrorDiv.textContent = '** Quest description cant\'t be empty!';
            questErrorDiv.classList.remove('hidden');
            return;
        } else {
            questErrorDiv.classList.add('hidden');
        }

        // Add quest
        if (isNewCategorySelected) {
            addQuest(newCategoryName, description);
        } else {
            addQuest(selectedCategory, description);
        }

        loadPage('active');
    })
}