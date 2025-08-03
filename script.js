// Valid login IDs
const validIDs = ['23701A05C3', '23701A05B8','23701A05B1'];

// Theme management
let currentTheme = 'light';
let isLoggedIn = false;

// Global test function for debugging
window.testContentLoading = function() {
    console.log('=== TESTING CONTENT LOADING ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('theoryContent element:', document.getElementById('theoryContent'));
    console.log('labContent element:', document.getElementById('labContent'));
    
    loadTheoryContent();
    loadLabContent();
    loadMincodeContent();
    
    console.log('=== TEST COMPLETE ===');
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Show loading screen first
    setTimeout(() => {
        console.log('Loading screen timeout complete');
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('mainSite').classList.remove('hidden');
        
        // Show home section (no login required for home)
        showSection('home');
        
        // Do NOT pre-load protected content - let users access it through login
    }, 1500);

    // Set initial theme
    updateTheme();
    
    // Create floating particles
    createFloatingParticles();
    
    // Add stagger animation to course cards
    setTimeout(addStaggerAnimation, 2000);
});

// Login functionality
function login() {
    const input = document.getElementById('loginInput');
    const errorDiv = document.getElementById('loginError');
    const enteredID = input.value.trim().toUpperCase();

    if (validIDs.includes(enteredID)) {
        // Successful login
        isLoggedIn = true;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainSite').classList.remove('hidden');
        
        // Update login button
        updateLoginButton();
        
        // Show success notification
        showLoginNotification('Login successful! Welcome to Semprepzie', 'success');
        
        // Return to the section that was requested
        const requestedSection = sessionStorage.getItem('requestedSection');
        if (requestedSection) {
            showSection(requestedSection);
            sessionStorage.removeItem('requestedSection');
        } else {
            showSection('home');
        }
    } else {
        // Failed login
        errorDiv.textContent = 'Invalid ID. Please enter ID';
        input.style.borderColor = '#ef4444';
        input.value = '';
        
        // Reset error after 3 seconds
        setTimeout(() => {
            errorDiv.textContent = '';
            input.style.borderColor = 'var(--border-color)';
        }, 3000);
    }
}

// Show login notification
function showLoginNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">${type === 'success' ? '✅' : '❌'}</span>
            <div style="font-size: 14px;">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Allow Enter key for login
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !document.getElementById('loginPage').classList.contains('hidden')) {
        login();
    }
});

// Logout functionality
function logout() {
    isLoggedIn = false;
    updateLoginButton();
    showLoginNotification('Logged out successfully', 'success');
    showSection('home');
    
    // Clear protected content
    clearProtectedContent();
    
    // Reset login form
    const loginInput = document.getElementById('loginInput');
    const errorDiv = document.getElementById('loginError');
    if (loginInput) loginInput.value = '';
    if (errorDiv) errorDiv.textContent = '';
    
    // Remove access message if it exists
    const accessMessage = document.getElementById('accessMessage');
    if (accessMessage) {
        accessMessage.remove();
    }
    
    // Reset login page title
    const loginContainer = document.querySelector('.login-container h1');
    if (loginContainer) {
        loginContainer.innerHTML = `🎓 Welcome to Semprepzie`;
    }
}

// Add login/logout button to navigation
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const loginButton = document.createElement('div');
            loginButton.className = 'login-toggle';
            loginButton.innerHTML = `
                <button id="loginToggle" onclick="toggleLogin()" style="
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
                ">🔐 Login</button>
            `;
            themeToggle.parentNode.insertBefore(loginButton, themeToggle);
        }
    }, 100);
});

// Toggle login/logout
function toggleLogin() {
    if (isLoggedIn) {
        logout();
    } else {
        document.getElementById('mainSite').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');
        
        setTimeout(() => {
            const loginInput = document.getElementById('loginInput');
            if (loginInput) {
                loginInput.focus();
            }
        }, 100);
    }
}

// Update login button text based on status
function updateLoginButton() {
    const loginToggle = document.getElementById('loginToggle');
    if (loginToggle) {
        if (isLoggedIn) {
            loginToggle.innerHTML = '🔓 Logout';
            loginToggle.classList.add('logged-in');
        } else {
            loginToggle.innerHTML = '🔐 Login';
            loginToggle.classList.remove('logged-in');
        }
    }
}

// Section navigation with login check
function showSection(sectionName) {
    // Check if section requires login
    if ((sectionName === 'theory' || sectionName === 'lab' || sectionName === 'mincode') && !isLoggedIn) {
        // Store the requested section and show login page
        sessionStorage.setItem('requestedSection', sectionName);
        showLoginPrompt(sectionName);
        return;
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Load content dynamically for protected sections
    if (sectionName === 'theory' && isLoggedIn) {
        loadTheoryContent();
    } else if (sectionName === 'lab' && isLoggedIn) {
        loadLabContent();
    } else if (sectionName === 'mincode' && isLoggedIn) {
        loadMincodeContent();
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.style.color = 'var(--text-primary)';
    });
    
    // Find and highlight current nav item
    const currentNavItem = Array.from(navLinks).find(link => 
        link.onclick && link.onclick.toString().includes(sectionName)
    );
    if (currentNavItem) {
        currentNavItem.classList.add('active');
        currentNavItem.style.color = 'var(--primary-color)';
    }
    
    // Close mobile menu after selection
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (navMenu && mobileToggle) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
    }
}

