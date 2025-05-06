// Utilities
// This file contains helper functions and utilities used across the application

// Helper function to recursively find a text property in an object
function findTextInObject(obj, depth = 0, maxDepth = 5) {
    // Prevent infinite recursion
    if (depth > maxDepth) return null;
    
    // Handle null/undefined
    if (!obj) return null;
    
    // If it's not an object, return null
    if (typeof obj !== 'object') return null;
    
    // Try to find a text property directly
    if ('text' in obj && typeof obj.text === 'string') {
        return obj.text;
    }
    
    // Recursively search through all properties
    for (const key in obj) {
        if (key === 'text' && typeof obj[key] === 'string') {
            return obj[key];
        }
        
        if (typeof obj[key] === 'object') {
            const found = findTextInObject(obj[key], depth + 1, maxDepth);
            if (found) return found;
        }
    }
    
    return null;
}

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export utility functions
export {
    findTextInObject,
    debounce
};
