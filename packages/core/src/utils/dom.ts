/**
 * DOM manipulation utilities for Niko Bathrooms PIM
 */

/**
 * Safely query a single element
 */
export function querySelector<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): T | null {
  return context.querySelector<T>(selector);
}

/**
 * Safely query multiple elements
 */
export function querySelectorAll<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): NodeListOf<T> {
  return context.querySelectorAll<T>(selector);
}

/**
 * Add event listener with automatic cleanup
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(type, listener, options);
  return () => element.removeEventListener(type, listener, options as boolean);
}

/**
 * Toggle CSS class with optional condition
 */
export function toggleClass(
  element: Element,
  className: string,
  condition?: boolean
): void {
  if (condition !== undefined) {
    element.classList.toggle(className, condition);
  } else {
    element.classList.toggle(className);
  }
}

/**
 * Create element with attributes and content
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes: Record<string, string> = {},
  content?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className' || key === 'class') {
      element.className = value;
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else {
      (element as any)[key] = value;
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
export function waitForElement<T extends Element = Element>(
  selector: string,
  timeout = 5000,
  context: Document | Element = document
): Promise<T | null> {
  return new Promise(resolve => {
    const element = context.querySelector<T>(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = context.querySelector<T>(selector);
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
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(
  element: Element,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
): void {
  element.scrollIntoView(options);
}