// Using native Node.js fetch and FormData (available in Node.js 18+)
const { extractAuthenticityToken, extractCookies } = require('./lib/auth-helpers');

// ROT13 encoding function to replace string-codec
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, function(char) {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(start + (char.charCodeAt(0) - start + 13) % 26);
  });
}

// Encoding function to replace string-codec encoder
function encoder(value, encoding) {
  if (encoding === 'base64') {
    return Buffer.from(value).toString('base64');
  } else if (encoding === 'rot13') {
    return rot13(value);
  }
  return value;
}

const getCsrfToken = async (cookies) => {
  try {
    const response = await fetch("https://hr.talenta.co/live-attendance", {
      headers: {
        Cookie: cookies,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Look for CSRF token in common patterns
    const html = await response.text();
    const csrfMatches = [
      html.match(/name="csrf-token" content="([^"]+)"/),
      html.match(/name="_token" content="([^"]+)"/),
      html.match(/window\.Laravel\.csrfToken = "([^"]+)"/),
      html.match(/<meta name="csrf-token" content="([^"]+)"/),
    ];
    
    for (const match of csrfMatches) {
      if (match) return match[1];
    }
    
    return null;
  } catch (error) {
    console.warn("Could not fetch CSRF token:", error.message);
    return null;
  }
};

const prepForm = async (obj) => {
  const { long, lat, desc, cookies, isCheckOut = false } = obj;
  const data = new FormData();
  const status = isCheckOut ? "checkout" : "checkin";

  const longEncoded = encoder(encoder(long, "base64"), "rot13");
  const latEncoded = encoder(encoder(lat, "base64"), "rot13");

  data.append("longitude", longEncoded);
  data.append("latitude", latEncoded);
  data.append("status", status);
  data.append("description", desc);

  // Try to get CSRF token
  const csrfToken = await getCsrfToken(cookies);
  if (csrfToken) {
    data.append("_token", csrfToken);
  }

  const headers = {
    Cookie: cookies,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Referer": "https://hr.talenta.co/live-attendance",
    "Origin": "https://hr.talenta.co",
    "X-Requested-With": "XMLHttpRequest",
  };

  // Add CSRF token to headers if available
  if (csrfToken) {
    headers["X-CSRF-TOKEN"] = csrfToken;
  }

  const config = {
    method: "POST",
    url: "https://hr.talenta.co/api/web/live-attendance/request",
    headers: headers,
    body: data,
  };

  return config;
};

const attendancePost = async (obj) => {
  const config = await prepForm(obj);
  
  const response = await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: config.body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorText
    };
    
    // Try to parse as JSON if possible
    try {
      error.response.data = JSON.parse(errorText);
    } catch (e) {
      // Keep as text if not valid JSON
    }
    
    throw error;
  }

  const responseText = await response.text();
  
  // Try to parse as JSON, fallback to text
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return responseText;
  }
};

const clockIn = async (obj) => {
  return await attendancePost({ ...obj, isCheckOut: false });
};

const clockOut = async (obj) => {
  return await attendancePost({ ...obj, isCheckOut: true });
};

/**
 * Fetch cookies automatically using username and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} - Cookie string for use with clockIn/clockOut
 */
const fetchCookies = async (email, password) => {
  try {
    // Step 1: Get login page and extract authenticity token
    console.log('🔐 Starting authentication process...');
    
    const loginPageUrl = 'https://account.mekari.com/users/sign_in?app_referer=Talenta';
    const loginPageResponse = await fetch(loginPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });
    
    if (!loginPageResponse.ok) {
      throw new Error(`Failed to load login page: ${loginPageResponse.status}`);
    }
    
    const loginPageHtml = await loginPageResponse.text();
    const authenticityToken = extractAuthenticityToken(loginPageHtml);
    
    if (!authenticityToken) {
      throw new Error('Could not extract authenticity token from login page');
    }
    
    const mekariCookie = extractCookies(loginPageResponse.headers);
    console.log('✅ Successfully extracted authenticity token');
    
    // Step 2: Submit login form
    console.log('🔑 Submitting login credentials...');
    
    const formData = new FormData();
    formData.append('utf8', '✓');
    formData.append('authenticity_token', authenticityToken);
    formData.append('user[email]', email);
    formData.append('no-captcha-token', '');
    formData.append('user[password]', password);
    
    const loginResponse = await fetch(loginPageUrl, {
      method: 'POST',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': mekariCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': loginPageUrl,
        'Origin': 'https://account.mekari.com',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      body: formData,
      redirect: 'manual', // Handle redirects manually
    });
    
    // Check for successful login (should get 302 redirect)
    if (loginResponse.status !== 302) {
      const errorText = await loginResponse.text();
      if (errorText.includes('Invalid email or password')) {
        throw new Error('Invalid email or password');
      }
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginCookies = extractCookies(loginResponse.headers);
    console.log('✅ Login successful');
    
    // Step 3: Get authorization code
    console.log('🔗 Getting authorization code...');
    
    const authUrl = 'https://account.mekari.com/auth?client_id=TAL-73645&response_type=code&scope=sso:profile';
    const authResponse = await fetch(authUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': `${mekariCookie}; ${loginCookies}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': loginPageUrl,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'manual',
    });
    
    if (authResponse.status !== 302) {
      throw new Error(`Authorization failed: ${authResponse.status} ${authResponse.statusText}`);
    }
    
    const locationHeader = authResponse.headers.get('location');
    if (!locationHeader || !locationHeader.includes('hr.talenta.co/sso-callback')) {
      throw new Error('Invalid authorization redirect');
    }
    
    console.log('✅ Authorization successful');
    
    // Step 4: Follow redirect to get final cookies
    console.log('🍪 Getting final session cookies...');
    
    const finalResponse = await fetch(locationHeader, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'manual',
    });
    
    const finalCookies = extractCookies(finalResponse.headers);
    
    if (!finalCookies) {
      throw new Error('Failed to get session cookies from Talenta');
    }
    
    console.log('✅ Successfully obtained session cookies');
    
    // Extract PHPSESSID or _identity cookie specifically
    const cookieMatch = finalCookies.match(/(?:PHPSESSID|_identity)=[^;]+/);
    if (cookieMatch) {
      return cookieMatch[0];
    }
    
    // If no specific cookie found, return all cookies
    return finalCookies;
    
  } catch (error) {
    console.error('❌ Cookie fetching failed:', error.message);
    throw error;
  }
};

module.exports = {
  clockIn,
  clockOut,
  fetchCookies,
};
