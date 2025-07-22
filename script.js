// ===== GLOBAL STATE MANAGEMENT =====
const AppState = {
  theme: localStorage.getItem('theme') || 'light',
  searchResults: [],
  isSearchOpen: false,
  isMenuOpen: false,
  currentPage: window.location.pathname.split('/').pop() || 'index.html',
  
  // Update state and notify listeners
  setState(newState) {
    Object.assign(this, newState);
    this.notifyListeners();
  },
  
  listeners: [],
  
  addListener(callback) {
    this.listeners.push(callback);
  },
  
  notifyListeners() {
    this.listeners.forEach(callback => callback(this));
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  // Debounce function for performance optimization
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Animate numbers for statistics
  animateNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  },
  
  // Format numbers with appropriate suffixes
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  // Create toast notification
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    const messageElement = toast.querySelector('.toast__message');
    const closeButton = toast.querySelector('.toast__close');
    
    messageElement.textContent = message;
    toast.className = `toast show toast--${type}`;
    
    const hideToast = () => {
      toast.classList.remove('show');
    };
    
    closeButton.onclick = hideToast;
    
    setTimeout(hideToast, duration);
  }
};

// ===== DOM MANIPULATION =====
const DOM = {
  // Efficient DOM updates using DocumentFragment
  createElements(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content;
  },
  
  // Batch DOM updates
  batchUpdate(updates) {
    const fragment = document.createDocumentFragment();
    updates.forEach(update => {
      if (typeof update === 'function') {
        update(fragment);
      }
    });
    return fragment;
  },
  
  // Smooth scroll to element
  scrollToElement(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// ===== THEME MANAGEMENT =====
const ThemeManager = {
  init() {
    this.applyTheme(AppState.theme);
    this.bindEvents();
  },
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('.theme-toggle__icon');
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    AppState.setState({ theme });
  },
  
  toggle() {
    const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    Utils.showToast(`Switched to ${newTheme} mode`, 'success');
  },
  
  bindEvents() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggle());
    }
  }
};

// ===== NAVIGATION MANAGEMENT =====
const Navigation = {
  init() {
    this.bindEvents();
    this.handleScroll();
    this.setActiveLink();
  },
  
  bindEvents() {
    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (AppState.isMenuOpen) {
          this.toggleMobileMenu();
        }
      });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));
  },
  
  toggleMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    AppState.setState({ isMenuOpen: !AppState.isMenuOpen });
    
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  },
  
  handleScroll() {
    const header = document.getElementById('header');
    if (header) {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  },
  
  setActiveLink() {
    const navLinks = document.querySelectorAll('.nav__link');
    const currentPage = AppState.currentPage;
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  }
};

// ===== SEARCH FUNCTIONALITY =====
const SearchManager = {
  init() {
    this.bindEvents();
    this.loadSearchData();
  },
  
  searchData: [],
  
  async loadSearchData() {
    // Simulate loading search data (in a real app, this would be an API call)
    this.searchData = [
      {
        title: "Thirst in Habib Al-Harsh Village",
        type: "report",
        url: "#",
        excerpt: "A humanitarian report from Habib Al-Harsh village in Al-Wadiah district, Abyan..."
      },
      {
        title: "Water Crisis Documentation",
        type: "project",
        url: "#",
        excerpt: "Investigating and documenting water scarcity issues in rural Yemen communities..."
      },
      {
        title: "Religious Freedom & Choice",
        type: "project",
        url: "#",
        excerpt: "Research and advocacy for religious freedom and the right to choice..."
      },
      {
        title: "Cultural Heritage Preservation",
        type: "project",
        url: "#",
        excerpt: "Documenting and preserving Yemeni cultural heritage..."
      }
    ];
  },
  
  bindEvents() {
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.openSearch());
    }
    
    if (searchClose) {
      searchClose.addEventListener('click', () => this.closeSearch());
    }
    
    if (searchModal) {
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
          this.closeSearch();
        }
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.performSearch(e.target.value);
      }, 300));
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.isSearchOpen) {
        this.closeSearch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }
    });
  },
  
  openSearch() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    
    if (searchModal && searchInput) {
      AppState.setState({ isSearchOpen: true });
      searchModal.classList.add('active');
      searchInput.focus();
    }
  },
  
  closeSearch() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    
    if (searchModal && searchInput) {
      AppState.setState({ isSearchOpen: false });
      searchModal.classList.remove('active');
      searchInput.value = '';
      this.clearSearchResults();
    }
  },
  
  performSearch(query) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }
    
    const results = this.searchData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(query.toLowerCase())
    );
    
    AppState.setState({ searchResults: results });
    this.displaySearchResults(results);
  },
  
  displaySearchResults(results) {
    // In a real implementation, you would display results below the search input
    console.log('Search results:', results);
  },
  
  clearSearchResults() {
    AppState.setState({ searchResults: [] });
  }
};

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const AnimationManager = {
  init() {
    this.setupIntersectionObserver();
    this.animateStatistics();
  },
  
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements with data-aos attribute
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => {
      observer.observe(el);
    });
  },
  
  animateStatistics() {
    const statNumbers = document.querySelectorAll('.stat-card__number');
    
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.target);
          Utils.animateNumber(entry.target, target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
      statsObserver.observe(stat);
    });
  }
};

