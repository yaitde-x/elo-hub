'use strict';

var https = require('https');

const USER_DEVICES = [
    {
        applianceId: 'whiteboard',
        manufacturerName: 'ELO Home',
        modelName: 'Whiteboard',
        version: '1.0',
        friendlyName: 'Whiteboard',
        friendlyDescription: "sakamoto's whiteboard",
        isReachable: true,
        actions: ['turnOn', 'turnOff', 'setPercentage', 'incrementPercentage', 'decrementPercentage'],
        
        additionalApplianceDetails: {
        }
    }, {
        applianceId: 'kitchen',
        manufacturerName: 'ELO Home',
        modelName: 'Kitchen',
        version: '1.0',
        friendlyName: 'Kitchen',
        friendlyDescription: "Kitchen mood lighting",
        isReachable: true,
        actions: ['turnOn', 'turnOff', 'setPercentage', 'incrementPercentage', 'decrementPercentage'],
        
        additionalApplianceDetails: {
        }
    },{
        applianceId: 'sidetable',
        manufacturerName: 'ELO Home',
        modelName: 'SideTable',
        version: '1.0',
        friendlyName: 'Side Table',
        friendlyDescription: "Side table",
        isReachable: true,
        actions: ['turnOn', 'turnOff', 'setPercentage', 'incrementPercentage', 'decrementPercentage'],
        
        additionalApplianceDetails: {
        }
    }
];

/**
 * Utility functions
 */

function log(title, msg) {
    console.log(`[${title}] ${msg}`);
}

function deviceIdToAddress(deviceId) {
    if (deviceId === 'whiteboard')
        return '192.168.1.136:8088';
    else if (deviceId === 'sidetable')
        return '192.168.1.70:88';
    else if (deviceId === 'kitchen')
        return '192.168.1.114:8088';
}

function makeDeviceRequest(url, devicePayload, message, callback) {
    
    // Options and headers for the HTTP request   
    var data = { 
            deviceAddress: encodeURIComponent(url)
            , payload: devicePayload
    };
            
    var payload = JSON.stringify(data);
    
    var options = {
        host: '<#scrubbed#>',
        port: 443,
        path: '/api/relay',
        method: 'POST',
        headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                 }
    };
    
    // Setup the HTTP request
    var req = https.request(options, function (res) {

        res.setEncoding('utf-8');
              
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        
        res.on('end', function () {
            log('DEBUG', 'Twilio Response: ' + responseString);
            callback(null, generateResponse(message, {}));
        });
    });
    
    req.on('error', function (e) {
        log('ERROR', 'HTTP error: ' + e.message);
        callback(null, generateErrorResponse());
    });
    
    log('DEBUG', 'API call to ' + url + ': ' + payload);
    req.write(payload);
    req.end();

}

var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
function generateMessageID() {

    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
}

/**
 * Generate a response message
 *
 * @param {string} name - Directive name
 * @param {Object} payload - Any special payload required for the response
 * @returns {Object} Response object
 */
function generateResponse(name, payload) {
    return {
        header: {
            messageId: generateMessageID(),
            name: name,
            namespace: 'Alexa.ConnectedHome.Control',
            payloadVersion: '2',
        },
        payload: payload,
    };
}

function generateErrorResponse() {
    return {
        header: {
            messageId: generateMessageID(),
            name: "BridgeOfflineError",
            namespace: 'Alexa.ConnectedHome.Control',
            payloadVersion: '2',
        },
        payload: {},
    };
}

/**
 * Mock functions to access device cloud.
 *
 * TODO: Pass a user access token and call cloud APIs in production.
 */

function getDevicesFromPartnerCloud() {
    /**
     * For the purposes of this sample code, we will return:
     * (1) Non-dimmable light bulb
     * (2) Dimmable light bulb
     */
    return USER_DEVICES;
}

function isValidToken() {
    /**
     * Always returns true for sample code.
     * You should update this method to your own access token validation.
     */
    return true;
}

function isDeviceOnline(applianceId) {
    log('DEBUG', `isDeviceOnline (applianceId: ${applianceId})`);

    /**
     * Always returns true for sample code.
     * You should update this method to your own validation.
     */
    return true;
}

