// ==================== CONFIGURATION ====================
const API_URL = 'http://localhost:5678/api';
let allWorks = [];
let categories = [];

// ==================== GESTION DE L'AUTHENTIFICATION ====================

function isLoggedIn() {
	return localStorage.getItem('token') !== null;
}

function handleLoginState() {
	const loggedIn = isLoggedIn();
	const editBanner = document.getElementById('edit-mode-banner');
	const loginLogoutLink = document.getElementById('login-logout-link');
	const filtersContainer = document.querySelector('.filters');
	const editBtn = document.getElementById('edit-btn');
	
	if (loggedIn) {
		editBanner.style.display = 'block';
		document.body.classList.add('has-edit-banner');
		
		loginLogoutLink.innerHTML = '';
		const logoutLink = document.createElement('a');
		logoutLink.href = '#';
		logoutLink.textContent = 'logout';
		logoutLink.addEventListener('click', handleLogout);
		loginLogoutLink.appendChild(logoutLink);
		
		if (filtersContainer) filtersContainer.style.display = 'none';
		if (editBtn) {
			editBtn.style.display = 'flex';
			editBtn.onclick = openModal;
		}
	} else {
		editBanner.style.display = 'none';
		document.body.classList.remove('has-edit-banner');
		loginLogoutLink.innerHTML = '<a href="login.html">login</a>';
		if (filtersContainer) filtersContainer.style.display = 'flex';
		if (editBtn) editBtn.style.display = 'none';
	}
}

function handleLogout(event) {
	event.preventDefault();
	localStorage.removeItem('token');
	localStorage.removeItem('userId');
	window.location.reload();
}

// ==================== API - RÉCUPÉRATION DES DONNÉES ====================

async function fetchWorks() {
	try {
		const response = await fetch(`${API_URL}/works`);
		if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
		return await response.json();
	} catch (error) {
		return [];
	}
}

async function fetchCategories() {
	try {
		const response = await fetch(`${API_URL}/categories`);
		if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
		return await response.json();
	} catch (error) {
		return [];
	}
}

// ==================== AFFICHAGE DE LA GALERIE ====================

function displayWorks(works) {
	const gallery = document.querySelector('.gallery');
	if (!gallery) return;
	
	gallery.innerHTML = '';
	
	if (!works || works.length === 0) {
		gallery.innerHTML = '<p style="text-align:center;padding:50px;color:#666">Aucun projet à afficher</p>';
		return;
	}
	
	works.forEach(work => {
		if (!work || !work.imageUrl || !work.title) return;
		
		const figure = document.createElement('figure');
		const img = document.createElement('img');
		img.src = work.imageUrl;
		img.alt = work.title;
		img.onerror = () => { img.alt = 'Image non disponible'; };
		
		const figcaption = document.createElement('figcaption');
		figcaption.textContent = work.title;
		
		figure.appendChild(img);
		figure.appendChild(figcaption);
		gallery.appendChild(figure);
	});
}

// ==================== SYSTÈME DE FILTRES ====================

function createFilters(categories) {
	const filtersContainer = document.querySelector('.filters');
	if (!filtersContainer) return;
	
	filtersContainer.innerHTML = '';
	
	const allButton = document.createElement('button');
	allButton.textContent = 'Tous';
	allButton.className = 'filter-btn active';
	allButton.dataset.categoryId = 'all';
	allButton.addEventListener('click', () => filterWorks(null));
	filtersContainer.appendChild(allButton);
	
	categories.forEach(category => {
		const button = document.createElement('button');
		button.textContent = category.name;
		button.className = 'filter-btn';
		button.dataset.categoryId = category.id;
		button.addEventListener('click', () => filterWorks(category.id));
		filtersContainer.appendChild(button);
	});
}

