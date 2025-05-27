
document.addEventListener('DOMContentLoaded', function() {
    initExercisesPage();
});


function initExercisesPage() {
    if (window.exercisesPageInitialized) {
        return;
    }
    window.exercisesPageInitialized = true;

    setupEventListeners();
}


function setupEventListeners() {
    const addExerciseBtn = document.getElementById('addExerciseManageBtn');
    if (addExerciseBtn) {
        addExerciseBtn.removeEventListener('click', showAddExerciseModal);
        addExerciseBtn.addEventListener('click', showAddExerciseModal);
    }

    const exerciseForm = document.getElementById('exerciseForm');
    if (exerciseForm) {
        exerciseForm.removeEventListener('submit', handleExerciseSubmit);
        exerciseForm.addEventListener('submit', handleExerciseSubmit);
    }

    const cancelBtn = document.getElementById('cancelExerciseBtn');
    if (cancelBtn) {
        cancelBtn.removeEventListener('click', closeExerciseModal);
        cancelBtn.addEventListener('click', closeExerciseModal);
    }

    const closeBtn = document.querySelector('#exerciseModal .close');
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeExerciseModal);
        closeBtn.addEventListener('click', closeExerciseModal);
    }

    // Delete modal event listeners
    const cancelDeleteBtn = document.getElementById('cancelDeleteExerciseBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.removeEventListener('click', closeDeleteModal);
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    const closeDeleteBtn = document.querySelector('#confirmDeleteExerciseModal .close');
    if (closeDeleteBtn) {
        closeDeleteBtn.removeEventListener('click', closeDeleteModal);
        closeDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    // Window click to close modals
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


function loadExercisesManagement() {
    console.log("Loading exercises for management...");

    fetch('http://localhost:8080/fodboldklub/exercises')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch exercises: ${response.status}`);
            }
            return response.json();
        })
        .then(exercises => {
            displayExercises(exercises);
        })
        .catch(error => {
            console.error('Error loading exercises:', error);
            const tableBody = document.querySelector('#exercisesManageTable tbody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Kunne ikke indlæse øvelser</td></tr>';
            }
        });
}


function displayExercises(exercises) {
    const tableBody = document.querySelector('#exercisesManageTable tbody');
    if (!tableBody) {
        console.error("Exercise table body not found");
        return;
    }

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

    setupTableEventListeners();
}


function setupTableEventListeners() {
    document.querySelectorAll('.edit-exercise').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function() {
            const exerciseId = this.dataset.id;
            editExercise(exerciseId);
        });
    });

    document.querySelectorAll('.delete-exercise').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function() {
            const exerciseId = this.dataset.id;
            confirmDeleteExercise(exerciseId);
        });
    });
}


function showAddExerciseModal() {
    console.log("Showing add exercise modal");

    const form = document.getElementById('exerciseForm');
    form.reset();

    document.getElementById('exerciseId').value = '';
    document.getElementById('exerciseModalTitle').textContent = 'Tilføj ny øvelse';
    document.getElementById('exerciseModal').style.display = 'block';
}


function closeExerciseModal() {
    document.getElementById('exerciseModal').style.display = 'none';
}


function closeDeleteModal() {
    document.getElementById('confirmDeleteExerciseModal').style.display = 'none';
}


function editExercise(exerciseId) {
    console.log("Editing exercise with ID:", exerciseId);

    fetch(`http://localhost:8080/fodboldklub/exercises/${exerciseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch exercise: ${response.status}`);
            }
            return response.json();
        })
        .then(exercise => {
            console.log("Exercise data loaded for editing:", exercise);

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


function confirmDeleteExercise(exerciseId) {
    console.log("Confirming delete for exercise ID:", exerciseId);

    const confirmBtn = document.getElementById('confirmDeleteExerciseBtn');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', function() {
        deleteExercise(exerciseId);
        closeDeleteModal();
    });

    document.getElementById('confirmDeleteExerciseModal').style.display = 'block';
}

/**
 * Delete an exercise
 */
function deleteExercise(exerciseId) {
    console.log("Deleting exercise with ID:", exerciseId);

    fetch(`http://localhost:8080/fodboldklub/exercises/${exerciseId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to delete exercise: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.deleted) {
                alert('Øvelsen blev slettet.');

                loadExercisesManagement();

                if (typeof loadExercises === 'function') {
                    loadExercises();
                }
            } else {
                alert('Der opstod en fejl ved sletning af øvelsen.');
            }
        })
        .catch(error => {
            console.error('Error deleting exercise:', error);

            if (error.message.includes('400')) {
                alert('Øvelsen kan ikke slettes da den er i brug i træningssessioner.');
            } else {
                alert('Der opstod en fejl ved sletning af øvelsen: ' + error.message);
            }
        });
}


function handleExerciseSubmit(event) {
    event.preventDefault();

    const form = event.target;

    // Prevent double submission
    if (form.dataset.submitting === 'true') {
        return;
    }
    form.dataset.submitting = 'true';

    const exerciseId = document.getElementById('exerciseId').value;
    const isEdit = exerciseId !== '';
    if (!validateExerciseForm()) {
        form.dataset.submitting = 'false';
        return;
    }

    const exercise = {
        name: document.getElementById('exerciseName').value.trim(),
        description: document.getElementById('exerciseDescription').value.trim(),
        duration: parseInt(document.getElementById('exerciseDuration').value)
    };

    if (isEdit) {
        exercise.exerciseId = parseInt(exerciseId);
    }

    const url = isEdit
        ? `http://localhost:8080/fodboldklub/exercises/${exerciseId}`
        : 'http://localhost:8080/fodboldklub/exercises';

    const method = isEdit ? 'PUT' : 'POST';

    console.log(`${method} ${url}`, exercise);

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exercise)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server error: ${text}`);
                });
            }
            return response.json();
        })
        .then(savedExercise => {
            console.log("Exercise saved:", savedExercise);

            alert(`Øvelsen blev ${isEdit ? 'opdateret' : 'oprettet'}.`);

            closeExerciseModal();
            loadExercisesManagement();

            // Reload exercises for training forms (if function exists)
            if (typeof loadExercises === 'function') {
                loadExercises();
            }
        })
        .catch(error => {
            console.error('Error saving exercise:', error);
            alert('Der opstod en fejl ved ' + (isEdit ? 'opdatering' : 'oprettelse') + ' af øvelsen: ' + error.message);
        })
        .finally(() => {
            form.dataset.submitting = 'false';
        });
}


function validateExerciseForm() {
    const name = document.getElementById('exerciseName').value.trim();
    if (!name) {
        alert('Indtast venligst et navn for øvelsen.');
        return false;
    }

    const description = document.getElementById('exerciseDescription').value.trim();
    if (!description) {
        alert('Indtast venligst en beskrivelse for øvelsen.');
        return false;
    }

    const duration = parseInt(document.getElementById('exerciseDuration').value);
    if (!duration || duration < 1) {
        alert('Indtast venligst en gyldig varighed (mindst 1 minut).');
        return false;
    }

    return true;
}

// Make loadExercisesManagement globally available
window.loadExercisesManagement = loadExercisesManagement;