// Show login prompt when trying to access restricted sections
function showLoginPrompt(sectionName) {
    const sectionTitle = sectionName === 'theory' ? 'Theory Courses' : 'Lab Materials';
    
    document.getElementById('mainSite').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    
    // Update login page title to show what they're trying to access
    const loginContainer = document.querySelector('.login-container h1');
    if (loginContainer) {
        loginContainer.innerHTML = `🎓 Login Required`;
    }
    
    // Add a message about what they're trying to access
    let accessMessage = document.getElementById('accessMessage');
    if (!accessMessage) {
        accessMessage = document.createElement('div');
        accessMessage.id = 'accessMessage';
        accessMessage.style.cssText = `
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        `;
        
        const loginForm = document.querySelector('.login-form');
        loginForm.insertBefore(accessMessage, loginForm.firstChild);
    }
    
    accessMessage.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${sectionName === 'theory' ? '📚' : '🔬'}</span>
            <strong>Accessing ${sectionTitle}</strong>
        </div>
        <div style="opacity: 0.9; font-size: 13px;">
            Please login with your student ID to continue
        </div>
    `;
    
    // Focus on input field
    setTimeout(() => {
        const loginInput = document.getElementById('loginInput');
        if (loginInput) {
            loginInput.focus();
        }
    }, 100);
}

// Load Theory content dynamically
function loadTheoryContent() {
    console.log('Loading theory content...');
    const theoryContent = document.getElementById('theoryContent');
    console.log('Theory content element:', theoryContent);
    if (!theoryContent) return; // Only check if element exists
    
    // Clear any existing content first
    theoryContent.innerHTML = '';
    
    const courseCards = `
        <div class="course-card" onclick="openCourse('course1')" data-tilt>
            <div class="course-content">
                <div class="course-icon">📐</div>
                <h3>Object Oriented Analysis and Design</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course2')" data-tilt>
            <div class="course-content">
                <div class="course-icon">⚛️</div>
                <h3>Introduction to Quantum Technology and Applications</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course3')" data-tilt>
            <div class="course-content">
                <div class="course-icon">🧪</div>
                <h3>Artificial Intelligence</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course4')" data-tilt>
            <div class="course-content">
                <div class="course-icon">💻</div>
                <h3>Computer Networks</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course5')" data-tilt>
            <div class="course-content">
                <div class="course-icon">📚</div>
                <h3>English for Competitive Examination</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
        <div class="course-card" onclick="openCourse('course6')" data-tilt>
            <div class="course-content">
                <div class="course-icon">⚙️</div>
                <h3>Automata Theory and Compiler Design</h3>
                <p>5 Units Available</p>
                <div class="course-glow"></div>
            </div>
        </div>
    `;
    
    theoryContent.innerHTML = courseCards;
    console.log('Theory content loaded, cards added:', courseCards.length);
    
    // Add entrance animation to newly loaded cards
    setTimeout(() => {
        const cards = theoryContent.querySelectorAll('.course-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 50);
}

// Load Lab content dynamically
function loadLabContent() {
    console.log('Loading lab content...');
    const labContent = document.getElementById('labContent');
    console.log('Lab content element:', labContent);
    if (!labContent) return; // Only check if element exists
    
    // Clear any existing content first
    labContent.innerHTML = '';
    
    const labCards = `
        <div class="lab-card" onclick="openLab('lab1')">
            <h3>Artificial Intelligence Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">👨‍💻</div>
        </div>
        <div class="lab-card" onclick="openLab('lab2')">
            <h3>Computer Networks Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">🔌</div>
        </div>
        <div class="lab-card" onclick="openLab('lab3')">
            <h3>Full Stack Development Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">🔬</div>
        </div>
        <div class="lab-card" onclick="openLab('lab4')">
            <h3>Tinkering Lab</h3>
            <p>10 Exercises</p>
            <div class="lab-icon">⚗️</div>
        </div>
    `;
    
    labContent.innerHTML = labCards;
    console.log('Lab content loaded, cards added:', labCards.length);
    
    // Add entrance animation to newly loaded cards
    setTimeout(() => {
        const cards = labContent.querySelectorAll('.lab-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 50);
}

// Load Minimized Code content dynamically
function loadMincodeContent() {
    const mincodeContent = document.getElementById('mincodeContent');
    if (!mincodeContent) return; // Only check if element exists
    
    // Clear any existing content first
    mincodeContent.innerHTML = '';
    
    const codeCards = `
        <div class="code-card">
            <div class="code-icon">🔧</div>
            <h3>Algorithms</h3>
            <p>Optimized code snippets for sorting, searching, and graph algorithms</p>
            <button class="view-btn" onclick="viewCode('algorithms')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">📊</div>
            <h3>Data Structures</h3>
            <p>Efficient implementations of arrays, trees, stacks, and queues</p>
            <button class="view-btn" onclick="viewCode('datastructures')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🌐</div>
            <h3>Web Development</h3>
            <p>Clean and minimal HTML, CSS, and JavaScript code</p>
            <button class="view-btn" onclick="viewCode('webdev')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🖥️</div>
            <h3>System Programming</h3>
            <p>Low-level programming and system optimization</p>
            <button class="view-btn" onclick="viewCode('system')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🤖</div>
            <h3>Machine Learning</h3>
            <p>Simplified ML algorithms and neural networks</p>
            <button class="view-btn" onclick="viewCode('ml')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">📱</div>
            <h3>Mobile Development</h3>
            <p>Cross-platform mobile app code snippets</p>
            <button class="view-btn" onclick="viewCode('mobile')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🔐</div>
            <h3>Cryptography</h3>
            <p>Security algorithms and encryption methods</p>
            <button class="view-btn" onclick="viewCode('crypto')">View Code</button>
        </div>
        <div class="code-card">
            <div class="code-icon">🚀</div>
            <h3>Performance</h3>
            <p>Code optimization and performance patterns</p>
            <button class="view-btn" onclick="viewCode('performance')">View Code</button>
        </div>
    `;
    
    mincodeContent.innerHTML = codeCards;
    
    // Add entrance animation to newly loaded cards
    setTimeout(() => {
        const cards = mincodeContent.querySelectorAll('.code-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 50);
}

// Clear content when logging out
function clearProtectedContent() {
    const theoryContent = document.getElementById('theoryContent');
    const labContent = document.getElementById('labContent');
    const mincodeContent = document.getElementById('mincodeContent');
    
    if (theoryContent) theoryContent.innerHTML = '';
    if (labContent) labContent.innerHTML = '';
    if (mincodeContent) mincodeContent.innerHTML = '';
}

// View code function for minimized code section
function viewCode(codeType) {
    // Create a modal for code viewing
    const codeModal = document.createElement('div');
    codeModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const codeContent = document.createElement('div');
    codeContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 15px;
        padding: 30px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: codeModalIn 0.3s ease-out;
    `;
    
    const codeMap = {
        algorithms: {
            title: 'Algorithm Code Snippets',
            icon: '🔧',
            code: `// Quick Sort Algorithm
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}

// Binary Search
function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
        },
        datastructures: {
            title: 'Data Structure Implementations',
            icon: '📊',
            code: `// Stack Implementation
class Stack {
    constructor() { this.items = []; }
    push(item) { this.items.push(item); }
    pop() { return this.items.pop(); }
    peek() { return this.items[this.items.length - 1]; }
    isEmpty() { return this.items.length === 0; }
}

// Binary Tree Node
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = this.right = null;
    }
}`
        },
        webdev: {
            title: 'Web Development Code',
            icon: '🌐',
            code: `<!-- Clean HTML Structure -->
<div class="card">
    <h3 class="card-title">Title</h3>
    <p class="card-content">Content</p>
    <button class="btn-primary">Action</button>
</div>

/* Minimalist CSS */
.card {
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}
.card:hover { transform: translateY(-5px); }`
        },
        system: {
            title: 'System Programming',
            icon: '🖥️',
            code: `// Memory Management
#include <stdlib.h>
#include <stdio.h>

void* safe_malloc(size_t size) {
    void* ptr = malloc(size);
    if (!ptr) {
        fprintf(stderr, "Memory allocation failed\\n");
        exit(1);
    }
    return ptr;
}

// File Operations
int read_file(const char* filename, char** buffer) {
    FILE* file = fopen(filename, "r");
    if (!file) return -1;
    // ... implementation
    fclose(file);
    return 0;
}`
        },
        ml: {
            title: 'Machine Learning Code',
            icon: '🤖',
            code: `// Simple Neural Network Neuron
class Neuron {
    constructor(weights, bias) {
        this.weights = weights;
        this.bias = bias;
    }
    
    activate(inputs) {
        let sum = this.bias;
        for (let i = 0; i < inputs.length; i++) {
            sum += inputs[i] * this.weights[i];
        }
        return this.sigmoid(sum);
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
}`
        },
        mobile: {
            title: 'Mobile Development',
            icon: '📱',
            code: `// React Native Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonText: { color: 'white', fontWeight: 'bold' }
});`
        },
        crypto: {
            title: 'Cryptography Algorithms',
            icon: '🔐',
            code: `// Caesar Cipher Implementation
