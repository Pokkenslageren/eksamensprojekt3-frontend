// training.js - handles training functionality, CRUD sessions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form handlers when the DOM is loaded
    initTrainingPage();
});

/**
 * Initialize the training page functionality
 */
function initTrainingPage() {
    console.log("Initializing training page...");

    loadExercises();
    loadTeams();
    loadSessions();

    document.getElementById('addTrainingBtn').addEventListener('click', showCreateTrainingPage);
    document.getElementById('addExerciseBtn').addEventListener('click', addExerciseRow);

    const cancelBtn = document.getElementById('cancelTrainingBtn');
    if (cancelBtn) {
        cancelBtn.setAttribute('onclick', 'cancelTrainingForm()');
    }

    const trainingForm = document.getElementById('trainingForm');
    if (trainingForm) {
        trainingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted");
            saveTrainingSession();
        });
    }

    const backToTrainingBtn = document.getElementById('backToTrainingBtn');
    if (backToTrainingBtn) {
        backToTrainingBtn.setAttribute('onclick', 'showTrainingPage()');
    }
}

/**
 * Show the training creation page
 */
function showCreateTrainingPage() {
    resetTrainingFormMode();

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    document.getElementById('create-training-page').classList.add('active');
    document.getElementById('trainingForm').reset();

    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    exercisesTable.innerHTML = '';

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    document.getElementById('trainingDate').value = formattedDate;
    document.getElementById('startTime').value = '18:00';
    document.getElementById('endTime').value = '19:30';

    const cancelBtn = document.getElementById('cancelTrainingBtn');
    if (cancelBtn) {
        cancelBtn.setAttribute('onclick', 'cancelTrainingForm()');
    }
}

/**
 * Set up event listeners for the training form buttons
 */
function setupTrainingFormButtons() {
    const cancelBtn = document.getElementById('cancelTrainingBtn');
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    newCancelBtn.addEventListener('click', function() {
        console.log("Cancel button clicked");
        showTrainingPage();
    });


    const trainingForm = document.getElementById('trainingForm');
    if (trainingForm) {
        const newForm = trainingForm.cloneNode(true);
        trainingForm.parentNode.replaceChild(newForm, trainingForm);

        document.getElementById('trainingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted");

            if (this.dataset.isSubmitting === 'true') {
                console.log("Already submitting, ignoring additional click");
                return;
            }

            this.dataset.isSubmitting = 'true';
            saveTrainingSession();
            this.dataset.isSubmitting = 'false';
        });

        const addExerciseBtn = document.getElementById('addExerciseBtn');
        if (addExerciseBtn) {
            const newAddExerciseBtn = addExerciseBtn.cloneNode(true);
            addExerciseBtn.parentNode.replaceChild(newAddExerciseBtn, addExerciseBtn);
            document.getElementById('addExerciseBtn').addEventListener('click', addExerciseRow);
        }
    }
}
/**
 * Show the training overview page
 */
function showTrainingPage() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    document.getElementById('traening-page').classList.add('active');

    loadSessions();
}

/**
 * Cancel training form and return to main training page
 */
function cancelTrainingForm() {
    console.log("Cancel button clicked directly");
    document.getElementById('create-training-page').classList.remove('active');
    document.getElementById('traening-page').classList.add('active');

    loadSessions();
}


/**
 * Load available exercises from the backend
 */
