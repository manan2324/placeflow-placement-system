/**
 * Utility functions for consistent date and time formatting across the application
 */

/**
 * Format a date to display in Indian locale with date and time
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "15 Feb 2026, 6:00 PM")
 */
export function formatDateTime(date) {
  if (!date) return "—";
  
  try {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "—";
  }
}

/**
 * Format a date to display only the date (no time)
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "15 Feb 2026")
 */
export function formatDate(date) {
  if (!date) return "—";
  
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "—";
  }
}

/**
 * Format a date to a short format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "15/02/2026")
 */
export function formatDateShort(date) {
  if (!date) return "—";
  
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "—";
  }
}

/**
 * Format time only
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted time string (e.g., "6:00 PM")
 */
export function formatTime(date) {
  if (!date) return "—";
  
  try {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return "—";
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return "—";
  
  try {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now - then) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    }
    
    if (diffInDays < 365) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return "—";
  }
}
