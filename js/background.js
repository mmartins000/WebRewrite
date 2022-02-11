// Web.ReWrite 0.1
// Written by Marcelo Martins, exploitedbunker.com
//
// =================
// 1. Common section
// =================

// Defining variables rules
let default_pattern = "<all_urls>";

// This Listener is used to exchange messages with Options window
browser.runtime.onMessage.addListener(messageHandler);

function messageHandler(message, sender, sendResponse) {
    if (message.command === "update") {
        sendResponse(getRules())
    } else if (message.command === "toggle") {
        switch (message.object) {
            case 'masterSwitch':
                if (toggleMasterSwitch())
                    sendResponse("masterSwitch enabled");
                else
                    sendResponse("masterSwitch disabled");
                break;
            case 'pageSwitch':
                if (togglePageSwitch())
                    sendResponse("pageSwitch enabled");
                else
                    sendResponse("pageSwitch disabled");
                break;
            case 'requestSwitch':
                if (toggleRequestSwitch())
                    sendResponse("requestSwitch enabled");
                else
                    sendResponse("requestSwitch disabled");
                break;
            case 'userAgentSwitch':
                if (toggleUserAgentSwitch())
                    sendResponse("userAgentSwitch enabled");
                else
                    sendResponse("userAgentSwitch disabled");
                break;
            case 'cookieSwitch':
                if (toggleCookieSwitch())
                    sendResponse("cookieSwitch enabled");
                else
                    sendResponse("cookieSwitch disabled");
                break;
            case 'localStorageSwitch':
                if (toggleLocalStorageSwitch())
                    sendResponse("localStorageSwitch enabled");
                else
                    sendResponse("localStorageSwitch disabled");
                break;
            case 'incognitoSwitch':
                if (toggleIncognitoSwitch())
                    sendResponse("incognitoSwitch enabled");
                else
                    sendResponse("incognitoSwitch disabled");
                break;
            case 'DefaultTheme':
                if (toggleDefaultThemeSwitch())
                    sendResponse("DefaultThemeSwitch enabled");
                else
                    sendResponse("DefaultThemeSwitch disabled");
                break;
        }
        saveLocalStorage(pageRewriteRules);
    } else if (message.command === "storage_import") {
        // Content comes from Options, Import
        // Receives a JSON string (message.object)
        // Converts the string into a JSON object
        pageRewriteRules = JSON.parse(message.object);
        saveLocalStorage(message.object); //Save a string to the LocalStorage
        sendResponse("storage loaded");
        // After saving to Local Storage, it's time to change Listeners based on switches
        checkListeners();
    } else if (message.command === "listenerStatus") {
        sendResponse(getListeners());
    } else if (message.command === "addlistener") {
        switch (message.object) {
            case 'pageRewrite':
                addListenerPage();
                break;
            case 'requestRewrite':
                addListenerRequest();
                break;
            case 'userAgentRewrite':
                addListenerUserAgent();
                break;
            case 'cookieRewrite':
                addListenerCookie();
                break;
            case 'localStorageRewrite':
                addListenerLocalStorage();
                break;
            case 'incognitoRewrite':
                addListenerIncognito();
                break;
        }
        sendResponse(getListeners());
    } else if (message.command === "removelistener") {
        switch (message.object) {
            case 'pageRewrite':
                removeListenerPage();
                sendResponse(getListeners());
                break;
            case 'requestRewrite':
                removeListenerRequest();
                sendResponse(getListeners());
                break;
            case 'userAgentRewrite':
                removeListenerUserAgent();
                sendResponse(getListeners());
                break;
            case 'cookieRewrite':
                removeListenerCookie();
                sendResponse(getListeners());
                break;
            case 'localStorageRewrite':
                removeListenerLocalStorage();
                sendResponse(getListeners());
                break;
            case 'incognitoRewrite':
                removeListenerIncognito();
                sendResponse(getListeners());
                break;
        }
    } else if (message.command === "isAllowedIncognito") {
        sendResponse(isAllowedIncognito());
    } else if (message.command === "getRules") {
        sendResponse(pageRewriteRules);
    }
}

function getActiveTab() {
    return browser.tabs.query({active: true, currentWindow: true});
}

