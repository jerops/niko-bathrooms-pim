/**
 * DOM manipulation utilities for Niko Bathrooms PIM
 */
/**
 * Safely query a single element
 */
export function querySelector(selector, context = document) {
    return context.querySelector(selector);
}
/**
 * Safely query multiple elements
 */
export function querySelectorAll(selector, context = document) {
    return context.querySelectorAll(selector);
}
/**
 * Add event listener with automatic cleanup
 */
export function addEventListener(element, type, listener, options) {
    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener, options);
}
/**
 * Toggle CSS class with optional condition
 */
export function toggleClass(element, className, condition) {
    if (condition !== undefined) {
        element.classList.toggle(className, condition);
    }
    else {
        element.classList.toggle(className);
    }
}
/**
 * Create element with attributes and content
 */
export function createElement(tagName, attributes = {}, content) {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className' || key === 'class') {
            element.className = value;
        }
        else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        }
        else {
            element[key] = value;
        }
    });
    if (content) {
        element.textContent = content;
    }
    return element;
}
/**
 * Wait for element to appear in DOM
 */
export function waitForElement(selector, timeout = 5000, context = document) {
    return new Promise(resolve => {
        const element = context.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        const observer = new MutationObserver(() => {
            const element = context.querySelector(selector);
            if (element) {
                observer.disconnect();
                clearTimeout(timer);
                resolve(element);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        const timer = setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}
/**
 * Check if element is visible in viewport
 */
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
}
/**
 * Smooth scroll to element
 */
export function scrollToElement(element, options = { behavior: 'smooth', block: 'center' }) {
    element.scrollIntoView(options);
}
//# sourceMappingURL=dom.js.map