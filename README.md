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
   - Create a database named `root`
   - Set username to `root`
   - Set password to `root`
   - Ensure PostgreSQL is running on localhost

5. Create database tables using the SQL commands in [resources/queries.sql](resources/queries.sql)

6. Run lint checks:
```bash
npm run lint
```

7. Fix linting errors:
```bash
npm run lint:fix
```

8. Start the service:
```bash
npm start
```

The service will be available at `http://localhost:3030`

### Code Quality
The repository has automated code quality checks that run on every pull request. These checks include:

1. **Linting**
   - Uses ESLint for code style and quality checks
   - Command: `npm run lint`
   - Enforces consistent code style and catches potential errors

2. **Dependency Management**
   - Uses `npm ci` for deterministic dependency installation
   - Ensures consistent dependency tree across all environments
   - Verifies package-lock.json integrity

3. **Node Modules Caching**
   - Uses GitHub Actions cache to speed up builds
   - Cache key is based on package-lock.json hash
   - Cache is restored if package-lock.json hasn't changed
   - Cache is saved if a new installation is required

4. **Code Formatting**
   - Ensures consistent code formatting
   - Can be automatically fixed using `npm run lint:fix`

The checks are configured to run on all branches and are enforced before merging any pull requests. The workflow uses GitHub Actions with the following key features:

- Uses Node.js v22.15
- Caches node_modules to speed up subsequent builds
- Uses npm ci for deterministic installations
- Runs lint checks to ensure code quality

## Database Configuration
The service uses PostgreSQL with the following configuration:
- Host: localhost (127.0.0.1)
- Database: root
- Username: root
- Password: root
- Port: 5432 (default PostgreSQL port)

For production environments, database configuration can be overridden using environment variables as specified in [envHelpers.js](helpers/envHelpers.js).

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
3. Publishes images to `ghcr.io` using the repository name (lowercased)
4. Uses GitHub Actions for secure authentication to GHCR

### Image Naming Convention
The Docker images follow this naming convention:
- Repository: `ghcr.io/${REPO_NAME_LOWERCASE}`
- Tag: `${TAG_NAME}_${COMMIT_HASH}_${RUN_NUMBER}`

For example, if you push a tag `v1.0.0` on commit `abc123`, the resulting image would be:
```
ghcr.io/sunbird-report-service:v1.0.0_abc123_1
```

### Security
- Uses GitHub's built-in authentication system
- Requires `GITHUB_TOKEN` for registry access
- Has read-only access to repository contents
- Has write access to packages (for publishing)

### Environment Variables

For a complete list of available environment variables and their default values, please refer to the [envHelpers.js](helpers/envHelpers.js) file. 

You can configure these variables while creating the container:
1. By passing them directly when creating the container (as shown in the usage example below)

### Usage
To use the published container image:

1. First create a network:
```bash
docker network create sunbird-network
```

2. Create and run a PostgreSQL container in the same network:
```bash
docker run --name sunbird-postgres \
  --network sunbird-network \
  -e POSTGRES_USER=root \
  -e POSTGRES_PASSWORD=root \
  -e POSTGRES_DB=root \
  -p 5432:5432 \
  postgres:latest
```

3. Run the report service container in the same network:
```bash
docker run --name sunbird-report-service \
  --network sunbird-network \
  -e SUNBIRD_REPORTS_DB_HOST=sunbird-postgres \
  -e SUNBIRD_REPORTS_DB_NAME=root \
  -e SUNBIRD_REPORTS_DB_PASSWORD=root \
  -e SUNBIRD_REPORTS_DB_PORT=5432 \
  -e SUNBIRD_REPORTS_DB_USER=root \
  -e SUNBIRD_SERVER_PORT=3030 \
  -e sunbird_azure_report_container_name='your-container-name' \
  -e sunbird_azure_account_name='your-account-name' \
  -e sunbird_azure_account_key='your-account-key' \
  -e sunbird_azure_sas_expiry_in_minutes='your-sas-expiry-in-minutes' \
  ghcr.io/sunbird-report-service:${TAG_NAME}
```

Important notes:
1. The `SUNBIRD_REPORTS_DB_HOST` should be set to the name of your PostgreSQL container (`sunbird-postgres` in this example)
2. The database credentials (`SUNBIRD_REPORTS_DB_NAME`, `SUNBIRD_REPORTS_DB_PASSWORD`, etc.) should match what was configured in the PostgreSQL container
3. Both containers must be in the same network (`sunbird-network` in this example) for them to communicate
4. The service will be available on port 3030 by default