var ua_strings;

// Loading stored User Agent strings
function loadUAStrings() {
    let json_ua = browser.runtime.getURL("resources/ua_strings.json");
    let request = new XMLHttpRequest();
    request.open('GET', json_ua);
    request.responseType = 'json';
    request.send();
    request.onload = function () {
        ua_strings = request.response;
    };
}

// After changes to the rules, save them back to the LocalStorage
function saveLocalStorage(content) {
    localStorage.setItem('pageRewriteRules', JSON.stringify(content));
}

// To display the rules in the webpage, we load them from the LocalStorage
function loadLocalStorage() {
    pageRewriteRules = JSON.parse(JSON.parse(localStorage.getItem('pageRewriteRules')));
    // Due to encoding, I had to do it twice.
    // This is a hack. Better solution would be to fix encoding.
}

function onError(error) {
    console.error(`Error: ${error}`);
}

function isAllowedIncognito() {
    return browser.extension.isAllowedIncognitoAccess()
}

function onStartup() {
    loadUAStrings();
    loadLocalStorage();
    checkListeners();
    console.log("WebRewrite running.");
}

function checkListeners() {
    try {
        if (! pageRewriteRules["settings"]) {
            loadDefaultRules();
        }
    } catch (e) {
        console.error("checkListeners(): error reading config information.");
    } finally {
        setListeners();
    }
}

function setListeners() {
    if (checkEnabled("pageRewrite")) {
        addListenerPage();
    } else {
        removeListenerPage();
    }
    if (checkEnabled("requestRewrite")) {
        addListenerRequest();
    } else {
        removeListenerRequest();
    }
    if (checkEnabled("userAgentRewrite")) {
        addListenerUserAgent();
    } else {
        removeListenerUserAgent();
    }
    if (checkEnabled("cookieRewrite")) {
        addListenerCookie();
    } else {
        removeListenerCookie();
    }
    if (checkEnabled("localStorageRewrite")) {
        addListenerLocalStorage();
    } else {
        removeListenerLocalStorage();
    }
    if (checkEnabled("incognitoRewrite")) {
        addListenerIncognito();
    } else {
        removeListenerIncognito();
    }
    //There is no Listener for executeRewrite section
}

function loadDefaultRules() {
    let json_ua = browser.runtime.getURL("resources/example_config.json5");
    let request = new XMLHttpRequest();
    request.open('GET', json_ua);
    request.responseType = 'json';
    request.send();
    request.onload = function () {
        // pageRewriteRules = JSON.parse(request.response);
        let content_json_str = JSON.stringify(request.response)
        if (isValidJSONString(content_json_str)) {
            sendStorageMessage("storage_import", content_json_str);
        }
    };
    console.log("Loaded default rules.");
    setListeners();
}

function addListenerPage() {
    if (! browser.webRequest.onBeforeRequest.hasListener(pageRewrite)) {
        browser.webRequest.onBeforeRequest.addListener(
            pageRewrite,
            {
                urls: [default_pattern],
                types: ["main_frame", "script", "stylesheet", "xmlhttprequest", "speculative", "websocket"]
            },
            ["blocking", "requestBody"]
        );
        console.debug("pageRewrite Listener added.");
    }
}

function addListenerRequest() {
    if (! browser.webRequest.onBeforeRequest.hasListener(requestRewrite)) {
        browser.webRequest.onBeforeRequest.addListener(
            requestRewrite,
            {urls: [default_pattern], types: ["main_frame", "sub_frame", "xmlhttprequest", "object", "websocket"]},
            ["blocking", "requestBody"]
        );
        console.debug("requestRewrite Listener added.");
    }
}

function addListenerUserAgent() {
    if (! browser.webRequest.onBeforeRequest.hasListener(userAgentRewrite)) {
        browser.webRequest.onBeforeSendHeaders.addListener(
            userAgentRewrite,
            {urls: [default_pattern]},
            ["blocking", "requestHeaders"]
        );
        console.debug("userAgentRewrite Listener added.");
    }
}