function loadExercises() {
    console.log("Loading exercises...");

    fetch('http://localhost:8080/fodboldklub/exercises')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch exercises: ' + response.status);
            }
            return response.json();
        })
        .then(exercises => {

            if (exercises && Array.isArray(exercises)) {

                window.availableExercises = exercises.map(ex => {

                    return {
                        exerciseId: ex.exerciseId,
                        name: ex.name || `Exercise ${ex.exerciseId}`,
                        description: ex.description || '',
                        duration: ex.duration || 10
                    };
                });
            } else {
                // Create fallback exercises
                window.availableExercises = [
                    { exerciseId: 1, name: "Warmup", description: "Grundig opvarmning", duration: 10 },
                    { exerciseId: 2, name: "5 Star Handball", description: "Australsk fodbold-inspireret håndboldøvelse", duration: 15 },
                    { exerciseId: 3, name: "Kicking Practice", description: "Øvelser til at forbedre spark-teknik", duration: 20 },
                    { exerciseId: 4, name: "Marking Drills", description: "Øvelser til at forbedre gribeteknik", duration: 15 },
                    { exerciseId: 5, name: "Tackling Technique", description: "Sikker tackling-teknik øvelser", duration: 15 }
                ];
            }
        })
        .catch(error => {
            console.error('Error loading exercises:', error);

            // Create fallback exercises if the fetch fails
            window.availableExercises = [
                { exerciseId: 1, name: "Warmup", description: "Grundig opvarmning", duration: 10 },
                { exerciseId: 2, name: "5 Star Handball", description: "Australsk fodbold-inspireret håndboldøvelse", duration: 15 },
                { exerciseId: 3, name: "Kicking Practice", description: "Øvelser til at forbedre spark-teknik", duration: 20 },
                { exerciseId: 4, name: "Marking Drills", description: "Øvelser til at forbedre gribeteknik", duration: 15 },
                { exerciseId: 5, name: "Tackling Technique", description: "Sikker tackling-teknik øvelser", duration: 15 }
            ];
        });
}
/**
 * Create dummy exercises for testing when API fails
 */
function createDummyExercises() {
    console.log("Creating dummy exercises for testing...");
    window.availableExercises = [
        { exerciseId: 1, name: "Warmup", description: "Grundig opvarmning", duration: 10 },
        { exerciseId: 2, name: "5 Star Handball", description: "Australsk fodbold-inspireret håndboldøvelse", duration: 15 },
        { exerciseId: 3, name: "Kicking Practice", description: "Øvelser til at forbedre spark-teknik", duration: 20 },
        { exerciseId: 4, name: "Marking Drills", description: "Øvelser til at forbedre gribeteknik", duration: 15 },
        { exerciseId: 5, name: "Tackling Technique", description: "Sikker tackling-teknik øvelser", duration: 15 }
    ];
    console.log("Dummy exercises created:", window.availableExercises);
    alert("Kunne ikke indlæse øvelser fra serveren. Bruger dummy øvelser til test.");
}

/**
 * Load teams for the team select
 */
function loadTeams() {
    console.log("Loading teams...");

    // Try both possible endpoints
    const endpoints = [
        'http://localhost:8080/teams',
        'http://localhost:8080/fodboldklub/teams'
    ];

    // Create some fallback teams
    const fallbackTeams = [
        { teamId: 1, name: "Senior hold" },
        { teamId: 2, name: "Ungdomshold" }
    ];

    // Function to populate team select
    const populateTeamSelect = (teams) => {
        console.log("Populating team select with:", teams);

        const teamSelect = document.getElementById('teamSelect');
        if (teamSelect) {
            // Clear existing options except the first (empty) option
            while (teamSelect.options.length > 1) {
                teamSelect.remove(1);
            }

            // If first option doesn't exist, add it
            if (teamSelect.options.length === 0) {
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Vælg hold...';
                teamSelect.appendChild(defaultOption);
            }

            // Add team options
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.teamId;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            });
        }
    };

    // Try to fetch from first endpoint
    fetch(endpoints[0])
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch teams: ${response.status}`);
            }
            return response.json();
        })
        .then(teams => {
            if (teams && Array.isArray(teams) && teams.length > 0) {
                console.log(`Successfully loaded ${teams.length} teams`);
                populateTeamSelect(teams);
            } else {
                throw new Error('No teams returned from API');
            }
        })
        .catch(error => {
            console.error(`Error loading teams from ${endpoints[0]}:`, error);

            // Try second endpoint
            fetch(endpoints[1])
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch teams from alt endpoint: ${response.status}`);
                    }
                    return response.json();
                })
                .then(teams => {
                    if (teams && Array.isArray(teams) && teams.length > 0) {
                        console.log(`Successfully loaded ${teams.length} teams from alt endpoint`);
                        populateTeamSelect(teams);
                    } else {
                        throw new Error('No teams returned from alternative API');
                    }
                })
                .catch(altError => {
                    console.error(`Error loading teams from ${endpoints[1]}:`, altError);
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
                throw new Error('Failed to fetch sessions: ' + response.status);
            }
            return response.json();
        })
        .then(sessions => {
            console.log("Sessions loaded:", sessions);

            // Update UI
            updateCalendarWithSessions(sessions);
            updateSessionsTable(sessions);
        })
        .catch(error => {
            console.error('Error loading sessions:', error);
        });
}