// ===== FORM HANDLING =====
const FormManager = {
  init() {
    this.bindEvents();
  },
  
  bindEvents() {
    // Newsletter form
    const newsletterForm = document.querySelector('.footer__newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
    }
    
    // Contact form (if exists on contact page)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }
  },
  
  handleNewsletterSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    
    if (this.validateEmail(email)) {
      // Simulate API call
      this.simulateAPICall('newsletter', { email })
        .then(() => {
          Utils.showToast('Successfully subscribed to newsletter!', 'success');
          e.target.reset();
        })
        .catch(() => {
          Utils.showToast('Failed to subscribe. Please try again.', 'error');
        });
    } else {
      Utils.showToast('Please enter a valid email address.', 'error');
    }
  },
  
  handleContactSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (this.validateContactForm(data)) {
      this.simulateAPICall('contact', data)
        .then(() => {
          Utils.showToast('Message sent successfully!', 'success');
          e.target.reset();
        })
        .catch(() => {
          Utils.showToast('Failed to send message. Please try again.', 'error');
        });
    }
  },
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validateContactForm(data) {
    const required = ['name', 'email', 'subject', 'message'];
    const missing = required.filter(field => !data[field] || !data[field].trim());
    
    if (missing.length > 0) {
      Utils.showToast(`Please fill in: ${missing.join(', ')}`, 'error');
      return false;
    }
    
    if (!this.validateEmail(data.email)) {
      Utils.showToast('Please enter a valid email address.', 'error');
      return false;
    }
    
    return true;
  },
  
  // Simulate API calls with promises
  simulateAPICall(endpoint, data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          console.log(`API call to ${endpoint}:`, data);
          resolve({ success: true });
        } else {
          reject(new Error('API call failed'));
        }
      }, 1000);
    });
  }
};

// ===== DATA MANAGEMENT =====
const DataManager = {
  init() {
    this.loadData();
    this.setupLocalStorage();
  },
  
  async loadData() {
    try {
      // Simulate loading data from JSONPlaceholder or similar API
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6');
      const posts = await response.json();
      
      // Transform data for our use case
      const transformedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.body.substring(0, 150) + '...',
        category: 'Article',
        date: new Date().toLocaleDateString(),
        author: 'EOHM Team'
      }));
      
      this.storeData('recentPosts', transformedPosts);
      this.updateRecentPosts(transformedPosts);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      Utils.showToast('Failed to load recent content', 'error');
    }
  },
  
  storeData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  },
  
  getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },
  
  updateRecentPosts(posts) {
    // This would update the recent posts section if we had dynamic content
    console.log('Recent posts loaded:', posts);
  },
  
  setupLocalStorage() {
    // Store user preferences
    const preferences = this.getData('userPreferences') || {
      theme: 'light',
      language: 'en',
      notifications: true
    };
    
    this.storeData('userPreferences', preferences);
  }
};

