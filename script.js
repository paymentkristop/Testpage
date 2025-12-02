/**
 * ==========================================================================================
 * LSS NEXUS ENTERPRISE CORE v9.0
 * PROPRIETARY LOGISTICS OPERATIONS SYSTEM
 * * DEVELOPED BY: RLC DEVELOPMENT WING
 * ARCHITECT: SGT K. KIRBY
 * ==========================================================================================
 * * TABLE OF CONTENTS:
 * 1.0  CONFIGURATION
 * 2.0  DATABASE SEEDING (CONTENT REPOSITORY)
 * 2.1 User Registry
 * 2.2 Learning Modules (The Curriculum)
 * 2.3 Achievement Badges
 * 3.0  STATE MANAGEMENT (LOCAL STORAGE INTERFACE)
 * 4.0  CORE CONTROLLER (APP LIFECYCLE)
 * 5.0  AUTHENTICATION MODULE
 * 6.0  ROUTING ENGINE
 * 7.0  GAMIFICATION SYSTEM
 * 8.0  MODULE RENDERER & TASK ENGINE
 * 9.0  ADMINISTRATION CONSOLE
 * 10.0 COMMAND PALETTE & SEARCH
 * 11.0 UI UTILITIES
 * ==========================================================================================
 */

/* ==========================================================================================
   1.0 CONFIGURATION
   ========================================================================================== */
const CONFIG = {
    appVersion: '9.0.21',
    storageKeys: {
        users: 'nexus_users_v9',
        currentUser: 'nexus_session_v9',
        settings: 'nexus_settings_v9',
        logs: 'nexus_logs_v9'
    },
    gameSettings: {
        xpBase: 100, // Base XP for simple tasks
        xpMultiplier: 1.5, // Multiplier for advanced modules
        levelThreshold: 1000, // XP needed per level
        maxLevel: 50
    },
    ui: {
        animationSpeed: 300,
        toastDuration: 4000
    }
};

/* ==========================================================================================
   3.0 STATE MANAGEMENT (LOCAL STORAGE INTERFACE)
   ========================================================================================== */
class Store {
    constructor() {
        this.init();
		this.users = [];
        this.modules = {};
        this.badges = {};
        this.currentUser = null;
    }

    init() {
        if (!localStorage.getItem(CONFIG.storageKeys.users)) {
            console.log(">> INIT: Seeding User Database...");
            localStorage.setItem(CONFIG.storageKeys.users, JSON.stringify(SEED_USERS));
        }
        if (!localStorage.getItem(CONFIG.storageKeys.logs)) {
            localStorage.setItem(CONFIG.storageKeys.logs, JSON.stringify([]));
        }
        this.checkSession();
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(CONFIG.storageKeys.users));
    }

    saveUsers(users) {
        localStorage.setItem(CONFIG.storageKeys.users, JSON.stringify(users));
    }

    getUser(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id || u.name === id); // Search by ID or Name
    }

    checkSession() {
        const session = sessionStorage.getItem(CONFIG.storageKeys.currentUser);
        if (session) {
            this.currentUser = JSON.parse(session);
        } else {
            this.currentUser = null;
        }
    }

    setSession(user) {
        sessionStorage.setItem(CONFIG.storageKeys.currentUser, JSON.stringify(user));
        this.currentUser = user;
    }

    clearSession() {
        sessionStorage.removeItem(CONFIG.storageKeys.currentUser);
        this.currentUser = null;
    }

    addLog(action, details) {
        const logs = JSON.parse(localStorage.getItem(CONFIG.storageKeys.logs));
        const entry = {
            timestamp: new Date().toLocaleString(),
            user: this.currentUser ? this.currentUser.name : 'SYSTEM',
            action: action,
            details: details
        };
        logs.unshift(entry); // Add to top
        if (logs.length > 100) logs.pop(); // Keep last 100
        localStorage.setItem(CONFIG.storageKeys.logs, JSON.stringify(logs));
    }

    getLogs() {
        return JSON.parse(localStorage.getItem(CONFIG.storageKeys.logs));
    }
}