function addListenerCookie() {
    if (! browser.webRequest.onBeforeRequest.hasListener(cookieRewrite)) {
        browser.webRequest.onBeforeRequest.addListener(
            cookieRewrite,
            {urls: [default_pattern], types: ["main_frame"]},
            ["blocking"]
        );
        console.debug("userAgentRewrite Listener added.");
    }
}

function addListenerLocalStorage() {
    if (! browser.webRequest.onBeforeRequest.hasListener(localStorageRewrite)) {
        browser.webRequest.onBeforeRequest.addListener(
            localStorageRewrite,
            {urls: [default_pattern], types: ["main_frame"]},
            ["blocking"]
        );
        console.debug("localStorageRewrite Listener added.");
    }
}

function addListenerIncognito() {
    if (! browser.webRequest.onBeforeRequest.hasListener(incognitoRewrite)) {
        if (isAllowedIncognito())
            browser.webRequest.onBeforeRequest.addListener(
                incognitoRewrite,
                {urls: [default_pattern], types: ["main_frame"]},
                ["blocking"]
            );
        console.debug("incognitoRewrite Listener added.");
    }
}

function removeListenerPage() {
    if (browser.webRequest.onBeforeRequest.hasListener(pageRewrite)) {
        browser.webRequest.onBeforeRequest.removeListener(pageRewrite);
        console.debug("pageRewrite Listener removed.");
    }
}

function removeListenerRequest() {
    if (browser.webRequest.onBeforeRequest.hasListener(requestRewrite)) {
        browser.webRequest.onBeforeRequest.removeListener(requestRewrite);
        console.debug("requestRewrite Listener removed.");
    }
}

function removeListenerUserAgent() {
    if (browser.webRequest.onBeforeRequest.hasListener(userAgentRewrite)) {
        browser.webRequest.onBeforeRequest.removeListener(userAgentRewrite);
        console.debug("userAgentRewrite Listener removed.");
    }
}

function removeListenerCookie() {
    if (browser.webRequest.onBeforeRequest.hasListener(cookieRewrite)) {
        browser.webRequest.onBeforeRequest.removeListener(cookieRewrite);
        console.debug("cookieRewrite Listener removed.");
    }
}

function removeListenerLocalStorage() {
    if (browser.webRequest.onBeforeRequest.hasListener(localStorageRewrite)) {
        browser.webRequest.onBeforeRequest.removeListener(localStorageRewrite);
        console.debug("localStorageRewrite Listener removed.");
    }
}

function removeListenerIncognito() {
    if (browser.webRequest.onBeforeRequest.hasListener(incognitoRewrite)) {
        browser.webRequest.onBeforeRequest.removeListener(incognitoRewrite);
        console.debug("incognitoRewrite Listener removed.");
    }
}

let pageRewriteRules = {};

function getRules() {
    return pageRewriteRules;
}

function toggleMasterSwitch() {
    pageRewriteRules["settings"]["switches"]["master"]["enabled"] = !pageRewriteRules["settings"]["switches"]["master"]["enabled"];
    console.debug("Master switch enabled: " + pageRewriteRules["settings"]["switches"]["master"]["enabled"]);
    return pageRewriteRules["settings"]["switches"]["master"]["enabled"];
}

function togglePageSwitch() {
    pageRewriteRules["settings"]["switches"]["pageRewrite"]["enabled"] = !pageRewriteRules["settings"]["switches"]["pageRewrite"]["enabled"];
    console.debug("Page switch enabled: " + pageRewriteRules["settings"]["switches"]["pageRewrite"]["enabled"]);
    return pageRewriteRules["settings"]["switches"]["pageRewrite"]["enabled"];
}

function toggleRequestSwitch() {
    pageRewriteRules["settings"]["switches"]["requestRewrite"]["enabled"] = !pageRewriteRules["settings"]["switches"]["requestRewrite"]["enabled"];
    console.debug("Request switch enabled: " + pageRewriteRules["settings"]["switches"]["requestRewrite"]["enabled"]);
    return pageRewriteRules["settings"]["switches"]["requestRewrite"]["enabled"];
}