/**
 * Update the calendar with session data
 */
function updateCalendarWithSessions(sessions) {
    console.log("Updating calendar with sessions...");

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

                const hours = sessionDate.getHours();
                const minutes = sessionDate.getMinutes();
                const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                const teamName = session.team ? session.team.name : '';
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
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Sunday becomes 6
    let currentRow = document.createElement('tr');


    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('td');
        currentRow.appendChild(emptyCell);
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
    console.log("Updating sessions table...");

    const sessionsTable = document.getElementById('sessionsTable');
    if (!sessionsTable) return;

    const tableBody = sessionsTable.querySelector('tbody');
    tableBody.innerHTML = '';

    const now = new Date();
    const futureSessions = sessions.filter(session => new Date(session.dateTime) > now);

    futureSessions.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    if (futureSessions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">Ingen kommende træningssessioner</td>';
        tableBody.appendChild(row);
        return;
    }

    futureSessions.forEach(session => {
        const row = document.createElement('tr');

        const sessionDate = new Date(session.dateTime);
        const dateStr = `${sessionDate.getDate().toString().padStart(2, '0')}/${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}/${sessionDate.getFullYear()}`;
        const timeStr = `${sessionDate.getHours().toString().padStart(2, '0')}:${sessionDate.getMinutes().toString().padStart(2, '0')}`;
        const teamName = session.team ? session.team.name : 'Ukendt hold';
        const exerciseCount = session.exercises ? session.exercises.length : 0;

        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${timeStr}</td>
            <td>${teamName}</td>
            <td>${session.location}</td>
            <td>${exerciseCount}</td>
            <td>
                <button class="btn btn-primary btn-sm view-session">Vis</button>
                <button class="btn btn-danger btn-sm delete-session">Slet</button>
            </td>
        `;

        // Add event listeners for buttons
        row.querySelector('.view-session').addEventListener('click', () => viewSessionDetails(session.sessionId));
        row.querySelector('.delete-session').addEventListener('click', () => confirmDeleteSession(session.sessionId));

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
                throw new Error('Failed to fetch session details: ' + response.status);
            }
            return response.json();
        })
        .then(session => {

            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.classList.remove('active');
            });
            const viewPage = document.getElementById('view-training-page');
            viewPage.classList.add('active');
            updateSessionDetailsView(session);
        })
        .catch(error => {
            console.error('Error loading session details:', error);
            alert('Der opstod en fejl ved indlæsning af sessionens detaljer.');
        });
}

/**
 * Update session details view with normalized exercise data handling
 */
function updateSessionDetailsView(session) {
    console.log("Updating session details view with:", session);

    // Format session date and time
    const sessionDate = new Date(session.dateTime);
    const dateStr = `${sessionDate.getDate().toString().padStart(2, '0')}/${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}/${sessionDate.getFullYear()}`;
    const startTimeStr = `${sessionDate.getHours().toString().padStart(2, '0')}:${sessionDate.getMinutes().toString().padStart(2, '0')}`;
    const endTime = new Date(sessionDate.getTime() + 90 * 60000);
    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

    // Update session details
    document.getElementById('sessionTitle').textContent = `Træningssession - ${dateStr}`;
    document.getElementById('sessionDate').textContent = dateStr;
    document.getElementById('sessionTime').textContent = `${startTimeStr} - ${endTimeStr}`;
    document.getElementById('sessionTeam').textContent = session.team ? session.team.name : 'Ukendt hold';
    document.getElementById('sessionLocation').textContent = session.location || 'Ingen lokation angivet';
    if (document.getElementById('sessionDescription')) {
        document.getElementById('sessionDescription').textContent = session.description || '';
    }

    // Clear and populate exercises table
    const exercisesTable = document.getElementById('sessionExercisesTable').querySelector('tbody');
    exercisesTable.innerHTML = '';

    if (session.exercises && session.exercises.length > 0) {
        // Sort exercises by order number
        const sortedExercises = [...session.exercises].sort((a, b) => a.orderNum - b.orderNum);

        sortedExercises.forEach(exercise => {
            const row = document.createElement('tr');

            // Find exercise details from available exercises
            let exerciseName = 'Ukendt øvelse';
            let exerciseDuration = '-';

            if (window.availableExercises && window.availableExercises.length > 0) {
                // Try to find the matching exercise by ID
                const exerciseDetails = window.availableExercises.find(e =>
                    e.exerciseId == exercise.exerciseId
                );

                if (exerciseDetails) {
                    exerciseName = exerciseDetails.name || exerciseName;
                    exerciseDuration = exerciseDetails.duration ? `${exerciseDetails.duration} min` : exerciseDuration;
                }
            }

            // Create table row
            row.innerHTML = `
                <td>${exercise.orderNum}</td>
                <td>${exerciseName}</td>
                <td>${exerciseDuration}</td>
                <td>${exercise.notes || '-'}</td>
            `;

            exercisesTable.appendChild(row);
        });
    } else {
        // No exercises
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">Ingen øvelser tilføjet</td>';
        exercisesTable.appendChild(row);
    }

    // Set up action buttons
    const editBtn = document.getElementById('editSessionBtn');
    const deleteBtn = document.getElementById('deleteSessionBtn');

    if (editBtn) {
        editBtn.dataset.id = session.sessionId;
        editBtn.onclick = () => editSession(session.sessionId);
    }

    if (deleteBtn) {
        deleteBtn.dataset.id = session.sessionId;
        deleteBtn.onclick = () => confirmDeleteSession(session.sessionId);
    }
}
/**
 * Confirm deletion of a session
 */
function confirmDeleteSession(sessionId) {
    console.log("Confirming deletion of session ID:", sessionId);

    const modal = document.getElementById('confirmDeleteModal');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.dataset.id = sessionId;
    modal.style.display = 'block';

    confirmBtn.onclick = function () {
        deleteSession(sessionId);
        modal.style.display = 'none';
    };
    document.getElementById('cancelDeleteBtn').onclick = function () {
        modal.style.display = 'none';
    };

    // Close button
    modal.querySelector('.close').onclick = function () {
        modal.style.display = 'none';
    };

    // Click outside to close
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

/**
 * Delete a session
 */
function deleteSession(sessionId) {
    console.log("Deleting session ID:", sessionId);

    fetch(`http://localhost:8080/sessions/${sessionId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete session: ' + response.status);
            }

            console.log("Session deleted successfully");

            // Navigate back to training page
            showTrainingPage();

            // Show success message
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
    // This would be implemented for the edit functionality
    // For now, just show a message
    alert('Redigering af træningssessioner er ikke implementeret endnu.');
}


/**
 * Add a new exercise row to the form
 */
function addExerciseRow() {
    console.log("Adding exercise row...");

    // Make sure we have exercises
    if (!window.availableExercises || !Array.isArray(window.availableExercises)) {
        console.error("No available exercises to add");
        return;
    }

    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    const newRow = document.createElement('tr');

    // Create cells with simple, direct HTML
    newRow.innerHTML = `
        <td>
            <select class="exercise-select" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px; appearance:auto;">
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

    // Get the select element we just created
    const select = newRow.querySelector('.exercise-select');

    // Add options manually
    window.availableExercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex.exerciseId;
        option.textContent = ex.name;
        option.dataset.duration = ex.duration;
        select.appendChild(option);
    });

    // Add event listeners
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.duration) {
            const durationInput = newRow.querySelector('.exercise-duration');
            if (durationInput) {
                durationInput.value = selectedOption.dataset.duration;
            }
        }
    });

    newRow.querySelector('.remove-exercise').addEventListener('click', function() {
        newRow.remove();
    });

    // Add the row to the table
    exercisesTable.appendChild(newRow);
}

/**
 * Save or update a training session
 */
function saveTrainingSession() {
    console.log("Saving training session...");

    if (!validateTrainingForm()) {
        return;
    }

    const form = document.getElementById('trainingForm');
    const isEditMode = form.dataset.editMode === 'true';
    const sessionId = isEditMode ? form.dataset.sessionId : null;

    const title = document.getElementById('trainingTitle').value;
    const dateStr = document.getElementById('trainingDate').value;
    const startTime = document.getElementById('startTime').value;
    const teamId = document.getElementById('teamSelect').value;
    const location = document.getElementById('location')?.value || 'Farum Park';
    const description = document.getElementById('description').value || '';

    const [day, month, year] = dateStr.split('/');
    const [hours, minutes] = startTime.split(':');
    const dateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;

    // Collect exercises from the form
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

    const payload = {
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

    console.log(`${isEditMode ? 'Updating' : 'Creating'} session with payload:`, payload);

    const url = isEditMode
        ? `http://localhost:8080/sessions/${sessionId}`
        : 'http://localhost:8080/sessions';

    const method = isEditMode ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error('Server returned error: ' + text);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(`Session ${isEditMode ? 'updated' : 'created'} successfully:`, data);
            alert(`Træningssession blev ${isEditMode ? 'opdateret' : 'oprettet'}!`);
            form.dataset.editMode = 'false';
            form.dataset.sessionId = '';

            showTrainingPage();
        })
        .catch(error => {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} session:`, error);
            alert(`Der opstod en fejl ved ${isEditMode ? 'opdatering' : 'oprettelse'} af træningssessionen: ${error.message}`);
        });
}

/**
 * Validate the training form
 */
function validateTrainingForm() {
    // validation
    const title = document.getElementById('trainingTitle')?.value;
    if (title === undefined || title === '') {
        alert('Indtast venligst en titel for træningssessionen.');
        return false;
    }

    // validation
    const dateStr = document.getElementById('trainingDate').value;
    if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        alert('Indtast venligst en gyldig dato (DD/MM/ÅÅÅÅ).');
        return false;
    }

    // validation
    const startTime = document.getElementById('startTime').value;
    if (!startTime || !/^\d{1,2}:\d{2}$/.test(startTime)) {
        alert('Indtast venligst et gyldigt tidspunkt (TT:MM).');
        return false;
    }

    // Tvalidation
    const teamId = document.getElementById('teamSelect').value;
    if (!teamId) {
        alert('Vælg venligst et hold.');
        return false;
    }

    // validation
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


// EDIT FUNCTIONALITY


/**
 * Edit an existing session
 * @param {number} sessionId - The ID of the session to edit
 */
function editSession(sessionId) {
    console.log("Editing session:", sessionId);

    // Fetch the session details
    fetch(`http://localhost:8080/sessions/${sessionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch session details: ' + response.status);
            }
            return response.json();
        })
        .then(session => {
            // Show the training form page
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById('create-training-page').classList.add('active');

            // Set the form title to indicate editing mode
            const pageHeader = document.querySelector('#create-training-page .page-header h2');
            if (pageHeader) {
                pageHeader.textContent = 'Rediger Træningssession';
            }

            // Store the session ID for later use
            const form = document.getElementById('trainingForm');
            form.dataset.editMode = 'true';
            form.dataset.sessionId = sessionId;

            // Populate the form with session data
            populateTrainingForm(session);

            // Set up cancel button
            const cancelBtn = document.getElementById('cancelTrainingBtn');
            if (cancelBtn) {
                cancelBtn.setAttribute('onclick', 'cancelTrainingForm()');
            }
        })
        .catch(error => {
            console.error('Error loading session for editing:', error);
            alert('Der opstod en fejl ved indlæsning af træningssessionen.');
        });
}

