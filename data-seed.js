/* ==========================================================================================
   LSS NEXUS DATA SEED
   ========================================================================================== */

/**
 * 2.1 USER REGISTRY (Mock Database)
 */
const SEED_USERS = [
    { 
        id: '30123456', 
        name: 'Sgt K. Kirby', 
        initials: 'SK',
        role: 'Admin', 
        status: 'Active', 
        xp: 14500, 
        level: 14, 
        badges: ['core_cert', 'admin_prime', 'expert_supply'],
        completedModules: ['mjdi_01', 'mjdi_02', 'mjdi_03', 'mjdi_04'],
        password: 'admin',
        lastLogin: '2025-12-04 08:30:21'
    },
    { 
        id: '30224466', 
        name: 'Cpl J. Jones', 
        initials: 'JJ',
        role: 'Instructor', 
        status: 'Active', 
        xp: 8200, 
        level: 8, 
        badges: ['core_cert', 'instructor_badge'],
        completedModules: ['mjdi_01', 'mjdi_02'],
        password: 'user',
        lastLogin: '2025-12-03 14:15:00'
    },
    // ... rest of your seed users ...
];

/**
 * 2.2 LEARNING MODULES (The Curriculum)
 */
const SEED_MODULES = {
    // --- CATEGORY: RECEIPTS ---
    'mjdi_01': {
        id: 'mjdi_01',
        title: 'Receipts: Standard Dues-In (U010)',
        category: 'Receipts',
        difficulty: 'Core',
        xpReward: 500,
        timeEst: '15 Mins',
        description: 'The fundamental process of receipting expected stock against an outstanding demand.',
        steps: [
            {
                title: 'Documentation Verification',
                content: `Before touching the keyboard, you must physically verify the incoming consignment.
                <br><br>
                <strong>Critical Checks:</strong>
                <ul>
                    <li><strong>NSN:</strong> Ensure the NATO Stock Number on the package matches the Issue Voucher (IV).</li>
                    <li><strong>D of Q:</strong> Check the Denomination of Quantity (e.g., received 1 Box of 100 vs 1 Each).</li>
                    <li><strong>Condition:</strong> Verify the materiel condition is A1 (Serviceable). If damaged, do not receipt as A1.</li>
                </ul>`,
                tip: 'If there is a discrepancy, quarantine the item and initiate a Discrepancy Report (F445).'
            },
            {
                title: 'Navigate to Transaction Screen',
                content: `On the MJDI Main Menu, navigate to the <strong>Transactions</strong> tab.
                <br>Select <strong>Receipts</strong> from the dropdown list.
                <br>Alternatively, use the keyboard shortcut <code>Alt + T</code> followed by <code>R</code>.`,
                tip: 'Ensure you are logged into the correct Unit Account (UIN) before proceeding.'
            },
            {
                title: 'Select Transaction Type',
                content: `In the Receipt header, locate the Transaction Code field.
                <br>Select <strong>U010 - Receipt from Depot/Unit</strong>.
                <br>This code links the receipt to your outstanding Dues-In list, closing the demand liability.`,
                tip: 'Do NOT use U013 for items you have demanded. U013 is for unexpected/local items only.'
            },
            {
                title: 'Enter Consignment Data',
                content: `Scan the barcode or type the NSN into the Item field.
                <br>The system should auto-populate the Description and Price.
                <br>Enter the <strong>Consignor UIN</strong> and the <strong>IV Number</strong> from the paperwork.`,
                tip: 'Double check the UIN. Receipting from the wrong source affects audit trails.'
            },
            {
                title: 'Commit and Finalize',
                content: `Click the <strong>Post (Disk Icon)</strong> to save the record.
                <br>The system will generate a Receipt Voucher (RV) number (e.g., RV 10023).
                <br><strong>Action:</strong> Write this RV number on the physical IV immediately and file in the CRB.`,
                tip: 'Receipts must be filed within 24 hours of physical arrival.'
            }
        ]
    },
    'mjdi_02': {
        id: 'mjdi_02',
        title: 'Receipts: Local Purchase (U013)',
        category: 'Receipts',
        difficulty: 'Core',
        xpReward: 400,
        timeEst: '10 Mins',
        description: 'Bringing items onto account that were not demanded via the supply chain (e.g., cash purchases).',
        steps: [
            {
                title: 'Authority Check',
                content: 'Ensure you have financial authority (ePC receipt or Local Purchase Order) before bringing items onto account.',
                tip: 'Items bought with public money MUST be accounted for.'
            },
            {
                title: 'Select U013',
                content: 'Navigate to Receipts. Select <strong>U013 - Receipt, Local Purchase</strong>.',
                tip: 'This transaction creates stock without a pre-existing demand.'
            },
            {
                title: 'Codification',
                content: 'If the item has an NSN, use it. If not, you may need to create a Non-Standard Item (NSI) record first.',
                tip: 'Search for existing NSNs before creating new NSI records.'
            }
        ]
    },

    // --- CATEGORY: ISSUES ---
    'mjdi_03': {
        id: 'mjdi_03',
        title: 'Issues: To AinU Holder',
        category: 'Issues',
        difficulty: 'Core',
        xpReward: 450,
        timeEst: '12 Mins',
        description: 'Issuing stock to internal departments (Articles in Use).',
        steps: [
            {
                title: 'Identify Customer',
                content: 'Navigate to <strong>Transactions > Issues</strong>. Use the search glass to find the AinU Holder (e.g., SQMS, MT, WKSP).',
                tip: 'Ensure the AinU holder has a valid signature on the delegation list.'
            },
            {
                title: 'Loan vs Consumption',
                content: `<strong>Crucial Decision:</strong>
                <ul>
                    <li><strong>Permanent Issue (P):</strong> Item is consumed (e.g., Paint, Oil, Batteries). Removed from account.</li>
                    <li><strong>Loan Issue (L):</strong> Item is durable (e.g., Drill, Tent). Transferred to AinU ledger.</li>
                </ul>`,
                tip: 'Incorrectly issuing a drill as "P" will lose the asset from the register.'
            },
            {
                title: 'Process Issue',
                content: 'Enter NSN and Qty. Click Post. Print 2 copies of the Issue Voucher (IV). One for them, one for you.',
                tip: 'Get a signature before handing over the goods.'
            }
        ]
    },
    'mjdi_04': {
        id: 'mjdi_04',
        title: 'Issues: External Transfer (U015)',
        category: 'Issues',
        difficulty: 'Advanced',
        xpReward: 600,
        timeEst: '20 Mins',
        description: 'Transferring stock to another Unit or Depot.',
        steps: [
            { title: 'Authority', content: 'Ensure you have a redistrubtion order or demand from the requesting unit.', tip: ''},
            { title: 'Select U015', content: 'Use transaction U015. Enter the destination UIN carefully.', tip: 'Wrong UIN means stock goes missing.'},
            { title: 'Pick and Pack', content: 'Generate the Issue Voucher. Ensure items are packed securely for transport.', tip: 'Include a copy of the IV inside the box.'}
        ]
    },

    // --- CATEGORY: STOCKTAKING ---
    'mjdi_05': {
        id: 'mjdi_05',
        title: 'Stocktaking: Program & Count',
        category: 'Stocktaking',
        difficulty: 'Advanced',
        xpReward: 800,
        timeEst: '30 Mins',
        description: 'Managing the mandatory stocktaking cycle (100% check over 2 years).',
        steps: [
            { title: 'Create Programme', content: 'Open Stocktaking Module. Select "Create Programme". Choose "Random" or "Location" based.', tip: ''},
            { title: 'Print Sheets', content: 'Print the count sheets (blind count - no quantities shown).', tip: 'Do not let the counter see the system stock.'},
            { title: 'Input Count', content: 'Enter the physical figures. The system will highlight discrepancies.', tip: ''},
            { title: 'Resolve', content: 'Investigate discrepancies. If valid, post adjustments (Surplus/Deficiency).', tip: 'Large variances require Officer approval.'}
        ]
    },

    // --- CATEGORY: DISPOSALS ---
    'mjdi_06': {
        id: 'mjdi_06',
        title: 'GXD: Gateway Disposals',
        category: 'Disposals',
        difficulty: 'Specialist',
        xpReward: 700,
        timeEst: '25 Mins',
        description: 'Declaring items as scrap or beyond economical repair (BER).',
        steps: [
            { title: 'Condition Check', content: 'Verify item is definitely BER. If high value, get an EME Report.', tip: ''},
            { title: 'Scrap Process', content: 'Trans > Disposals > GXD. Select "Scrap".', tip: ''},
            { title: 'Backloading', content: 'If item is hazardous or sensitive, use the Backload process instead of Scrap.', tip: ''}
        ]
    },

    // --- CATEGORY: ADMIN ---
    'mjdi_07': {
        id: 'mjdi_07',
        title: 'UAA: User Role Management',
        category: 'Admin',
        difficulty: 'Command',
        xpReward: 300,
        timeEst: '10 Mins',
        description: 'Adding and removing users from the MJDI stack.',
        steps: [
            { title: 'Access Admin', content: 'Open System Admin > Users.', tip: ''},
            { title: 'Create Profile', content: 'Input Service Number and Role. Assign to UIN.', tip: ''}
        ]
    }
};

/**
 * 2.3 ACHIEVEMENT BADGES
 */
const SEED_BADGES = {
    'core_cert': {
        id: 'core_cert',
        name: 'Core Certified',
        icon: 'icon-check',
        desc: 'Completed all Basic Receipts & Issues modules.'
    },
    'admin_prime': {
        id: 'admin_prime',
        name: 'System Architect',
        icon: 'icon-settings',
        desc: 'Reached Level 10 and unlocked Admin privileges.'
    },
    'expert_supply': {
        id: 'expert_supply',
        name: 'Supply Expert',
        icon: 'icon-box',
        desc: 'Logged 10,000 XP in operations.'
    },
    'instructor_badge': {
        id: 'instructor_badge',
        name: 'Instructor',
        icon: 'icon-book',
        desc: 'Authorized to train others.'
    },
    'first_login': {
        id: 'first_login',
        name: 'Recruit',
        icon: 'icon-user',
        desc: 'Logged in for the first time.'
    }
};