function turnOn(applianceId, token, callback) {
    log('DEBUG', `turnOn (applianceId: ${applianceId})`);

    var deviceAddress = "http://" + deviceIdToAddress(applianceId) + "/api/dev_on";
    return makeDeviceRequest(deviceAddress, { brightness: 255 }, 'TurnOnConfirmation', callback);
}

function turnOff(applianceId, token, callback) {
    log('DEBUG', `turnOff (applianceId: ${applianceId})`);

    var deviceAddress = "http://" + deviceIdToAddress(applianceId) + "/api/dev_off";
    return makeDeviceRequest(deviceAddress, { }, 'TurnOffConfirmation', callback);
}

function setPercentage(applianceId, token, percentage, callback) {
    log('DEBUG', `setPercentage (applianceId: ${applianceId}), percentage: ${percentage}`);

    var deviceAddress = "http://" + deviceIdToAddress(applianceId) + "/api/dev_level";
    var level = parseInt((255 * (percentage/100)).toString());
    return makeDeviceRequest(deviceAddress, { brightness: level }, 'SetPercentageConfirmation', callback);
}

function incrementPercentage(applianceId, delta) {
    log('DEBUG', `incrementPercentage (applianceId: ${applianceId}), delta: ${delta}`);

    // Call device cloud's API to set percentage delta

    return generateResponse('IncrementPercentageConfirmation', {});
}

function decrementPercentage(applianceId, delta) {
    log('DEBUG', `decrementPercentage (applianceId: ${applianceId}), delta: ${delta}`);

    // Call device cloud's API to set percentage delta

    return generateResponse('DecrementPercentageConfirmation', {});
}

/**
 * Main logic
 */

/**
 * This function is invoked when we receive a "Discovery" message from Alexa Smart Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given customer.
 *
 * @param {Object} request - The full request object from the Alexa smart home service. This represents a DiscoverAppliancesRequest.
 *     https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesrequest
 *
 * @param {function} callback - The callback object on which to succeed or fail the response.
 *     https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback
 *     If successful, return <DiscoverAppliancesResponse>.
 *     https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
 */
function handleDiscovery(request, callback) {
    log('DEBUG', `Discovery Request: ${JSON.stringify(request)}`);

    /**
     * Get the OAuth token from the request.
     */
    const userAccessToken = request.payload.accessToken.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        const errorMessage = `Discovery Request [${request.header.messageId}] failed. Invalid access token: ${userAccessToken}`;
        log('ERROR', errorMessage);
        callback(new Error(errorMessage));
    }

    /**
     * Assume access token is valid at this point.
     * Retrieve list of devices from cloud based on token.
     *
     * For more information on a discovery response see
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
     */
    const response = {
        header: {
            messageId: generateMessageID(),
            name: 'DiscoverAppliancesResponse',
            namespace: 'Alexa.ConnectedHome.Discovery',
            payloadVersion: '2'
        },
        payload: {
            discoveredAppliances: getDevicesFromPartnerCloud(userAccessToken)
        }
    };

    /**
     * Log the response. These messages will be stored in CloudWatch.
     */
    log('DEBUG', `Discovery Response: ${JSON.stringify(response)}`);

    /**
     * Return result with successful message.
     */
    callback(null, response);
}

/**
 * A function to handle control events.
 * This is called when Alexa requests an action such as turning off an appliance.
 *
 * @param {Object} request - The full request object from the Alexa smart home service.
 * @param {function} callback - The callback object on which to succeed or fail the response.
 */
