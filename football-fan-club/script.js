const API_KEY = '615558005b814a5e9a9cc2552169d2fa';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('recent-matches-list')) {
        fetchRecentAndLiveMatches();
        fetchUpcomingMatches();
        setInterval(fetchRecentAndLiveMatches, 60000);
    }
});

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.toggle('active');
}

function joinClub(event) {
    event.preventDefault();
    const name = document.getElementById('name')?.value || 'Fan';
    const team = document.getElementById('team')?.value || 'your team';
    alert(`Welcome to Football FC, ${name}! 🎉\nYour application has been received.`);
    event.target.reset();
}

document.addEventListener('click', function (event) {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.menu-btn');

    if (navLinks && menuBtn) {
        if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
            navLinks.classList.remove('active');
        }
    }
});

async function fetchRecentAndLiveMatches() {
    const container = document.getElementById('recent-matches-list');
    if (!container) return;

    try {
        const targetUrl = 'https://api.football-data.org/v4/competitions/PL/matches?status=FINISHED,IN_PLAY';
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, {
            headers: { 'X-Auth-Token': API_KEY }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();

        if (!data.matches || data.matches.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No recent matches found.</p>';
            return;
        }

        const matchesToShow = data.matches.slice(-5).reverse();

        container.innerHTML = matchesToShow.map(match => `
            <div class="match-row">
                <div>
                    <small>${match.competition.name}</small>
                    <h3>${match.homeTeam.shortName || match.homeTeam.name}</h3>
                </div>
                <div class="big-score">
                    ${match.status === 'IN_PLAY' || match.status === 'PAUSED' ? '🔴 ' : ''}
                    ${match.score.fullTime.home ?? 0} - ${match.score.fullTime.away ?? 0}
                </div>
                <div>
                    <h3>${match.awayTeam.shortName || match.awayTeam.name}</h3>
                </div>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = '<p style="text-align:center; color: var(--accent-red);">Failed to load live scores.</p>';
    }
}

async function fetchUpcomingMatches() {
    const container = document.getElementById('upcoming-matches-grid');
    if (!container) return;

    try {
        const targetUrl = 'https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED';
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, {
            headers: { 'X-Auth-Token': API_KEY }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();

        if (!data.matches || data.matches.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No upcoming matches scheduled.</p>';
            return;
        }

        const matchesToShow = data.matches.slice(0, 6);

        container.innerHTML = matchesToShow.map(match => {
            const matchDate = new Date(match.utcDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short'
            }).toUpperCase();

            return `
                <div class="match-card upcoming">
                    <span>${matchDate}</span>
                    <h3>${match.homeTeam.shortName || match.homeTeam.name}</h3>
                    <div class="score">VS</div>
                    <h3>${match.awayTeam.shortName || match.awayTeam.name}</h3>
                    <p>${match.competition.name}</p>
                </div>
            `;
        }).join('');

    } catch (error) {
        container.innerHTML = '<p style="text-align:center; color: var(--accent-red);">Failed to load upcoming fixtures.</p>';
    }
}