const API_URL = 'http://localhost:5678/api';

// Fonction de validation d'email avec regex
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

async function handleLogin(event) {
	event.preventDefault();
	
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	const errorMessage = document.querySelector('.error-message');
	
	if (errorMessage) errorMessage.remove();
	
	if (!email || email.trim() === '') {
		displayError('Veuillez saisir votre email');
		return;
	}
	
	// Validation du format de l'email avec regex
	if (!isValidEmail(email.trim())) {
		displayError('Veuillez saisir une adresse email valide');
		return;
	}
	
	if (!password || password.trim() === '') {
		displayError('Veuillez saisir votre mot de passe');
		return;
	}
	
	try {
		const response = await fetch(`${API_URL}/users/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: email.trim(),
				password: password
			})
		});
		
		let data = {};
		try {
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				data = await response.json();
			}
		} catch (e) {}
		
		if (response.ok && data.token) {
			localStorage.setItem('token', data.token);
			localStorage.setItem('userId', data.userId);
			window.location.href = 'index.html';
		} else {
			if (response.status === 404) {
				displayError('Utilisateur non trouvé');
			} else if (response.status === 401) {
				displayError('Erreur dans l\'identifiant ou le mot de passe');
			} else {
				displayError('Erreur lors de la connexion. Veuillez réessayer.');
			}
		}
	} catch (error) {
		console.error('Erreur lors de la connexion:', error);
		const errorMsg = !navigator.onLine 
			? 'Pas de connexion internet. Vérifiez votre connexion.' 
			: 'Une erreur est survenue. Veuillez réessayer.';
		displayError(errorMsg);
	}
}

function displayError(message) {
	const form = document.getElementById('login-form');
	const existingError = document.querySelector('.error-message');
	
	if (existingError) existingError.remove();
	
	const errorDiv = document.createElement('div');
	errorDiv.className = 'error-message';
	errorDiv.textContent = message;
	errorDiv.style.cssText = 'color:#d32f2f;text-align:center;margin-top:15px;font-size:14px';
	
	form.appendChild(errorDiv);
}

document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');
	if (loginForm) loginForm.addEventListener('submit', handleLogin);
});
