// ============================================================================
// MAIN PORTFOLIO APPLICATION - CORE FUNCTIONALITY
// ============================================================================

class PortfolioApp {
  constructor() {
    this.currentPage = 'home';
    this.darkMode = false;
    this.portfolioData = this.loadPortfolioData();
    this.init();
  }

  init() {
    console.log('[Portfolio] Initializing application...');
    
    // Phase 1: Setup navigation and listeners (DOM-independent)
    this.setupPageNavigation(); // Must run BEFORE displayContent to read URL hash
    this.setupEventListeners();
    this.loadTheme();
    this.setupStorageListener(); // Listen for changes from admin panel
    this.setupBroadcastChannel(); // Setup BroadcastChannel listener
    
    // Phase 2: Inject HTML content into DOM
    this.displayContent();
    
    // Phase 3: Setup scroll animations AFTER content is in DOM
    this.setupScrollAnimations();
    
    console.log('[Portfolio] Initialization complete. Current page:', this.currentPage);
  }

  setupStorageListener() {
    // Store current data for comparison
    this.lastKnownData = JSON.stringify(this.portfolioData);

    // Listen for changes from admin panel via storage events (other tabs)
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      console.log('[Portfolio] Storage event detected:', e.key);
      
      if (e.key === 'portfolio-data' || e.key === 'portfolio-data-updated') {
        console.log('[Portfolio] Portfolio data changed, reloading...');
        this.portfolioData = this.loadPortfolioData();
        this.displayContent();
      } else if (e.key === 'portfolio-theme-colors' || e.key === 'portfolio-theme-colors-updated') {
        console.log('[Portfolio] Theme colors changed, reloading...');
        this.loadThemeColors();
      } else if (e.key === 'portfolio-theme' || e.key === 'portfolio-theme-updated') {
        console.log('[Portfolio] Theme changed, reloading...');
        this.loadTheme();
      }
    });

    // Listen for page visibility changes (when user switches back to main tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('[Portfolio] Page is visible, checking for updates...');
        this.checkForDataUpdates();
      }
    });

    // Aggressive polling - check every 2 seconds (not 5)
    this.pollInterval = setInterval(() => {
      this.checkForDataUpdates();
    }, 2000);
  }

  checkForDataUpdates() {
    try {
      const saved = localStorage.getItem('portfolio-data');
      if (saved) {
        const currentData = JSON.stringify(this.loadPortfolioData());
        if (currentData !== this.lastKnownData) {
          console.log('[Portfolio] Data change detected via polling');
          this.lastKnownData = currentData;
          this.portfolioData = this.loadPortfolioData();
          this.displayContent();
        }
      }
    } catch (e) {
      console.warn('[Portfolio] Error checking for updates:', e);
    }
  }

  setupBroadcastChannel() {
    // BroadcastChannel for same-origin messaging
    if (window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('portfolio-updates');
        bc.addEventListener('message', (msg) => {
          const data = msg.data || {};
          console.log('[Portfolio] BroadcastChannel message:', data.type);
          
          if (data.type === 'portfolio-data') {
            this.portfolioData = this.loadPortfolioData();
            this.displayContent();
          } else if (data.type === 'portfolio-theme-colors') {
            this.loadThemeColors();
          } else if (data.type === 'portfolio-theme') {
            this.loadTheme();
          }
        });
        this._bc = bc;
      } catch (e) {
        console.warn('[Portfolio] BroadcastChannel not available:', e);
      }
    }
  }

  // ============================================================================
  // THEME MANAGEMENT
  // ============================================================================

  loadTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.darkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.applyTheme();
    this.loadThemeColors();
  }

  applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) toggle.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) toggle.textContent = '🌙';
    }
    localStorage.setItem('portfolio-theme', this.darkMode ? 'dark' : 'light');
  }

  loadThemeColors() {
    const savedColors = localStorage.getItem('portfolio-theme-colors');
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        document.documentElement.style.setProperty('--primary-color', colors.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', colors.secondaryColor);
        document.documentElement.style.setProperty('--accent-color', colors.accentColor);
      } catch (e) {
        console.warn('Failed to load theme colors:', e);
      }
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
  }

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  loadPortfolioData() {
    const defaultData = {
      profile: {
        name: 'Nirmal Kumar',
        title: 'Full Stack Developer & UI/UX Enthusiast',
        bio: 'Passionate developer crafting beautiful and functional web experiences with modern technologies.',
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
        description: 'I am a skilled full-stack developer with expertise in modern web technologies. I love creating engaging user experiences and solving complex problems.',
        background: 'With 3+ years of experience, I have worked on various projects ranging from startups to enterprise applications.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'HTML5', 'CSS3', 'Tailwind CSS', 'Web Design', 'Git', 'Docker'],
        interests: ['Web Development', 'UI/UX Design', 'Open Source', 'Problem Solving']
      },
      experience: [
        {
          id: 1,
          title: 'Senior Developer',
          company: 'Tech Company Inc.',
          startDate: '2022',
          endDate: 'Present',
          description: 'Led development of high-performance web applications using React and Node.js',
          skills: ['React', 'Node.js', 'MongoDB']
        },
        {
          id: 2,
          title: 'Full Stack Developer',
          company: 'Web Solutions Ltd.',
          startDate: '2020',
          endDate: '2022',
          description: 'Developed and maintained multiple client projects with focus on performance and UX',
          skills: ['JavaScript', 'React', 'Python', 'PostgreSQL']
        },
        {
          id: 3,
          title: 'Frontend Developer Intern',
          company: 'Digital Agency Co.',
          startDate: '2019',
          endDate: '2020',
          description: 'Built responsive web interfaces and learned modern frontend practices',
          skills: ['HTML', 'CSS', 'JavaScript', 'React']
        }
      ],
      education: [
        {
          id: 1,
          degree: 'Bachelor of Technology',
          institution: 'University of Technology',
          year: '2019',
          field: 'Computer Science',
          gpa: '3.8/4.0'
        },
        {
          id: 2,
          degree: 'Diploma in Web Development',
          institution: 'Online Learning Platform',
          year: '2018',
          field: 'Full Stack Web Development',
          gpa: 'A+'
        }
      ],
      projects: [
        {
          id: 1,
          title: 'E-Commerce Platform',
          description: 'A full-stack e-commerce solution with payment integration, inventory management, and admin dashboard.',
          image: 'assets/images/project-1.svg',
          category: 'Full Stack',
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          github: 'https://github.com',
          demo: 'https://example.com',
          startDate: '2023',
          endDate: '2024'
        },
        {
          id: 2,
          title: 'Task Management App',
          description: 'A collaborative task management application with real-time updates, team collaboration, and progress tracking.',
          image: 'assets/images/project-2.svg',
          category: 'Frontend',
          technologies: ['React', 'Firebase', 'Tailwind CSS'],
          github: 'https://github.com',
          demo: 'https://example.com',
          startDate: '2023',
          endDate: '2023'
        },
        {
          id: 3,
          title: 'AI Chat Bot',
          description: 'An AI-powered chatbot with natural language processing, trained to assist with customer support queries.',
          image: 'assets/images/project-3.svg',
          category: 'Backend',
          technologies: ['Python', 'TensorFlow', 'Flask', 'PostgreSQL'],
          github: 'https://github.com',
          demo: 'https://example.com',
          startDate: '2022',
          endDate: '2023'
        },
        {
          id: 4,
          title: 'Portfolio Website',
          description: 'A responsive personal portfolio website with admin panel, dark mode, and SEO optimization.',
          image: 'assets/images/project-4.svg',
          category: 'Full Stack',
          technologies: ['HTML5', 'CSS3', 'JavaScript', 'localStorage'],
          github: 'https://github.com',
          demo: 'https://example.com',
          startDate: '2024',
          endDate: '2024'
        },
        {
          id: 5,
          title: 'Social Media Dashboard',
          description: 'Analytics dashboard for monitoring social media metrics across multiple platforms in real-time.',
          image: 'assets/images/project-5.svg',
          category: 'Frontend',
          technologies: ['React', 'Chart.js', 'API Integration'],
          github: 'https://github.com',
          demo: 'https://example.com',
          startDate: '2023',
          endDate: '2023'
        },
        {
          id: 6,
          title: 'Mobile Weather App',
          description: 'Cross-platform weather application with real-time data, location services, and weather forecasting.',
          image: 'assets/images/project-6.svg',
          category: 'Mobile',
          technologies: ['React Native', 'OpenWeather API', 'Expo'],
          github: 'https://github.com',
          demo: 'https://example.com',
          startDate: '2022',
          endDate: '2023'
        }
      ],
      contact: {
        formSubmissions: []
      },
      resume: 'assets/documents/resume.pdf'
    };

    const savedData = localStorage.getItem('portfolio-data');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.warn('[Portfolio] Corrupted localStorage data, using defaults:', e);
        localStorage.removeItem('portfolio-data');
        return defaultData;
      }
    }
    return defaultData;
  }

  savePortfolioData() {
    localStorage.setItem('portfolio-data', JSON.stringify(this.portfolioData));
    this.displayContent();
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  setupEventListeners() {
    // Theme toggle - with retry if element not found yet
    const attachThemeListener = () => {
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => this.toggleTheme());
      }
    };
    attachThemeListener();

    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    mobileToggle?.addEventListener('click', () => {
      const navLinks = document.querySelector('.nav-links');
      navLinks?.classList.toggle('active');
    });

    // Contact form
    document.getElementById('contact-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Resume download
    document.getElementById('download-resume')?.addEventListener('click', () => this.downloadResume());
  }

  reattachEventListeners() {
    // Reattach theme toggle after DOM updates
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      // Remove old listeners by cloning
      const newToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(newToggle, toggle);
      newToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
  setupPageNavigation() {
    // Read initial hash and navigate if present
    const initialHash = window.location.hash ? window.location.hash.replace('#', '') : null;
    const validPages = ['home', 'about', 'experience', 'education', 'projects', 'resume', 'contact'];
    
    if (initialHash && validPages.includes(initialHash)) {
      this.currentPage = initialHash;
      console.log('[Portfolio] Initial page from hash:', initialHash);
    } else {
      console.log('[Portfolio] No hash or invalid hash, using default (home)');
    }

    // Update on hash change
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h && validPages.includes(h)) {
        console.log('[Portfolio] Hash changed to:', h);
        this.navigateTo(h);
      }
    });
  }

  handleNavigation(e) {
    const href = e.target.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const page = href.substring(1);
      this.navigateTo(page);
      document.querySelector('.nav-links')?.classList.remove('active');
    }
  }

  navigateTo(page) {
    this.currentPage = page;
    this.displayContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${page}`) {
        link.classList.add('active');
      }
    });
  }

  // ============================================================================
  // CONTENT DISPLAY
  // ============================================================================

  displayContent() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('[Portfolio] CRITICAL: #main-content element not found in DOM. Page cannot render.');
      this.showMessage('Error: Main content container not found. Please refresh the page.', 'error');
      return;
    }

    try {
      console.log('[Portfolio] Generating content for page:', this.currentPage);
      const content = this.getPageContent();
      console.log('[Portfolio] Content generated successfully, length:', content.length);
      mainContent.innerHTML = content;
      console.log('[Portfolio] ✓ Loaded page:', this.currentPage);
      console.log('[Portfolio] Content injected. Elements in main:', mainContent.children.length);
      this.attachPageListeners();
      this.reattachEventListeners(); // Reattach theme toggle after content update
    } catch (error) {
      console.error('[Portfolio] Error rendering content:', error);
      console.error('[Portfolio] Error stack:', error.stack);
      console.error('[Portfolio] Current page:', this.currentPage);
      this.showMessage('Error loading page content. Please try again.', 'error');
    }
  }

  getPageContent() {
    const safeCall = (method, name) => {
      try {
        return method.call(this);
      } catch (e) {
        console.error(`[Portfolio] Error in ${name}:`, e);
        return `<section><div class="container"><h2>Error loading ${name}</h2><p>${e.message}</p></div></section>`;
      }
    };

    const pages = {
      home: safeCall(this.getHomeContent, 'getHomeContent'),
      about: safeCall(this.getAboutContent, 'getAboutContent'),
      experience: safeCall(this.getExperienceContent, 'getExperienceContent'),
      education: safeCall(this.getEducationContent, 'getEducationContent'),
      projects: safeCall(this.getProjectsContent, 'getProjectsContent'),
      resume: safeCall(this.getResumeContent, 'getResumeContent'),
      contact: safeCall(this.getContactContent, 'getContactContent')
    };

    return pages[this.currentPage] || pages.home;
  }

  getHomeContent() {
    const { profile, about } = this.portfolioData;
    return `
      <section class="hero">
        <div class="container hero-content">
          <div class="hero-text">
            <h1>Hello, I'm ${profile.name}</h1>
            <p>${profile.title}</p>
            <p>${about.description}</p>
            <div class="hero-buttons">
              <a href="#about" class="btn btn-primary">Learn More</a>
              <a href="#contact" class="btn btn-secondary">Get In Touch</a>
            </div>
          </div>
          <div class="hero-image">
            <img 
              src="${profile.profilePhoto}" 
              alt="${profile.name}" 
              loading="lazy"
              width="400"
              height="400"
            />
          </div>
        </div>
      </section>
    `;
  }

  getAboutContent() {
    const { profile, about } = this.portfolioData;
    return `
      <section class="dark-section">
        <div class="container">
          <h2>About Me</h2>
          <div class="about-grid">
            <div class="about-image fade-in-scroll">
              <img 
                src="${profile.profilePhoto}" 
                alt="${profile.name}"
                loading="lazy"
                width="400"
                height="400"
              />
            </div>
            <div>
              <p class="fade-in-scroll">${about.description}</p>
              <p class="fade-in-scroll">${about.background}</p>
              <h3>Skills & Expertise</h3>
              <div class="fade-in-scroll">
                ${about.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  getExperienceContent() {
    const { experience } = this.portfolioData;
    return `
      <section>
        <div class="container">
          <h2>Work Experience</h2>
          <div class="timeline">
            ${experience.map((exp, index) => `
              <div class="timeline-item" style="animation-delay: ${index * 0.1}s;">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-date">${exp.startDate} - ${exp.endDate}</div>
                  <h3>${exp.title}</h3>
                  <p class="company-name" style="color: var(--primary-color); font-weight: 600; margin-bottom: 0.5rem;">${exp.company}</p>
                  <p>${exp.description}</p>
                  <div>
                    ${exp.skills.map(skill => `<span class="skill-tag" style="font-size: 0.8rem;">${skill}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  getEducationContent() {
    const { education } = this.portfolioData;
    return `
      <section class="dark-section">
        <div class="container">
          <h2>Education</h2>
          <div class="grid grid-2">
            ${education.map((edu, index) => `
              <div class="education-card fade-in-scroll" style="animation-delay: ${index * 0.1}s;">
                <h3>${edu.degree}</h3>
                <p style="color: var(--primary-color); font-weight: 600; margin-bottom: 0.5rem;">${edu.institution}</p>
                <p><strong>Field:</strong> ${edu.field}</p>
                <p><strong>Year:</strong> ${edu.year}</p>
                <p><strong>Performance:</strong> ${edu.gpa}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  getProjectsContent() {
    const { projects } = this.portfolioData;
    return `
      <section class="dark-section">
        <div class="container">
          <h2>My Projects</h2>
          <div class="projects-filter" style="margin-bottom: 2rem; text-align: center;">
            <button class="filter-btn active" data-filter="all" style="margin-right: 1rem;">All</button>
            <button class="filter-btn" data-filter="Full Stack" style="margin-right: 1rem;">Full Stack</button>
            <button class="filter-btn" data-filter="Frontend" style="margin-right: 1rem;">Frontend</button>
            <button class="filter-btn" data-filter="Backend" style="margin-right: 1rem;">Backend</button>
            <button class="filter-btn" data-filter="Mobile">Mobile</button>
          </div>
          <div class="projects-grid">
            ${projects.map((project, index) => `
              <div class="project-card fade-in-scroll" data-category="${project.category}" style="animation-delay: ${index * 0.1}s;">
                <div class="project-image">
                  <img src="${project.image}" alt="${project.title}" loading="lazy" />
                  <div class="project-overlay">
                    <div class="project-links">
                      <a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-link" title="Live Demo">
                        <i class="fas fa-external-link-alt"></i> Demo
                      </a>
                      <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link" title="GitHub Repo">
                        <i class="fas fa-code-branch"></i> Code
                      </a>
                    </div>
                  </div>
                </div>
                <div class="project-content">
                  <span class="project-category">${project.category}</span>
                  <h3>${project.title}</h3>
                  <p>${project.description}</p>
                  <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                  </div>
                  <div class="project-date" style="font-size: 0.85rem; color: var(--primary-color); margin-top: 1rem;">
                    ${project.startDate} - ${project.endDate}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  getResumeContent() {
    const { resume } = this.portfolioData;
    return `
      <section>
        <div class="container">
          <h2>Resume</h2>
          <div style="text-align: center; margin-bottom: 2rem;">
            <a href="${resume}" download class="btn btn-primary" id="download-resume">
              📥 Download Resume as PDF
            </a>
          </div>
          <div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%); border-radius: 12px;">
            <p style="color: rgba(0,0,0,0.6);">Resume preview will be displayed here. Click the download button above to get the PDF version.</p>
            <p style="margin-top: 1rem; font-size: 0.9rem;">The resume file is stored securely and can be updated from the admin panel.</p>
          </div>
        </div>
      </section>
    `;
  }

  getContactContent() {
    const { profile } = this.portfolioData;
    return `
      <section class="dark-section">
        <div class="container">
          <h2>Get In Touch</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 3rem;">
            <div>
              <h3>Contact Information</h3>
              <p><strong>Email:</strong> <a href="mailto:${profile.email}" style="color: var(--primary-color); text-decoration: none;">${profile.email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${profile.phone}" style="color: var(--primary-color); text-decoration: none;">${profile.phone}</a></p>
              <p><strong>Location:</strong> ${profile.location}</p>
              <h3 style="margin-top: 2rem;">Follow Me</h3>
              <div class="social-links">
                ${profile.socialLinks.linkedin ? `<a href="${profile.socialLinks.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn">in</a>` : ''}
                ${profile.socialLinks.github ? `<a href="${profile.socialLinks.github}" target="_blank" rel="noopener noreferrer" class="social-link" title="GitHub">⚙️</a>` : ''}
                ${profile.socialLinks.instagram ? `<a href="${profile.socialLinks.instagram}" target="_blank" rel="noopener noreferrer" class="social-link" title="Instagram">📷</a>` : ''}
                ${profile.socialLinks.twitter ? `<a href="${profile.socialLinks.twitter}" target="_blank" rel="noopener noreferrer" class="social-link" title="Twitter">𝕏</a>` : ''}
              </div>
            </div>
            <div>
              <form id="contact-form" class="contact-form">
                <div class="form-group">
                  <label for="name">Name</label>
                  <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                  <label for="subject">Subject</label>
                  <input type="text" id="subject" name="subject" required>
                </div>
                <div class="form-group">
                  <label for="message">Message</label>
                  <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  attachPageListeners() {
    document.getElementById('download-resume')?.addEventListener('click', () => this.downloadResume());
    document.getElementById('contact-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  // ============================================================================
  // FORM HANDLING
  // ============================================================================

  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value,
      timestamp: new Date().toISOString()
    };

    this.portfolioData.contact.formSubmissions.push(formData);
    this.savePortfolioData();

    // Show success message
    this.showMessage('Message sent successfully! Thank you for reaching out.', 'success');
    
    // Reset form
    e.target.reset();

    // You can add email sending functionality here using a backend service
  }

  // ============================================================================
  // SCROLL ANIMATIONS
  // ============================================================================

  setupScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-scroll');
    console.log('[Portfolio] Setting up scroll animations for', fadeElements.length, 'elements');
    
    // Make all fade-in-scroll elements immediately visible on load (important for initial content display)
    fadeElements.forEach(element => {
      element.classList.add('visible');
    });

    if (fadeElements.length === 0) {
      console.warn('[Portfolio] No .fade-in-scroll elements found. This is normal if page content doesn\'t use this class.');
      return;
    }

    // Setup scroll animations for elements entering viewport
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(element => {
      observer.observe(element);
    });
    
    console.log('[Portfolio] ✓ Scroll animations setup complete');
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  showMessage(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(alert, container.firstChild);
      setTimeout(() => alert.remove(), 5000);
    }
  }

  downloadResume() {
    const link = document.createElement('a');
    link.href = this.portfolioData.resume;
    link.download = 'resume.pdf';
    link.click();
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  window.portfolio = new PortfolioApp();
});

// ============================================================================
// PERFORMANCE & ACCESSIBILITY
// ============================================================================

// Lazy loading for images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Smooth scroll behavior
if (!('scrollBehavior' in document.documentElement.style)) {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
