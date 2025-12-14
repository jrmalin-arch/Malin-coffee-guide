// --- Configuration & Data ---
const CUP_VOLUME_G = 125; // Moccamaster's definition of a "cup" in grams/ml
const GRINDER_SETTINGS = {
    "1zpresso": {
        "AeroPress": "5.0 - 6.0 clicks",
        "Cup One": "6.0 - 7.0 clicks",
        "Moccamaster KGBV": "7.0 - 8.0 clicks"
    },
    "baratza": {
        "AeroPress": "12 - 16",
        "Cup One": "14 - 18",
        "Moccamaster KGBV": "18 - 22"
    }
};

// --- State Variables ---
let selectedCups = 0;
let selectedWater = 0;
let selectedMaker = '';
let selectedRatio = 0;
let selectedGrinder = '';

// --- Step 1: Cup Selection ---
function initCupOptions() {
    // Added 3, 5, 7, 9 cups
    const cups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
    const cupOptions = document.getElementById('cup-options');
    
    cupOptions.innerHTML = cups.map(c => {
        let text = `${c} Cups`;
        if (c === 1) {
            text += ` (300g mug)`;
        } else if (c > 2) {
            text += ` (${c * CUP_VOLUME_G}g total)`;
        }
        return `<button onclick="selectCups(${c})">${text}</button>`
    }).join('');
}

function selectCups(cups) {
    selectedCups = cups;
    
    const makerOptionsContainer = document.getElementById('maker-options');
    makerOptionsContainer.innerHTML = '';
    
    // Logic for setting water volume and choosing maker
    if (cups === 1) {
        selectedWater = 300; // Single large mug volume
        document.getElementById('maker-hint').textContent = 'For a single large mug, choose the best device.';
        makerOptionsContainer.innerHTML = `
            <button onclick="selectMaker('AeroPress')">AeroPress (Regular)</button>
            <button onclick="selectMaker('Cup One')">Moccamaster Cup One</button>
        `;
        showStep(2);
    } else if (cups === 2) {
        selectedWater = 600; // AeroPress XL max volume
        document.getElementById('maker-hint').textContent = 'The AeroPress XL is best for two servings (max capacity is 600ml).';
        makerOptionsContainer.innerHTML = `<button onclick="selectMaker('AeroPress')">AeroPress XL</button>`;
        showStep(2);
    } else if (cups >= 3 && cups <= 10) {
        // Moccamaster KGBV Logic (using 125g per cup)
        selectedWater = cups * CUP_VOLUME_G; 
        selectedMaker = 'Moccamaster KGBV';
        document.getElementById('maker-hint').textContent = `The Moccamaster KGBV is the best choice for ${cups} cups (${selectedWater}g total).`;
        makerOptionsContainer.innerHTML = `<button onclick="selectMaker('Moccamaster KGBV')">Moccamaster KGBV</button>`;
        showStep(3); // Auto-selects maker, moves to next step
    } else {
        alert('Invalid cup selection.');
        resetApp();
    }
}

// --- Step 2: Maker Selection (For 1-2 Cups) ---
function selectMaker(maker) {
    selectedMaker = maker;
    // Special handling for AeroPress to set the correct display name
    if (selectedCups === 1 && selectedMaker === 'AeroPress') {
        selectedMaker = 'AeroPress (Regular)';
    } else if (selectedCups === 2 && selectedMaker === 'AeroPress') {
        selectedMaker = 'AeroPress XL'; 
    }
    showStep(3);
}

// --- Step 3 & 4: Ratio and Grinder Selection (No changes) ---
function initRatioOptions() {
    const ratioButtons = document.getElementById('ratio-options').querySelectorAll('button');
    ratioButtons.forEach(button => {
        button.onclick = () => {
            selectedRatio = parseInt(button.dataset.ratio);
            showStep(4);
        };
    });
}

function initGrinderOptions() {
    const grinderButtons = document.getElementById('grinder-options').querySelectorAll('button');
    grinderButtons.forEach(button => {
        button.onclick = () => {
            selectedGrinder = button.dataset.grinder;
            calculateAndDisplayResult();
        };
    });
}

// --- Final Step: Calculation & Display ---
function calculateAndDisplayResult() {
    // Math: Coffee Weight (g) = Water Weight (g) / Ratio 
    const coffeeWeight = selectedWater / selectedRatio;
    const roundedCoffeeWeight = Math.round(coffeeWeight);

    // Get the display text for the ratio
    let ratioText = '';
    if (selectedRatio === 14) ratioText = 'Strong (1:14)';
    else if (selectedRatio === 16) ratioText = 'Medium (1:16)';
    else ratioText = 'Mild (1:18)';
    
    // FIX: Robust logic to get the correct lookup key for GRINDER_SETTINGS
    let lookupMaker;
    if (selectedMaker.includes('AeroPress')) {
        lookupMaker = 'AeroPress';
    } else if (selectedMaker.includes('Cup One')) {
        lookupMaker = 'Cup One';
    } else {
        // Must be Moccamaster KGBV
        lookupMaker = 'Moccamaster KGBV';
    }
    
    // This will now always correctly pull a setting unless Grinder or Maker wasn't selected
    const grindSetting = GRINDER_SETTINGS[selectedGrinder][lookupMaker];

    // Update the result display
    document.getElementById('result-cups').textContent = selectedCups;
    document.getElementById('result-maker').textContent = selectedMaker;
    document.getElementById('result-ratio-text').textContent = ratioText;
    document.getElementById('result-water').textContent = selectedWater.toLocaleString();
    document.getElementById('result-coffee').textContent = roundedCoffeeWeight.toLocaleString();
    document.getElementById('result-grind-setting').textContent = grindSetting;

    showStep('result-area');
}

// --- UI Utility Functions (No changes, reused from previous code) ---
function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
    const stepToShow = document.getElementById(typeof stepId === 'number' ? `step-${stepId}` : stepId);
    if (stepToShow) {
        stepToShow.classList.remove('hidden');
    }
}

function resetApp() {
    selectedCups = 0;
    selectedWater = 0;
    selectedMaker = '';
    selectedRatio = 0;
    selectedGrinder = '';
    showStep(1);
}

// --- Initialize the App ---
document.addEventListener('DOMContentLoaded', () => {
    initCupOptions();
    initRatioOptions();
    initGrinderOptions();
    showStep(1); // Start on the first step
});
