/**
 * LSS NEXUS CORE CONTROLLER v7.0
 * Copyright 2025 RLC Development Wing
 */

// --- 1. DATA REPOSITORIES (Hardcoded for Demo) ---

const DB_INVENTORY = [
    { nsn: '1005-99-123-4567', desc: 'Rifle, 5.56mm, L85A3', doq: 'EA', loc: 'ARM-01-A', qty: 45, status: 'SVC' },
    { nsn: '5820-99-882-1102', desc: 'Radio, Bowman, PRC 355', doq: 'EA', loc: 'COM-02-B', qty: 12, status: 'R2' },
    { nsn: '2540-99-721-3344', desc: 'Tyre, 11R22.5, Michelin', doq: 'EA', loc: 'MT-05-C', qty: 8, status: 'SVC' },
    { nsn: '8415-99-112-9988', desc: 'Helmet, Virtus, Large', doq: 'EA', loc: 'Q-01-A', qty: 150, status: 'SVC' },
    { nsn: '6625-99-441-2299', desc: 'Multimeter, Fluke', doq: 'EA', loc: 'TE-09-D', qty: 3, status: 'SVC' },
];

const DB_WALKTHROUGHS = {
    'receipts': {
        title: 'MJDI Receipts (U010)',
        steps: [
            {
                title: 'IV Verification',
                desc: 'Locate the Issue Voucher (IV). Confirm the D of Q (Unit of Issue) matches the physical item exactly. Check the Condition Code is A1 (Serviceable).',
                tip: 'If D of Q is "Box of 100", ensure you are not receipting 100 boxes.',
                img: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=STEP+1:+CHECK+IV'
            },
            {
                title: 'Open Transaction Menu',
                desc: 'Click on the "Transactions" tab in the top ribbon. Select "Receipts" from the dropdown list.',
                tip: 'Keyboard Shortcut: Alt + T',
                img: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=STEP+2:+OPEN+MENU'
            },
            {
                title: 'Select Transaction Type',
                desc: 'In the popup window, select "U010 - Dues In Receipt" from the transaction type selector.',
                tip: 'Use U013 for unexpected items (Local Purchase).',
                img: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=STEP+3:+SELECT+U010'
            },
            {
                title: 'Enter NSN',
                desc: 'Scan or type the NSN. The system will auto-match to the outstanding Demand if U010 was selected.',
                tip: 'Watch out for "Alternative Item" warnings.',
                img: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=STEP+4:+ENTER+NSN'
            },
            {
                title: 'Post & Print',
                desc: 'Click the Disk icon to save. The RV number will appear. Write this on the IV immediately.',
                tip: 'File the IV in the CRB within 24 hours.',
                img: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=STEP+5:+COMPLETE'
            }
        ]
    },
    'issues': {
        title: 'MJDI Issues (AinU)',
        steps: [
            { title: 'Select Account', desc: 'Navigate to Issues. Select target AinU.', tip: '', img: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=ISSUE+STEP+1' },
            { title: 'Add Item', desc: 'Scan NSN. Ensure "Loan" is checked.', tip: '', img: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=ISSUE+STEP+2' }
        ]
    }
};

const DB_SEARCH = [
    { label: 'Receipts Guide', meta: 'MJDI U010', action: 'route:receipts' },
    { label: 'Issues Guide', meta: 'MJDI AinU', action: 'route:issues' },
    { label: 'VITAL Terminal', meta: 'Simulator', action: 'route:vital' },
    { label: 'Inventory List', meta: 'Database', action: 'route:inventory' },
    { label: 'System Admin', meta: 'Config', action: 'func:admin' },
    { label: 'Toggle Theme', meta: 'UI', action: 'func:theme' }
];

// --- 2. CORE CLASS ---

class NexusController {
    constructor() {
        this.router = new Router();
        this.admin = new AdminModule();
        this.walkthrough = new WalkthroughModule();
        this.cmd = new CommandModule();
        this.vital = new VitalModule();
        this.theme = new ThemeModule();
        this.ui = new UIModule();
        this.util = new Utilities();

        this.init();
    }

    init() {
        this.simulateBoot();
        this.setupEventListeners();
        this.populateInventory();
    }

    simulateBoot() {
        const bar = document.getElementById('boot-bar');
        const overlay = document.getElementById('sys-boot-layer');
        const shell = document.getElementById('app-shell');
        
        let width = 0;
        const interval = setInterval(() => {
            width += 4;
            if(bar) bar.style.width = width + '%';
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    shell.classList.remove('hidden');
                    shell.classList.add('visible');
                    setTimeout(() => overlay.remove(), 500);
                }, 500);
            }
        }, 30); // Fast boot for UX
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.cmd.open();
            }
            if (e.key === 'Escape') {
                this.cmd.close();
                this.walkthrough.close();
                this.admin.close();
            }
        });
    }

    populateInventory() {
        const tbody = document.getElementById('inv-table-body');
        if(!tbody) return;
        
        tbody.innerHTML = DB_INVENTORY.map(item => `
            <tr>
                <td style="font-family:var(--font-mono)">${item.nsn}</td>
                <td>${item.desc}</td>
                <td>${item.doq}</td>
                <td>${item.loc}</td>
                <td>${item.qty}</td>
                <td><span class="status-badge ${item.status === 'SVC' ? 'ok' : 'low'}">${item.status}</span></td>
                <td><button class="btn-sm" onclick="alert('Details for ${item.nsn}')">View</button></td>
            </tr>
        `).join('');
    }
}