function filterWorks(categoryId) {
	const filteredWorks = categoryId === null 
		? allWorks 
		: allWorks.filter(work => work.categoryId === categoryId);
	
	displayWorks(filteredWorks);
	
	const buttons = document.querySelectorAll('.filter-btn');
	buttons.forEach(btn => {
		btn.classList.remove('active');
		if (categoryId === null && btn.dataset.categoryId === 'all') {
			btn.classList.add('active');
		} else if (categoryId !== null && parseInt(btn.dataset.categoryId) === categoryId) {
			btn.classList.add('active');
		}
	});
}

function updateGallery() {
	const activeButton = document.querySelector('.filter-btn.active');
	let activeCategoryId = null;
	
	if (activeButton && activeButton.dataset.categoryId !== 'all') {
		activeCategoryId = parseInt(activeButton.dataset.categoryId);
	}
	
	const filtersContainer = document.querySelector('.filters');
	if (filtersContainer && filtersContainer.children.length > 0) {
		filterWorks(activeCategoryId);
	} else {
		displayWorks(allWorks);
	}
	
	const modal = document.getElementById('modal');
	if (modal && modal.style.display === 'block') {
		loadModalGallery();
	}
}

// ==================== INITIALISATION ====================

async function initGallery() {
	allWorks = await fetchWorks();
	categories = await fetchCategories();
	
	if (allWorks.length > 0) {
		if (!isLoggedIn() && categories.length > 0) {
			createFilters(categories);
		}
		displayWorks(allWorks);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	handleLoginState();
	initGallery();
	initModal();
});

// ==================== MODALE - GESTION ====================

function openModal() {
	const modal = document.getElementById('modal');
	if (modal) {
		modal.style.display = 'block';
		showGalleryZone();
		loadModalGallery();
	}
}

function closeModal() {
	const modal = document.getElementById('modal');
	if (modal) {
		modal.style.display = 'none';
		showGalleryZone();
	}
}

function showGalleryZone() {
	const galleryZone = document.getElementById('modal-gallery-zone');
	const formZone = document.getElementById('modal-form-zone');
	const backBtn = document.getElementById('modal-back-btn');
	const modalTitle = document.getElementById('modal-title');
	
	if (galleryZone) galleryZone.style.display = 'block';
	if (formZone) formZone.style.display = 'none';
	if (backBtn) backBtn.style.display = 'none';
	if (modalTitle) modalTitle.textContent = 'Galerie photo';
	
	resetAddWorkForm();
}

function showFormZone() {
	const galleryZone = document.getElementById('modal-gallery-zone');
	const formZone = document.getElementById('modal-form-zone');
	const backBtn = document.getElementById('modal-back-btn');
	const modalTitle = document.getElementById('modal-title');
	
	if (galleryZone) galleryZone.style.display = 'none';
	if (formZone) formZone.style.display = 'block';
	if (backBtn) backBtn.style.display = 'block';
	if (modalTitle) modalTitle.textContent = 'Ajout photo';
	
	setTimeout(() => updateSubmitButton(), 100);
}

function loadModalGallery() {
	const modalGalleryContainer = document.querySelector('.modal-gallery-container');
	if (!modalGalleryContainer) return;
	
	modalGalleryContainer.innerHTML = '';
	
	if (allWorks.length === 0) {
		modalGalleryContainer.innerHTML = '<p style="text-align:center;padding:20px">Aucun travail dans la galerie</p>';
		return;
	}
	
	allWorks.forEach(work => {
		const workItem = document.createElement('div');
		workItem.className = 'modal-work-item';
		
		const img = document.createElement('img');
		img.src = work.imageUrl;
		img.alt = work.title;
		
		const deleteBtn = document.createElement('button');
		deleteBtn.type = 'button';
		deleteBtn.className = 'modal-work-delete';
		deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
		deleteBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			deleteWork(parseInt(work.id));
		});
		
		workItem.appendChild(img);
		workItem.appendChild(deleteBtn);
		modalGalleryContainer.appendChild(workItem);
	});
}

