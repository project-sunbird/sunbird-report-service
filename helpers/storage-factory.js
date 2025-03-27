const { envVariables } = require('./envHelpers');

const getStorageProvider = () => {
    const provider = envVariables.sunbird_cloud_storage_provider || 'azure'; // default to azure for backward compatibility
    
    switch (provider.toLowerCase()) {
        case 'gcloud':
            return require('./gcp-storage');
        case 'azure':
        default:
            return require('./azure-storage');
    }
}

module.exports = getStorageProvider();
