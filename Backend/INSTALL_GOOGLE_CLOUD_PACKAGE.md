# Dependencies to Install

To complete the Google Cloud Logging integration, add the following package to your Backend package.json:

## Installation Command

Run this command in your Backend directory:

```bash
npm install @google-cloud/logging-winston
```

## Manual Installation

Or manually add to `package.json` under dependencies:

```json
{
  "dependencies": {
    "@google-cloud/logging-winston": "^5.0.0"
  }
}
```

Then run:
```bash
npm install
```

## What This Package Does

- `@google-cloud/logging-winston`: Integrates Google Cloud Logging with Winston logger
  - Automatically sends all logs to Google Cloud Logging
  - Maintains local file logging as fallback
  - Works in development and production
  - Handles authentication with Google Cloud credentials

## Already Installed Dependencies

Your project already has:
- `winston`: For structured logging (^3.x.x)
- `convex`: Backend framework

## Verify Installation

After installation, verify with:

```bash
npm ls @google-cloud/logging-winston
```

You should see output like:
```
├── @google-cloud/logging-winston@5.0.0
```

## Note on Google Cloud Credentials

The `@google-cloud/logging-winston` package will automatically use:
1. `GOOGLE_APPLICATION_CREDENTIALS` environment variable (if set)
2. Application Default Credentials
3. Google Cloud service account credentials

See `GOOGLE_CLOUD_LOGGING_SETUP.md` for credential setup instructions.
