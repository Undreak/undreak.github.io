// Projects Page - Full project listing with filters and search

class AllProjectsManager {
    constructor() {
        this.githubUsername = 'Undreak';
        this.gitlabUsername = 'Undreak';
        this.API_TIMEOUT = 10000; // 10 seconds

        this.grid = document.getElementById('projects-grid');
        this.loading = document.getElementById('loading');
        this.emptyState = document.getElementById('empty-state');
        this.stats = document.getElementById('stats');
        this.searchInput = document.getElementById('search-input');
        this.sortSelect = document.getElementById('sort-select');
        this.languageFilter = document.getElementById('language-filter');
        this.sourceButtons = document.querySelectorAll('[data-source]');

        this.allProjects = [];
        this.filteredProjects = [];
        this.currentFilters = {
            source: 'all',
            language: 'all',
            search: '',
            sort: 'updated'
        };

        this.init();
    }

    /**
     * Get translated message with fallback
     */
    t(key, fallback, replacements = {}) {
        if (window.i18n && window.i18n.t) {
            return window.i18n.t(key, replacements) || fallback;
        }
        // Apply replacements to fallback
        let result = fallback;
        Object.keys(replacements).forEach(placeholder => {
            result = result.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return result;
    }

    // URL validation to prevent open redirect vulnerabilities
    isValidURL(url) {
        if (!url) return null;
        try {
            const parsed = new URL(url);
            // Only allow http/https protocols
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                return null;
            }
            return parsed.href;
        } catch {
            return null;
        }
    }

    // Sanitize text content to prevent XSS
    sanitizeText(text) {
        if (!text) return '';
        // Use DOMPurify if available, otherwise escape HTML
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async init() {
        try {
            await this.fetchAllProjects();
            this.setupEventListeners();
            this.applyFilters();
        } catch (error) {
            console.error('Init error:', error);
            this.showError(error);
        }
    }

    async fetchAllProjects() {
        const [githubProjects, gitlabProjects] = await Promise.allSettled([
            this.fetchAllGitHubRepos(),
            this.fetchAllGitLabProjects()
        ]);

        if (githubProjects.status === 'fulfilled') {
            this.allProjects.push(...githubProjects.value);
        } else {
            console.warn('GitHub fetch failed:', githubProjects.reason);
        }

        if (gitlabProjects.status === 'fulfilled') {
            this.allProjects.push(...gitlabProjects.value);
        } else {
            console.warn('GitLab fetch failed:', gitlabProjects.reason);
        }

        if (this.allProjects.length === 0) {
            throw new Error('No projects found');
        }

        this.populateLanguageFilter();
        this.hideLoading();
    }

    async fetchAllGitHubRepos() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

        try {
            const response = await fetch(
                `https://api.github.com/users/${this.githubUsername}/repos?per_page=100&sort=updated`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (response.status === 403) {
                const resetTime = response.headers.get('X-RateLimit-Reset');
                let message = this.t('projects.error.githubRateLimit', 'GitHub API rate limit exceeded.');
                if (resetTime) {
                    const resetDate = new Date(parseInt(resetTime) * 1000);
                    const minutesUntilReset = Math.ceil((resetDate - new Date()) / 60000);
                    message += ' ' + this.t('projects.error.tryAgainIn', `Try again in ${minutesUntilReset} minute(s).`, { minutes: minutesUntilReset });
                } else {
                    message += ' ' + this.t('projects.error.tryAgainLater', 'Please try again later.');
                }
                throw new Error(message);
            }

            if (!response.ok) {
                throw new Error(this.t('projects.error.githubError', `GitHub API error: ${response.status}`, { status: response.status }));
            }

            const repos = await response.json();

            return repos
                .filter(repo => !repo.fork)
                .filter(repo => !repo.name.includes('.github.io'))
                .map(repo => ({
                    name: repo.name,
                    description: repo.description,
                    html_url: repo.html_url,
                    homepage: repo.homepage,
                    topics: repo.topics || [],
                    language: repo.language,
                    stargazers_count: repo.stargazers_count,
                    updated_at: repo.updated_at,
                    created_at: repo.created_at,
                    source: 'github'
                }));
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(this.t('projects.error.githubTimeout', 'GitHub request timed out. Please check your connection.'));
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async fetchAllGitLabProjects() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

        try {
            const response = await fetch(
                `https://gitlab.com/api/v4/users/${this.gitlabUsername}/projects?per_page=100&order_by=updated_at`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (response.status === 429) {
                throw new Error(this.t('projects.error.gitlabRateLimit', 'GitLab API rate limit exceeded. Please try again later.'));
            }

            if (!response.ok) {
                throw new Error(this.t('projects.error.gitlabError', `GitLab API error: ${response.status}`, { status: response.status }));
            }

            const projects = await response.json();

            return projects
                .filter(project => !project.forked_from_project)
                .map(project => ({
                    name: project.name,
                    description: project.description || null,
                    html_url: project.web_url,
                    homepage: null,
                    topics: project.topics || project.tag_list || [],
                    language: null,
                    stargazers_count: project.star_count || 0,
                    updated_at: project.last_activity_at,
                    created_at: project.created_at,
                    source: 'gitlab'
                }));
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(this.t('projects.error.gitlabTimeout', 'GitLab request timed out. Please check your connection.'));
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    setupEventListeners() {
        // Search with debouncing
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // Sanitize and limit search input
                const sanitized = e.target.value
                    .replace(/[<>]/g, '')
                    .trim()
                    .toLowerCase()
                    .substring(0, 100);
                this.currentFilters.search = sanitized;
                this.applyFilters();
            }, 300);
        });

        // Sort
        this.sortSelect.addEventListener('change', (e) => {
            this.currentFilters.sort = e.target.value;
            this.applyFilters();
        });

        // Language filter
        this.languageFilter.addEventListener('change', (e) => {
            this.currentFilters.language = e.target.value;
            this.applyFilters();
        });

        // Source filter buttons
        this.sourceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sourceButtons.forEach(b => b.classList.remove('is-active'));
                e.target.classList.add('is-active');
                this.currentFilters.source = e.target.dataset.source;
                this.applyFilters();
            });
        });
    }

    populateLanguageFilter() {
        const languages = new Set();
        this.allProjects.forEach(project => {
            if (project.language) {
                languages.add(project.language);
            }
        });

        if (languages.size > 0) {
            const sortedLanguages = Array.from(languages).sort();
            sortedLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = lang;
                this.languageFilter.appendChild(option);
            });
            document.getElementById('language-filter-container').classList.remove('hidden');
        }
    }

    applyFilters() {
        // Start with all projects
        let filtered = [...this.allProjects];

        // Filter by source
        if (this.currentFilters.source !== 'all') {
            filtered = filtered.filter(p => p.source === this.currentFilters.source);
        }

        // Filter by language
        if (this.currentFilters.language !== 'all') {
            filtered = filtered.filter(p => p.language === this.currentFilters.language);
        }

        // Filter by search
        if (this.currentFilters.search) {
            filtered = filtered.filter(p => {
                const searchStr = this.currentFilters.search;
                return (p.name && p.name.toLowerCase().includes(searchStr)) ||
                       (p.description && p.description.toLowerCase().includes(searchStr)) ||
                       (p.topics && p.topics.some(t => t.toLowerCase().includes(searchStr)));
            });
        }

        // Sort
        filtered.sort((a, b) => {
            switch (this.currentFilters.sort) {
                case 'stars':
                    return b.stargazers_count - a.stargazers_count;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'updated':
                default:
                    return new Date(b.updated_at) - new Date(a.updated_at);
            }
        });

        this.filteredProjects = filtered;
        this.displayProjects();
        this.updateStats();
    }

    displayProjects() {
        if (this.filteredProjects.length === 0) {
            this.grid.classList.add('hidden');
            this.emptyState.classList.remove('hidden');
            return;
        }

        this.grid.classList.remove('hidden');
        this.emptyState.classList.add('hidden');

        this.grid.innerHTML = this.filteredProjects.map(project => this.createProjectCard(project)).join('');
    }

    createProjectCard(repo) {
        const topics = repo.topics || [];
        const description = this.sanitizeText(repo.description) || this.t('projects.noDescription', 'No description available');
        const name = this.sanitizeText(repo.name);
        const language = this.sanitizeText(repo.language);
        const sourceIcon = repo.source === 'github' ? this.getGitHubIcon() : this.getGitLabIcon();

        // Validate URLs to prevent XSS and open redirect
        const repoUrl = this.isValidURL(repo.html_url);
        const homepageUrl = this.isValidURL(repo.homepage);

        if (!repoUrl) {
            console.warn('Invalid repository URL:', repo.html_url);
            return '';
        }

        return `
            <article class="project-card" data-project="${name}">
                <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="project-card__link-overlay" aria-label="View ${name}"></a>
                <div class="project-card__header">
                    <h3 class="project-card__title">${name}</h3>
                    <div class="project-card__icons">
                        <span class="project-card__source" title="${repo.source === 'github' ? 'GitHub' : 'GitLab'}">
                            ${sourceIcon}
                        </span>
                        ${homepageUrl ? `
                            <a href="${homepageUrl}"
                               class="project-card__external"
                               target="_blank"
                               rel="noopener noreferrer"
                               aria-label="View ${name} live demo"
                               title="Live demo">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </a>
                        ` : ''}
                    </div>
                </div>
                <p class="project-card__description">${description}</p>
                ${topics.length > 0 ? `
                    <div class="project-card__tags">
                        ${topics.slice(0, 5).map(topic => `<span class="tag">${this.sanitizeText(topic)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="project-card__stats">
                    ${repo.stargazers_count > 0 ? `
                        <span class="stat">
                            <svg viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                            </svg>
                            <span>${repo.stargazers_count}</span>
                        </span>
                    ` : ''}
                    ${language ? `
                        <span class="stat">
                            <svg viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="8" r="3"/>
                            </svg>
                            <span>${language}</span>
                        </span>
                    ` : ''}
                </div>
            </article>
        `;
    }

    updateStats() {
        const github = this.filteredProjects.filter(p => p.source === 'github').length;
        const gitlab = this.filteredProjects.filter(p => p.source === 'gitlab').length;
        const total = this.filteredProjects.length;

        const projectWord = total === 1
            ? this.t('projects.project', 'project')
            : this.t('projects.projectsPlural', 'projects');

        // Build stats safely using DOM methods
        this.stats.textContent = '';

        const totalBadge = document.createElement('span');
        totalBadge.className = 'stat-badge';
        const strong = document.createElement('strong');
        strong.textContent = total;
        totalBadge.appendChild(strong);
        totalBadge.appendChild(document.createTextNode(' ' + projectWord));
        this.stats.appendChild(totalBadge);

        const githubBadge = document.createElement('span');
        githubBadge.className = 'stat-badge stat-badge--github';
        githubBadge.textContent = github + ' GitHub';
        this.stats.appendChild(githubBadge);

        const gitlabBadge = document.createElement('span');
        gitlabBadge.className = 'stat-badge stat-badge--gitlab';
        gitlabBadge.textContent = gitlab + ' GitLab';
        this.stats.appendChild(gitlabBadge);
    }

    getGitHubIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>`;
    }

    getGitLabIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 0 0-.867 0L1.388 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.924.924 0 0 0 .331-1.024"/>
        </svg>`;
    }

    hideLoading() {
        if (this.loading) {
            this.loading.classList.add('hidden');
        }
    }

    showError(error) {
        this.hideLoading();

        // Build error message safely using DOM methods
        this.grid.textContent = '';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';

        const title = document.createElement('h3');
        title.textContent = this.t('projects.error.title', 'Unable to load projects');
        errorDiv.appendChild(title);

        const message = document.createElement('p');
        message.textContent = this.sanitizeText(error.message);
        errorDiv.appendChild(message);

        const linksPara = document.createElement('p');
        linksPara.textContent = this.t('projects.error.visitDirect', 'Visit my GitHub or GitLab directly.').split('GitHub')[0];

        const githubLink = document.createElement('a');
        githubLink.href = `https://github.com/${this.githubUsername}`;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
        githubLink.textContent = 'GitHub';
        linksPara.appendChild(githubLink);

        linksPara.appendChild(document.createTextNode(' or '));

        const gitlabLink = document.createElement('a');
        gitlabLink.href = `https://gitlab.com/${this.gitlabUsername}`;
        gitlabLink.target = '_blank';
        gitlabLink.rel = 'noopener noreferrer';
        gitlabLink.textContent = 'GitLab';
        linksPara.appendChild(gitlabLink);

        linksPara.appendChild(document.createTextNode(' directly.'));
        errorDiv.appendChild(linksPara);

        this.grid.appendChild(errorDiv);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AllProjectsManager();
    });
} else {
    new AllProjectsManager();
}
