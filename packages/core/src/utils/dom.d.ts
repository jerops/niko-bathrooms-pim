/**
 * DOM manipulation utilities for Niko Bathrooms PIM
 */
/**
 * Safely query a single element
 */
export declare function querySelector<T extends Element = Element>(selector: string, context?: Document | Element): T | null;
/**
 * Safely query multiple elements
 */
export declare function querySelectorAll<T extends Element = Element>(selector: string, context?: Document | Element): NodeListOf<T>;
/**
 * Add event listener with automatic cleanup
 */
export declare function addEventListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: (event: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): () => void;
/**
 * Toggle CSS class with optional condition
 */
export declare function toggleClass(element: Element, className: string, condition?: boolean): void;
/**
 * Create element with attributes and content
 */
export declare function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, attributes?: Record<string, string>, content?: string): HTMLElementTagNameMap[K];
/**
 * Wait for element to appear in DOM
 */
export declare function waitForElement<T extends Element = Element>(selector: string, timeout?: number, context?: Document | Element): Promise<T | null>;
/**
 * Check if element is visible in viewport
 */
export declare function isElementInViewport(element: Element): boolean;
/**
 * Smooth scroll to element
 */
export declare function scrollToElement(element: Element, options?: ScrollIntoViewOptions): void;
//# sourceMappingURL=dom.d.ts.map