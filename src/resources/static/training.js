// training.js - handles training functionality, CRUD sessions

document.addEventListener('DOMContentLoaded', function() {
    initTrainingPage();
});

/**
 * Initialize the training page functionality
 */
function initTrainingPage() {
    console.log("Initializing training page...");

    // Prevent double initialization
    if (window.trainingPageInitialized) {
        return;
    }
    window.trainingPageInitialized = true;

    loadExercises();
    loadTeams();
    loadSessions();

    setupEventListeners();
}

/**
 * Set up all event listeners for the training page
 */
function setupEventListeners() {
    const addTrainingBtn = document.getElementById('addTrainingBtn');
    if (addTrainingBtn) {
        addTrainingBtn.removeEventListener('click', showCreateTrainingPage);
        addTrainingBtn.addEventListener('click', showCreateTrainingPage);
    }

    const addExerciseBtn = document.getElementById('addExerciseBtn');
    if (addExerciseBtn) {
        addExerciseBtn.removeEventListener('click', addExerciseRow);
        addExerciseBtn.addEventListener('click', addExerciseRow);
    }

    const cancelBtn = document.getElementById('cancelTrainingBtn');
    if (cancelBtn) {
        cancelBtn.removeEventListener('click', cancelTrainingForm);
        cancelBtn.addEventListener('click', cancelTrainingForm);
    }

    const trainingForm = document.getElementById('trainingForm');
    if (trainingForm) {
        trainingForm.removeEventListener('submit', handleFormSubmit);
        trainingForm.addEventListener('submit', handleFormSubmit);
    }

    const backToTrainingBtn = document.getElementById('backToTrainingBtn');
    if (backToTrainingBtn) {
        backToTrainingBtn.removeEventListener('click', showTrainingPage);
        backToTrainingBtn.addEventListener('click', showTrainingPage);
    }
}

/**
 * Handle form submission with proper error handling
 */
function handleFormSubmit(e) {
    e.preventDefault();

    if (e.target.dataset.submitting === 'true') {
        console.log("Form already submitting, ignoring duplicate submission");
        return;
    }

    e.target.dataset.submitting = 'true';

    saveTrainingSession()
        .finally(() => {
            e.target.dataset.submitting = 'false';
        });
}

/**
 * Show the training creation page
 */
function showCreateTrainingPage() {
    resetTrainingFormMode();

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    document.getElementById('create-training-page').classList.add('active');

    resetTrainingForm();
    setDefaultFormValues();
}

/**
 * Reset the training form to its initial state
 */
function resetTrainingForm() {
    const form = document.getElementById('trainingForm');
    form.reset();

    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    exercisesTable.innerHTML = '';
}

/**
 * Set default values for the form
 */
function setDefaultFormValues() {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    document.getElementById('trainingDate').value = formattedDate;
    document.getElementById('startTime').value = '18:00';
    document.getElementById('endTime').value = '19:30';
    document.getElementById('location').value = 'Farum Park';
}

/**
 * Show the training overview page
 */
function showTrainingPage() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    document.getElementById('traening-page').classList.add('active');
    loadSessions();
}

/**
 * Cancel training form and return to main training page
 */
function cancelTrainingForm() {
    console.log("Canceling training form");
    showTrainingPage();
}

/**
 * Load available exercises from the backend
 */
