// training.js - stripped down to focus on creating sessions
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const trainingForm = document.getElementById('trainingForm');
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    const cancelTrainingBtn = document.getElementById('cancelTrainingBtn');

    // Load existing exercises for adding to sessions
    loadExercises();

    // Add exercise button handler
    addExerciseBtn.addEventListener('click', function() {
        addExerciseRow();
    });

    // Cancel button handler
    cancelTrainingBtn.addEventListener('click', function() {
        // Navigate back to main training page
        document.getElementById('traening-page').classList.add('active');
        document.getElementById('create-training-page').classList.remove('active');
    });

    // Form submission handler
    trainingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTrainingSession();
    });

    // Load available exercises from the backend
    function loadExercises() {
        fetch('/fodboldklub/exercises')
            .then(response => response.json())
            .then(exercises => {
                // Store exercises in a global variable for later use
                window.availableExercises = exercises;
                console.log('Loaded exercises:', exercises);
            })
            .catch(error => {
                console.error('Error loading exercises:', error);
            });
    }

    // Add a new exercise row to the table
    function addExerciseRow() {
        // Create row with exercise selection, duration and notes
        const newRow = document.createElement('tr');

        // Exercise selection cell
        const exerciseCell = document.createElement('td');
        const exerciseSelect = document.createElement('select');
        exerciseSelect.className = 'exercise-select';

        // Add empty option
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Vælg øvelse...';
        exerciseSelect.appendChild(emptyOption);

        // Add options for all available exercises
        if (window.availableExercises) {
            window.availableExercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.exerciseId;
                option.textContent = exercise.name;
                option.dataset.duration = exercise.duration;
                exerciseSelect.appendChild(option);
            });
        }

        // Auto-fill duration when exercise is selected
        exerciseSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const duration = selectedOption.dataset.duration || '';
            this.closest('tr').querySelector('.exercise-duration').value = duration;
        });

        exerciseCell.appendChild(exerciseSelect);

        // Duration cell
        const durationCell = document.createElement('td');
        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.className = 'exercise-duration';
        durationInput.placeholder = 'Minutter';
        durationInput.min = '1';
        durationCell.appendChild(durationInput);

        // Notes cell
        const notesCell = document.createElement('td');
        const notesInput = document.createElement('input');
        notesInput.type = 'text';
        notesInput.className = 'exercise-notes';
        notesInput.placeholder = 'Noter til øvelsen...';
        notesCell.appendChild(notesInput);

        // Delete button cell
        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.textContent = 'Fjern';
        deleteBtn.addEventListener('click', function() {
            this.closest('tr').remove();
        });
        actionsCell.appendChild(deleteBtn);

        // Add cells to row and row to table
        newRow.appendChild(exerciseCell);
        newRow.appendChild(durationCell);
        newRow.appendChild(notesCell);
        newRow.appendChild(actionsCell);
        exercisesTable.appendChild(newRow);
    }

    // Save training session to the backend
    function saveTrainingSession() {
        // Basic validation
        if (!validateForm()) {
            return;
        }

        // Get form data
        const dateStr = document.getElementById('trainingDate').value;
        const startTime = document.getElementById('startTime').value;
        const teamId = document.getElementById('teamSelect').value;
        const location = document.getElementById('location').value || 'Farum Park';

        // Parse date and time - adjust the format based on your date input
        let dateTime;
        try {
            // Assuming date format is DD/MM/YYYY
            const [day, month, year] = dateStr.split('/');
            const [hours, minutes] = startTime.split(':');
            dateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        } catch (e) {
            alert('Ugyldig dato eller tidspunkt format. Brug DD/MM/ÅÅÅÅ og HH:MM.');
            return;
        }

        // Collect exercises
        const exercises = [];
        const exerciseRows = exercisesTable.querySelectorAll('tr');

        exerciseRows.forEach((row, index) => {
            const exerciseSelect = row.querySelector('.exercise-select');
            if (exerciseSelect && exerciseSelect.value) {
                exercises.push({
                    exerciseId: parseInt(exerciseSelect.value),
                    orderNum: index + 1, // Use row index for order
                    notes: row.querySelector('.exercise-notes').value || ''
                });
            }
        });

        // Create request payload
        const payload = {
            session: {
                dateTime: dateTime,
                location: location,
                team: {
                    teamId: parseInt(teamId)
                }
            },
            exercises: exercises
        };

        // Send to backend
        fetch('/fodboldklub/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server returned status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                alert('Træningssession blev oprettet!');

                // Navigate back to training overview
                document.getElementById('traening-page').classList.add('active');
                document.getElementById('create-training-page').classList.remove('active');

                // Optional: Refresh the calendar or list of sessions
                loadSessions();
            })
            .catch(error => {
                console.error('Error creating session:', error);
                alert('Der opstod en fejl ved oprettelse af træningssessionen: ' + error.message);
            });
    }

    // Simple form validation
    function validateForm() {
        const dateStr = document.getElementById('trainingDate').value;
        if (!dateStr) {
            alert('Vælg venligst en dato for træningssessionen.');
            return false;
        }

        const startTime = document.getElementById('startTime').value;
        if (!startTime) {
            alert('Indtast venligst et starttidspunkt.');
            return false;
        }

        const teamId = document.getElementById('teamSelect').value;
        if (!teamId) {
            alert('Vælg venligst et hold.');
            return false;
        }

        // At least one exercise
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

    // Optional: Load sessions for the calendar view
    function loadSessions() {
        fetch('/fodboldklub/sessions')
            .then(response => response.json())
            .then(sessions => {
                console.log('Sessions loaded:', sessions);
                // Update UI as needed
            })
            .catch(error => {
                console.error('Error loading sessions:', error);
            });
    }
});