function toggleUserAgentSwitch() {
    pageRewriteRules["settings"]["switches"]["userAgentRewrite"]["enabled"] = !pageRewriteRules["settings"]["switches"]["userAgentRewrite"]["enabled"];
    console.debug("UserAgent switch enabled: " + pageRewriteRules["settings"]["switches"]["userAgentRewrite"]["enabled"]);
    return pageRewriteRules["settings"]["switches"]["userAgentRewrite"]["enabled"];
}

function toggleCookieSwitch() {
    pageRewriteRules["settings"]["switches"]["cookieRewrite"]["enabled"] = !pageRewriteRules["settings"]["switches"]["cookieRewrite"]["enabled"];
    console.debug("Cookie switch enabled: " + pageRewriteRules["settings"]["switches"]["cookieRewrite"]["enabled"]);
    return pageRewriteRules["settings"]["switches"]["cookieRewrite"]["enabled"];
}

function toggleLocalStorageSwitch() {
    pageRewriteRules["settings"]["switches"]["localStorageRewrite"]["enabled"] = !pageRewriteRules["settings"]["switches"]["localStorageRewrite"]["enabled"];
    console.debug("LocalStorage switch enabled: " + pageRewriteRules["settings"]["switches"]["localStorageRewrite"]["enabled"]);
    return pageRewriteRules["settings"]["switches"]["localStorageRewrite"]["enabled"];
}

function toggleIncognitoSwitch() {
    pageRewriteRules["settings"]["switches"]["incognitoRewrite"]["enabled"] = !pageRewriteRules["settings"]["switches"]["incognitoRewrite"]["enabled"];
    console.debug("Incognito switch enabled: " + pageRewriteRules["settings"]["switches"]["incognitoRewrite"]["enabled"]);
    return pageRewriteRules["settings"]["switches"]["incognitoRewrite"]["enabled"];
}

function toggleDefaultThemeSwitch() {
    pageRewriteRules["settings"]["general"]["default_theme"] = !pageRewriteRules["settings"]["general"]["default_theme"];
    console.debug("Default Theme switch enabled: " + pageRewriteRules["settings"]["general"]["default_theme"]);
    return pageRewriteRules["settings"]["general"]["default_theme"];
}

function getListeners() {
    let data = {};
    data["pageRewrite"] = browser.webRequest.onBeforeRequest.hasListener(pageRewrite);
    data["requestRewrite"] = browser.webRequest.onBeforeRequest.hasListener(requestRewrite);
    data["userAgentRewrite"] = browser.webRequest.onBeforeSendHeaders.hasListener(userAgentRewrite);
    data["cookieRewrite"] = browser.webRequest.onBeforeRequest.hasListener(cookieRewrite);
    data["localStorageRewrite"] = browser.webRequest.onBeforeRequest.hasListener(localStorageRewrite);
    data["incognitoRewrite"] = browser.webRequest.onBeforeRequest.hasListener(incognitoRewrite);
    console.debug("background.js, getListeners():", data);
    return data
}

function checkEnabled(component) {
    // Used to check if we should do processing or not
    try {
        if (pageRewriteRules["settings"]["switches"]["master"]["enabled"]) {
            return pageRewriteRules["settings"]["switches"][component]["enabled"];
        } else {
            return false
        }
    } catch (e) {
        console.error("checkEnabled(): error reading settings.");
        return false
    }
}

// Page Load
onStartup();

// ================
// 2. page.Rewrite
// ================

function pageRewrite(details) {
    if (! checkEnabled("pageRewrite")) { return {} }

    let config = pageRewriteRules["pageRewrite_rules"];
    let urlAddress = details.url;
    //let event = "onBeforeRequest";
    for (let i in config) {
        let target = config[i]["target"];
        let enabled = config[i]["enabled"];
        if (enabled) {
            if (urlAddress.includes(target)) {
                let filter = browser.webRequest.filterResponseData(details.requestId);
                let decoder = new TextDecoder("utf-8");
                let encoder = new TextEncoder();
                filter.ondata = event => {
                    let replaced_str = decoder.decode(event.data, {stream: true});
                    for (let r in config[i]["rules"]) {
                        let enabled = config[i]["rules"][r]["enabled"];
                        if (enabled) {
                            let rule = config[i]["rules"][r]["rule"];
                            let flags = config[i]["rules"][r]["flags"];
                            let replace = config[i]["rules"][r]["replace"];
                            replaced_str = replaced_str.replace(RegExp(rule, flags), replace);
                        }
                    }
                    filter.write(encoder.encode(replaced_str));
                    filter.disconnect();
                };
            }
        }
    }
    // return {}
}

