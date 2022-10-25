import {debugMode} from "../config";

export function getErrorMessage(error) {
    let errorMsg;
    if (error.response) {
        errorMsg = error.response.data.message;
        if (debugMode) errorMsg += ' (' + error.response.data.error + ')';
    } else {
        errorMsg = '网络错误';
        if (debugMode) errorMsg += ' (' + error.message + ')';
    }
    return errorMsg;
}