// --- 3. MODULES ---

class Router {
    constructor() {
        this.views = document.querySelectorAll('.view-panel');
        this.navItems = document.querySelectorAll('.nav-item');
    }

    navigate(viewId) {
        // Hide all views
        this.views.forEach(v => v.classList.remove('active'));
        this.navItems.forEach(n => n.classList.remove('active'));

        // Show target
        const targetView = document.getElementById(`view-${viewId}`);
        const dashboard = document.getElementById('view-dashboard');

        if (targetView) {
            targetView.classList.add('active');
        } else {
            // Fallback for anchor links inside dashboard
            dashboard.classList.add('active');
            const anchor = document.getElementById(`guide-${viewId}`);
            if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
        }

        // Update sidebar highlight
        const activeNav = document.querySelector(`.nav-item[href="#${viewId}"]`);
        if (activeNav) activeNav.classList.add('active');
    }
}

class WalkthroughModule {
    constructor() {
        this.overlay = document.getElementById('overlay-cinema');
        this.data = null;
        this.index = 0;
        this.els = {
            title: document.getElementById('wt-title'),
            img: document.getElementById('wt-img'),
            stepNum: document.getElementById('wt-step-num'),
            stepTitle: document.getElementById('wt-step-title'),
            stepDesc: document.getElementById('wt-step-desc'),
            tip: document.getElementById('wt-tip-text'),
            bar: document.getElementById('wt-progress'),
            timeline: document.getElementById('wt-timeline')
        };
    }

    start(id) {
        if (!DB_WALKTHROUGHS[id]) return alert("Module data not found");
        this.data = DB_WALKTHROUGHS[id];
        this.index = 0;
        this.overlay.classList.add('active');
        this.render();
    }

    close() {
        this.overlay.classList.remove('active');
    }

    next() {
        if (this.index < this.data.steps.length - 1) {
            this.index++;
            this.render();
        } else {
            this.close();
            // Trigger XP
            const xpEl = document.getElementById('user-xp-display');
            let curr = parseInt(xpEl.innerText);
            xpEl.innerText = curr + 150;
            alert("MODULE COMPLETE: +150 XP");
        }
    }

    prev() {
        if (this.index > 0) {
            this.index--;
            this.render();
        }
    }