/* ==========================================================================================
   4.0 CORE CONTROLLER (APP LIFECYCLE)
   ========================================================================================== */
class NexusCore {
    constructor() {
        this.store = new Store();
        
        // Sub-Controllers
        this.auth = new AuthManager(this);
        this.router = new Router(this);
        this.ui = new UIManager(this);
        this.game = new GamificationEngine(this);
        this.task = new TaskEngine(this);
        this.admin = new AdminController(this);
        this.cmd = new CommandPalette(this);

        this.init();
    }

    init() {
        // Boot Sequence Simulation
        setTimeout(() => {
            const bootLayer = document.getElementById('sys-boot-layer');
            const bootBar = document.getElementById('boot-bar');
            
            // Animate bar
            bootBar.style.width = '100%';
            
            setTimeout(() => {
                bootLayer.style.opacity = '0';
                setTimeout(() => bootLayer.remove(), 800);
                
                // Check Auth State
                if (this.store.currentUser) {
                    this.router.loadView('view-app');
                    this.onAppLoad();
                } else {
                    this.router.loadView('view-auth');
                }
            }, 1500);
        }, 500);
    }

    onAppLoad() {
        this.ui.updateHUD();
        this.ui.renderDashboard();
        this.ui.renderModuleGrid();
        
        // Admin check
        if (this.store.currentUser.role === 'Admin') {
            document.getElementById('admin-nav-section').style.display = 'block';
        }
    }
}

/* ==========================================================================================
   5.0 AUTHENTICATION MODULE
   ========================================================================================== */
class AuthManager {
    constructor(core) {
        this.core = core;
    }

    login() {
        const idInput = document.getElementById('login-user').value;
        const passInput = document.getElementById('login-pass').value;
        
        const user = this.core.store.getUser(idInput); // Can simulate by ID or Username

        if (user) {
            if (user.status === 'Locked') {
                alert("ACCOUNT LOCKED. Contact Administration.");
                return;
            }
            if (user.password === passInput) {
                // Success
                this.core.store.setSession(user);
                this.core.store.addLog('LOGIN', 'User authenticated successfully');
                
                // Transition
                this.core.router.loadView('view-app');
                this.core.onAppLoad();
                
                // Welcome Toast
                this.core.game.showToast(`Welcome back, ${user.name}`, 'info');
                
                // First Login Badge Check
                if (!user.badges.includes('first_login')) {
                    this.core.game.awardBadge('first_login');
                }
            } else {
                this.shakeForm();
                alert("INVALID CREDENTIALS");
            }
        } else {
            this.shakeForm();
            alert("USER NOT FOUND");
        }
    }

    logout() {
        this.core.store.addLog('LOGOUT', 'User session ended');
        this.core.store.clearSession();
        location.reload(); // Hard reset
    }

    toggleRegister() {
        // Simple mock implementation
        const id = prompt("Enter new Service Number:");
        if(!id) return;
        const name = prompt("Enter Rank and Name:");
        
        const newUser = {
            id: id,
            name: name,
            initials: name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(),
            role: 'Student',
            status: 'Active',
            xp: 0,
            level: 0,
            badges: [],
            completedModules: [],
            password: 'user', // Default
            lastLogin: 'Never'
        };
        
        const users = this.core.store.getUsers();
        users.push(newUser);
        this.core.store.saveUsers(users);
        alert(`Account Created.\nID: ${id}\nPass: user`);
    }

    shakeForm() {
        const form = document.querySelector('.auth-card');
        form.style.animation = 'none';
        form.offsetHeight; /* Trigger reflow */
        form.style.animation = 'shake 0.5s';
    }
}

/* ==========================================================================================
   6.0 ROUTING ENGINE
   ========================================================================================== */
class Router {
    constructor(core) {
        this.core = core;
        this.currentView = null;
    }

