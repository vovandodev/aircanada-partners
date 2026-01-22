// Air Canada Partners Search Application
class PartnerSearch {
    constructor() {
        this.data = {
            airlines: [],
            retail: [],
            travel: [],
            alliances: []
        };
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateCounts();
        this.renderResults();
    }

    async loadData() {
        try {
            const [airlines, retail, travel, alliances] = await Promise.all([
                fetch('airlines.json').then(r => r.json()),
                fetch('retail.json').then(r => r.json()),
                fetch('travel.json').then(r => r.json()),
                fetch('alliances.json').then(r => r.json())
            ]);

            this.data.airlines = airlines;
            this.data.retail = retail;
            this.data.travel = travel;
            this.data.alliances = alliances;
        } catch (error) {
            console.error('Error loading data:', error);
            document.getElementById('resultsCount').textContent = 'Error loading data. Please refresh the page.';
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearBtn');
        const tabBtns = document.querySelectorAll('.tab-btn');

        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            clearBtn.style.display = this.searchTerm ? 'block' : 'none';
            this.renderResults();
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.searchTerm = '';
            clearBtn.style.display = 'none';
            this.renderResults();
        });

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.renderResults();
            });
        });
    }

    updateCounts() {
        document.getElementById('airlines-count').textContent = this.data.airlines.length;
        document.getElementById('retail-count').textContent = this.data.retail.length;
        document.getElementById('travel-count').textContent = this.data.travel.length;
        document.getElementById('alliances-count').textContent = this.data.alliances.length;
    }

    filterData() {
        let results = [];

        if (this.currentCategory === 'all' || this.currentCategory === 'airlines') {
            const filtered = this.data.airlines.filter(item => 
                !this.searchTerm || 
                item.Airline.toLowerCase().includes(this.searchTerm) ||
                item.Region.toLowerCase().includes(this.searchTerm) ||
                item.Status.toLowerCase().includes(this.searchTerm)
            );
            results.push(...filtered.map(item => ({ ...item, type: 'airline' })));
        }

        if (this.currentCategory === 'all' || this.currentCategory === 'retail') {
            const filtered = this.data.retail.filter(item => 
                !this.searchTerm || 
                item.Company.toLowerCase().includes(this.searchTerm) ||
                item.Description.toLowerCase().includes(this.searchTerm)
            );
            results.push(...filtered.map(item => ({ ...item, type: 'retail' })));
        }

        if (this.currentCategory === 'all' || this.currentCategory === 'travel') {
            const filtered = this.data.travel.filter(item => 
                !this.searchTerm || 
                item.Company.toLowerCase().includes(this.searchTerm) ||
                item.Notes.toLowerCase().includes(this.searchTerm)
            );
            results.push(...filtered.map(item => ({ ...item, type: 'travel' })));
        }

        if (this.currentCategory === 'all' || this.currentCategory === 'alliances') {
            const filtered = this.data.alliances.filter(item => 
                !this.searchTerm || 
                item.Airline.toLowerCase().includes(this.searchTerm) ||
                item.Alliance.toLowerCase().includes(this.searchTerm) ||
                item.Country.toLowerCase().includes(this.searchTerm) ||
                item.Code.toLowerCase().includes(this.searchTerm)
            );
            results.push(...filtered.map(item => ({ ...item, type: 'alliance' })));
        }

        return results;
    }

    highlightText(text, search) {
        if (!search || !text) return text;
        const regex = new RegExp(`(${search})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    renderResults() {
        const results = this.filterData();
        const container = document.getElementById('resultsContainer');
        const totalResults = this.currentCategory === 'all' 
            ? this.data.airlines.length + this.data.retail.length + this.data.travel.length + this.data.alliances.length
            : results.length;

        document.getElementById('resultsCount').textContent = 
            `Showing ${results.length} of ${totalResults} results${this.searchTerm ? ` for "${this.searchTerm}"` : ''}`;

        if (results.length === 0) {
            container.innerHTML = '<div class="no-results">No results found. Try a different search term.</div>';
            return;
        }

        container.innerHTML = results.map(item => this.renderCard(item)).join('');
    }

    renderCard(item) {
        const searchTerm = this.searchTerm;

        switch (item.type) {
            case 'airline':
                return `
                    <div class="card airline-card">
                        <div class="card-header">
                            <span class="badge airline">Airline</span>
                            <span class="region">${this.highlightText(item.Region, searchTerm)}</span>
                        </div>
                        <h3>${this.highlightText(item.Airline, searchTerm)}</h3>
                        <p class="status"><strong>Status:</strong> ${this.highlightText(item.Status, searchTerm)}</p>
                    </div>
                `;

            case 'retail':
                const hasLink = item.eStore && item.eStore !== 'Y' && item.eStore !== 'N' && item.eStore.startsWith('http');
                return `
                    <div class="card retail-card">
                        <div class="card-header">
                            <span class="badge retail">Retail Partner</span>
                            ${hasLink ? '<span class="estore-badge">eStore Available</span>' : ''}
                        </div>
                        <h3>${this.highlightText(item.Company, searchTerm)}</h3>
                        <p class="description">${this.highlightText(item.Description, searchTerm)}</p>
                        ${hasLink ? `<a href="${item.eStore}" target="_blank" rel="noopener noreferrer" class="partner-link">Visit Partner →</a>` : ''}
                    </div>
                `;

            case 'travel':
                return `
                    <div class="card travel-card">
                        <div class="card-header">
                            <span class="badge travel">Travel Service</span>
                        </div>
                        <h3>${this.highlightText(item.Company, searchTerm)}</h3>
                        <p class="notes">${this.highlightText(item.Notes, searchTerm)}</p>
                    </div>
                `;

            case 'alliance':
                return `
                    <div class="card alliance-card">
                        <div class="card-header">
                            <span class="badge alliance">${this.highlightText(item.Alliance, searchTerm)}</span>
                            <span class="code">${this.highlightText(item.Code, searchTerm)}</span>
                        </div>
                        <h3>${this.highlightText(item.Airline, searchTerm)}</h3>
                        <p class="country"><strong>Country:</strong> ${this.highlightText(item.Country, searchTerm)}</p>
                        ${item.Note ? `<p class="note">${this.highlightText(item.Note, searchTerm)}</p>` : ''}
                    </div>
                `;

            default:
                return '';
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PartnerSearch();
});