function handleControl(request, callback) {
    log('DEBUG', `Control Request: ${JSON.stringify(request)}`);

    /**
     * Get the access token.
     */
    const userAccessToken = request.payload.accessToken.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     *
     * If the token is invliad, return InvalidAccessTokenError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#invalidaccesstokenerror
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        log('ERROR', `Discovery Request [${request.header.messageId}] failed. Invalid access token: ${userAccessToken}`);
        callback(null, generateResponse('InvalidAccessTokenError', {}));
        return;
    }

    /**
     * Grab the applianceId from the request.
     */
    const applianceId = request.payload.appliance.applianceId;

    /**
     * If the applianceId is missing, return UnexpectedInformationReceivedError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#unexpectedinformationreceivederror
     */
    if (!applianceId) {
        log('ERROR', 'No applianceId provided in request');
        const payload = { faultingParameter: `applianceId: ${applianceId}` };
        callback(null, generateResponse('UnexpectedInformationReceivedError', payload));
        return;
    }

    /**
     * At this point the applianceId and accessToken are present in the request.
     *
     * Please review the full list of errors in the link below for different states that can be reported.
     * If these apply to your device/cloud infrastructure, please add the checks and respond with
     * accurate error messages. This will give the user the best experience and help diagnose issues with
     * their devices, accounts, and environment
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#error-messages
     */
    if (!isDeviceOnline(applianceId, userAccessToken)) {
        log('ERROR', `Device offline: ${applianceId}`);
        callback(null, generateResponse('TargetOfflineError', {}));
        return;
    }

    let response;
    let doCallback = true;
    
    switch (request.header.name) {
        case 'TurnOnRequest':
            doCallback = false;
            turnOn(applianceId, userAccessToken, callback);
            break;

        case 'TurnOffRequest':
            doCallback = false;
            turnOff(applianceId, userAccessToken, callback);
            break;

        case 'SetPercentageRequest': {
            const percentage = request.payload.percentageState.value;
            if (!percentage) {
                const payload = { faultingParameter: `percentageState: ${percentage}` };
                callback(null, generateResponse('UnexpectedInformationReceivedError', payload));
                return;
            }
            doCallback = false;
            setPercentage(applianceId, userAccessToken, percentage, callback);
            break;
        }

        case 'IncrementPercentageRequest': {
            const delta = request.payload.deltaPercentage.value;
            if (!delta) {
                const payload = { faultingParameter: `deltaPercentage: ${delta}` };
                callback(null, generateResponse('UnexpectedInformationReceivedError', payload));
                return;
            }
            response = incrementPercentage(applianceId, userAccessToken, delta);
            break;
        }

        case 'DecrementPercentageRequest': {
            const delta = request.payload.deltaPercentage.value;
            if (!delta) {
                const payload = { faultingParameter: `deltaPercentage: ${delta}` };
                callback(null, generateResponse('UnexpectedInformationReceivedError', payload));
                return;
            }
            response = decrementPercentage(applianceId, userAccessToken, delta);
            break;
        }

        default: {
            log('ERROR', `No supported directive name: ${request.header.name}`);
            callback(null, generateResponse('UnsupportedOperationError', {}));
            return;
        }
    }

    log('DEBUG', `Control Confirmation: ${JSON.stringify(response)}`);

    if (doCallback)
        callback(null, response);
}

/**
 * Main entry point.
 * Incoming events from Alexa service through Smart Home API are all handled by this function.
 *
 * It is recommended to validate the request and response with Alexa Smart Home Skill API Validation package.
 *  https://github.com/alexa/alexa-smarthome-validation
 */
exports.handler = (request, context, callback) => {
    
    log('DEBUG', 'handler called');
    
    switch (request.header.namespace) {
        /**
         * The namespace of 'Alexa.ConnectedHome.Discovery' indicates a request is being made to the Lambda for
         * discovering all appliances associated with the customer's appliance cloud account.
         *
         * For more information on device discovery, please see
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discovery-messages
         */
        case 'Alexa.ConnectedHome.Discovery':
            handleDiscovery(request, callback);
            break;

        /**
         * The namespace of "Alexa.ConnectedHome.Control" indicates a request is being made to control devices such as
         * a dimmable or non-dimmable bulb. The full list of Control events sent to your lambda are described below.
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#payload
         */
        case 'Alexa.ConnectedHome.Control':
            handleControl(request, callback);
            break;

        /**
         * The namespace of "Alexa.ConnectedHome.Query" indicates a request is being made to query devices about
         * information like temperature or lock state. The full list of Query events sent to your lambda are described below.
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#payload
         *
         * TODO: In this sample, query handling is not implemented. Implement it to retrieve temperature or lock state.
         */
        // case 'Alexa.ConnectedHome.Query':
        //     handleQuery(request, callback);
        //     break;

        /**
         * Received an unexpected message
         */
        default: {
            const errorMessage = `No supported namespace: ${request.header.namespace}`;
            log('ERROR', errorMessage);
            callback(new Error(errorMessage));
        }
    }
}