/**
 * Populate the training form with session data
 * @param {Object} session - The session data
 */
function populateTrainingForm(session) {
    // Reset the form first
    document.getElementById('trainingForm').reset();

    // Clear existing exercise rows
    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    exercisesTable.innerHTML = '';

    // Set session details
    // Format the date from ISO to DD/MM/YYYY
    const sessionDate = new Date(session.dateTime);
    const formattedDate = `${sessionDate.getDate().toString().padStart(2, '0')}/${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}/${sessionDate.getFullYear()}`;

    // Format the time from ISO to HH:MM
    const formattedTime = `${sessionDate.getHours().toString().padStart(2, '0')}:${sessionDate.getMinutes().toString().padStart(2, '0')}`;

    document.getElementById('trainingTitle').value = session.title || `Træning ${formattedDate}`;
    document.getElementById('trainingDate').value = formattedDate;
    document.getElementById('startTime').value = formattedTime;

    // Calculate end time (assuming 90 min sessions)
    const endTime = new Date(sessionDate.getTime() + 90 * 60000);
    const formattedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('endTime').value = formattedEndTime;

    // Set team
    if (session.team && session.team.teamId) {
        document.getElementById('teamSelect').value = session.team.teamId;
    }

    // Set location
    if (session.location) {
        document.getElementById('location').value = session.location;
    }

    // Set description
    if (session.description) {
        document.getElementById('description').value = session.description;
    }

    // Add exercise rows
    if (session.exercises && session.exercises.length > 0) {
        // Sort by order number
        const sortedExercises = [...session.exercises].sort((a, b) => a.orderNum - b.orderNum);

        sortedExercises.forEach(exercise => {
            addExerciseRowWithData(exercise);
        });
    }
}