class CaesarCipher {
    static encrypt(text, shift) {
        return text.replace(/[a-zA-Z]/g, char => {
            const base = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(
                ((char.charCodeAt(0) - base + shift) % 26) + base
            );
        });
    }
    
    static decrypt(text, shift) {
        return this.encrypt(text, 26 - shift);
    }
}

// Simple Hash Function
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Base64 Encoding/Decoding
const Base64 = {
    encode: str => btoa(unescape(encodeURIComponent(str))),
    decode: str => decodeURIComponent(escape(atob(str)))
};`
        },
        performance: {
            title: 'Performance Optimization',
            icon: '🚀',
            code: `// Memoization Pattern
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Debounce Function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle Function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy Loading Implementation
class LazyLoader {
    static observe(elements, callback) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        elements.forEach(el => observer.observe(el));
    }
}`
        }
    };
    
    const selectedCode = codeMap[codeType] || codeMap.algorithms;
    
    codeContent.innerHTML = `
        <div style="margin-bottom: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">${selectedCode.icon}</div>
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">${selectedCode.title}</h3>
        </div>
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin-bottom: 20px; overflow-x: auto;">
            <pre style="color: #f8f8f2; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; margin: 0;"><code>${selectedCode.code}</code></pre>
        </div>
        <div style="text-align: center;">
            <button onclick="closeCodeModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    codeModal.appendChild(codeContent);
    document.body.appendChild(codeModal);
    
    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes codeModalIn {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
    `;
    document.head.appendChild(animationStyle);
    
    // Close modal when clicking outside
    codeModal.addEventListener('click', function(e) {
        if (e.target === codeModal) {
            closeCodeModal();
        }
    });
    
    // Store reference for closing
    window.currentCodeModal = codeModal;
}

// Close code modal
function closeCodeModal() {
    if (window.currentCodeModal) {
        window.currentCodeModal.style.animation = 'fadeOut 0.3s ease-in forwards';
        
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
        
        setTimeout(() => {
            if (window.currentCodeModal && window.currentCodeModal.parentNode) {
                document.body.removeChild(window.currentCodeModal);
                window.currentCodeModal = null;
            }
        }, 300);
    }
}

// Theme toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme();
}

function updateTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}

// Mobile menu toggle function
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && mobileToggle) {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');
    
    if (navMenu && mobileToggle && navbar) {
        if (!navbar.contains(event.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth > 768 && navMenu && mobileToggle) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Course data structure
const courseData = {
    course1: {
        title: 'Object Oriented Analysis and Design',
        icon: '📐',
        units: [
            /*{
                title: 'Unit 1: Algebra',
                content: 'Introduction to algebraic expressions, equations, and inequalities.',
                pdf: 'mathematics_unit1.pdf'
            },
            {
                title: 'Unit 2: Calculus',
                content: 'Differential and integral calculus fundamentals.',
                pdf: 'mathematics_unit2.pdf'
            },
            {
                title: 'Unit 3: Geometry',
                content: 'Euclidean geometry and coordinate systems.',
                pdf: 'mathematics_unit3.pdf'
            },
            {
                title: 'Unit 4: Statistics',
                content: 'Probability, distributions, and statistical analysis.',
                pdf: 'mathematics_unit4.pdf'
            },
            {
                title: 'Unit 5: Discrete Mathematics',
                content: 'Logic, sets, and combinatorics.',
                pdf: 'mathematics_unit5.pdf'
            }*/
        ]
    },
    course2: {
        title: 'Introduction to Quantum Technology and Applications',
        icon: '⚛️',
        units: [
            {
                title: 'Unit 1: Introduction to Quantum Theory and Technologies ',
                content: ' The transition from classical to quantum physics',
                pdf: 'pdfs/unitone.pdf'
            }/*,
            {
                title: 'Unit 2: Thermodynamics',
                content: 'Heat, temperature, and thermal processes.',
                pdf: 'physics_unit2.pdf'
            },
            {
                title: 'Unit 3: Electromagnetism',
                content: 'Electric and magnetic fields and their interactions.',
                pdf: 'physics_unit3.pdf'
            },
            {
                title: 'Unit 4: Optics',
                content: 'Light, reflection, refraction, and wave optics.',
                pdf: 'physics_unit4.pdf'
            },
            {
                title: 'Unit 5: Modern Physics',
                content: 'Quantum mechanics and atomic structure.',
                pdf: 'physics_unit5.pdf'
            }*/
        ]
    },
    course3: {
        title: 'Artificial Intelligence',
        icon: '🧪',
        units: [
            /*{
                title: 'Unit 1: Atomic Structure',
                content: 'Atoms, electrons, and periodic properties.',
                pdf: 'chemistry_unit1.pdf'
            },
            {
                title: 'Unit 2: Chemical Bonding',
                content: 'Ionic, covalent, and metallic bonding.',
                pdf: 'chemistry_unit2.pdf'
            },
            {
                title: 'Unit 3: Thermochemistry',
                content: 'Energy changes in chemical reactions.',
                pdf: 'chemistry_unit3.pdf'
            },
            {
                title: 'Unit 4: Organic Chemistry',
                content: 'Carbon compounds and functional groups.',
                pdf: 'chemistry_unit4.pdf'
            },
            {
                title: 'Unit 5: Chemical Kinetics',
                content: 'Reaction rates and mechanisms.',
                pdf: 'chemistry_unit5.pdf'
            }*/
        ]
    },
    course4: {
        title: 'Computer Networks',
        icon: '💻',
        units: [
            {
                title: 'Unit 1: Programming Fundamentals',
                content: 'Variables, data types, and control structures.',
                pdf: 'pdfs/cn1.docx'
            },
            {
                title: 'Unit 2: Data Structures',
                content: 'Arrays, linked lists, stacks, and queues.',
                pdf: 'cs_unit2.pdf'
            },
            {
                title: 'Unit 3: Algorithms',
                content: 'Sorting, searching, and algorithm analysis.',
                pdf: 'cs_unit3.pdf'
            },
            {
                title: 'Unit 4: Object-Oriented Programming',
                content: 'Classes, objects, inheritance, and polymorphism.',
                pdf: 'cs_unit4.pdf'
            },
            {
                title: 'Unit 5: Database Systems',
                content: 'SQL, database design, and normalization.',
                pdf: 'cs_unit5.pdf'
            }
        ]
    },
    course5: {
        title: 'English for Competitive Examination',
        icon: '📚',
        units: [/*
            {
                title: 'Unit 1: Grammar and Syntax',
                content: 'Parts of speech, sentence structure, and punctuation.',
                pdf: 'english_unit1.pdf'
            },
            {
                title: 'Unit 2: Literature Analysis',
                content: 'Poetry, prose, and dramatic works analysis.',
                pdf: 'english_unit2.pdf'
            },
            {
                title: 'Unit 3: Writing Skills',
                content: 'Essay writing, reports, and technical writing.',
                pdf: 'english_unit3.pdf'
            },
            {
                title: 'Unit 4: Communication Skills',
                content: 'Verbal and non-verbal communication.',
                pdf: 'english_unit4.pdf'
            },
            {
                title: 'Unit 5: Linguistics',
                content: 'Language structure and evolution.',
                pdf: 'english_unit5.pdf'
            }*/
        ]
    },
    course6: {
        title: 'Automata Theory and Compiler Design',
        icon: '⚙️',
        units: [/*
            {
                title: 'Unit 1: Engineering Drawing',
                content: 'Technical drawing and CAD fundamentals.',
                pdf: 'engineering_unit1.pdf'
            },
            {
                title: 'Unit 2: Materials Science',
                content: 'Properties and applications of engineering materials.',
                pdf: 'engineering_unit2.pdf'
            },
            {
                title: 'Unit 3: Mechanics of Materials',
                content: 'Stress, strain, and material behavior.',
                pdf: 'engineering_unit3.pdf'
            },
            {
                title: 'Unit 4: Fluid Mechanics',
                content: 'Fluid statics and dynamics.',
                pdf: 'engineering_unit4.pdf'
            },
            {
                title: 'Unit 5: Control Systems',
                content: 'Feedback systems and control theory.',
                pdf: 'engineering_unit5.pdf'
            }*/
        ]
    }
};

// Lab data structure
const labData = {
    lab1: {
        title: 'Programming Lab',
        icon: '👨‍💻',
        exercises: [
            /*{ title: 'Exercise 1: Hello World Program', pdf: 'prog_ex1.pdf' },
            { title: 'Exercise 2: Variables and Data Types', pdf: 'prog_ex2.pdf' },
            { title: 'Exercise 3: Control Structures', pdf: 'prog_ex3.pdf' },
            { title: 'Exercise 4: Functions', pdf: 'prog_ex4.pdf' },
            { title: 'Exercise 5: Arrays and Strings', pdf: 'prog_ex5.pdf' },
            { title: 'Exercise 6: Object-Oriented Programming', pdf: 'prog_ex6.pdf' },
            { title: 'Exercise 7: File Handling', pdf: 'prog_ex7.pdf' },
            { title: 'Exercise 8: Error Handling', pdf: 'prog_ex8.pdf' },
            { title: 'Exercise 9: Data Structures', pdf: 'prog_ex9.pdf' },
            { title: 'Exercise 10: Final Project', pdf: 'prog_ex10.pdf' }
        */]
    },
    lab2: {
        title: 'Electronics Lab',
        icon: '🔌',
        exercises: [/*
            { title: 'Exercise 1: Basic Circuit Analysis', pdf: 'elec_ex1.pdf' },
            { title: 'Exercise 2: Ohm\'s Law Verification', pdf: 'elec_ex2.pdf' },
            { title: 'Exercise 3: Diode Characteristics', pdf: 'elec_ex3.pdf' },
            { title: 'Exercise 4: Transistor Amplifiers', pdf: 'elec_ex4.pdf' },
            { title: 'Exercise 5: Op-Amp Circuits', pdf: 'elec_ex5.pdf' },
            { title: 'Exercise 6: Digital Logic Gates', pdf: 'elec_ex6.pdf' },
            { title: 'Exercise 7: Flip-Flops and Counters', pdf: 'elec_ex7.pdf' },
            { title: 'Exercise 8: ADC and DAC', pdf: 'elec_ex8.pdf' },
            { title: 'Exercise 9: Microcontroller Programming', pdf: 'elec_ex9.pdf' },
            { title: 'Exercise 10: Final Circuit Project', pdf: 'elec_ex10.pdf' }
        */]
    },
    lab3: {
        title: 'Physics Lab',
        icon: '🔬',
        exercises: [
            /*{ title: 'Exercise 1: Pendulum Experiment', pdf: 'phys_ex1.pdf' },
            { title: 'Exercise 2: Velocity and Acceleration', pdf: 'phys_ex2.pdf' },
            { title: 'Exercise 3: Hooke\'s Law', pdf: 'phys_ex3.pdf' },
            { title: 'Exercise 4: Heat Transfer', pdf: 'phys_ex4.pdf' },
            { title: 'Exercise 5: Electric Circuits', pdf: 'phys_ex5.pdf' },
            { title: 'Exercise 6: Magnetic Fields', pdf: 'phys_ex6.pdf' },
            { title: 'Exercise 7: Optics and Lenses', pdf: 'phys_ex7.pdf' },
            { title: 'Exercise 8: Wave Properties', pdf: 'phys_ex8.pdf' },
            { title: 'Exercise 9: Radioactivity', pdf: 'phys_ex9.pdf' },
            { title: 'Exercise 10: Spectroscopy', pdf: 'phys_ex10.pdf' }
        */]
    },
    lab4: {
        title: 'Chemistry Lab',
        icon: '⚗️',
        exercises: [
           /* { title: 'Exercise 1: Acid-Base Titration', pdf: 'chem_ex1.pdf' },
            { title: 'Exercise 2: Crystallization', pdf: 'chem_ex2.pdf' },
            { title: 'Exercise 3: Distillation', pdf: 'chem_ex3.pdf' },
            { title: 'Exercise 4: Extraction Methods', pdf: 'chem_ex4.pdf' },
            { title: 'Exercise 5: Chromatography', pdf: 'chem_ex5.pdf' },
            { title: 'Exercise 6: Organic Synthesis', pdf: 'chem_ex6.pdf' },
            { title: 'Exercise 7: Spectral Analysis', pdf: 'chem_ex7.pdf' },
            { title: 'Exercise 8: Electrochemistry', pdf: 'chem_ex8.pdf' },
            { title: 'Exercise 9: Kinetics Study', pdf: 'chem_ex9.pdf' },
            { title: 'Exercise 10: Final Analysis', pdf: 'chem_ex10.pdf' }
       */ ]
    }
};

// Open course modal
function openCourse(courseId) {
    const course = courseData[courseId];
    if (!course) return;

    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.innerHTML = `${course.icon} ${course.title}`;
    
    // Add top-level View All PDFs button
    let content = `
        <div class="modal-top-actions">
            <button class="view-all-pdfs-btn" onclick="viewAllPDFs('${courseId}')">
                <span class="btn-icon">📚</span>
                <span class="btn-text">View All PDFs</span>
            </button>
        </div>
        <div class="units-box-container">`;
    
    course.units.forEach((unit, index) => {
        content += `
            <div class="unit-box" data-unit="${index}">
                <div class="unit-header">
                    <div class="unit-number-badge">Unit ${index + 1}</div>
                    <h3 class="unit-title">${unit.title}</h3>
                    <button class="unit-pdf-btn" onclick="viewPDF('${unit.pdf}')" title="View PDF">
                        <span class="btn-icon">📄</span>
                    </button>
                </div>
                <div class="unit-content">
                    <p class="unit-description">${unit.content}</p>
                </div>
                <div class="unit-footer">
                    <div class="unit-actions-box">
                        <button class="pdf-box-btn" onclick="viewPDF('${unit.pdf}')">
                            <span class="btn-icon">📄</span>
                            <span class="btn-text">View PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    content += '</div>';

    modalBody.innerHTML = content;
    modal.style.display = 'block';

    // Add 3D effects to unit boxes after they're created
    setTimeout(() => {
        const unitBoxes = modal.querySelectorAll('.unit-box');
        unitBoxes.forEach((box, index) => {
            // Initial entrance animation
            box.style.opacity = '0';
            box.style.transform = 'translateY(30px)';
            box.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            setTimeout(() => {
                box.style.opacity = '1';
                box.style.transform = 'translateY(0)';
            }, index * 100);

            // Add 3D mouse tracking
            box.addEventListener('mousemove', (e) => {
                const rect = box.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * -8;
                const rotateY = (x - centerX) / centerX * 8;
                
                box.style.transform = `
                    translateY(-5px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale(1.02)
                    perspective(800px)
                `;
            });

            box.addEventListener('mouseleave', () => {
                box.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }, 100);

    // Add box model styles for units
    const style = document.createElement('style');
    style.textContent = `
        .units-box-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 20px;
            max-height: 70vh;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        .unit-box {
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 0;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
        }
        
        .unit-box:hover {
            border-color: var(--primary-color);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
            transform: translateY(-2px);
        }
        
        .unit-header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .unit-number-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            backdrop-filter: blur(10px);
        }
        
        .unit-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            flex: 1;
        }
        
        .unit-content {
            padding: 20px;
            background: var(--bg-secondary);
        }
        
        .unit-description {
            margin: 0;
            color: var(--text-secondary);
            line-height: 1.6;
            font-size: 14px;
        }
        
        .unit-footer {
            padding: 15px 20px;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }
        
        .unit-actions-box {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .pdf-box-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
            justify-content: center;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
        
        .pdf-box-btn:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        
        .btn-icon {
            font-size: 16px;
        }
        
        .btn-text {
            font-weight: 500;
        }
        

        
        /* Box model variations for different units */
        .unit-box:nth-child(1) .unit-header {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .unit-box:nth-child(2) .unit-header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        
        .unit-box:nth-child(3) .unit-header {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .unit-box:nth-child(4) .unit-header {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        .unit-box:nth-child(5) .unit-header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        /* Responsive design for box model */
        @media (max-width: 768px) {
            .units-box-container {
                gap: 15px;
            }
            
            .unit-header {
                padding: 12px 15px;
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .unit-title {
                font-size: 16px;
            }
            
            .unit-content {
                padding: 15px;
            }
            
            .unit-footer {
                padding: 12px 15px;
            }
            
            .unit-actions-box {
                flex-direction: column;
                gap: 8px;
            }
            
            .pdf-box-btn {
                min-width: auto;
                padding: 12px 16px;
            }
        }
        
        /* Scrollbar styling for units container */
        .units-box-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .units-box-container::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 3px;
        }
        
        .units-box-container::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 3px;
        }
        
        .units-box-container::-webkit-scrollbar-thumb:hover {
            background: var(--secondary-color);
        }
    `;
    document.head.appendChild(style);
}

// Open lab modal
function openLab(labId) {
    const lab = labData[labId];
    if (!lab) return;

    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.innerHTML = `${lab.icon} ${lab.title}`;
    
    // Add top-level View All PDFs button
    let content = `
        <div class="modal-top-actions">
            <button class="view-all-pdfs-btn" onclick="viewAllLabPDFs('${labId}')">
                <span class="btn-icon">📚</span>
                <span class="btn-text">View All Exercise PDFs</span>
            </button>
        </div>
        <div class="exercises-box-container">`;
    
    lab.exercises.forEach((exercise, index) => {
        content += `
            <div class="exercise-box" data-exercise="${index}">
                <div class="exercise-header">
                    <div class="exercise-number-badge">Exercise ${index + 1}</div>
                    <h3 class="exercise-title">${exercise.title}</h3>
                    <button class="exercise-pdf-btn" onclick="viewPDF('${exercise.pdf}')" title="View PDF">
                        <span class="btn-icon">📄</span>
                    </button>
                </div>
                <div class="exercise-content">
                    <p class="exercise-description">Complete this practical exercise with detailed instructions and examples.</p>
                </div>
                <div class="exercise-footer">
                    <div class="exercise-actions-box">
                        <button class="pdf-box-btn" onclick="viewPDF('${exercise.pdf}')">
                            <span class="btn-icon">📄</span>
                            <span class="btn-text">View PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    content += '</div>';

    modalBody.innerHTML = content;
    modal.style.display = 'block';

    // Add 3D effects to exercise boxes after they're created
    setTimeout(() => {
        const exerciseBoxes = modal.querySelectorAll('.exercise-box');
        exerciseBoxes.forEach((box, index) => {
            // Initial entrance animation
            box.style.opacity = '0';
            box.style.transform = 'translateY(30px)';
            box.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            setTimeout(() => {
                box.style.opacity = '1';
                box.style.transform = 'translateY(0)';
            }, index * 80);

            // Add 3D mouse tracking
            box.addEventListener('mousemove', (e) => {
                const rect = box.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * -8;
                const rotateY = (x - centerX) / centerX * 8;
                
                box.style.transform = `
                    translateY(-5px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale(1.02)
                    perspective(800px)
                `;
            });

            box.addEventListener('mouseleave', () => {
                box.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }, 100);

    // Add box model styles for exercises
    const style = document.createElement('style');
    style.textContent = `
        .exercises-box-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
            max-height: 70vh;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        .exercise-box {
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 0;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
        }
        
        .exercise-box:hover {
            border-color: var(--accent-color);
            box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
            transform: translateY(-2px);
        }
        
        .exercise-header {
            background: linear-gradient(135deg, var(--accent-color), #0891b2);
            color: white;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .exercise-number-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            backdrop-filter: blur(10px);
        }
        
        .exercise-title {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            flex: 1;
        }
        
        .difficulty-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .difficulty-badge.easy {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .difficulty-badge.medium {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .difficulty-badge.hard {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .exercise-content {
            padding: 20px;
            background: var(--bg-secondary);
        }
        
        .exercise-description {
            margin: 0;
            color: var(--text-secondary);
            line-height: 1.6;
            font-size: 14px;
        }
        
        .exercise-footer {
            padding: 15px 20px;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
        }
        
        .exercise-actions-box {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .pdf-box-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
            justify-content: center;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
        
        .pdf-box-btn:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        

        
        /* Box model variations for different exercises */
        .exercise-box:nth-child(1) .exercise-header {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
        
        .exercise-box:nth-child(2) .exercise-header {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        .exercise-box:nth-child(3) .exercise-header {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
        }
        
        .exercise-box:nth-child(4) .exercise-header {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .exercise-box:nth-child(5) .exercise-header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .exercise-box:nth-child(6) .exercise-header {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .exercise-box:nth-child(7) .exercise-header {
            background: linear-gradient(135deg, #ec4899, #db2777);
        }
        
        .exercise-box:nth-child(8) .exercise-header {
            background: linear-gradient(135deg, #84cc16, #65a30d);
        }
        
        .exercise-box:nth-child(9) .exercise-header {
            background: linear-gradient(135deg, #f97316, #ea580c);
        }
        
        .exercise-box:nth-child(10) .exercise-header {
            background: linear-gradient(135deg, #6b7280, #4b5563);
        }
        
        /* Responsive design for exercise boxes */
        @media (max-width: 768px) {
            .exercises-box-container {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .exercise-header {
                padding: 12px 15px;
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .exercise-title {
                font-size: 14px;
            }
            
            .exercise-content {
                padding: 15px;
            }
            
            .exercise-footer {
                padding: 12px 15px;
            }
            
            .exercise-actions-box {
                flex-direction: column;
                gap: 8px;
            }
            
            .pdf-box-btn {
                min-width: auto;
                padding: 12px 16px;
            }
        }
        
        /* Scrollbar styling for exercises container */
        .exercises-box-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .exercises-box-container::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 3px;
        }
        
        .exercises-box-container::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 3px;
        }
        
        .exercises-box-container::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
}

// Close modal
function closeModal() {
    document.getElementById('courseModal').style.display = 'none';
}

// View PDF function
function viewPDF(filename) {
    // Create a modal for PDF viewing
    const pdfModal = document.createElement('div');
    pdfModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const pdfContent = document.createElement('div');
    pdfContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: pdfModalIn 0.3s ease-out;
    `;
    
    pdfContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 15px;">📄</div>
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">PDF Document</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">Opening: ${filename}</p>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="openPDFInNewTab('${filename}')" style="
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            ">🔗 Open in New Tab</button>
            <button onclick="closePDFModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    pdfModal.appendChild(pdfContent);
    document.body.appendChild(pdfModal);
    
    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes pdfModalIn {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
    `;
    document.head.appendChild(animationStyle);
    
    // Close modal when clicking outside
    pdfModal.addEventListener('click', function(e) {
        if (e.target === pdfModal) {
            closePDFModal();
        }
    });
    
    // Store reference for closing
    window.currentPDFModal = pdfModal;
}

// Open PDF in new tab
function openPDFInNewTab(filename) {
    // Construct the proper PDF URL
    let pdfUrl;
    
    // Check if filename already includes path
    if (filename.startsWith('pdfs/')) {
        pdfUrl = `./${filename}`;
    } else {
        pdfUrl = `./pdfs/${filename}`;
    }
    
    // Try to open the actual PDF file
    const newWindow = window.open(pdfUrl, '_blank');
    
    // If opening fails (popup blocked), show fallback
    if (!newWindow) {
        // Show notification that popup was blocked
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⚠️</span>
                <div style="font-size: 14px;">
                    <strong>Popup Blocked</strong><br>
                    <small>Please allow popups to view PDF</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // Alternative: try to navigate to PDF in same tab
        setTimeout(() => {
            if (confirm(`Would you like to open ${filename} in this tab instead?`)) {
                window.location.href = pdfUrl;
            }
        }, 1000);
    }
    
    closePDFModal();
}

// Close PDF modal
function closePDFModal() {
    if (window.currentPDFModal) {
        window.currentPDFModal.style.animation = 'fadeOut 0.3s ease-in forwards';
        
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
        
        setTimeout(() => {
            if (window.currentPDFModal && window.currentPDFModal.parentNode) {
                document.body.removeChild(window.currentPDFModal);
                window.currentPDFModal = null;
            }
        }, 300);
    }
}

// View all PDFs for a course
function viewAllPDFs(courseId) {
    const course = courseData[courseId];
    if (!course) return;
    
    // Create a modal for viewing all PDFs
    const allPDFModal = document.createElement('div');
    allPDFModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const allPDFContent = document.createElement('div');
    allPDFContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: modalSlideIn 0.3s ease-out;
    `;
    
    let pdfList = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 15px;">${course.icon}</div>
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">${course.title} - All PDFs</h3>
            <p style="color: var(--text-secondary);">Click any PDF to view in a new tab</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    course.units.forEach((unit, index) => {
        pdfList += `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: var(--bg-secondary); border-radius: 12px; transition: all 0.3s ease; cursor: pointer;" onclick="viewPDF('${unit.pdf}')">
                <div style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; min-width: 60px; text-align: center;">Unit ${index + 1}</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 16px;">${unit.title}</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${unit.pdf}</p>
                </div>
                <div style="font-size: 24px;">📄</div>
            </div>
        `;
    });
    
    pdfList += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="closeAllPDFModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    allPDFContent.innerHTML = pdfList;
    allPDFModal.appendChild(allPDFContent);
    document.body.appendChild(allPDFModal);
    
    // Close modal when clicking outside
    allPDFModal.addEventListener('click', function(e) {
        if (e.target === allPDFModal) {
            closeAllPDFModal();
        }
    });
    
    // Store reference for closing
    window.currentAllPDFModal = allPDFModal;
}

// View all PDFs for a lab
function viewAllLabPDFs(labId) {
    const lab = labData[labId];
    if (!lab) return;
    
    // Create a modal for viewing all lab PDFs
    const allPDFModal = document.createElement('div');
    allPDFModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const allPDFContent = document.createElement('div');
    allPDFContent.style.cssText = `
        background: var(--bg-card);
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: modalSlideIn 0.3s ease-out;
    `;
    
    let pdfList = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 15px;">${lab.icon}</div>
            <h3 style="color: var(--accent-color); margin-bottom: 10px;">${lab.title} - All Exercise PDFs</h3>
            <p style="color: var(--text-secondary);">Click any exercise PDF to view in a new tab</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    lab.exercises.forEach((exercise, index) => {
        pdfList += `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: var(--bg-secondary); border-radius: 12px; transition: all 0.3s ease; cursor: pointer;" onclick="viewPDF('${exercise.pdf}')">
                <div style="background: linear-gradient(135deg, var(--accent-color), #0891b2); color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; min-width: 80px; text-align: center; font-size: 12px;">Exercise ${index + 1}</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 16px;">${exercise.title}</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${exercise.pdf}</p>
                </div>
                <div style="font-size: 24px;">📄</div>
            </div>
        `;
    });
    
    pdfList += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="closeAllPDFModal()" style="
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
            ">✕ Close</button>
        </div>
    `;
    
    allPDFContent.innerHTML = pdfList;
    allPDFModal.appendChild(allPDFContent);
    document.body.appendChild(allPDFModal);
    
    // Close modal when clicking outside
    allPDFModal.addEventListener('click', function(e) {
        if (e.target === allPDFModal) {
            closeAllPDFModal();
        }
    });
    
    // Store reference for closing
    window.currentAllPDFModal = allPDFModal;
}

// Close all PDF modal
function closeAllPDFModal() {
    if (window.currentAllPDFModal) {
        window.currentAllPDFModal.style.animation = 'fadeOut 0.3s ease-in forwards';
        
        setTimeout(() => {
            if (window.currentAllPDFModal && window.currentAllPDFModal.parentNode) {
                document.body.removeChild(window.currentAllPDFModal);
                window.currentAllPDFModal = null;
            }
        }, 300);
    }
}

// View slides function
function viewSlides(courseId, unitIndex) {
    alert(`Opening slides for ${courseData[courseId].title} - ${courseData[courseId].units[unitIndex].title}\n\nNote: In a real implementation, this would display interactive slides.`);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('courseModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactive animations
function addInteractiveAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-animation');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });

    // Card hover effects
    document.querySelectorAll('.course-card, .lab-card, .code-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
        });
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', addInteractiveAnimations);

// Contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Simulate form submission
            alert(`Thank you, ${name}! Your message has been sent successfully.\nWe'll get back to you at ${email} soon.`);
            
            // Reset form
            this.reset();
        });
    }
});

// Add typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when home section is shown
function initializeTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && !heroTitle.classList.contains('typed')) {
        heroTitle.classList.add('typed');
        typeWriter(heroTitle, '🎓 Welcome to Semprepzie', 80);
    }
}

// Call typing effect when page loads
setTimeout(initializeTypingEffect, 2000);

// Create floating particles background
function createFloatingParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);
    
    // Create 50 particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Add stagger animation to course cards
function addStaggerAnimation() {
    const courseCards = document.querySelectorAll('.course-card, .lab-card, .code-card, .feature');
    courseCards.forEach((card, index) => {
        card.classList.add('stagger-item');
        card.style.animationDelay = (index * 0.1) + 's';
        
        // Add enhanced 3D mouse tracking effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -15;
            const rotateY = (x - centerX) / centerX * 15;
            
            card.style.transform = `
                translateY(-20px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale(1.05)
                perspective(1000px)
            `;
            
            // Add dynamic glow effect
            const glowIntensity = Math.sqrt(rotateX * rotateX + rotateY * rotateY) / 20;
            card.style.filter = `drop-shadow(0 0 ${glowIntensity * 20}px rgba(99, 102, 241, ${glowIntensity}))`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.filter = 'none';
        });
    });
}

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.classList.add('ripple');
        
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
    
    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add magnetic effect to cards
function addMagneticEffect() {
    const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
    cards.forEach(card => {
        // Mouse move for magnetic effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 20;
            const rotateY = (x / rect.width) * 20;
            
            card.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateZ(20px)
                scale(1.05)
            `;
        });
        
        // Mouse leave to reset
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
        });
        
        // Double click for flip effect
        card.addEventListener('dblclick', () => {
            card.classList.toggle('flipped');
            setTimeout(() => {
                card.classList.remove('flipped');
            }, 2000);
        });
        
        // Add holographic effect randomly
        if (Math.random() > 0.7) {
            setTimeout(() => {
                card.classList.add('holographic');
                setTimeout(() => {
                    card.classList.remove('holographic');
                }, 3000);
            }, Math.random() * 5000);
        }
        
        // Add 3D text effect
        const title = card.querySelector('h3');
        if (title) {
            title.setAttribute('data-text', title.textContent);
        }
    });
}

// Add parallax effect to course icons
function addIconParallax() {
    const icons = document.querySelectorAll('.course-icon, .lab-icon');
    
    icons.forEach(icon => {
        const card = icon.closest('.course-card, .lab-card, .code-card');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const moveX = (x / rect.width) * 10;
            const moveY = (y / rect.height) * 10;
            
            icon.style.transform = `
                translateX(${moveX}px) 
                translateY(${moveY}px) 
                rotateY(${moveX}deg)
                scale(1.1)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateX(0) translateY(0) rotateY(0deg) scale(1)';
        });
    });
}

// Add depth layers effect
function addDepthLayers() {
    const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
    
    cards.forEach(card => {
        // Create depth layers
        const layers = ['shallow', 'medium', 'deep'];
        const elements = card.querySelectorAll('h3, p, .course-icon, .lab-icon');
        
        elements.forEach((element, index) => {
            element.style.position = 'relative';
            element.style.zIndex = elements.length - index;
            element.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseenter', () => {
            elements.forEach((element, index) => {
                const depth = (elements.length - index) * 5;
                element.style.transform = `translateZ(${depth}px)`;
            });
        });
        
        card.addEventListener('mouseleave', () => {
            elements.forEach(element => {
                element.style.transform = 'translateZ(0px)';
            });
        });
    });
}

// Add course card tilt effect based on device orientation (mobile)
function addGyroscopeEffect() {
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
        window.addEventListener('deviceorientation', (e) => {
            const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
            const gamma = e.gamma; // left to right tilt (-90 to 90)
            const beta = e.beta;   // front to back tilt (-180 to 180)
            
            cards.forEach(card => {
                if (!card.matches(':hover')) {
                    const rotateX = (beta / 180) * 10;
                    const rotateY = (gamma / 90) * 10;
                    
                    card.style.transform = `
                        perspective(1000px) 
                        rotateX(${rotateX}deg) 
                        rotateY(${rotateY}deg)
                    `;
                }
            });
        });
    }
}

// Add particle explosion effect on click
function addParticleExplosion() {
    const cards = document.querySelectorAll('.course-card, .lab-card, .code-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Create particle explosion
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    left: ${centerX}px;
                    top: ${centerY}px;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (i / 20) * Math.PI * 2;
                const velocity = 100 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                let x = 0, y = 0, opacity = 1;
                
                const animate = () => {
                    x += vx * 0.02;
                    y += vy * 0.02 + 2; // gravity
                    opacity -= 0.02;
                    
                    particle.style.transform = `translate(${x}px, ${y}px)`;
                    particle.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        document.body.removeChild(particle);
                    }
                };
                
                animate();
            }
        });
    });
}

// Add random special effects
function addRandomEffects() {
    const cards = document.querySelectorAll('.course-card');
    
    setInterval(() => {
        if (Math.random() > 0.8) {
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            
            // Random effect selection
            const effects = ['energy-pulse', 'holographic', 'glitch'];
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            
            randomCard.classList.add(randomEffect);
            
            setTimeout(() => {
                randomCard.classList.remove(randomEffect);
            }, 2000);
        }
    }, 5000);
}

// Initialize all interactive effects
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addRippleEffect();
        addMagneticEffect();
        addIconParallax();
        addDepthLayers();
        addGyroscopeEffect();
        addParticleExplosion();
        addRandomEffects();
        // Removed init3DCursor() to remove stars cursor
    }, 6000);
});

