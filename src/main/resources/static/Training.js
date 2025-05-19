
document.addEventListener('DOMContentLoaded', function() {
    // Formen
    const trainingForm = document.getElementById('trainingForm');
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    const exercisesTable = document.getElementById('exercisesTable').querySelector('tbody');
    const cancelTrainingBtn = document.getElementById('cancelTrainingBtn');

    // Load exercises
    loadExercises();

    //exercise button handler
    addExerciseBtn.addEventListener('click', function() {
        addExerciseRow();
    });


    cancelTrainingBtn.addEventListener('click', function() {
        document.getElementById('traening-page').classList.add('active');
        document.getElementById('create-training-page').classList.remove('active');
    });

    trainingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTrainingSession();
    });

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

    function addExerciseRow() {
        const newRow = document.createElement('tr');

        const exerciseCell = document.createElement('td');
        const exerciseSelect = document.createElement('select');
        exerciseSelect.className = 'exercise-select';

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Vælg øvelse...';
        exerciseSelect.appendChild(emptyOption);

        if (window.availableExercises) {
            window.availableExercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.exerciseId;
                option.textContent = exercise.name;
                option.dataset.duration = exercise.duration;
                exerciseSelect.appendChild(option);
            });
        }

        // autofill læmgde
        exerciseSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const duration = selectedOption.dataset.duration || '';
            this.closest('tr').querySelector('.exercise-duration').value = duration;
        });

        exerciseCell.appendChild(exerciseSelect);

        const durationCell = document.createElement('td');
        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.className = 'exercise-duration';
        durationInput.placeholder = 'Minutter';
        durationInput.min = '1';
        durationCell.appendChild(durationInput);

        const notesCell = document.createElement('td');
        const notesInput = document.createElement('input');
        notesInput.type = 'text';
        notesInput.className = 'exercise-notes';
        notesInput.placeholder = 'Noter til øvelsen...';
        notesCell.appendChild(notesInput);

        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.textContent = 'Fjern';
        deleteBtn.addEventListener('click', function() {
            this.closest('tr').remove();
        });
        actionsCell.appendChild(deleteBtn);

        newRow.appendChild(exerciseCell);
        newRow.appendChild(durationCell);
        newRow.appendChild(notesCell);
        newRow.appendChild(actionsCell);
        exercisesTable.appendChild(newRow);
    }

    function saveTrainingSession() {
        // Basic validation
        if (!validateForm()) {
            return;
        }

        const dateStr = document.getElementById('trainingDate').value;
        const startTime = document.getElementById('startTime').value;
        const teamId = document.getElementById('teamSelect').value;
        const location = document.getElementById('location').value || 'Farum Park';

        let dateTime;
        try {
            const [day, month, year] = dateStr.split('/');
            const [hours, minutes] = startTime.split(':');
            dateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        } catch (e) {
            alert('Ugyldig dato eller tidspunkt format. Brug DD/MM/ÅÅÅÅ og HH:MM.');
            return;
        }

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

                document.getElementById('traening-page').classList.add('active');
                document.getElementById('create-training-page').classList.remove('active');

                loadSessions();
            })
            .catch(error => {
                console.error('Error creating session:', error);
                alert('Der opstod en fejl ved oprettelse af træningssessionen: ' + error.message);
            });
    }

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
    //todo delete eventuelt
    function loadSessions() {
        fetch('/fodboldklub/sessions')
            .then(response => response.json())
            .then(sessions => {
                console.log('Sessions loaded:', sessions);
            })
            .catch(error => {
                console.error('Error loading sessions:', error);
            });
    }
});