function loadExercises() {
    console.log("Loading exercises...");

    fetch('http://localhost:8080/fodboldklub/exercises')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch exercises: ${response.status}`);
            }
            return response.json();
        })
        .then(exercises => {
            if (exercises && Array.isArray(exercises)) {
                window.availableExercises = exercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    name: ex.name || `Exercise ${ex.exerciseId}`,
                    description: ex.description || '',
                    duration: ex.duration || 10
                }));
                console.log(`Loaded ${exercises.length} exercises`);
            } else {
                createFallbackExercises();
            }
        })
        .catch(error => {
            console.error('Error loading exercises:', error);
            createFallbackExercises();
        });
}

/**
 * Create fallback exercises when API fails
 */
function createFallbackExercises() {
    console.log("Creating fallback exercises");
    window.availableExercises = [
        { exerciseId: 1, name: "Opvarmning", description: "Grundig opvarmning", duration: 10 },
        { exerciseId: 2, name: "5 Star Handball", description: "Australsk fodbold-inspireret håndboldøvelse", duration: 15 },
        { exerciseId: 3, name: "Kicking Practice", description: "Øvelser til at forbedre spark-teknik", duration: 20 },
        { exerciseId: 4, name: "Marking Drills", description: "Øvelser til at forbedre gribeteknik", duration: 15 },
        { exerciseId: 5, name: "Tackling Technique", description: "Sikker tackling-teknik øvelser", duration: 15 }
    ];
}

/**
 * Load teams for the team select
 */
function loadTeams() {
    console.log("Loading teams...");

    const endpoints = [
        'http://localhost:8080/fodboldklub/teams',
        'http://localhost:8080/teams'
    ];

    const fallbackTeams = [
        { teamId: 1, name: "Farum Cats" },
        { teamId: 2, name: "Ungdomshold" }
    ];

    const populateTeamSelect = (teams) => {
        const teamSelect = document.getElementById('teamSelect');
        if (!teamSelect) return;

        teamSelect.innerHTML = '<option value="">Vælg hold...</option>';

        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.teamId;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
    };

    // Try primary endpoint first
    fetch(endpoints[0])
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(teams => {
            if (teams && Array.isArray(teams) && teams.length > 0) {
                populateTeamSelect(teams);
            } else {
                throw new Error('No teams returned');
            }
        })
        .catch(error => {
            console.error(`Primary endpoint failed: ${error.message}`);
            // Try fallback endpoint
            fetch(endpoints[1])
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                })
                .then(teams => {
                    if (teams && Array.isArray(teams) && teams.length > 0) {
                        populateTeamSelect(teams);
                    } else {
                        throw new Error('No teams from fallback');
                    }
                })
                .catch(() => {
                    console.log("Using fallback teams");
                    populateTeamSelect(fallbackTeams);
                });
        });
}

/**
 * Load all sessions and update the UI
 */
function loadSessions() {
    console.log("Loading sessions...");

    fetch('http://localhost:8080/sessions')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch sessions: ${response.status}`);
            }
            return response.json();
        })
        .then(sessions => {
            console.log("Sessions loaded:", sessions);
            updateCalendarWithSessions(sessions);
            updateSessionsTable(sessions);
        })
        .catch(error => {
            console.error('Error loading sessions:', error);
            // Show empty state
            const tableBody = document.querySelector('#sessionsTable tbody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Kunne ikke indlæse træningssessioner</td></tr>';
            }
        });
}

/**
 * Update the calendar with session data
 */
function updateCalendarWithSessions(sessions) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthNames = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'December'];

    const calendarTitle = document.querySelector('.calendar-header h3');
    if (calendarTitle) {
        calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    generateCalendar(currentMonth, currentYear);

    sessions.forEach(session => {
        const sessionDate = new Date(session.dateTime);

        if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
            const day = sessionDate.getDate();
            const dateCell = document.querySelector(`.calendar td[data-day="${day}"]`);

            if (dateCell) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event training';
                eventEl.dataset.id = session.sessionId;

                const timeStr = sessionDate.toLocaleTimeString('da-DK', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const teamName = session.team ? session.team.name : 'Ukendt hold';
                eventEl.textContent = `${timeStr} - ${teamName}`;

                eventEl.addEventListener('click', () => viewSessionDetails(session.sessionId));
                dateCell.appendChild(eventEl);
            }
        }
    });
}

/**
 * Generate calendar for the specified month
 */
function generateCalendar(month, year) {
    const calendarBody = document.querySelector('.calendar tbody');
    if (!calendarBody) return;

    calendarBody.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6;

    let currentRow = document.createElement('tr');

    for (let i = 0; i < firstDayOfWeek; i++) {
        currentRow.appendChild(document.createElement('td'));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        if ((firstDayOfWeek + day - 1) % 7 === 0 && day > 1) {
            calendarBody.appendChild(currentRow);
            currentRow = document.createElement('tr');
        }

        const dayCell = document.createElement('td');
        dayCell.setAttribute('data-day', day);

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        currentRow.appendChild(dayCell);
    }

    if (currentRow.hasChildNodes()) {
        calendarBody.appendChild(currentRow);
    }
}

/**
 * Update the sessions table with the latest data
 */