    loadView(viewId) {
        // Hide all top-level views (Auth / App)
        document.querySelectorAll('body > section, body > div[id^="view-"]').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show target
        const target = document.getElementById(viewId);
        if (target) {
            target.style.display = viewId === 'view-auth' ? 'flex' : 'grid';
            
            // If loading app, default to dashboard sub-view
            if (viewId === 'view-app') {
                this.navigate('dashboard');
            }
        }
    }

    navigate(pageId) {
        // Handle Sidebar Highlights
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[onclick*="${pageId}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Hide all page views
        document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Update Breadcrumbs
            const breadcrumb = document.getElementById('page-title');
            breadcrumb.innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);
            
            // Specific Load Actions
            if (pageId === 'admin') this.core.admin.renderUsers();
            if (pageId === 'dashboard') this.core.ui.renderDashboard();
            if (pageId === 'profile') this.core.ui.renderProfile();
        }
    }
}

/* ==========================================================================================
   7.0 GAMIFICATION SYSTEM
   ========================================================================================== */
class GamificationEngine {
    constructor(core) {
        this.core = core;
    }

    awardXP(amount) {
        const user = this.core.store.currentUser;
        const oldLevel = user.level;
        
        user.xp += amount;
        
        // Level Calc (Simple linear: 1000xp per level)
        const newLevel = Math.floor(user.xp / CONFIG.gameSettings.levelThreshold);
        
        // Save
        this.updateUserRecord(user);
        this.core.ui.updateHUD(); // Refresh UI
        
        // Notifications
        this.showToast(`+${amount} XP Gained`, 'success');
        
        if (newLevel > oldLevel) {
            user.level = newLevel;
            this.updateUserRecord(user);
            this.showLevelUpModal(newLevel);
        }
    }

    awardBadge(badgeId) {
        const user = this.core.store.currentUser;
        if (!user.badges.includes(badgeId)) {
            user.badges.push(badgeId);
            this.updateUserRecord(user);
            const badge = SEED_BADGES[badgeId];
            this.showToast(`Badge Unlocked: ${badge.name}`, 'gold');
        }
    }

