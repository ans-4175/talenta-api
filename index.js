// Using native Node.js fetch and FormData (available in Node.js 18+)

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

module.exports = {
  clockIn,
  clockOut,
};
