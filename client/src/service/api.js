import axios from 'axios';

import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config'

const API_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000, 
    headers: {
        "content-type": "application/json"
    }
});

// Request interceptor: runs before every API call
axiosInstance.interceptors.request.use(
    function(config) {

        // Check if request has query params (e.g. ?page=2)
        if (config.TYPE?.params) {
            config.params = config.TYPE.params;
        }

        // Check if request has URL param (e.g. /posts/123)
        else if (config.TYPE?.query) {
            config.url = config.url + '/' + config.TYPE.query;
        }

        // Return modified request config
        return config;
    },

    // Handle request errors
    function(error) {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function(response) {
        // Stop global loader here
        return processResponse(response);
    },
    function(error) {
        // Stop global loader here
        return Promise.reject(ProcessError(error));
    }
)


const processResponse = (response) => {
    if (response?.status === 200) {
        return { isSuccess: true, data: response.data }
    } else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        }
    }
}


const ProcessError = async (error) => {
    if (error.response) {
        console.log("ERROR IN RESPONSE: ", error);
            return {
                isError: true,
                msg: API_NOTIFICATION_MESSAGES.responseFailure,
                code: error.response.status
            }
    }
    else if(error.request){
        console.log("ERROR IN REquest: ", error);
            return {
                isError: true,
                msg: API_NOTIFICATION_MESSAGES.responseFailure,
                code: ""
            }
        
    }
    else {
        console.log("ERROR IN network: ", error);
            return {
                isError: true,
                msg: API_NOTIFICATION_MESSAGES.responseFailure,
                code: ""
            }
    }

}    

const API = {};
for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) =>
        axiosInstance({
            method: value.method,
            url: value.url,
            data: value.method === 'DELETE' ? '' : body,
            responseType: value.responseType,
            // headers: {
            //     authorization: getAccessToken(),
            // },
            // TYPE: getType(value, body),
            onUploadProgress: function(progressEvent) {
                if (showUploadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showUploadProgress(percentCompleted);
                }
            },
            onDownloadProgress: function(progressEvent) {
                if (showDownloadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showDownloadProgress(percentCompleted);
                }
            }
        });
}

export { API };



// API request sent
//       ↓
// Backend responds
//       ↓
// Interceptor runs
//       ↓
// Success → processResponse()
// Error → ProcessError()
//       ↓
// React receives clean result