// ==================== MODALE - SUPPRESSION D'UN TRAVAIL ====================

async function deleteWork(workId) {
	const token = localStorage.getItem('token');
	if (!token) {
		alert('Vous devez être connecté pour supprimer un travail');
		return;
	}
	
	if (!confirm('Voulez-vous vraiment supprimer ce travail ?')) return;
	
	try {
		const response = await fetch(`${API_URL}/works/${workId}`, {
			method: 'DELETE',
			headers: { 'Authorization': `Bearer ${token}` }
		});
		
		if (response.ok || response.status === 204 || response.status === 200) {
			allWorks = await fetchWorks();
			updateGallery();
		} else {
			const errorData = await response.json().catch(() => ({}));
			const errorMessage = errorData.error || errorData.message || 'Erreur lors de la suppression';
			alert(response.status === 401 ? 'Vous n\'êtes pas autorisé' : `Erreur: ${errorMessage}`);
		}
	} catch (error) {
		alert(!navigator.onLine ? 'Pas de connexion internet' : 'Une erreur est survenue');
	}
}

// ==================== MODALE - INITIALISATION ====================

function initModal() {
	const editBtn = document.getElementById('edit-btn');
	if (editBtn && isLoggedIn()) {
		editBtn.addEventListener('click', openModal);
	}
	
	const closeBtn = document.getElementById('modal-close-btn');
	if (closeBtn) closeBtn.addEventListener('click', closeModal);
	
	const modal = document.getElementById('modal');
	if (modal) {
		modal.addEventListener('click', (e) => {
			if (e.target === modal || e.target.classList.contains('modal-overlay')) {
				closeModal();
			}
		});
		
		const modalContent = modal.querySelector('.modal-content');
		if (modalContent) {
			modalContent.addEventListener('click', (e) => e.stopPropagation());
		}
		
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && modal.style.display === 'block') {
				closeModal();
			}
		});
	}
	
	const addPhotoBtn = document.getElementById('modal-add-photo-btn');
	if (addPhotoBtn) {
		addPhotoBtn.addEventListener('click', () => {
			showFormZone();
			loadCategoriesInForm();
		});
	}
	
	const backBtn = document.getElementById('modal-back-btn');
	if (backBtn) backBtn.addEventListener('click', showGalleryZone);
	
	const imageInput = document.getElementById('work-image');
	if (imageInput) {
		imageInput.addEventListener('change', (e) => {
			handleImagePreview(e);
			updateSubmitButton();
		});
	}
	
	const titleInput = document.getElementById('work-title');
	if (titleInput) {
		titleInput.addEventListener('input', updateSubmitButton);
	}
	
	const categorySelect = document.getElementById('work-category');
	if (categorySelect) {
		categorySelect.addEventListener('change', updateSubmitButton);
	}
	
	updateSubmitButton();
	
	const submitBtn = document.getElementById('modal-submit-btn');
	if (submitBtn) {
		// Supprimer tous les anciens listeners en clonant le bouton
		const newSubmitBtn = submitBtn.cloneNode(true);
		submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
		
		// Ajouter le listener en phase de capture pour intercepter tôt
		newSubmitBtn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			handleAddWork(e);
			return false;
		}, true);
		
		// Protection supplémentaire sur le bouton
		newSubmitBtn.onclick = function(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			handleAddWork(e);
			return false;
		};
	}
}

// ==================== MODALE - GESTION DU BOUTON VALIDER ====================

