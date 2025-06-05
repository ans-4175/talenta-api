# Test Scripts

This directory contains test scripts for the Talenta API.

## Available Tests

### test-unit.js
Unit tests for the fetchCookies functionality and helper functions.

**Usage:**
```bash
npm run test-unit
# or
node test-script/test-unit.js
```

**Description:**
- Tests authenticity token extraction
- Tests cookie parsing functionality
- Validates module exports
- No external dependencies or network calls

### test-fix.js
Test script to verify the signature fix and API functionality.

**Usage:**
```bash
npm run test-fix
# or
node test-script/test-fix.js
```

**Description:**
- Tests the enhanced API with CSRF token support
- Validates configuration setup
- Performs clock-in test with enhanced error handling
- Provides detailed diagnostics for signature-related issues

**Requirements:**
- Valid config.js file with required fields (cookiesTalenta, latitude, longitude)
- Active Talenta account cookies

### test-fetch-cookies.js
Interactive test for the automatic cookie fetching functionality.

**Usage:**
```bash
npm run test-fetch-cookies
# or
node test-script/test-fetch-cookies.js
```

**Description:**
- Tests the new fetchCookies function with real credentials
- Interactive - prompts for email and password
- Tests integration with existing clockIn function
- Provides comprehensive error diagnostics

**Requirements:**
- Valid Talenta account credentials
- Interactive terminal for password input

## Running Tests

From the project root directory:

### Individual Tests
```bash
# Run unit tests (automated)
npm run test-unit

# Run API fix test (requires config.js)
npm run test-fix

# Run cookie fetching test (interactive)
npm run test-fetch-cookies
```

### Batch Tests
```bash
# Run all tests (includes interactive test-fetch-cookies)
npm run test-all

# Run only automated tests (non-interactive)
npm run test-automated
```

## Adding New Tests

When adding new test scripts:
1. Place them in this `test-script/` directory
2. Use descriptive names (e.g., `test-scheduler.js`, `test-auth.js`)
3. Follow the `test-*` naming pattern for inclusion in batch scripts
4. Add corresponding npm scripts in package.json
5. Include proper documentation and usage instructions
6. Update this README with information about new tests

## Notes

- **test-all**: Runs all tests, including interactive ones. Be prepared to provide input for test-fetch-cookies.
- **test-automated**: Runs only non-interactive tests, suitable for CI/CD or automated environments.
- Some tests require configuration files or network access to function properly.