    updateUserRecord(updatedUser) {
        // Update Session
        this.core.store.setSession(updatedUser);
        
        // Update Database
        const users = this.core.store.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            this.core.store.saveUsers(users);
        }
    }

    showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        if (type === 'success') icon = '<svg class="icon"><use href="#icon-check"></use></svg>';
        if (type === 'gold') icon = '<svg class="icon"><use href="#icon-award"></use></svg>';
        
        toast.innerHTML = `${icon} <span>${msg}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => toast.remove(), 500);
        }, CONFIG.ui.toastDuration);
    }

    showLevelUpModal(level) {
        document.getElementById('lvl-up-num').innerText = level;
        document.getElementById('modal-levelup').classList.add('active');
        // Confetti effect logic could go here
    }
}

/* ==========================================================================================
   8.0 MODULE RENDERER & TASK ENGINE
   ========================================================================================== */
class TaskEngine {
    constructor(core) {
        this.core = core;
        this.activeModule = null;
        this.currentStep = 0;
    }

    start(moduleId) {
        const module = SEED_MODULES[moduleId];
        if (!module) return alert("Module Data Missing");

        this.activeModule = module;
        this.currentStep = 0;
        
        // Render Task Runner UI
        document.getElementById('run-task-id').innerText = module.id.toUpperCase();
        document.getElementById('run-task-title').innerText = module.title;
        document.getElementById('run-task-xp').innerText = module.xpReward;
        
        this.renderStep();
        this.renderTOC();
        
        // Navigate
        this.core.router.navigate('task');
    }

    renderStep() {
        const step = this.activeModule.steps[this.currentStep];
        const total = this.activeModule.steps.length;
        const container = document.getElementById('run-task-body');
        
        // Build HTML
        let html = `
            <div class="task-step-content fade-in">
                <div class="step-header">
                    <span class="step-badge">Step ${this.currentStep + 1} of ${total}</span>
                    <h3>${step.title}</h3>
                </div>
                <div class="step-text">${step.content}</div>
        `;
        
        if (step.tip) {
            html += `
                <div class="step-tip">
                    <svg class="icon"><use href="#icon-bell"></use></svg>
                    <div><strong>PRO TIP:</strong> ${step.tip}</div>
                </div>
            `;
        }
        
        html += `</div>`;
        container.innerHTML = html;

        // Update Progress Bar
        const pct = ((this.currentStep) / (total - 1)) * 100;
        document.getElementById('run-prog-bar').style.width = (this.currentStep === 0 ? 5 : pct) + '%';

        // Button States
const btnFinish = document.getElementById('btn-finish-task');
if (this.currentStep === total - 1) {
    btnFinish.classList.remove('hidden');
} else {
    btnFinish.classList.add('hidden');
}
    }

    renderTOC() {
        const list = document.getElementById('run-task-steps-list');
        list.innerHTML = this.activeModule.steps.map((s, i) => `
            <li class="${i === this.currentStep ? 'active' : ''}" onclick="Nexus.task.jumpTo(${i})">
                <span class="toc-num">${i+1}</span>
                <span class="toc-title">${s.title}</span>
            </li>
        `).join('');
    }

    nextStep() {
        if (this.currentStep < this.activeModule.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
            this.renderTOC();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
            this.renderTOC();
        }
    }

    jumpTo(index) {
        this.currentStep = index;
        this.renderStep();
        this.renderTOC();
    }

    complete() {
        const user = this.core.store.currentUser;
        
        if (user.completedModules.includes(this.activeModule.id)) {
            this.core.game.showToast("Module already completed. No XP awarded.", "warning");
        } else {
            // New Completion
            user.completedModules.push(this.activeModule.id);
            this.core.game.awardXP(this.activeModule.xpReward);
            
            // Check for specific badges
            if (this.activeModule.category === 'Receipts' && user.completedModules.includes('mjdi_01')) {
                this.core.game.awardBadge('core_cert');
            }
        }
        
        // Return to Hub
        this.core.router.navigate('modules');
    }
}

/* ==========================================================================================
   9.0 ADMINISTRATION CONSOLE
   ========================================================================================== */
class AdminController {
    constructor(core) {
        this.core = core;
    }

    // Tab Switching Logic
    tab(tabName) {
        document.querySelectorAll('.adm-tab-view').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.adm-tab').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`adm-view-${tabName}`).classList.add('active');
        // Find the button that called this and activate it (passed via event usually, simplified here)
    }

    // User Table
    renderUsers() {
        const users = this.core.store.getUsers();
        const tbody = document.getElementById('admin-user-table').querySelector('tbody');
        
        tbody.innerHTML = users.map(u => `
            <tr>
                <td style="font-family:var(--font-mono)">${u.id}</td>
                <td>
                    <div class="user-cell">
                        <div class="avatar-small">${u.initials}</div>
                        <div>${u.name}</div>
                    </div>
                </td>
                <td><span class="role-badge ${u.role.toLowerCase()}">${u.role}</span></td>
                <td>${u.xp}</td>
                <td><span class="status-badge ${u.status.toLowerCase()}">${u.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="Nexus.admin.editUser('${u.id}')">
                        <svg class="icon"><use href="#icon-settings"></use></svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Modal Logic
    openUserModal() {
        document.getElementById('modal-user-edit').classList.add('active');
        document.getElementById('adm-user-form').reset();
        document.getElementById('modal-user-title').innerText = "Add New User";
        document.getElementById('adm-edit-id').value = ""; // Empty for new
    }

    editUser(id) {
        const user = this.core.store.getUser(id);
        if (!user) return;
        
        document.getElementById('modal-user-edit').classList.add('active');
        document.getElementById('modal-user-title').innerText = `Edit: ${user.name}`;
        
        document.getElementById('adm-edit-id').value = user.id;
        document.getElementById('adm-edit-name').value = user.name;
        document.getElementById('adm-edit-role').value = user.role;
        document.getElementById('adm-edit-xp').value = user.xp;
        document.getElementById('adm-edit-status').value = user.status;
    }

    saveUser() {
        const id = document.getElementById('adm-edit-id').value;
        const name = document.getElementById('adm-edit-name').value;
        const role = document.getElementById('adm-edit-role').value;
        const xp = parseInt(document.getElementById('adm-edit-xp').value) || 0;
        const status = document.getElementById('adm-edit-status').value;
        
        const users = this.core.store.getUsers();
        
        if (id) {
            // Update
            const idx = users.findIndex(u => u.id === id);
if (idx !== -1) {
    users[idx] = { 
        ...users[idx],
        name,
        role,
        xp,
        status
    };
}
        } else {
            // Create
            const newId = Math.floor(30000000 + Math.random() * 900000).toString();
            users.push({
                id: newId,
                name, role, status, xp,
                level: Math.floor(xp / 1000),
                badges: [],
                completedModules: [],
                password: 'user',
                initials: name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0,2)
    .toUpperCase(),
                lastLogin: 'Never'
            });
        }
        
        this.core.store.saveUsers(users);
        this.core.ui.closeModal('modal-user-edit');
        this.renderUsers();
        this.core.game.showToast('User Database Updated', 'success');
    }

    resetDB() {
        if(confirm("CRITICAL WARNING: This will wipe all user progress and reset to factory defaults. Proceed?")) {
            localStorage.clear();
            location.reload();
        }
    }
}

