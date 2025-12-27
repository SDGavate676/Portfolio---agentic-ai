// ============================================================================
// ADMIN PANEL - CORE FUNCTIONALITY
// ============================================================================

class AdminDashboard {
  constructor() {
    this.checkAuth();
    this.portfolioData = this.loadPortfolioData();
    this.editingId = null;
    this.editingType = null;
    this.init();
  }

  checkAuth() {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const session = JSON.parse(token);
      const expiresAt = new Date(session.expiresAt);
      
      if (expiresAt <= new Date()) {
        localStorage.removeItem('admin-token');
        window.location.href = 'login.html';
      }
    } catch (e) {
      window.location.href = 'login.html';
    }
  }

  init() {
    this.setupTheme();
    this.setupNavigation();
    this.setupEventListeners();
    this.loadDashboardData();
  }

  // ============================================================================
  // THEME SETUP
  // ============================================================================

  setupTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        this.switchSection(section, link);
      });
    });
  }

  switchSection(section, link) {
    // Hide all panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Remove active from all nav links
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.remove('active');
    });

    // Show selected panel
    const panel = document.getElementById(section);
    if (panel) {
      panel.classList.add('active');
    }

    if (link) {
      link.classList.add('active');
    }

    // Load section-specific data
    this.loadSectionData(section);
  }

  loadSectionData(section) {
    switch (section) {
      case 'profile':
        this.populateProfileForm();
        break;
      case 'about':
        this.populateAboutForm();
        break;
      case 'experience':
        this.loadExperienceTable();
        break;
      case 'education':
        this.loadEducationTable();
        break;
      case 'projects':
        this.loadProjectsTable();
        break;
      case 'resume':
        this.loadResumeSection();
        break;
      case 'contact':
        this.populateContactForm();
        break;
      case 'messages':
        this.loadMessages();
        break;
      case 'theme':
        this.populateThemeForm();
        break;
    }
  }

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  loadPortfolioData() {
    const saved = localStorage.getItem('portfolio-data');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      profile: {
        name: 'Nirmal Kumar',
        title: 'Full Stack Developer & UI/UX Enthusiast',
        bio: 'Passionate developer crafting beautiful and functional web experiences.',
        profilePhoto: 'assets/images/profile.svg',
        email: 'nirmal@example.com',
        phone: '+91 98765 43210',
        location: 'India',
        socialLinks: {
          linkedin: 'https://linkedin.com',
          github: 'https://github.com',
          instagram: 'https://instagram.com',
          twitter: 'https://twitter.com'
        }
      },
      about: {
        description: 'I am a skilled full-stack developer...',
        background: 'With 3+ years of experience...',
        skills: ['JavaScript', 'React', 'Node.js'],
        interests: ['Web Development', 'UI/UX Design']
      },
      experience: [],
      education: [],
      contact: {
        formSubmissions: []
      },
      resume: null
    };
  }

  savePortfolioData() {
    localStorage.setItem('portfolio-data', JSON.stringify(this.portfolioData));
    // Notify via BroadcastChannel (same-origin messaging)
    if (window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('portfolio-updates');
        bc.postMessage({ type: 'portfolio-data', timestamp: Date.now() });
        bc.close();
      } catch (e) {
        console.warn('BroadcastChannel failed:', e);
      }
    }
    // Also set timestamp key for storage event detection
    try {
      localStorage.setItem('portfolio-data-updated', Date.now().toString());
    } catch (e) {
      console.warn('Could not write timestamp key:', e);
    }
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  setupEventListeners() {
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

    // Profile
    document.getElementById('save-profile')?.addEventListener('click', () => this.saveProfile());
    document.getElementById('profile-photo')?.addEventListener('change', (e) => this.handleProfilePhoto(e));

    // About
    document.getElementById('save-about')?.addEventListener('click', () => this.saveAbout());
    document.getElementById('add-skill-btn')?.addEventListener('click', () => this.addSkill());
    document.getElementById('add-interest-btn')?.addEventListener('click', () => this.addInterest());
    document.getElementById('skill-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSkill();
    });
    document.getElementById('interest-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addInterest();
    });

    // Experience
    document.getElementById('add-experience-btn')?.addEventListener('click', () => this.openExperienceModal());
    document.getElementById('experience-form')?.addEventListener('submit', (e) => this.saveExperience(e));

    // Education
    document.getElementById('add-education-btn')?.addEventListener('click', () => this.openEducationModal());
    document.getElementById('education-form')?.addEventListener('submit', (e) => this.saveEducation(e));

    // Resume
    document.getElementById('resume-file')?.addEventListener('change', (e) => this.handleResumeFile(e));
    document.getElementById('save-resume')?.addEventListener('click', () => this.saveResume());

    // Contact
    document.getElementById('save-contact')?.addEventListener('click', () => this.saveContact());

    // Messages
    document.getElementById('clear-messages-btn')?.addEventListener('click', () => this.clearMessages());

    // Theme
    document.getElementById('save-theme')?.addEventListener('click', () => this.saveTheme());
    document.getElementById('reset-theme')?.addEventListener('click', () => this.resetTheme());
    document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => this.toggleDarkMode(e));

    // Color pickers
    ['primary-color', 'secondary-color', 'accent-color'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', (e) => {
        document.getElementById(`${id}-value`).textContent = e.target.value;
      });
    });
    // Projects
    document.getElementById('add-project-btn')?.addEventListener('click', () => this.openProjectModal());
    document.getElementById('project-form')?.addEventListener('submit', (e) => this.saveProject(e));
  }

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  populateProfileForm() {
    const { profile } = this.portfolioData;
    
    document.getElementById('name').value = profile.name || '';
    document.getElementById('title').value = profile.title || '';
    document.getElementById('bio').value = profile.bio || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('location').value = profile.location || '';
    
    document.getElementById('linkedin').value = profile.socialLinks?.linkedin || '';
    document.getElementById('github').value = profile.socialLinks?.github || '';
    document.getElementById('instagram').value = profile.socialLinks?.instagram || '';
    document.getElementById('twitter').value = profile.socialLinks?.twitter || '';
  }

  handleProfilePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.portfolioData.profile.profilePhoto = event.target.result;
        document.getElementById('profile-photo-name').textContent = `✓ ${file.name}`;
        this.savePortfolioData();
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.portfolioData.profile = {
      ...this.portfolioData.profile,
      name: document.getElementById('name').value,
      title: document.getElementById('title').value,
      bio: document.getElementById('bio').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      socialLinks: {
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        instagram: document.getElementById('instagram').value,
        twitter: document.getElementById('twitter').value
      }
    };

    this.savePortfolioData();
    this.showNotification('Profile updated successfully!', 'success');
  }

  // ============================================================================
  // ABOUT MANAGEMENT
  // ============================================================================

  populateAboutForm() {
    const { about } = this.portfolioData;
    
    document.getElementById('about-description').value = about.description || '';
    document.getElementById('about-background').value = about.background || '';
    
    this.displaySkills(about.skills || []);
    this.displayInterests(about.interests || []);
  }

  displaySkills(skills) {
    const container = document.getElementById('skills-container');
    container.innerHTML = skills.map((skill, index) => `
      <span class="skill-tag">
        ${skill}
        <button type="button" onclick="admin.removeSkill(${index})">×</button>
      </span>
    `).join('');
  }

  displayInterests(interests) {
    const container = document.getElementById('interests-container');
    container.innerHTML = interests.map((interest, index) => `
      <span class="skill-tag">
        ${interest}
        <button type="button" onclick="admin.removeInterest(${index})">×</button>
      </span>
    `).join('');
  }

  addSkill() {
    const input = document.getElementById('skill-input');
    const skill = input.value.trim();
    
    if (skill) {
      this.portfolioData.about.skills.push(skill);
      this.displaySkills(this.portfolioData.about.skills);
      input.value = '';
    }
  }

  removeSkill(index) {
    this.portfolioData.about.skills.splice(index, 1);
    this.displaySkills(this.portfolioData.about.skills);
  }

  addInterest() {
    const input = document.getElementById('interest-input');
    const interest = input.value.trim();
    
    if (interest) {
      this.portfolioData.about.interests.push(interest);
      this.displayInterests(this.portfolioData.about.interests);
      input.value = '';
    }
  }

  removeInterest(index) {
    this.portfolioData.about.interests.splice(index, 1);
    this.displayInterests(this.portfolioData.about.interests);
  }

  saveAbout() {
    this.portfolioData.about = {
      description: document.getElementById('about-description').value,
      background: document.getElementById('about-background').value,
      skills: this.portfolioData.about.skills,
      interests: this.portfolioData.about.interests
    };

    this.savePortfolioData();
    this.showNotification('About information updated!', 'success');
  }

  // ============================================================================
  // EXPERIENCE MANAGEMENT
  // ============================================================================

  openExperienceModal(id = null) {
    this.editingId = id;
    this.editingType = 'experience';
    
    const modal = document.getElementById('experience-modal');
    const form = document.getElementById('experience-form');
    const title = document.getElementById('experience-modal-title');

    form.reset();

    if (id !== null) {
      const exp = this.portfolioData.experience.find(e => e.id === id);
      if (exp) {
        title.textContent = 'Edit Experience';
        document.getElementById('exp-title').value = exp.title;
        document.getElementById('exp-company').value = exp.company;
        document.getElementById('exp-start').value = exp.startDate;
        document.getElementById('exp-end').value = exp.endDate;
        document.getElementById('exp-description').value = exp.description;
        document.getElementById('exp-skills').value = exp.skills.join(', ');
      }
    } else {
      title.textContent = 'Add Experience';
    }

    modal.classList.add('active');
  }

  saveExperience(e) {
    e.preventDefault();

    const experience = {
      id: this.editingId || Date.now(),
      title: document.getElementById('exp-title').value,
      company: document.getElementById('exp-company').value,
      startDate: document.getElementById('exp-start').value,
      endDate: document.getElementById('exp-end').value,
      description: document.getElementById('exp-description').value,
      skills: document.getElementById('exp-skills').value.split(',').map(s => s.trim())
    };

    if (this.editingId) {
      const index = this.portfolioData.experience.findIndex(e => e.id === this.editingId);
      this.portfolioData.experience[index] = experience;
    } else {
      this.portfolioData.experience.push(experience);
    }

    this.savePortfolioData();
    this.loadExperienceTable();
    closeModal('experience-modal');
    this.showNotification('Experience saved!', 'success');
  }

  loadExperienceTable() {
    const tbody = document.getElementById('experience-tbody');
    
    tbody.innerHTML = this.portfolioData.experience.map(exp => `
      <tr>
        <td>${exp.title}</td>
        <td>${exp.company}</td>
        <td>${exp.startDate} - ${exp.endDate}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="admin.openExperienceModal(${exp.id})">Edit</button>
            <button class="btn-delete" onclick="admin.deleteExperience(${exp.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    this.updateStats();
  }

  deleteExperience(id) {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.portfolioData.experience = this.portfolioData.experience.filter(e => e.id !== id);
      this.savePortfolioData();
      this.loadExperienceTable();
      this.showNotification('Experience deleted!', 'success');
    }
  }

  // ============================================================================
  // EDUCATION MANAGEMENT
  // ============================================================================

  openEducationModal(id = null) {
    this.editingId = id;
    this.editingType = 'education';
    
    const modal = document.getElementById('education-modal');
    const form = document.getElementById('education-form');
    const title = document.getElementById('education-modal-title');

    form.reset();

    if (id !== null) {
      const edu = this.portfolioData.education.find(e => e.id === id);
      if (edu) {
        title.textContent = 'Edit Education';
        document.getElementById('edu-degree').value = edu.degree;
        document.getElementById('edu-institution').value = edu.institution;
        document.getElementById('edu-year').value = edu.year;
        document.getElementById('edu-field').value = edu.field;
        document.getElementById('edu-gpa').value = edu.gpa;
      }
    } else {
      title.textContent = 'Add Education';
    }

    modal.classList.add('active');
  }

  saveEducation(e) {
    e.preventDefault();

    const education = {
      id: this.editingId || Date.now(),
      degree: document.getElementById('edu-degree').value,
      institution: document.getElementById('edu-institution').value,
      year: document.getElementById('edu-year').value,
      field: document.getElementById('edu-field').value,
      gpa: document.getElementById('edu-gpa').value
    };

    if (this.editingId) {
      const index = this.portfolioData.education.findIndex(e => e.id === this.editingId);
      this.portfolioData.education[index] = education;
    } else {
      this.portfolioData.education.push(education);
    }

    this.savePortfolioData();
    this.loadEducationTable();
    closeModal('education-modal');
    this.showNotification('Education saved!', 'success');
  }

  loadEducationTable() {
    const tbody = document.getElementById('education-tbody');
    
    tbody.innerHTML = this.portfolioData.education.map(edu => `
      <tr>
        <td>${edu.degree}</td>
        <td>${edu.institution}</td>
        <td>${edu.year}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="admin.openEducationModal(${edu.id})">Edit</button>
            <button class="btn-delete" onclick="admin.deleteEducation(${edu.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    this.updateStats();
  }

  deleteEducation(id) {
    if (confirm('Are you sure you want to delete this education entry?')) {
      this.portfolioData.education = this.portfolioData.education.filter(e => e.id !== id);
      this.savePortfolioData();
      this.loadEducationTable();
      this.showNotification('Education deleted!', 'success');
    }
  }

  // ============================================================================
  // PROJECTS MANAGEMENT
  // ============================================================================

  openProjectModal(id = null) {
    this.editingId = id;
    this.editingType = 'project';

    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const title = document.getElementById('project-modal-title');

    form.reset();

    if (id !== null) {
      const proj = (this.portfolioData.projects || []).find(p => p.id === id);
      if (proj) {
        title.textContent = 'Edit Project';
        document.getElementById('proj-title').value = proj.title || '';
        document.getElementById('proj-category').value = proj.category || '';
        document.getElementById('proj-tech').value = (proj.technologies || []).join(', ');
        document.getElementById('proj-image').value = proj.image || '';
        document.getElementById('proj-demo').value = proj.demo || '';
        document.getElementById('proj-github').value = proj.github || '';
        document.getElementById('proj-start').value = proj.startDate || '';
        document.getElementById('proj-end').value = proj.endDate || '';
        document.getElementById('proj-desc').value = proj.description || '';
      }
    } else {
      title.textContent = 'Add Project';
    }

    modal.classList.add('active');
  }

  saveProject(e) {
    e.preventDefault();

    if (!this.portfolioData.projects) this.portfolioData.projects = [];

    const project = {
      id: this.editingId || Date.now(),
      title: document.getElementById('proj-title').value,
      category: document.getElementById('proj-category').value,
      technologies: document.getElementById('proj-tech').value.split(',').map(t => t.trim()).filter(Boolean),
      image: document.getElementById('proj-image').value || 'assets/images/project-1.svg',
      demo: document.getElementById('proj-demo').value || '#',
      github: document.getElementById('proj-github').value || '#',
      startDate: document.getElementById('proj-start').value || '',
      endDate: document.getElementById('proj-end').value || '',
      description: document.getElementById('proj-desc').value || ''
    };

    if (this.editingId) {
      const idx = this.portfolioData.projects.findIndex(p => p.id === this.editingId);
      if (idx !== -1) this.portfolioData.projects[idx] = project;
    } else {
      this.portfolioData.projects.push(project);
    }

    this.savePortfolioData();
    this.loadProjectsTable();
    closeModal('project-modal');
    this.showNotification('Project saved!', 'success');
  }

  loadProjectsTable() {
    const tbody = document.getElementById('projects-tbody');
    const projects = this.portfolioData.projects || [];

    tbody.innerHTML = projects.map(proj => `
      <tr>
        <td>${proj.title}</td>
        <td>${proj.category}</td>
        <td>${(proj.technologies || []).slice(0,3).join(', ')}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="admin.openProjectModal(${proj.id})">Edit</button>
            <button class="btn-delete" onclick="admin.deleteProject(${proj.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    this.updateStats();
  }

  deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.portfolioData.projects = (this.portfolioData.projects || []).filter(p => p.id !== id);
      this.savePortfolioData();
      this.loadProjectsTable();
      this.showNotification('Project deleted!', 'success');
    }
  }

  // ============================================================================
  // RESUME MANAGEMENT
  // ============================================================================

  handleResumeFile(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.showNotification('Please upload a PDF file only.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        this.portfolioData.resume = event.target.result;
        document.getElementById('resume-file-name').textContent = `✓ ${file.name}`;
      };
      reader.readAsDataURL(file);
    }
  }

  loadResumeSection() {
    if (this.portfolioData.resume) {
      document.getElementById('current-resume').textContent = 'Resume uploaded ✓';
      document.getElementById('download-resume-link').style.display = 'inline-block';
      document.getElementById('download-resume-link').href = this.portfolioData.resume;
    }
  }

  saveResume() {
    if (this.portfolioData.resume) {
      this.savePortfolioData();
      this.showNotification('Resume uploaded successfully!', 'success');
    } else {
      this.showNotification('Please select a resume file first.', 'error');
    }
  }

  // ============================================================================
  // CONTACT MANAGEMENT
  // ============================================================================

  populateContactForm() {
    const { email, phone, location } = this.portfolioData.profile;
    
    document.getElementById('contact-email').value = email || '';
    document.getElementById('contact-phone').value = phone || '';
    document.getElementById('contact-location').value = location || '';
  }

  saveContact() {
    this.portfolioData.profile.email = document.getElementById('contact-email').value;
    this.portfolioData.profile.phone = document.getElementById('contact-phone').value;
    this.portfolioData.profile.location = document.getElementById('contact-location').value;

    this.savePortfolioData();
    this.showNotification('Contact information updated!', 'success');
  }

  // ============================================================================
  // MESSAGES
  // ============================================================================

  loadMessages() {
    const container = document.getElementById('messages-container');
    const messages = this.portfolioData.contact.formSubmissions || [];

    if (messages.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999;">No messages yet.</p>';
      return;
    }

    container.innerHTML = messages.map((msg, index) => `
      <div style="background: var(--card-light); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary-color);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
          <div>
            <h4 style="margin: 0; margin-bottom: 0.25rem;">${msg.name}</h4>
            <p style="margin: 0; font-size: 0.85rem; opacity: 0.7;">${new Date(msg.timestamp).toLocaleString()}</p>
          </div>
          <button class="btn-delete" onclick="admin.deleteMessage(${index})" style="padding: 4px 8px; font-size: 0.8rem;">Delete</button>
        </div>
        <p style="margin: 0.5rem 0; font-weight: 500;">📧 ${msg.email}</p>
        <p style="margin: 0.5rem 0;"><strong>Subject:</strong> ${msg.subject}</p>
        <p style="margin: 0.5rem 0;">${msg.message}</p>
      </div>
    `).join('');
  }

  deleteMessage(index) {
    if (confirm('Delete this message?')) {
      this.portfolioData.contact.formSubmissions.splice(index, 1);
      this.savePortfolioData();
      this.loadMessages();
    }
  }

  clearMessages() {
    if (confirm('Are you sure? This will delete all messages permanently.')) {
      this.portfolioData.contact.formSubmissions = [];
      this.savePortfolioData();
      this.loadMessages();
      this.showNotification('All messages cleared!', 'success');
    }
  }

  // ============================================================================
  // THEME MANAGEMENT
  // ============================================================================

  populateThemeForm() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
  }

  toggleDarkMode(e) {
    if (e.target.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('portfolio-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('portfolio-theme', 'light');
    }
    try {
      localStorage.setItem('portfolio-theme-updated', Date.now().toString());
    } catch (err) {}
    if (window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('portfolio-updates');
        bc.postMessage({ type: 'portfolio-theme', value: this.darkMode });
        bc.close();
      } catch (err) {}
    }
  }

  saveTheme() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    const accentColor = document.getElementById('accent-color').value;

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);

    const themeData = {
      primaryColor,
      secondaryColor,
      accentColor,
      isDark: document.body.classList.contains('dark-mode')
    };

    localStorage.setItem('portfolio-theme-colors', JSON.stringify(themeData));
    try {
      localStorage.setItem('portfolio-theme-colors-updated', Date.now().toString());
    } catch (err) {}
    if (window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('portfolio-updates');
        bc.postMessage({ type: 'portfolio-theme-colors', data: themeData });
        bc.close();
      } catch (err) {}
    }
    this.showNotification('Theme updated successfully!', 'success');
  }

  resetTheme() {
    document.documentElement.style.setProperty('--primary-color', '#6366f1');
    document.documentElement.style.setProperty('--secondary-color', '#ec4899');
    document.documentElement.style.setProperty('--accent-color', '#f59e0b');

    document.getElementById('primary-color').value = '#6366f1';
    document.getElementById('secondary-color').value = '#ec4899';
    document.getElementById('accent-color').value = '#f59e0b';

    document.getElementById('primary-color-value').textContent = '#6366f1';
    document.getElementById('secondary-color-value').textContent = '#ec4899';
    document.getElementById('accent-color-value').textContent = '#f59e0b';

    localStorage.removeItem('portfolio-theme-colors');
    this.showNotification('Theme reset to default!', 'success');
  }

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  loadDashboardData() {
    document.getElementById('experience-count').textContent = this.portfolioData.experience.length;
    document.getElementById('education-count').textContent = this.portfolioData.education.length;
    document.getElementById('messages-count').textContent = this.portfolioData.contact.formSubmissions.length;
  }

  updateStats() {
    this.loadDashboardData();
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  showNotification(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '2000';
    alert.style.maxWidth = '400px';

    document.body.appendChild(alert);

    setTimeout(() => {
      alert.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => alert.remove(), 300);
    }, 4000);
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('admin-token');
      window.location.href = 'login.html';
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}

function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

let admin;

document.addEventListener('DOMContentLoaded', () => {
  admin = new AdminDashboard();

  // Load theme colors if saved
  const savedTheme = localStorage.getItem('portfolio-theme-colors');
  if (savedTheme) {
    const theme = JSON.parse(savedTheme);
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  }
});
