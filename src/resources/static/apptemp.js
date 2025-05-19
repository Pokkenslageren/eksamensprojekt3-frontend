// apptemp.js - Handles basic navigation between sections

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    const backToTrainingBtn = document.getElementById('backToTrainingBtn');
    if (backToTrainingBtn) {
        backToTrainingBtn.addEventListener('click', function() {
            showPage('traening');
        });
    }
});

/**
 * Initialize navigation between pages
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.sidebar li');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            showPage(pageId);

            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Show a specific page and hide others
 * @param {string} pageId - The ID of the page to show
 */
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const pageToShow = document.getElementById(`${pageId}-page`);

    if (pageToShow) {
        pageToShow.classList.add('active');
    }

    if (pageId === 'traening' && typeof initTrainingPage === 'function' && !window.trainingInitialized) {
        initTrainingPage();
        window.trainingInitialized = true;
    } else if (pageId === 'traening') {
        if (typeof loadSessions === 'function') {
            loadSessions();
        }
    }

    if (pageId === 'exercises' && typeof loadExercisesManagement === 'function') {
        loadExercisesManagement();
    }
}

/**
 * Handle logout button click
 */
function handleLogout() {
    // For now, just confirm and redirect to login
    if (confirm('Er du sikker på, at du vil logge ud?')) {
        // In a real application, this would clear session data
        console.log('Logging out...');
        // For demo, just reload the page
        window.location.reload();
    }
}

/**
 * Global error handler function that can be used by other modules
 * @param {Error} error - The error that occurred
 * @param {string} context - Context where the error happened
 */
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    alert(`Der opstod en fejl: ${error.message}`);
}

// Export functions for other modules to use
window.app = {
    showPage: showPage,
    handleError: handleError
};