function updateSessionsTable(sessions) {
    const tableBody = document.querySelector('#sessionsTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const now = new Date();
    const futureSessions = sessions
        .filter(session => new Date(session.dateTime) > now)
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    if (futureSessions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Ingen kommende træningssessioner</td></tr>';
        return;
    }

    futureSessions.forEach(session => {
        const row = document.createElement('tr');
        const sessionDate = new Date(session.dateTime);

        const dateStr = sessionDate.toLocaleDateString('da-DK');
        const timeStr = sessionDate.toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const teamName = session.team ? session.team.name : 'Ukendt hold';
        const exerciseCount = session.exercises ? session.exercises.length : 0;

        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${timeStr}</td>
            <td>${teamName}</td>
            <td>${session.location}</td>
            <td>${exerciseCount}</td>
            <td>
                <button class="btn btn-primary btn-sm view-session" data-id="${session.sessionId}">Vis</button>
                <button class="btn btn-danger btn-sm delete-session" data-id="${session.sessionId}">Slet</button>
            </td>
        `;
        row.querySelector('.view-session').addEventListener('click', (e) => {
            viewSessionDetails(e.target.dataset.id);
        });

        row.querySelector('.delete-session').addEventListener('click', (e) => {
            confirmDeleteSession(e.target.dataset.id);
        });

        tableBody.appendChild(row);
    });
}

/**
 * View session details
 */
function viewSessionDetails(sessionId) {
    console.log("Viewing session details for ID:", sessionId);

    fetch(`http://localhost:8080/sessions/${sessionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch session: ${response.status}`);
            }
            return response.json();
        })
        .then(session => {
            showSessionDetailsPage(session);
        })
        .catch(error => {
            console.error('Error loading session details:', error);
            alert('Der opstod en fejl ved indlæsning af sessionens detaljer.');
        });
}

/**
 * Show session details page
 */
function showSessionDetailsPage(session) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    document.getElementById('view-training-page').classList.add('active');
    updateSessionDetailsView(session);
}

/**
 * Update session details view
 */
function updateSessionDetailsView(session) {
    const sessionDate = new Date(session.dateTime);
    const dateStr = sessionDate.toLocaleDateString('da-DK');
    const startTimeStr = sessionDate.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // træmninger 90 minutter
    const endTime = new Date(sessionDate.getTime() + 90 * 60000);
    const endTimeStr = endTime.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('sessionTitle').textContent = `Træningssession - ${dateStr}`;
    document.getElementById('sessionDate').textContent = dateStr;
    document.getElementById('sessionTime').textContent = `${startTimeStr} - ${endTimeStr}`;
    document.getElementById('sessionTeam').textContent = session.team ? session.team.name : 'Ukendt hold';
    document.getElementById('sessionLocation').textContent = session.location || 'Ingen lokation angivet';

    const descriptionEl = document.getElementById('sessionDescription');
    if (descriptionEl) {
        descriptionEl.textContent = session.description || 'Ingen beskrivelse';
    }

    updateSessionExercisesTable(session.exercises || []);
    setupSessionActionButtons(session.sessionId);
}

/**
 * Update the session exercises table
 */
function updateSessionExercisesTable(exercises) {
    const tableBody = document.querySelector('#sessionExercisesTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (exercises.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Ingen øvelser tilføjet</td></tr>';
        return;
    }

    const sortedExercises = [...exercises].sort((a, b) => a.orderNum - b.orderNum);

    sortedExercises.forEach(exercise => {
        const row = document.createElement('tr');

        let exerciseName = 'Ukendt øvelse';
        let exerciseDuration = '-';

        if (window.availableExercises) {
            const exerciseDetails = window.availableExercises.find(e =>
                e.exerciseId == exercise.exerciseId
            );

            if (exerciseDetails) {
                exerciseName = exerciseDetails.name;
                exerciseDuration = exerciseDetails.duration ? `${exerciseDetails.duration} min` : '-';
            }
        }

        row.innerHTML = `
            <td>${exercise.orderNum}</td>
            <td>${exerciseName}</td>
            <td>${exerciseDuration}</td>
            <td>${exercise.notes || '-'}</td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Set up session action buttons
 */
function setupSessionActionButtons(sessionId) {
    const editBtn = document.getElementById('editSessionBtn');
    const deleteBtn = document.getElementById('deleteSessionBtn');

    if (editBtn) {
        editBtn.removeEventListener('click', editBtn._clickHandler);
        editBtn._clickHandler = () => editSession(sessionId);
        editBtn.addEventListener('click', editBtn._clickHandler);
    }

    if (deleteBtn) {
        deleteBtn.removeEventListener('click', deleteBtn._clickHandler);
        deleteBtn._clickHandler = () => confirmDeleteSession(sessionId);
        deleteBtn.addEventListener('click', deleteBtn._clickHandler);
    }
}

/**
 * Confirm deletion of a session
 */
function confirmDeleteSession(sessionId) {
    const modal = document.getElementById('confirmDeleteModal');
    if (!modal) {
        if (confirm('Er du sikker på, at du vil slette denne træningssession?')) {
            deleteSession(sessionId);
        }
        return;
    }

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const closeBtn = modal.querySelector('.close');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        deleteSession(sessionId);
        modal.style.display = 'none';
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    modal.style.display = 'block';
}

/**
 * Delete a session
 */
function deleteSession(sessionId) {
    fetch(`http://localhost:8080/sessions/${sessionId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to delete session: ${response.status}`);
            }

            console.log("Session deleted successfully");
            showTrainingPage();
            alert('Træningssession blev slettet.');
        })
        .catch(error => {
            console.error('Error deleting session:', error);
            alert('Der opstod en fejl ved sletning af træningssessionen.');
        });
}

