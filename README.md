# sunbird-report-service

Repository: https://github.com/project-sunbird/sunbird-report-service

## Development Setup

### Prerequisites
- Node.js v22.15
- PostgreSQL database

### Local Development
To set up the project locally:

1. Fork the repository on GitHub

2. Clone your fork:
```bash
git clone https://github.com/your-username/sunbird-report-service.git
cd sunbird-report-service
```

3. Install dependencies:
```bash
npm i
```

4. Configure PostgreSQL:
   - Configure the database settings
   - Refer to [config/config.json](config/config.json) for database configuration details

5. Create database tables using the SQL commands in [resources/queries.sql](resources/queries.sql)

6. Start the service:
```bash
npm start
```

The service will be available at `http://localhost:3030`

### Code Quality

The project maintains code quality through automated checks that run on every pull request:

1. **Linting**
   - ESLint for code style and quality
   - Command: `npm run lint`

2. **Dependencies**
   - Uses `npm ci` for deterministic installations
   - GitHub Actions cache for faster builds

3. **Code Formatting**
   - Ensures consistent code formatting
   - Can be automatically fixed using `npm run lint:fix`

These checks ensure consistent code style and secure dependency management.

## Container Image Publishing

This repository uses GitHub Actions to automatically build and publish Docker container images to GitHub Container Registry (GHCR) whenever a new tag is pushed to the repository.

### Build and Publish Workflow

The workflow is triggered on:
- creation of any tag

Key features of the workflow:
1. Automatically builds Docker images
2. Tags images with a combination of:
   - The tag name (lowercased)
   - Short commit hash
   - GitHub run number
3. Publishes images to `ghcr.io` using the repository name
4. Uses GitHub Actions for secure authentication to GHCR

### Image Naming Convention
The Docker images follow this naming convention:
- Repository: `ghcr.io/${OWNER_NAME}/${REPO_NAME_LOWERCASE}`
- Tag: `${TAG_NAME}_${COMMIT_HASH}_${RUN_NUMBER}`

For example, if you push a tag `v1.0.0` on commit `abc123`, the resulting image would be:
```
ghcr.io/project-sunbird/sunbird-report-service:v1.0.0_abc123_1
```
