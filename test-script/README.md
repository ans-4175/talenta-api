# Test Scripts

This directory contains test scripts for the Talenta API.

## Available Tests

### test-fix.js
Test script to verify the signature fix and API functionality.

**Usage:**
```bash
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

## Running Tests

From the project root directory:

```bash
# Run the signature fix test
node test-script/test-fix.js
```

## Adding New Tests

When adding new test scripts:
1. Place them in this `test-script/` directory
2. Use descriptive names (e.g., `test-scheduler.js`, `test-auth.js`)
3. Include proper documentation and usage instructions
4. Update this README with information about new tests