// ==================
// 3. request.Rewrite
// ==================

function requestRewrite(details) {
    if (! checkEnabled("requestRewrite")) { return {} }

    let urlAddress = details.url;
    let redirUrl = urlAddress;
    let changeBool = false;
    let config = pageRewriteRules["requestRewrite_rules"];

    for (let i in config) {
        let target = config[i]["target"];
        let enabled = config[i]["enabled"];
        if (enabled) {
            if (urlAddress.includes(target)) {
                for (let r in config) {
                    let enabled = config[i]["rules"][r]["enabled"];
                    if (enabled) {
                        let url_rule = config[i]["rules"][r]["url"]["rule"];
                        if (url_rule) {
                            let url_flags = config[i]["rules"][r]["url"]["flags"];
                            let url_replace = config[i]["rules"][r]["url"]["replace"];

                            redirUrl = urlAddress.replace(RegExp(url_rule, url_flags), url_replace);
                        }

                        let postData_rule = config[i]["rules"][r]["postData"]["rule"];
                        if (postData_rule) {
                            let postData_flags = config[i]["rules"][r]["postData"]["flags"];
                            let postData_replace = config[i]["rules"][r]["postData"]["replace"];

                            let request_postData = details.requestBody;
                            request_postData = request_postData.replace(RegExp(postData_rule, postData_flags), postData_replace);
                            return {requestBody: details.requestBody};
                        };

                        if (redirUrl !== urlAddress) {
                            changeBool = true;
                        }
                    }
                }
            }
        }
    }

    if (changeBool) {
        return {
            redirectUrl: redirUrl
        };
    }
}

// ==============
// 4. ua.Rewrite
// ==============

function getUserAgent(urlAddress) {
    let config = pageRewriteRules["userAgentRewrite_rules"];
    for (let i in config) {
        if (urlAddress.includes(config[i]["target"])) {
            let enabled = config[i]["enabled"];
            if (enabled) {
                let ua = config[i]["ua"];
                if (ua === "random") {
                    let rand = Math.floor(Math.random() * 40);
                    ua = ua_strings["user_agents"][rand]["ua"]
                }
                return ua
            }
        }
    }
}

function userAgentRewrite(e) {
    if (! checkEnabled("userAgentRewrite")) { return {} }

    let ua = getUserAgent(e.url);
    e.requestHeaders.forEach(function(header) {
        if (header.name.toLowerCase() === "user-agent") {
            header.value = ua;
        }
    });
    return {requestHeaders: e.requestHeaders};
}

// =================
// 5. cookie.Rewrite
// =================

function onRemovedCookie(cookie) {
    console.debug(`Removed Cookie: ${cookie.name}`);
}

function onSetCookie(cookie) {
    console.debug(`Set Cookie: ${cookie.name}`);
}

function updateCookie(domain, key, value) {
    getActiveTab().then((tabs) => {
        // get any previously set cookie for the current tab
        let gettingCookie = browser.cookies.get({
            url: tabs[0].url,
            firstPartyDomain: domain,
            name: key
        });
        gettingCookie.then((cookie) => {
            if (cookie) {
                console.debug(`Found Cookie: ${cookie.name}`);
            } else {
                let settingCookie = browser.cookies.set({
                    url: tabs[0].url,
                    domain: domain,
                    firstPartyDomain: domain,
                    name: key,
                    value: value
                });
                settingCookie.then(onSetCookie, onError);
            }
        });
    });
}

function removeCookie(domain, key) {
    getActiveTab().then((tabs) => {
        // get any previously set cookie for the current tab
        let gettingCookie = browser.cookies.get({
            url: tabs[0].url,
            firstPartyDomain: domain,
            name: key
        });
        gettingCookie.then((cookie) => {
            if (cookie) {
                console.debug(`Found Cookie: ${cookie.name}`);
                let removingCookie = browser.cookies.remove({
                    url: tabs[0].url,
                    domain: domain,
                    name: key
                });
                removingCookie.then(onRemovedCookie, onError);
            }
        });
    });
}

