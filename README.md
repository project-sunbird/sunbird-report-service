# sunbird-report-service

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