/* ==========================================================================================
   10.0 COMMAND PALETTE & SEARCH
   ========================================================================================== */
class CommandPalette {
    constructor(core) {
        this.core = core;
        this.overlay = document.getElementById('modal-cmd');
        this.input = document.getElementById('cmd-input');
        this.results = document.getElementById('cmd-results');
        
        // Search Data Source
        this.index = [
            { t: 'Receipts Guide', d: 'View U010 Module', fn: () => this.core.router.navigate('modules') },
            { t: 'Dashboard', d: 'Go Home', fn: () => this.core.router.navigate('dashboard') },
            { t: 'Profile', d: 'View My Stats', fn: () => this.core.router.navigate('profile') },
            { t: 'Log Out', d: 'Exit System', fn: () => this.core.auth.logout() },
            { t: 'Admin', d: 'System Configuration', fn: () => this.core.router.navigate('admin') },
            { t: 'Issues', d: 'View AinU Module', fn: () => this.core.router.navigate('modules') }
        ];

        this.input.addEventListener('input', (e) => this.search(e.target.value));
    }

    open() {
        this.overlay.classList.add('active');
        this.input.value = '';
        this.input.focus();
        this.search('');
    }

    close() {
        this.overlay.classList.remove('active');
    }

    search(query) {
        const q = query.toLowerCase();
        const matches = this.index.filter(i => i.t.toLowerCase().includes(q) || i.d.toLowerCase().includes(q));
        
        this.results.innerHTML = matches.map(m => `
            <div class="cmd-item">
                <div class="cmd-text">
                    <div class="cmd-main">${m.t}</div>
                    <div class="cmd-sub">${m.d}</div>
                </div>
                <div class="cmd-hint">↵</div>
            </div>
        `).join('');
        
        // Add click listeners
        const items = this.results.querySelectorAll('.cmd-item');
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                matches[index].fn();
                this.close();
            });
        });
    }
}

/* ==========================================================================================
   11.0 UI UTILITIES
   ========================================================================================== */