// Add smooth page transitions
function addPageTransitions() {
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('onclick').match(/'(\w+)'/)[1];
            
            // Add loading overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            overlay.innerHTML = '<div style="color: white; font-size: 24px;">Loading...</div>';
            document.body.appendChild(overlay);
            
            // Fade in overlay
            setTimeout(() => overlay.style.opacity = '1', 10);
            
            // Switch section and remove overlay
            setTimeout(() => {
                showSection(targetSection);
                overlay.style.opacity = '0';
                setTimeout(() => document.body.removeChild(overlay), 300);
            }, 500);
        });
    });
}

// Smooth scroll to section function
function scrollToSection(sectionId) {
    // First make sure we're on the home page
    showSection('home');
    
    // Wait a moment for the section to show, then scroll
    setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, 100);
}

// Advanced 3D Effects for About and Contact sections
function init3DEffects() {
    // Mouse tracking for 3D tilt effects
    const sections = document.querySelectorAll('.home-about-section, .home-contact-section');
    
    sections.forEach(section => {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 5;
            const rotateY = (x / rect.width) * 5;
            
            section.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg)
                translateZ(10px)
            `;
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
    
    // Feature cards individual mouse tracking
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        feature.addEventListener('mousemove', (e) => {
            const rect = feature.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 15;
            const rotateY = (x / rect.width) * 15;
            
            feature.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg)
                translateZ(20px)
                scale(1.05)
            `;
        });
        
        feature.addEventListener('mouseleave', () => {
            feature.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
        });
    });
    
    // Contact items 3D tracking
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (y / rect.height) * 10;
            const rotateY = (x / rect.width) * 10;
            
            item.style.transform = `
                perspective(1000px) 
                rotateX(${-rotateX}deg) 
                rotateY(${rotateY}deg)
                translateZ(15px)
                translateX(10px)
                scale(1.02)
            `;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateX(0px) scale(1)';
        });
    });
}