/**
 * Add an exercise row with pre-filled data
 * @param {Object} exerciseData - The exercise data
 */
function addExerciseRowWithData(exerciseData) {
    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    const newRow = document.createElement('tr');

    // Create the exercise cell with select
    const exerciseCell = document.createElement('td');
    const select = document.createElement('select');
    select.className = 'exercise-select';
    select.style.width = '100%';
    select.style.padding = '8px';
    select.style.borderRadius = '4px';
    select.style.border = '1px solid #ccc';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Vælg øvelse...';
    select.appendChild(defaultOption);

    // Add exercise options
    if (window.availableExercises && window.availableExercises.length > 0) {
        window.availableExercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex.exerciseId;
            option.textContent = ex.name;
            option.dataset.duration = ex.duration;

            // Select this option if it matches the exercise data
            if (ex.exerciseId == exerciseData.exerciseId) {
                option.selected = true;
            }

            select.appendChild(option);
        });
    }

    exerciseCell.appendChild(select);

    // Create duration cell
    const durationCell = document.createElement('td');
    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.className = 'exercise-duration';
    durationInput.placeholder = 'Minutter';
    durationInput.min = '1';
    durationInput.style.width = '100%';
    durationInput.style.padding = '8px';
    durationInput.style.border = '1px solid #ccc';
    durationInput.style.borderRadius = '4px';

    // Set duration if available
    if (window.availableExercises) {
        const exercise = window.availableExercises.find(ex => ex.exerciseId == exerciseData.exerciseId);
        if (exercise && exercise.duration) {
            durationInput.value = exercise.duration;
        }
    }

    durationCell.appendChild(durationInput);

    // Create notes cell
    const notesCell = document.createElement('td');
    const notesInput = document.createElement('input');
    notesInput.type = 'text';
    notesInput.className = 'exercise-notes';
    notesInput.placeholder = 'Noter til øvelsen...';
    notesInput.value = exerciseData.notes || '';
    notesInput.style.width = '100%';
    notesInput.style.padding = '8px';
    notesInput.style.border = '1px solid #ccc';
    notesInput.style.borderRadius = '4px';
    notesCell.appendChild(notesInput);

    // Create delete button cell
    const actionCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = 'Fjern';
    deleteBtn.addEventListener('click', () => newRow.remove());
    actionCell.appendChild(deleteBtn);

    // Add cells to row
    newRow.appendChild(exerciseCell);
    newRow.appendChild(durationCell);
    newRow.appendChild(notesCell);
    newRow.appendChild(actionCell);

    // Add event listener for duration update
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.duration) {
            durationInput.value = selectedOption.dataset.duration;
        }
    });

    exercisesTable.appendChild(newRow);
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

