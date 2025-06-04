/**
 * Authentication helper functions for Talenta API
 */

/**
 * Extract authenticity token from login page
 * @param {string} html - HTML content of the login page
 * @returns {string|null} - The authenticity token or null if not found
 */
const extractAuthenticityToken = (html) => {
  const tokenMatches = [
    html.match(/name="authenticity_token" value="([^"]+)"/),
    html.match(/<input[^>]*name="authenticity_token"[^>]*value="([^"]+)"/),
    html.match(/authenticity_token[^"]*"([^"]+)"/),
  ];
  
  for (const match of tokenMatches) {
    if (match) return match[1];
  }
  
  return null;
};

/**
 * Extract cookies from response headers
 * @param {Headers} headers - Response headers
 * @returns {string} - Formatted cookie string
 */
const extractCookies = (headers) => {
  const setCookies = headers.get('set-cookie');
  if (!setCookies) return '';
  
  const cookies = setCookies.split(',').map(cookie => {
    return cookie.trim().split(';')[0];
  }).join('; ');
  
  return cookies;
};

module.exports = {
  extractAuthenticityToken,
  extractCookies,
};