function updateSubmitButton() {
	const imageInput = document.getElementById('work-image');
	const titleInput = document.getElementById('work-title');
	const categorySelect = document.getElementById('work-category');
	const submitBtn = document.getElementById('modal-submit-btn');
	
	if (!submitBtn) return;
	
	const hasImage = imageInput && imageInput.files && imageInput.files.length > 0 && imageInput.files[0];
	const hasTitle = titleInput && titleInput.value && titleInput.value.trim() !== '';
	const hasCategory = categorySelect && categorySelect.value && categorySelect.value !== '';
	
	if (hasImage && hasTitle && hasCategory) {
		submitBtn.classList.remove('incomplete');
		submitBtn.style.backgroundColor = '#1D6154';
		submitBtn.disabled = false;
	} else {
		submitBtn.classList.add('incomplete');
		submitBtn.style.backgroundColor = '#A7A7A7';
		submitBtn.disabled = true;
	}
}

// ==================== MODALE - PRÉVISUALISATION D'IMAGE ====================

function handleImagePreview(e) {
	const file = e.target.files[0];
	if (!file) return;
	
	const maxSize = 4 * 1024 * 1024;
	if (file.size > maxSize) {
		alert('Le fichier est trop volumineux. Taille maximale : 4Mo');
		e.target.value = '';
		resetImagePreview();
		return;
	}
	
	if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
		alert('Format de fichier non supporté. Utilisez JPG ou PNG');
		e.target.value = '';
		resetImagePreview();
		return;
	}
	
	const reader = new FileReader();
	reader.onload = (event) => {
		const preview = document.getElementById('image-preview');
		const previewImg = document.getElementById('preview-img');
		const uploadIcon = document.querySelector('.form-image-upload i.fa-regular.fa-image');
		const uploadLabel = document.querySelector('.image-upload-label');
		const uploadInfo = document.querySelector('.image-upload-info');
		
		if (preview && previewImg) {
			previewImg.src = event.target.result;
			preview.style.display = 'block';
			if (uploadIcon) uploadIcon.style.display = 'none';
			if (uploadLabel) uploadLabel.style.display = 'none';
			if (uploadInfo) uploadInfo.style.display = 'none';
		}
	};
	reader.readAsDataURL(file);
}

function resetImagePreview() {
	const preview = document.getElementById('image-preview');
	const previewImg = document.getElementById('preview-img');
	const uploadIcon = document.querySelector('.form-image-upload i.fa-regular.fa-image');
	const uploadLabel = document.querySelector('.image-upload-label');
	const uploadInfo = document.querySelector('.image-upload-info');
	const imageInput = document.getElementById('work-image');
	
	if (preview) preview.style.display = 'none';
	if (previewImg) previewImg.src = '';
	if (uploadIcon) uploadIcon.style.display = 'block';
	if (uploadLabel) uploadLabel.style.display = 'inline-block';
	if (uploadInfo) uploadInfo.style.display = 'block';
	if (imageInput) imageInput.value = '';
}

// ==================== MODALE - AJOUT D'UN TRAVAIL ====================

