// Modern tab-style navigation
class LeaderboardManager {
  constructor() {
    this.currentSection = 'top-players-content';
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupEventListeners();
    this.showSection(this.currentSection);
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.section-button');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const sectionId = e.target.getAttribute('data-section');
        this.switchSection(sectionId);
      });
    });
  }

  switchSection(sectionId) {
    // Update active tab
    document.querySelectorAll('.section-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    // Hide all sections with animation
    const allSections = document.querySelectorAll('#leaderboard-container > div');
    allSections.forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        section.classList.remove('active');
      }, 200);
    });

    // Show selected section with animation
    setTimeout(() => {
      const selectedSection = document.getElementById(sectionId);
      if (selectedSection) {
        selectedSection.classList.add('active');
        setTimeout(() => {
          selectedSection.style.opacity = '1';
          selectedSection.style.transform = 'translateX(0)';
        }, 50);
      }
    }, 250);

    this.currentSection = sectionId;
  }

  showSection(sectionId) {
    // Initial setup without animation
    document.querySelectorAll('.section-button').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === sectionId);
    });
    
    document.querySelectorAll('#leaderboard-container > div').forEach(section => {
      section.classList.toggle('active', section.id === sectionId);
    });
  }

  setupEventListeners() {
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const tabs = Array.from(document.querySelectorAll('.section-button'));
        const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
        
        let newIndex;
        if (e.key === 'ArrowLeft') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        this.switchSection(tabs[newIndex].getAttribute('data-section'));
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new LeaderboardManager();
});

// Expose for backward compatibility
window.changeSection = function(button) {
  const sectionId = button.getAttribute('data-section');
  const manager = new LeaderboardManager();
  manager.switchSection(sectionId);
};