// ===== PROJECT FILTERING =====
const ProjectFilter = {
  init() {
    this.bindEvents();
    this.projects = this.loadProjects();
  },
  
  projects: [],
  currentFilter: 'all',
  
  loadProjects() {
    // In a real app, this would come from an API
    return [
      {
        id: 1,
        title: "Water Crisis Documentation",
        category: "humanitarian",
        status: "active",
        year: 2025,
        description: "Investigating and documenting water scarcity issues in rural Yemen communities."
      },
      {
        id: 2,
        title: "Religious Freedom & Choice",
        category: "rights",
        status: "ongoing",
        year: 2024,
        description: "Research and advocacy for religious freedom and the right to choice."
      },
      {
        id: 3,
        title: "Cultural Heritage Preservation",
        category: "culture",
        status: "featured",
        year: 2023,
        description: "Documenting and preserving Yemeni cultural heritage."
      }
    ];
  },
  
  bindEvents() {
    // Filter buttons (if they exist on projects page)
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.applyFilter(filter);
      });
    });
    
    // Search within projects
    const projectSearch = document.getElementById('project-search');
    if (projectSearch) {
      projectSearch.addEventListener('input', Utils.debounce((e) => {
        this.searchProjects(e.target.value);
      }, 300));
    }
  },
  
  applyFilter(filter) {
    this.currentFilter = filter;
    const filteredProjects = filter === 'all' 
      ? this.projects 
      : this.projects.filter(project => project.category === filter);
    
    this.renderProjects(filteredProjects);
    this.updateFilterButtons(filter);
  },
  
  searchProjects(query) {
    const filtered = this.projects.filter(project =>
      project.title.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase())
    );
    
    this.renderProjects(filtered);
  },
  
  renderProjects(projects) {
    const container = document.querySelector('.projects-grid');
    if (!container) return;
    
    // Use DocumentFragment for efficient DOM updates
    const fragment = document.createDocumentFragment();
    
    projects.forEach(project => {
      const projectElement = this.createProjectCard(project);
      fragment.appendChild(projectElement);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
  },
  
  createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-card__image">
        <img src="images/project-${project.id}.jpg" alt="${project.title}" loading="lazy">
        <div class="project-card__badge">${project.status}</div>
      </div>
      <div class="project-card__content">
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__description">${project.description}</p>
        <div class="project-card__meta">
          <span class="project-card__category">${project.category}</span>
          <span class="project-card__date">${project.year}</span>
        </div>
      </div>
    `;
    
    return card;
  },
  
  updateFilterButtons(activeFilter) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === activeFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
};

// ===== CLIENT-SIDE ROUTING =====
const Router = {
  init() {
    this.bindEvents();
    this.handleRoute();
  },
  
  bindEvents() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="/"], a[href$=".html"]')) {
        const href = e.target.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          e.preventDefault();
          this.navigateTo(href);
        }
      }
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  },
  
  navigateTo(path) {
    history.pushState(null, null, path);
    this.handleRoute();
  },
  
  handleRoute() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    AppState.setState({ currentPage: page });
    
    // Update active navigation link
    Navigation.setActiveLink();
    
    // Page-specific initialization
    this.initializePage(page);
  },
  
  initializePage(page) {
    switch (page) {
      case 'index.html':
      case '':
        this.initHomePage();
        break;
      case 'projects.html':
        this.initProjectsPage();
        break;
      case 'contact.html':
        this.initContactPage();
        break;
      default:
        break;
    }
  },
  
  initHomePage() {
    // Home page specific initialization
    AnimationManager.init();
  },
  
  initProjectsPage() {
    // Projects page specific initialization
    ProjectFilter.init();
  },
  
  initContactPage() {
    // Contact page specific initialization
    this.initMap();
  },
  
  initMap() {
    // Initialize Leaflet map for contact page
    const mapContainer = document.getElementById('contact-map');
    if (mapContainer && typeof L !== 'undefined') {
      const map = L.map('contact-map').setView([15.3694, 44.1910], 10); // Sana'a coordinates
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      L.marker([15.3694, 44.1910])
        .addTo(map)
        .bindPopup('EOHM Office<br>Sana\'a, Yemen')
        .openPopup();
    }
  }
};

// ===== PERFORMANCE MONITORING =====
const PerformanceMonitor = {
  init() {
    this.measurePageLoad();
    this.setupErrorHandling();
  },
  
  measurePageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      
      console.log(`Page load time: ${loadTime}ms`);
      
      // Store performance data
      DataManager.storeData('performanceMetrics', {
        loadTime,
        timestamp: Date.now(),
        page: AppState.currentPage
      });
    });
  },
  
  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('JavaScript error:', e.error);
      
      // In a real app, you might send this to an error tracking service
      DataManager.storeData('lastError', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });
  }
};

// ===== MAIN APPLICATION INITIALIZATION =====
class EOHMApp {
  constructor() {
    this.modules = [
      ThemeManager,
      Navigation,
      SearchManager,
      FormManager,
      DataManager,
      Router,
      PerformanceMonitor
    ];
  }
  
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // Initialize all modules
      this.modules.forEach(module => {
        if (module.init) {
          module.init();
        }
      });
      
      // Set up global event listeners
      this.setupGlobalEvents();
      
      console.log('EOHM Website initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize EOHM Website:', error);
      Utils.showToast('Failed to initialize website features', 'error');
    }
  }
  
  setupGlobalEvents() {
    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          DOM.scrollToElement(targetElement, 80);
        }
      }
    });
    
    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      // Skip to main content
      if (e.key === 'Tab' && e.target === document.body) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.focus();
        }
      }
    });
  }
}

// ===== INITIALIZE APPLICATION =====
const app = new EOHMApp();
app.init();

// ===== EXPORT FOR TESTING (if needed) =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppState,
    Utils,
    ThemeManager,
    Navigation,
    SearchManager,
    FormManager,
    DataManager,
    ProjectFilter,
    Router,
    EOHMApp
  };
}

