function runNow(page) {
    browser.tabs.query({active: true, currentWindow: true}).then(function(tabs){
        page.runNow(tabs[0].url);
    });
}

function onSuccessUpdateSwitches(page) {
    updateSwitches(page.getRules());
}

function toggleMasterSwitch(page) {
    page.toggleMasterSwitch();
}

function togglePageSwitch(page) {
    page.togglePageSwitch();
}

function toggleRequestSwitch(page) {
    page.toggleRequestSwitch();
}

function toggleUserAgentSwitch(page) {
    page.toggleUserAgentSwitch();
}

function toggleCookieSwitch(page) {
    page.toggleCookieSwitch();
}

function toggleLocalStorageSwitch(page) {
    page.toggleLocalStorageSwitch();
}

function toggleIncognitoSwitch(page) {
    page.toggleIncognitoSwitch();
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function setTheme(theme_name) {
    // Darkly comes from https://bootswatch.com/darkly/

    let theme = "css/" + theme_name + "/bootstrap.min.css";
    $('link[title="main"]').attr('href', theme);
}

function updateSwitches(json_object) {
    if (json_object["settings"]["switches"]["master"]["enabled"]) {
        $('#switchMaster').prop('checked', true);
    } else {
        $('#switchMaster').prop('checked', false);
    }
    if (json_object["settings"]["switches"]["pageRewrite"]["enabled"]) {
        $('#switchPageRewrite').prop('checked', true);
    } else {
        $('#switchPageRewrite').prop('checked', false);
    }
    if (json_object["settings"]["switches"]["requestRewrite"]["enabled"]) {
        $('#switchRequestRewrite').prop('checked', true);
    } else {
        $('#switchRequestRewrite').prop('checked', false);
    }
    if (json_object["settings"]["switches"]["userAgentRewrite"]["enabled"]) {
        $('#switchUserAgentRewrite').prop('checked', true);
    } else {
        $('#switchUserAgentRewrite').prop('checked', false);
    }
    if (json_object["settings"]["switches"]["cookieRewrite"]["enabled"]) {
        $('#switchCookieRewrite').prop('checked', true);
    } else {
        $('#switchCookieRewrite').prop('checked', false);
    }
    if (json_object["settings"]["switches"]["localStorageRewrite"]["enabled"]) {
        $('#switchLocalStorageRewrite').prop('checked', true);
    } else {
        $('#switchLocalStorageRewrite').prop('checked', false);
    }
    if (json_object["settings"]["switches"]["incognitoRewrite"]["enabled"]) {
        $('#switchIncognitoRewrite').prop('checked', true);
    } else {
        $('#switchIncognitoRewrite').prop('checked', false);
    }

    if (json_object["settings"]["general"]["default_theme"]) {
        setTheme("default");
    } else {
        setTheme("darkly");
    }
}

let getting = browser.runtime.getBackgroundPage();
getting.then(onSuccessUpdateSwitches, onError);

$(document).ready(function() {
    getting.then(onSuccessUpdateSwitches, onError);

    $('#switchMaster').click(function() {
        if ($(this).prop('checked') === false) {
            $('#switchPageRewrite').prop('disabled', true);
            $('#switchRequestRewrite').prop('disabled', true);
            $('#switchUserAgentRewrite').prop('disabled', true);
            $('#switchCookieRewrite').prop('disabled', true);
            $('#switchLocalStorageRewrite').prop('disabled', true);
            $('#switchIncognitoRewrite').prop('disabled', true);
        } else {
            $('#switchPageRewrite').prop('disabled', false);
            $('#switchRequestRewrite').prop('disabled', false);
            $('#switchUserAgentRewrite').prop('disabled', false);
            $('#switchCookieRewrite').prop('disabled', false);
            $('#switchLocalStorageRewrite').prop('disabled', false);
            $('#switchIncognitoRewrite').prop('disabled', false);
        }
        getting.then(toggleMasterSwitch, onError);
    });

    $('#switchPageRewrite').click(function() {
        getting.then(togglePageSwitch, onError);
    });

    $('#switchRequestRewrite').click(function() {
        getting.then(toggleRequestSwitch, onError);
    });

    $('#switchUserAgentRewrite').click(function() {
        getting.then(toggleUserAgentSwitch, onError);
    });

    $('#switchCookieRewrite').click(function() {
        getting.then(toggleCookieSwitch, onError);
    });

    $('#switchLocalStorageRewrite').click(function() {
        getting.then(toggleLocalStorageSwitch, onError);
    });

    $('#switchIncognitoRewrite').click(function() {
        getting.then(toggleIncognitoSwitch, onError);
    });

    $('#popupOptions').click(function() {
        browser.runtime.openOptionsPage();
    });

    $('#runNow').click(function() {
        getting.then(runNow, onError);
    });
});