function cookieRewrite(e) {
    if (! checkEnabled("cookieRewrite")) { return {} }

    let config = pageRewriteRules["cookieRewrite_rules"];
    for (let i in config) {
        let domain = config[i]["target"];
        let enabled = config[i]["enabled"];
        if (enabled) {
            if (e.url.includes(domain)) {
                for (let r in config[i]["rules"]) {
                    let enabled = config[i]["rules"][r]["enabled"];
                    if (enabled) {
                        let rule = config[i]["rules"][r]["rule"];
                        let key = config[i]["rules"][r]["key"];

                        if (rule === "add") {
                            let value = config[i]["rules"][r]["value"];
                            updateCookie(domain, key, value);
                        } else if (rule === "remove") {
                            removeCookie(domain, key)
                        }
                    }
                }
            }
        }
    }

    return {};
}

// =======================
// 6. localStorage.Rewrite
// =======================

function setLocalStorage(key, value) {
    localStorage.setItem(key, value);
}

function removeLocalStorage(key) {
    localStorage.removeItem(key);
}

function localStorageRewrite(e) {
    if (! checkEnabled("localStorageRewrite")) { return {} }
    let urlAddress = e.url;
    let config = pageRewriteRules["localStorageRewrite_rules"];
    for (let i in config) {
        let target = config[i]["target"];
        let enabled = config[i]["enabled"];
        if (enabled) {
            if (urlAddress.includes(target)) {
                for (let r in config[i]["rules"]) {
                    let enabled = config[i]["rules"][r]["enabled"];
                    if (enabled) {
                        let rule = config[i]["rules"][r]["rule"];
                        let key = config[i]["rules"][r]["key"];

                        if (rule === "add") {
                            let value = config[i]["rules"][r]["value"];
                            setLocalStorage(key, value);
                        } else if (rule === "remove") {
                            removeLocalStorage(key);
                        }
                    }
                }
            }
        }
    }
    return {};
}

// ====================
// 7. incognito.Rewrite
// ====================

function incognitoRewrite(e) {
    // if (extension.isAllowedIncognitoAccess() || ! checkEnabled("incognitoRewrite")) { return {} }
    if (! checkEnabled("incognitoRewrite")) { return {} }

    let urlAddress = e.url;
    let config = pageRewriteRules["incognitoRewrite_rules"];
    for (let i in config) {
        let target = config[i]["target"];
        if (urlAddress.includes(target)) {
            let enabled = config[i]["enabled"];
            if (enabled) {
                let incognitoOption = config[i]["incognito"];
                let closeOption = config[i]["closecurrenttab"];
                browser.windows.getLastFocused().then((windowInfo) => {
                    console.debug(`Window is private: ${windowInfo.incognito}`);
                    if (windowInfo.incognito === false) {
                        console.debug("Trying to close the older tab...");
                        if (closeOption) {
                            getActiveTab().then((tabs) => {
                                let removingCurrent = browser.tabs.remove(tabs[0].id);
                                removingCurrent.then(() => {
                                    console.debug("Trying to create an incognito window...");
                                    let creating = browser.windows.create({
                                        url: e.url,
                                        incognito: incognitoOption
                                    });
                                    creating.then(() => {
                                        console.debug(`Created window: ${windowInfo.id}`);
                                    }, onError);
                                });
                            });
                        }
                        requestRewrite(e);
                    }
                });
            }
        }
    }
    // return {}
}

// ========================
// 8. executeScript.Rewrite
// ========================

function runNow(pageURL) {
    let urlAddress = pageURL;
    let config = pageRewriteRules["executeScriptRewrite_rules"];
    for (let r in config) {
        let domain = config[r]["target"];
        if (urlAddress.includes(domain)) {
            let enabled = config[r]["enabled"];
            if (enabled) {
                let run = config[r]["run"];
                const execute_code = browser.tabs.executeScript({
                    code: run
                });
            }
        }
    }
}
