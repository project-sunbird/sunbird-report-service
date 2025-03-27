const { Storage } = require('@google-cloud/storage');
const _ = require('lodash');
const { envVariables } = require('./envHelpers');
const { GCLOUD: { project_id, bucket_name, client_email, private_key, signed_url_expiry } } = envVariables;

const storage = new Storage({
    projectId: project_id,
    credentials: {
        client_email: client_email,
        private_key: private_key
    }
});

const getBlobReadStream = ({ container = bucket_name, filePath }) => {
    return new Promise((resolve, reject) => {
        try {
            const bucket = storage.bucket(container);
            const file = bucket.file(filePath);
            resolve(file.createReadStream());
        } catch (error) {
            reject(error);
        }
    });
}

const checkIfBlobExists = ({ container = bucket_name, filePath }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bucket = storage.bucket(container);
            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            
            if (!exists) {
                reject({
                    exists: false,
                    error: new Error('Blob does not exist')
                });
                return;
            }
            
            const [metadata] = await file.getMetadata();
            resolve({
                exists: true,
                lastModified: metadata ? metadata.updated : null
            });
        } catch (error) {
            reject({
                exists: false,
                error
            });
        }
    });
}

const getSharedAccessSignature = ({ container = bucket_name, filePath, headers = {}, expiryTime = signed_url_expiry }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bucket = storage.bucket(container);
            const file = bucket.file(filePath);
            
            // First check if file exists
            const [exists] = await file.exists();
            if (!exists) {
                reject(new Error('File does not exist'));
                return;
            }

            const options = {
                version: 'v4',
                action: 'read',
                expires: Date.now() + (expiryTime * 60 * 1000) // Convert minutes to milliseconds
            };

            if (headers && 'filename' in headers && 'content-disposition' in headers && headers['content-disposition'] === 'attachment') {
                options.responseDisposition = `attachment;filename=${headers.filename}`;
            }

            const [signedUrl] = await file.getSignedUrl(options);
            const startDate = new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + expiryTime);

            resolve({ 
                sasUrl: signedUrl, 
                expiresAt: Date.parse(expiryDate), 
                startDate 
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { getBlobReadStream, getSharedAccessSignature, checkIfBlobExists };