async function handleAddWork(event) {
	// Protection absolue contre le rechargement
	if (event) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
	}
	
	const token = localStorage.getItem('token');
	if (!token) {
		alert('Vous devez être connecté pour ajouter un travail');
		return false;
	}
	
	const imageInput = document.getElementById('work-image');
	const titleInput = document.getElementById('work-title');
	const categorySelect = document.getElementById('work-category');
	const submitBtn = document.getElementById('modal-submit-btn');
	const errorMessage = document.querySelector('.form-error-message');
	
	if (errorMessage) errorMessage.remove();
	
	const hasImage = imageInput && imageInput.files && imageInput.files.length > 0 && imageInput.files[0];
	const hasTitle = titleInput && titleInput.value && titleInput.value.trim() !== '';
	const hasCategory = categorySelect && categorySelect.value && categorySelect.value !== '';
	
	if (!hasImage || !hasTitle || !hasCategory) {
		let missingFields = [];
		if (!hasImage) missingFields.push('image');
		if (!hasTitle) missingFields.push('titre');
		if (!hasCategory) missingFields.push('catégorie');
		
		const errorMsg = 'Veuillez remplir tous les champs : ' + missingFields.join(', ') + ' sont requis';
		displayFormError(errorMsg);
		return;
	}
	
	const errors = [];
	
	if (hasImage) {
		const file = imageInput.files[0];
		const maxSize = 4 * 1024 * 1024;
		if (file.size > maxSize) {
			errors.push('L\'image est trop volumineuse. Taille maximale : 4Mo');
		}
		if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
			errors.push('Format d\'image non supporté. Utilisez JPG ou PNG');
		}
	}
	
	if (hasTitle && titleInput.value.trim().length < 2) {
		errors.push('Le titre doit contenir au moins 2 caractères');
	}
	
	if (hasCategory) {
		const categoryValue = parseInt(categorySelect.value);
		if (isNaN(categoryValue) || categoryValue <= 0) {
			errors.push('Catégorie invalide');
		}
	}
	
	if (errors.length > 0) {
		displayFormError(errors.join('<br>'));
		return;
	}
	
	if (submitBtn) {
		submitBtn.disabled = true;
		submitBtn.textContent = 'Envoi en cours...';
	}
	
	try {
		const formData = new FormData();
		formData.append('image', imageInput.files[0]);
		formData.append('title', titleInput.value.trim());
		formData.append('category', parseInt(categorySelect.value));
		
		const response = await fetch(`${API_URL}/works`, {
			method: 'POST',
			headers: { 'Authorization': `Bearer ${token}` },
			body: formData
		});
		
		let data = {};
		try {
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				data = await response.json();
			}
		} catch (e) {}
		
		if (response.ok || response.status === 201) {
			// Mise à jour dynamique sans rechargement
			allWorks = await fetchWorks();
			updateGallery();
			resetAddWorkForm();
			showGalleryZone();
			return false;
		} else {
			let errorMsg = data.error || data.message || 'Erreur lors de l\'ajout du travail';
			if (response.status === 400) errorMsg = 'Données invalides : ' + errorMsg;
			else if (response.status === 401) errorMsg = 'Vous n\'êtes pas autorisé';
			else if (response.status === 500) errorMsg = 'Erreur serveur. Veuillez réessayer.';
			displayFormError(errorMsg);
		}
	} catch (error) {
		const errorMsg = !navigator.onLine ? 'Pas de connexion internet' : 'Une erreur est survenue';
		displayFormError(errorMsg);
	} finally {
		if (submitBtn) {
			submitBtn.disabled = false;
			submitBtn.textContent = 'Valider';
		}
	}
}

function displayFormError(message) {
	const formContainer = document.querySelector('.add-work-form');
	if (!formContainer) return;
	
	const existingError = document.querySelector('.form-error-message');
	if (existingError) existingError.remove();
	
	const errorDiv = document.createElement('div');
	errorDiv.className = 'form-error-message';
	errorDiv.innerHTML = message;
	errorDiv.style.cssText = 'color:#d32f2f;text-align:center;margin-top:15px;font-size:14px;font-family:Work Sans';
	
	formContainer.appendChild(errorDiv);
	errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetAddWorkForm() {
	const imageInput = document.getElementById('work-image');
	const titleInput = document.getElementById('work-title');
	const categorySelect = document.getElementById('work-category');
	
	if (imageInput) imageInput.value = '';
	if (titleInput) titleInput.value = '';
	if (categorySelect) {
		categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>';
	}
	
	resetImagePreview();
	
	const errorMessage = document.querySelector('.form-error-message');
	if (errorMessage) errorMessage.remove();
	
	updateSubmitButton();
}

async function loadCategoriesInForm() {
	const categorySelect = document.getElementById('work-category');
	if (!categorySelect) return;
	
	categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>';
	
	try {
		categories = await fetchCategories();
		categories.forEach(category => {
			const option = document.createElement('option');
			option.value = category.id;
			option.textContent = category.name;
			categorySelect.appendChild(option);
		});
		updateSubmitButton();
	} catch (error) {
		// Erreur silencieuse
	}
}