class UIManager {
    constructor(core) {
        this.core = core;
    }

toggleSidebar() {
    document.getElementById('main-sidebar').classList.toggle('open');
}

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('nexus_theme', next);
    }

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    updateHUD() {
        const u = this.core.store.currentUser;
        if (!u) return;

        // Sidebar HUD
        document.getElementById('hud-name').innerText = u.name;
        document.getElementById('hud-initials').innerText = u.initials;
        document.getElementById('hud-level').innerText = u.level;
        document.getElementById('hud-xp-text').innerText = `${u.xp} / ${CONFIG.gameSettings.levelThreshold * (u.level + 1)}`;
        
        const xpPct = (u.xp % CONFIG.gameSettings.levelThreshold) / 10;
        document.getElementById('hud-xp-bar').style.width = `${xpPct}%`;
        
        // Sidebar Role
        document.getElementById('sidebar-role-display').innerText = u.role;
    }

    renderDashboard() {
        const u = this.core.store.currentUser;
        document.getElementById('dash-user-name').innerText = u.name;
        
        // Compliance Math
        const totalModules = Object.keys(SEED_MODULES).length;
        const done = u.completedModules.length;
        const pct = Math.floor((done / totalModules) * 100);
        
        document.getElementById('dash-compliance').innerText = `${pct}%`;
        document.getElementById('completion-text').innerText = `${pct}%`;
        document.getElementById('completion-chart').style.setProperty('--p', pct);
        
        // Stats
        document.getElementById('stat-modules-count').innerText = totalModules;
        document.getElementById('stat-xp-count').innerText = u.xp;
        document.getElementById('stat-completed-count').innerText = done;
        
        // Populate Task List
        const list = document.getElementById('dashboard-task-list');
        list.innerHTML = '';
        
        let pendingCount = 0;
        
        for (const [key, mod] of Object.entries(SEED_MODULES)) {
            const isDone = u.completedModules.includes(key);
            if (!isDone && pendingCount < 3) {
                pendingCount++;
                list.innerHTML += `
                    <div class="task-card" onclick="Nexus.task.start('${key}')">
                        <div class="task-info">
                            <h4>${mod.title}</h4>
                            <div class="task-tags">
                                <span>${mod.category}</span>
                                <span class="tag-xp">+${mod.xpReward} XP</span>
                            </div>
                        </div>
                        <button class="btn-icon"><svg class="icon"><use href="#icon-play"></use></svg></button>
                    </div>
                `;
            }
        }
        
        if (pendingCount === 0) {
            list.innerHTML = '<div class="empty-state">All recommended training completed!</div>';
        }
        
        document.getElementById('pending-tasks-count').innerText = totalModules - done;
    }

    renderModuleGrid() {
        const container = document.getElementById('modules-grid');
        container.innerHTML = '';
        
        for (const [key, mod] of Object.entries(SEED_MODULES)) {
            const isDone = this.core.store.currentUser.completedModules.includes(key);
            
            container.innerHTML += `
                <div class="module-card ${isDone ? 'completed' : ''}">
                    <div class="card-thumb" style="background: linear-gradient(45deg, #1e293b, #0f172a);">
                        <span class="card-badge">${mod.difficulty}</span>
                        ${isDone ? '<div class="completed-overlay"><svg class="icon"><use href="#icon-check"></use></svg></div>' : ''}
                    </div>
                    <div class="card-body">
                        <h3>${mod.title}</h3>
                        <p>${mod.description}</p>
                        <div class="card-meta">
                            <span><svg class="icon"><use href="#icon-award"></use></svg> ${mod.xpReward} XP</span>
                            <span><svg class="icon"><use href="#icon-book"></use></svg> ${mod.steps.length} Steps</span>
                        </div>
                        <button class="btn btn-brand full" onclick="Nexus.task.start('${key}')">
                            ${isDone ? 'Review Module' : 'Start Module'}
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    renderProfile() {
        // Implementation for profile view would go here similar to dashboard
        // Populating badge grid, history list, etc.
    }
}

/* ==========================================================================================
   INITIALIZATION
   ========================================================================================== */
// Initialize the Nexus System globally
window.Nexus = new NexusCore();