// Scroll-based 3D parallax effects
function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const sections = document.querySelectorAll('.home-section-divider');
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrolled * speed);
            const rotateX = (rect.top / window.innerHeight) * 5;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                section.style.transform = `
                    perspective(1000px) 
                    translateY(${yPos}px) 
                    rotateX(${rotateX}deg)
                `;
            }
        });
        
        // Feature cards scroll animation
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            const rect = feature.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const progress = (window.innerHeight - rect.top) / window.innerHeight;
                const translateY = (1 - progress) * 50;
                const rotateX = progress * 5;
                const scale = 0.8 + (progress * 0.2);
                
                feature.style.transform = `
                    perspective(1000px) 
                    translateY(${translateY}px) 
                    rotateX(${rotateX}deg)
                    scale(${Math.min(scale, 1)})
                `;
            }
        });
    });
}

// Contact form 3D interaction
function initFormEffects() {
    const form = document.querySelector('.contact-form');
    const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    if (form) {
        // Form container tilt on focus
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                form.style.transform = 'perspective(1000px) rotateX(-2deg) translateY(-5px)';
            });
            
            input.addEventListener('blur', () => {
                form.style.transform = 'perspective(1000px) rotateX(0deg) translateY(0px)';
            });
        });
        
        // Button 3D press effect
        const button = form.querySelector('button');
        if (button) {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'perspective(1000px) translateY(2px) rotateX(5deg) scale(0.98)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = 'perspective(1000px) translateY(-3px) rotateX(0deg) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'perspective(1000px) translateY(0px) rotateX(0deg) scale(1)';
            });
        }
    }
}

// Intersection Observer for entrance animations
function initIntersectionAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Staggered animation for child elements
                const children = entry.target.querySelectorAll('.feature, .contact-item');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.animation = `slideInUp 0.6s ease-out forwards`;
                        child.style.animationDelay = `${index * 0.1}s`;
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('.home-about-section, .home-contact-section').forEach(section => {
        observer.observe(section);
    });
}

// Initialize all 3D effects
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        init3DEffects();
        initScrollEffects();
        initFormEffects();
        initIntersectionAnimations();
    }, 1000);
});
