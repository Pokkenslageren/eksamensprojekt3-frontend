/**
 * Exercise management functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initExercisesPage();
});

/**
 * Initialize the exercises page
 */
function initExercisesPage() {
    const addExerciseBtn = document.getElementById('addExerciseManageBtn');
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', showAddExerciseModal);
    }

    const exerciseForm = document.getElementById('exerciseForm');
    if (exerciseForm) {
        exerciseForm.addEventListener('submit', handleExerciseSubmit);
    }

    const cancelBtn = document.getElementById('cancelExerciseBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeExerciseModal);
    }

    const closeBtn = document.querySelector('#exerciseModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeExerciseModal);
    }
    document.getElementById('cancelDeleteExerciseBtn').addEventListener('click', function() {
        document.getElementById('confirmDeleteExerciseModal').style.display = 'none';
    });

    document.querySelector('#confirmDeleteExerciseModal .close').addEventListener('click', function() {
        document.getElementById('confirmDeleteExerciseModal').style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        const exerciseModal = document.getElementById('exerciseModal');
        const deleteModal = document.getElementById('confirmDeleteExerciseModal');

        if (event.target === exerciseModal) {
            exerciseModal.style.display = 'none';
        }

        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

/**
 * Load and display exercises
 */
function loadExercisesManagement() {
    fetch('http://localhost:8080/fodboldklub/exercises')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch exercises: ' + response.status);
            }
            return response.json();
        })
        .then(exercises => {
            displayExercises(exercises);
        })
        .catch(error => {
            console.error('Error loading exercises:', error);
            alert('Der opstod en fejl ved indlæsning af øvelser.');
        });
}

/**
 * Display exercises in the table
 */
function displayExercises(exercises) {
    const tableBody = document.querySelector('#exercisesManageTable tbody');
    tableBody.innerHTML = '';

    if (!exercises || exercises.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center;">Ingen øvelser fundet</td>';
        tableBody.appendChild(row);
        return;
    }

    exercises.forEach(exercise => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${exercise.exerciseId}</td>
            <td>${exercise.name}</td>
            <td>${exercise.description}</td>
            <td>${exercise.duration} min</td>
            <td>
                <button class="btn btn-primary btn-sm edit-exercise" data-id="${exercise.exerciseId}">Rediger</button>
                <button class="btn btn-danger btn-sm delete-exercise" data-id="${exercise.exerciseId}">Slet</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-exercise').forEach(button => {
        button.addEventListener('click', function() {
            const exerciseId = this.dataset.id;
            editExercise(exerciseId);
        });
    });

    document.querySelectorAll('.delete-exercise').forEach(button => {
        button.addEventListener('click', function() {
            const exerciseId = this.dataset.id;
            confirmDeleteExercise(exerciseId);
        });
    });
}

/**
 * Show the add exercise modal
 */
function showAddExerciseModal() {

    document.getElementById('exerciseForm').reset();
    document.getElementById('exerciseId').value = '';
    document.getElementById('exerciseModalTitle').textContent = 'Tilføj ny øvelse';
    document.getElementById('exerciseModal').style.display = 'block';
}

/**
 * Close the exercise modal
 */
function closeExerciseModal() {
    document.getElementById('exerciseModal').style.display = 'none';
}

/**
 * Edit an exercise
 */
function editExercise(exerciseId) {
    fetch(`http://localhost:8080/fodboldklub/exercises/${exerciseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch exercise: ' + response.status);
            }
            return response.json();
        })
        .then(exercise => {

            document.getElementById('exerciseId').value = exercise.exerciseId;
            document.getElementById('exerciseName').value = exercise.name;
            document.getElementById('exerciseDescription').value = exercise.description;
            document.getElementById('exerciseDuration').value = exercise.duration;

            document.getElementById('exerciseModalTitle').textContent = 'Rediger øvelse';
            document.getElementById('exerciseModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading exercise for editing:', error);
            alert('Der opstod en fejl ved indlæsning af øvelsen.');
        });
}

/**
 * Confirm delete exercise
 */
function confirmDeleteExercise(exerciseId) {
    document.getElementById('confirmDeleteExerciseBtn').dataset.id = exerciseId;

    document.getElementById('confirmDeleteExerciseBtn').onclick = function() {
        deleteExercise(this.dataset.id);
        document.getElementById('confirmDeleteExerciseModal').style.display = 'none';
    };

    document.getElementById('confirmDeleteExerciseModal').style.display = 'block';
}

/**
 * Delete an exercise
 */
function deleteExercise(exerciseId) {
    fetch(`http://localhost:8080/fodboldklub/exercises/${exerciseId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete exercise: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            if (result.deleted) {
                alert('Øvelsen blev slettet.');
                loadExercisesManagement();

                loadExercises();
            } else {
                alert('Der opstod en fejl ved sletning af øvelsen.');
            }
        })
        .catch(error => {
            console.error('Error deleting exercise:', error);
            alert('Der opstod en fejl ved sletning af øvelsen: ' + error.message);
        });
}

/**
 * Handle exercise form submission
 */
function handleExerciseSubmit(event) {
    event.preventDefault();

    const exerciseId = document.getElementById('exerciseId').value;
    const isEdit = exerciseId !== '';

    const exercise = {
        name: document.getElementById('exerciseName').value,
        description: document.getElementById('exerciseDescription').value,
        duration: parseInt(document.getElementById('exerciseDuration').value)
    };

    if (isEdit) {
        exercise.exerciseId = parseInt(exerciseId);
    }

    const url = isEdit
        ? `http://localhost:8080/fodboldklub/exercises/${exerciseId}`
        : 'http://localhost:8080/fodboldklub/exercises';

    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exercise)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save exercise: ' + response.status);
            }
            return response.json();
        })
        .then(savedExercise => {
            alert(`Øvelsen blev ${isEdit ? 'opdateret' : 'oprettet'}.`);
            closeExerciseModal();
            loadExercisesManagement();

            loadExercises();
        })
        .catch(error => {
            console.error('Error saving exercise:', error);
            alert('Der opstod en fejl ved ' + (isEdit ? 'opdatering' : 'oprettelse') + ' af øvelsen: ' + error.message);
        });
}