/**
 * Edit a session
 */
function editSession(sessionId) {
    fetch(`http://localhost:8080/sessions/${sessionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch session: ${response.status}`);
            }
            return response.json();
        })
        .then(session => {
            showEditSessionForm(session);
        })
        .catch(error => {
            console.error('Error loading session for editing:', error);
            alert('Der opstod en fejl ved indlæsning af træningssessionen.');
        });
}

/**
 * Show edit session form
 */
function showEditSessionForm(session) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    document.getElementById('create-training-page').classList.add('active');
    const pageHeader = document.querySelector('#create-training-page .page-header h2');
    if (pageHeader) {
        pageHeader.textContent = 'Rediger Træningssession';
    }

    const form = document.getElementById('trainingForm');
    form.dataset.editMode = 'true';
    form.dataset.sessionId = session.sessionId;

    populateEditForm(session);
}

/**
 * Populate form with session data for editing
 */
function populateEditForm(session) {
    resetTrainingForm();

    const sessionDate = new Date(session.dateTime);
    const formattedDate = sessionDate.toLocaleDateString('da-DK');
    const formattedTime = sessionDate.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('trainingTitle').value = session.title || `Træning ${formattedDate}`;
    document.getElementById('trainingDate').value = formattedDate;
    document.getElementById('startTime').value = formattedTime;

    const endTime = new Date(sessionDate.getTime() + 90 * 60000);
    document.getElementById('endTime').value = endTime.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (session.team && session.team.teamId) {
        document.getElementById('teamSelect').value = session.team.teamId;
    }

    if (session.location) {
        document.getElementById('location').value = session.location;
    }

    const descriptionEl = document.getElementById('description');
    if (descriptionEl && session.description) {
        descriptionEl.value = session.description;
    }

    if (session.exercises && session.exercises.length > 0) {
        const sortedExercises = [...session.exercises].sort((a, b) => a.orderNum - b.orderNum);
        sortedExercises.forEach(exercise => {
            addExerciseRowWithData(exercise);
        });
    }
}

/**
 * Add a new exercise row to the form
 */
function addExerciseRow() {
    if (!window.availableExercises || !Array.isArray(window.availableExercises)) {
        console.error("No available exercises to add");
        alert("Kunne ikke indlæse øvelser. Prøv at genindlæse siden.");
        return;
    }

    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>
            <select class="exercise-select" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                <option value="">Vælg øvelse...</option>
            </select>
        </td>
        <td>
            <input type="number" class="exercise-duration" placeholder="Minutter" min="1" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
        </td>
        <td>
            <input type="text" class="exercise-notes" placeholder="Noter til øvelsen..." style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm remove-exercise">Fjern</button>
        </td>
    `;

    const select = newRow.querySelector('.exercise-select');
    const durationInput = newRow.querySelector('.exercise-duration');

    window.availableExercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex.exerciseId;
        option.textContent = ex.name;
        option.dataset.duration = ex.duration;
        select.appendChild(option);
    });

    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.duration) {
            durationInput.value = selectedOption.dataset.duration;
        }
    });

    newRow.querySelector('.remove-exercise').addEventListener('click', function() {
        newRow.remove();
    });

    exercisesTable.appendChild(newRow);
}

/**
 * Add exercise row with pre-filled data (for editing)
 */
function addExerciseRowWithData(exerciseData) {
    if (!window.availableExercises) {
        console.error("Available exercises not loaded");
        return;
    }

    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>
            <select class="exercise-select" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                <option value="">Vælg øvelse...</option>
            </select>
        </td>
        <td>
            <input type="number" class="exercise-duration" placeholder="Minutter" min="1" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
        </td>
        <td>
            <input type="text" class="exercise-notes" placeholder="Noter til øvelsen..." style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm remove-exercise">Fjern</button>
        </td>
    `;

    const select = newRow.querySelector('.exercise-select');
    const durationInput = newRow.querySelector('.exercise-duration');
    const notesInput = newRow.querySelector('.exercise-notes');

    window.availableExercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex.exerciseId;
        option.textContent = ex.name;
        option.dataset.duration = ex.duration;

        if (ex.exerciseId == exerciseData.exerciseId) {
            option.selected = true;
            durationInput.value = ex.duration;
        }

        select.appendChild(option);
    });

    notesInput.value = exerciseData.notes || '';

    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.duration) {
            durationInput.value = selectedOption.dataset.duration;
        }
    });

    newRow.querySelector('.remove-exercise').addEventListener('click', function() {
        newRow.remove();
    });

    exercisesTable.appendChild(newRow);
}

