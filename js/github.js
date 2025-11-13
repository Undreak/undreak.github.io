// GitHub & GitLab API Integration

class ProjectsManager {
    constructor() {
        console.log('ProjectsManager: Initializing...');
        this.githubUsername = 'Undreak';
        this.gitlabUsername = 'Undreak';
        this.container = document.getElementById('projects-container');
        this.loading = document.getElementById('projects-loading');

        if (!this.container) {
            console.error('ProjectsManager: Container element not found!');
            return;
        }
        if (!this.loading) {
            console.error('ProjectsManager: Loading element not found!');
            return;
        }

        console.log('ProjectsManager: Elements found, starting init...');
        this.init();
    }

    async init() {
        try {
            const [githubProjects, gitlabProjects] = await Promise.allSettled([
                this.fetchGitHubRepos(),
                this.fetchGitLabProjects()
            ]);

            const allProjects = [];

            if (githubProjects.status === 'fulfilled') {
                console.log('GitHub projects loaded:', githubProjects.value.length);
                allProjects.push(...githubProjects.value);
            } else {
                console.warn('GitHub fetch failed:', githubProjects.reason);
            }

            if (gitlabProjects.status === 'fulfilled') {
                console.log('GitLab projects loaded:', gitlabProjects.value.length);
                allProjects.push(...gitlabProjects.value);
            } else {
                console.warn('GitLab fetch failed:', gitlabProjects.reason);
            }

            console.log('Total projects before filtering:', allProjects.length);

            if (allProjects.length === 0) {
                console.warn('No projects found from either platform');
            }

            // Sort by last updated
            allProjects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

            this.displayProjects(allProjects.slice(0, 6));
            this.hideLoading();
        } catch (error) {
            console.error('Init error:', error);
            this.handleError(error);
        }
    }

    async fetchGitHubRepos() {
        const response = await fetch(`https://api.github.com/users/${this.githubUsername}/repos?sort=updated&per_page=10`);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = await response.json();

        // Filter and normalize GitHub repos
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
                source: 'github'
            }));
    }

    async fetchGitLabProjects() {
        const response = await fetch(`https://gitlab.com/api/v4/users/${this.gitlabUsername}/projects?order_by=updated_at&per_page=10`);

        if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status}`);
        }

        const projects = await response.json();

        // Normalize GitLab projects to match GitHub structure
        return projects
            .filter(project => {
                // GitLab uses 'forked_from_project' instead of 'fork'
                return !project.forked_from_project;
            })
            .map(project => ({
                name: project.name,
                description: project.description || null,
                html_url: project.web_url,
                homepage: null,
                topics: project.topics || project.tag_list || [],
                language: null, // GitLab API requires separate call for languages
                stargazers_count: project.star_count || 0,
                updated_at: project.last_activity_at,
                source: 'gitlab'
            }));
    }

    displayProjects(repos) {
        console.log('Displaying projects:', repos.length);
        if (repos.length === 0) {
            this.container.innerHTML = '<p class="projects__empty">No projects to display yet.</p>';
            return;
        }

        const cardsHTML = repos.map(repo => this.createProjectCard(repo)).join('');
        console.log('Generated HTML length:', cardsHTML.length);
        this.container.innerHTML = cardsHTML;
        console.log('Projects displayed successfully');
    }

    createProjectCard(repo) {
        const topics = repo.topics || [];
        const description = repo.description || 'No description available';
        const sourceIcon = repo.source === 'github' ? this.getGitHubIcon() : this.getGitLabIcon();

        return `
            <article class="project-card" data-project="${repo.name}">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-card__link-overlay" aria-label="View ${repo.name}"></a>
                <div class="project-card__header">
                    <h3 class="project-card__title">${repo.name}</h3>
                    <div class="project-card__icons">
                        <span class="project-card__source" title="${repo.source === 'github' ? 'GitHub' : 'GitLab'}">
                            ${sourceIcon}
                        </span>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}"
                               class="project-card__external"
                               target="_blank"
                               rel="noopener noreferrer"
                               aria-label="View ${repo.name} live demo"
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
                        ${topics.slice(0, 5).map(topic => `<span class="tag">${topic}</span>`).join('')}
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
                    ${repo.language ? `
                        <span class="stat">
                            <svg viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="8" r="3"/>
                            </svg>
                            <span>${repo.language}</span>
                        </span>
                    ` : ''}
                </div>
            </article>
        `;
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

    handleError(error) {
        console.error('Failed to fetch projects:', error);
        this.hideLoading();
        this.container.innerHTML = `
            <div class="projects__error">
                <p>Unable to load projects at the moment. Please visit my <a href="https://github.com/${this.githubUsername}" target="_blank" rel="noopener noreferrer">GitHub</a> or <a href="https://gitlab.com/${this.gitlabUsername}" target="_blank" rel="noopener noreferrer">GitLab</a> profile directly.</p>
            </div>
        `;
    }

    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }
}

// Initialize projects when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProjectsManager();
    });
} else {
    new ProjectsManager();
}