    render() {
        const step = this.data.steps[this.index];
        const total = this.data.steps.length;

        this.els.title.innerText = this.data.title;
        this.els.img.src = step.img;
        this.els.stepNum.innerText = `Step ${this.index + 1} of ${total}`;
        this.els.stepTitle.innerText = step.title;
        this.els.stepDesc.innerText = step.desc;
        this.els.tip.innerText = step.tip || "No tip for this step.";
        
        // Progress Bar
        const pct = ((this.index + 1) / total) * 100;
        this.els.bar.style.width = `${pct}%`;

        // Timeline Dots
        this.els.timeline.innerHTML = this.data.steps.map((_, i) => 
            `<div class="timeline-dot ${i === this.index ? 'active' : ''}"></div>`
        ).join('');
    }
}

class AdminModule {
    constructor() {
        this.overlay = document.getElementById('overlay-admin');
    }
    open() {
        const pin = prompt("ENTER ADMIN PIN:");
        if (pin === "1134") {
            this.overlay.classList.add('active');
        } else {
            alert("ACCESS DENIED");
        }
    }
    close() { this.overlay.classList.remove('active'); }
    switchTab(tabId) {
        document.querySelectorAll('.adm-tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.adm-link').forEach(l => l.classList.remove('active'));
        document.getElementById(`adm-tab-${tabId}`).classList.add('active');
        event.target.classList.add('active');
    }
}

class VitalModule {
    constructor() {
        this.term = document.getElementById('vital-terminal');
        this.input = document.getElementById('vital-input');
    }
    input(cmd) {
        this.print(`KEY_PRESS: ${cmd}`);
        if(cmd === 'F1') this.print("HELP: LIST, CLEAR, EXIT, CHECK <PKG>");
        if(cmd === 'F3') Nexus.router.navigate('dashboard');
    }
    submit() {
        const val = this.input.value.toUpperCase();
        this.input.value = '';
        this.print(`> ${val}`);
        
        if (val === 'LIST') this.print("PKG 001: HELD\nPKG 002: ISSUED");
        else if (val === 'CLEAR') this.term.innerHTML = '<div class="term-line prompt">> <span id="vital-cursor" class="cursor">_</span></div>';
        else this.print("UNKNOWN COMMAND");
    }
    print(txt) {
        const div = document.createElement('div');
        div.className = 'term-line';
        div.innerText = txt;
        this.term.insertBefore(div, this.term.lastElementChild);
        this.term.scrollTop = this.term.scrollHeight;
    }
}

class CommandModule {
    constructor() {
        this.overlay = document.getElementById('overlay-cmd');
        this.input = document.getElementById('cmd-input');
        this.results = document.getElementById('cmd-results');
        this.input.addEventListener('input', (e) => this.search(e.target.value));
    }
    open() {
        this.overlay.classList.add('active');
        this.input.value = '';
        this.input.focus();
        this.search('');
    }
    close() { this.overlay.classList.remove('active'); }
    search(q) {
        const term = q.toLowerCase();
        const matches = DB_SEARCH.filter(i => i.label.toLowerCase().includes(term));
        
        this.results.innerHTML = matches.map(m => `
            <div class="cmd-item" onclick="Nexus.cmd.exec('${m.action}')">
                <span class="cmd-main">${m.label}</span>
                <span class="cmd-sub">${m.meta}</span>
            </div>
        `).join('');
    }
    exec(actionStr) {
        const [type, val] = actionStr.split(':');
        if (type === 'route') Nexus.router.navigate(val);
        if (type === 'func') {
            if(val === 'admin') Nexus.admin.open();
            if(val === 'theme') Nexus.theme.toggle();
        }
        this.close();
    }
}

class ThemeModule {
    toggle() {
        const cur = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
    }
}

class UIModule {
    toggleSidebar() {
        document.getElementById('main-sidebar').classList.toggle('open');
    }
}

class Utilities {
    copy(btn) {
        // Mock copy
        const orig = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = orig, 1000);
    }
}

// --- BOOT SYSTEM ---
window.Nexus = new NexusController();