/**
 * Save or update a training session
 */
async function saveTrainingSession() {
    console.log("Saving training session...");

    const form = document.getElementById('trainingForm');

    if (!validateTrainingForm()) {
        return;
    }

    const isEditMode = form.dataset.editMode === 'true';
    const sessionId = isEditMode ? form.dataset.sessionId : null;

    try {
        const payload = buildSessionPayload();

        const url = isEditMode
            ? `http://localhost:8080/sessions/${sessionId}`
            : 'http://localhost:8080/sessions';

        const method = isEditMode ? 'PUT' : 'POST';

        console.log(`${method} ${url}`, payload);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        }

        const data = await response.json();
        console.log(`Session ${isEditMode ? 'updated' : 'created'} successfully:`, data);

        alert(`Træningssession blev ${isEditMode ? 'opdateret' : 'oprettet'}!`);

        form.dataset.editMode = 'false';
        form.dataset.sessionId = '';

        const pageHeader = document.querySelector('#create-training-page .page-header h2');
        if (pageHeader) {
            pageHeader.textContent = 'Opret Træningssession';
        }

        showTrainingPage();

    } catch (error) {
        console.error('Error saving session:', error);
        alert(`Der opstod en fejl: ${error.message}`);
    }
}

/**
 * Build the session payload for API submission
 */
function buildSessionPayload() {
    const dateStr = document.getElementById('trainingDate').value;
    const startTime = document.getElementById('startTime').value;
    const teamId = document.getElementById('teamSelect').value;
    const location = document.getElementById('location').value || 'Farum Park';
    const description = document.getElementById('description').value || '';

    const [day, month, year] = dateStr.split('/');
    const [hours, minutes] = startTime.split(':');
    const dateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;

    const exercises = [];
    const exerciseRows = document.querySelectorAll('#exercisesTable tbody tr');

    exerciseRows.forEach((row, index) => {
        const exerciseSelect = row.querySelector('.exercise-select');
        const exerciseId = exerciseSelect?.value;

        if (exerciseId && exerciseId !== '') {
            exercises.push({
                exerciseId: parseInt(exerciseId),
                orderNum: index + 1,
                notes: row.querySelector('.exercise-notes')?.value || ''
            });
        }
    });

    return {
        session: {
            dateTime: dateTime,
            location: location,
            description: description,
            team: {
                teamId: parseInt(teamId)
            }
        },
        exercises: exercises
    };
}

/**
 * Validate the training form
 */
function validateTrainingForm() {
    const title = document.getElementById('trainingTitle')?.value;
    if (!title || title.trim() === '') {
        alert('Indtast venligst en titel for træningssessionen.');
        return false;
    }

    const dateStr = document.getElementById('trainingDate').value;
    if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        alert('Indtast venligst en gyldig dato (DD/MM/ÅÅÅÅ).');
        return false;
    }

    const startTime = document.getElementById('startTime').value;
    if (!startTime || !/^\d{1,2}:\d{2}$/.test(startTime)) {
        alert('Indtast venligst et gyldigt tidspunkt (TT:MM).');
        return false;
    }

    const teamId = document.getElementById('teamSelect').value;
    if (!teamId) {
        alert('Vælg venligst et hold.');
        return false;
    }

    const exerciseSelects = document.querySelectorAll('.exercise-select');
    let hasValidExercise = false;

    exerciseSelects.forEach(select => {
        if (select.value) {
            hasValidExercise = true;
        }
    });

    if (!hasValidExercise) {
        alert('Tilføj venligst mindst én øvelse til træningssessionen.');
        return false;
    }

    return true;
}

/**
 * Reset the training form to create mode
 */
function resetTrainingFormMode() {
    const form = document.getElementById('trainingForm');
    form.dataset.editMode = 'false';
    form.dataset.sessionId = '';

    const pageHeader = document.querySelector('#create-training-page .page-header h2');
    if (pageHeader) {
        pageHeader.textContent = 'Opret Træningssession';
    }
}

window.showTrainingPage = showTrainingPage;
window.editSession = editSession;
window.confirmDeleteSession = confirmDeleteSession;