// Web.ReWrite 0.1
// Written by Marcelo Martins, exploitedbunker.com
//

let edPage = CodeMirror.fromTextArea(document.getElementById("codePage"), {
    lineNumbers: true,
    // gutter: true,
    lineWrapping: true,
    smartIndent: true,
    readOnly: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: { name: "javascript", json: true }
});

let edRequest = CodeMirror.fromTextArea(document.getElementById("codeRequest"), {
    lineNumbers: true,
    // gutter: true,
    lineWrapping: true,
    readOnly: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: { name: "javascript", json: true }
});

let edUserAgent = CodeMirror.fromTextArea(document.getElementById("codeUserAgent"), {
    lineNumbers: true,
    // gutter: true,
    lineWrapping: true,
    readOnly: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: { name: "javascript", json: true }
});

let edCookie = CodeMirror.fromTextArea(document.getElementById("codeCookie"), {
    lineNumbers: true,
    // gutter: true,
    lineWrapping: true,
    readOnly: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: { name: "javascript", json: true }
});

let edLocalStorage = CodeMirror.fromTextArea(document.getElementById("codeLocalStorage"), {
    lineNumbers: true,
    // gutter: true,
    lineWrapping: true,
    readOnly: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: { name: "javascript", json: true }
});

let edIncognito = CodeMirror.fromTextArea(document.getElementById("codeIncognito"), {
    lineNumbers: true,
    // gutter: true,
    lineWrapping: true,
    readOnly: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: { name: "javascript", json: true }
});

let edExecuteScript = CodeMirror.fromTextArea(document.getElementById("codeExecuteScript"), {
    lineNumbers: true,
    // gutter: true,
    lineWrapping: true,
    readOnly: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: { name: "javascript", json: true }
});

editorList = [edPage, edRequest, edUserAgent, edCookie, edLocalStorage, edIncognito, edExecuteScript];

edPage.on('focus', function() {
    edPage.refresh();
});

edRequest.on('focus', function() {
    edRequest.refresh();
});

edUserAgent.on('focus', function() {
    edUserAgent.refresh();
});

edCookie.on('focus', function() {
    edCookie.refresh();
});

edLocalStorage.on('focus', function() {
    edLocalStorage.refresh();
});

edIncognito.on('focus', function() {
    edIncognito.refresh();
});

edExecuteScript.on('focus', function() {
    edExecuteScript.refresh();
});

function saveToLocalStorage(content_json_obj) {
    //Receives a JSON object
    let content_json_str = JSON.stringify(content_json_obj)
    if (isValidJSONString(content_json_str)) {
        // Send back to Background
        //sendStorageMessage("storage_import", content_json_obj);
        sendStorageMessage("storage_import", content_json_str);
        updateImportedStatus(true);
        sendListenerUpdateMessage();
        return content_json_str     //Content used by calling function
    } else {
        console.error("saveToLocalStorage Error: invalid JSON content.");
    }
}

function prepareRead(object) {
    if (document.getElementById(object).files[0]) {
        let fileObject = document.getElementById(object);
        $(document.getElementById(object))
            .next('.custom-file-label')
            .addClass("selected")
            .html(fileObject.files[0].name);
        if (fileObject) {
            progressiveRead(fileObject.files[0], object);
        }
    }
}

function progressiveRead(file) {
    let chunkSize = 20480;
    let pos = 0;
    let reader = new FileReader();

    function progressiveReadNext() {
        let end = Math.min(pos + chunkSize, file.size);

        reader.onload = function() {
            let data = reader.result;
            let array = new Int8Array(data);
            pos = end;
            if (pos < file.size) {
                // Reading is not finished yet.
                setTimeout(progressiveReadNext, 10);
            } else {
                // Done reading. Let's process the content.
                let dec = new TextDecoder("utf8");
                let Uint8Arr = new Uint8Array(array);
                let decoded = dec.decode(Uint8Arr);
                // if (file.size < 15000) {
                if (isValidJSONString(decoded)) {
                    // isValidJSONString() expects a JSON string

                    // KNOWN BUG: escaped chars get unescaped after JSON.parse()
                    // Tried to use a reviver; didn't work as expected.
                    // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#using_the_reviver_parameter

                    //const myReviver = (key, val) => key === "rule" ? val.replace(/\//g, "\/") : val;

                    //processLocalStorage() expects to receive a JSON object
                    Promise.resolve(processLocalStorage(JSON.parse(decoded))) //JSON object
                        .then(startUp)
                        //saveToLocalStorage() expects to receive a JSON object
                        .then(saveToLocalStorage(JSON.parse(decoded))) //JSON object
                        .then(updateSwitchesFromOptions);
                } else {
                    console.error("Import Error: invalid JSON file.");
                    updateImportedStatus(false);
                }
                // }
            }
        };

        let blob;
        if (file.slice) {
            blob = file.slice(pos, end);
        } else if (file.webkitSlice) {
            blob = file.webkitSlice(pos, end);
        }
        reader.readAsArrayBuffer(blob);
    }
    setTimeout(progressiveReadNext, 10);
}

var pageRewriteRules = {};

function processLocalStorage(data) {
    //receives a JSON object (cannot use str functions)
    pageRewriteRules = data;
    if (pageRewriteRules["settings"]) {
        console.log("Loading rules...");
        edPage.doc.setValue(JSON.stringify(pageRewriteRules["pageRewrite_rules"], null, '\t'));
        edRequest.doc.setValue(JSON.stringify(pageRewriteRules["requestRewrite_rules"], null, '\t'));
        edUserAgent.doc.setValue(JSON.stringify(pageRewriteRules["userAgentRewrite_rules"], null, '\t'));
        edCookie.doc.setValue(JSON.stringify(pageRewriteRules["cookieRewrite_rules"], null, '\t'));
        edLocalStorage.doc.setValue(JSON.stringify(pageRewriteRules["localStorageRewrite_rules"], null, '\t'));
        edIncognito.doc.setValue(JSON.stringify(pageRewriteRules["incognitoRewrite_rules"], null, '\t'));
        edExecuteScript.doc.setValue(JSON.stringify(pageRewriteRules["executeScriptRewrite_rules"], null, '\t'));
        for (const editor of editorList) {
            editor.clearHistory();          // Disable undo to before pasting JSON
            editor.scrollIntoView({line: 0, ch: 0});
            editor.focus();
            editor.refresh();
        }
        console.log("Loading rules: we're all set.");
    } else {
        console.log("Loading default rules...");
        progressiveRead("config.json5");
    }
    edPage.markClean();
    edRequest.markClean();
    edUserAgent.markClean();
    edCookie.markClean();
    edLocalStorage.markClean();
    edIncognito.markClean();
    edExecuteScript.markClean();

    return pageRewriteRules;
}

var ua_strings;

function startUp(data) {
    // Functions that depend on processLocalStorage()

    if (isDefaultMode()) {
        setTheme("default");
    } else {
        setTheme("darkly");
    }

    // Update Settings switches
    updateSwitchesFromOptions();

    // Start with all Save buttons disabled
    disableSaveAddTargetButtons();
}

function concatRules() {
    let pageRules = edPage.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,"");
    let requestRules = edRequest.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,"");
    let userAgentRules = edUserAgent.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,"");
    let cookieRules = edCookie.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,"");
    let localStorageRules = edLocalStorage.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,"");
    let incognitoRules = edIncognito.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,"");
    let executeScriptRules = edExecuteScript.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,"");

    pageRewriteRules["pageRewrite_rules"] = JSON.parse(pageRules);
    pageRewriteRules["requestRewrite_rules"] = JSON.parse(requestRules);
    pageRewriteRules["userAgentRewrite_rules"] = JSON.parse(userAgentRules);
    pageRewriteRules["cookieRewrite_rules"] = JSON.parse(cookieRules);
    pageRewriteRules["localStorageRewrite_rules"] = JSON.parse(localStorageRules);
    pageRewriteRules["incognitoRewrite_rules"] = JSON.parse(incognitoRules);
    pageRewriteRules["executeScriptRewrite_rules"] = JSON.parse(executeScriptRules);
}

function disableSavePageButtons() {
    $('#btnCodePageSave')
        .prop('disabled', true)
        .addClass("btn-outline-secondary")
        .removeClass("btn-danger");
}

function disableSaveRequestButtons() {
    $('#btnCodeRequestSave')
        .prop('disabled', true)
        .addClass("btn-outline-secondary")
        .removeClass("btn-danger");
}

function disableSaveUserAgentButtons() {
    $('#btnCodeUserAgentSave')
        .prop('disabled', true)
        .addClass("btn-outline-secondary")
        .removeClass("btn-danger");
}

function disableSaveCookieButtons() {
    $('#btnCodeCookieSave')
        .prop('disabled', true)
        .addClass("btn-outline-secondary")
        .removeClass("btn-danger");
}

function disableSaveLocalStorageButtons() {
    $('#btnCodeLocalStorageSave')
        .prop('disabled', true)
        .addClass("btn-outline-secondary")
        .removeClass("btn-danger");
}

function disableSaveIncognitoButtons() {
    $('#btnCodeIncognitoSave')
        .prop('disabled', true)
        .addClass("btn-outline-secondary")
        .removeClass("btn-danger");
}

function disableSaveExecuteScriptButtons() {
    $('#btnCodeExecuteScriptSave')
        .prop('disabled', true)
        .addClass("btn-outline-secondary")
        .removeClass("btn-danger");
}

function disableSaveAddTargetButtons() {
    // Start with all Save buttons disabled
    disableSavePageButtons();
    disableSaveRequestButtons();
    disableSaveUserAgentButtons();
    disableSaveCookieButtons();
    disableSaveLocalStorageButtons();
    disableSaveIncognitoButtons();
    disableSaveExecuteScriptButtons();
}

function isValidJSONString(json_string) {
    // Receives JSON string
    try {
        JSON.parse(json_string);
    } catch (e) {
        return false;
    }
    return true;
}

function isValidJSONObject(json_object) {
    return json_object && typeof json_object === "object";
}

function setTheme(theme_name) {
    // Darkly comes from https://bootswatch.com/darkly/

    let theme = "css/" + theme_name + "/bootstrap.min.css";
    $('link[title="main"]').attr('href', theme);
    if (theme.includes('default')) {    // toggleClass didn't work as expected on page reload
        $('img').not('.no-invert').removeClass("inverted");
        $('svg').not('.no-invert').removeClass("inverted");
    } else {
        $('img').not('.no-invert').addClass("inverted");
        $('svg').not('.no-invert').addClass("inverted");
    }
    //
    if (theme_name === "darkly") {
        $('#pageThemebox').addClass("cm-s-material-darker");
        $('#requestThemebox').addClass("cm-s-material-darker");
        $('#userAgentThemebox').addClass("cm-s-material-darker");
        $('#cookieThemebox').addClass("cm-s-material-darker");
        $('#localStorageThemebox').addClass("cm-s-material-darker");
        $('#incognitoThemebox').addClass("cm-s-material-darker");
        $('#executeScriptThemebox').addClass("cm-s-material-darker");
        $('div.cm-s-default')
            .addClass("cm-s-material-darker")
            .removeClass("cm-s-default");
    } else {
        $('#pageThemebox').removeClass("cm-s-material-darker");
        $('#requestThemebox').removeClass("cm-s-material-darker");
        $('#userAgentThemebox').removeClass("cm-s-material-darker");
        $('#cookieThemebox').removeClass("cm-s-material-darker");
        $('#localStorageThemebox').removeClass("cm-s-material-darker");
        $('#incognitoThemebox').removeClass("cm-s-material-darker");
        $('#executeScriptThemebox').removeClass("cm-s-material-darker");
        $('div.cm-s-material-darker')
            .removeClass("cm-s-material-darker")
            .addClass("cm-s-default");
    }
}

function isDefaultMode() {
    if (pageRewriteRules["settings"]["general"]["default_theme"]) {
        return pageRewriteRules["settings"]["general"]["default_theme"];
    } else {
        return false
    }
}

function toggleDarkMode() {
    // Darkly comes from https://bootswatch.com/darkly/

    pageRewriteRules["settings"]["general"]["default_theme"] = !pageRewriteRules["settings"]["general"]["default_theme"];
    if (pageRewriteRules["settings"]["general"]["default_theme"]) {
        setTheme("default");
        console.log("Default Mode enabled.");
        // Fixes an error in Darkly theme, custom select border
        $('.custom-select').removeClass('border-light');
    } else {
        setTheme("darkly");
        console.log("Dark Mode enabled.");
        // Fixes an error in Darkly theme, custom select border
        $('.custom-select').addClass('border-light');
    }
    saveToLocalStorage(pageRewriteRules);
}

function updateSwitchesFromOptions() {
    if (pageRewriteRules["settings"]["switches"]["master"]["enabled"]) {
        $('#switchMaster').prop('checked', true);
    } else {
        $('#switchMaster').prop('checked', false);
    }
    if (pageRewriteRules["settings"]["switches"]["pageRewrite"]["enabled"]) {
        $('#switchPageRewrite').prop('checked', true);
    } else {
        $('#switchPageRewrite').prop('checked', false);
    }
    if (pageRewriteRules["settings"]["switches"]["requestRewrite"]["enabled"]) {
        $('#switchRequestRewrite').prop('checked', true);
    } else {
        $('#switchRequestRewrite').prop('checked', false);
    }
    if (pageRewriteRules["settings"]["switches"]["userAgentRewrite"]["enabled"]) {
        $('#switchUserAgentRewrite').prop('checked', true);
    } else {
        $('#switchUserAgentRewrite').prop('checked', false);
    }
    if (pageRewriteRules["settings"]["switches"]["cookieRewrite"]["enabled"]) {
        $('#switchCookieRewrite').prop('checked', true);
    } else {
        $('#switchCookieRewrite').prop('checked', false);
    }
    if (pageRewriteRules["settings"]["switches"]["localStorageRewrite"]["enabled"]) {
        $('#switchLocalStorageRewrite').prop('checked', true);
    } else {
        $('#switchLocalStorageRewrite').prop('checked', false);
    }
    if (pageRewriteRules["settings"]["switches"]["incognitoRewrite"]["enabled"]) {
        $('#switchIncognitoRewrite').prop('checked', true);
    } else {
        $('#switchIncognitoRewrite').prop('checked', false);
    }
    if (pageRewriteRules["settings"]["general"]["default_theme"]) {
        $('#switchSettingsTheme').prop('checked', true);
    } else {
        $('#switchSettingsTheme').prop('checked', false);
    }
}

function exportRulesToFile(content, fileName = 'webRewriteRules.json5', contentType = 'text/plain') {
    let a = document.createElement("a");
    let myFile = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(myFile);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

function editorTimeoutSetFocus(editor) {
    setTimeout(function() {
        editor.focus();
    }, 400);
}

function editorUserAgentSelector() {
    // Decided to let the program run without waiting for UA to load
    setTimeout(function() {
        $("select[id^='useragent-input-target-']").empty();
        $.each(ua_strings["user_agents"], function (i, item) {
            $("select[id^='useragent-input-target-']")
                .append($('<option>', {
                    value: item.ua,
                    text : item.ua
                }));
        });
    }, 500);
}

function loadUAStrings() {
    function reqListener() {
        ua_strings = JSON.parse(this.responseText);
    }

    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "resources/ua_strings.json");
    oReq.send();
}

function updateImportedStatus(result) {
    if (result) {
        $('#importFailedDiv').addClass("d-none");
        $('#importSuccessfullyDiv').removeClass("d-none");
        setTimeout(function() {
            $('#importSuccessfullyDiv').addClass("d-none");
        }, 3000);
    } else {
        $('#importFailedDiv').removeClass("d-none");
        $('#importSuccessfullyDiv').addClass("d-none");
    }
}

function getRules() {
    var sendingMessage = browser.runtime.sendMessage({
        command: "getRules"
    })
    sendingMessage.then((result) => {
        Promise.resolve(processLocalStorage(result))
            .then(startUp)
            .then(loadUAStrings)
            .then(editorUserAgentSelector);
    });
}

function getRulesForExport() {
    var sendingMessage = browser.runtime.sendMessage({
        command: "getRules"
    })
    sendingMessage.then((result) => {
        exportRulesToFile(JSON.stringify(result, null, 2));
    });
}

function sendStorageMessage(command, object) {
    var sendingMessage = browser.runtime.sendMessage({
        command: command,
        object: object
    });
    sendingMessage.then((result) => {
        updateListenerButtons(result);
    });
}

function sendListenerMessage(command, object) {
    var sendingMessage = browser.runtime.sendMessage({
        command: command,
        object: object
    })
    sendingMessage.then((result) => {
        updateListenerButtons(result);
    });
}

function sendListenerUpdateMessage() {
    var listenerMessage = browser.runtime.sendMessage({
        command: "listenerStatus"
    })
    listenerMessage.then((result) => {
        updateListenerButtons(result);
    });
}

function updateListenerButtons(result) {
    if (result["pageRewrite"]) {
        $('#btnPageAddListener').prop('disabled', true);
        $('#btnPageRemoveListener').prop('disabled', false);
    } else {
        $('#btnPageAddListener').prop('disabled', false);
        $('#btnPageRemoveListener').prop('disabled', true);
    }
    if (result["requestRewrite"]) {
        $('#btnRequestAddListener').prop('disabled', true);
        $('#btnRequestRemoveListener').prop('disabled', false);
    } else {
        $('#btnRequestAddListener').prop('disabled', false);
        $('#btnRequestRemoveListener').prop('disabled', true);
    }
    if (result["userAgentRewrite"]) {
        $('#btnUserAgentAddListener').prop('disabled', true);
        $('#btnUserAgentRemoveListener').prop('disabled', false);
    } else {
        $('#btnUserAgentAddListener').prop('disabled', false);
        $('#btnUserAgentRemoveListener').prop('disabled', true);
    }
    if (result["cookieRewrite"]) {
        $('#btnCookieAddListener').prop('disabled', true);
        $('#btnCookieRemoveListener').prop('disabled', false);
    } else {
        $('#btnCookieAddListener').prop('disabled', false);
        $('#btnCookieRemoveListener').prop('disabled', true);
    }
    if (result["localStorageRewrite"]) {
        $('#btnLocalStorageAddListener').prop('disabled', true);
        $('#btnLocalStorageRemoveListener').prop('disabled', false);
    } else {
        $('#btnLocalStorageAddListener').prop('disabled', false);
        $('#btnLocalStorageRemoveListener').prop('disabled', true);
    }
    if (result["incognitoRewrite"]) {
        $('#btnIncognitoAddListener').prop('disabled', true);
        $('#btnIncognitoRemoveListener').prop('disabled', false);
    } else {
        $('#btnIncognitoAddListener').prop('disabled', false);
        $('#btnIncognitoRemoveListener').prop('disabled', true);
    }
}

function isAllowedIncognito() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "isAllowedIncognito"
    })
    sendingMessage.then((result) => {
        updateIncognitoStatus(result);
    });
}

function updateIncognitoStatus(result) {
    if (result) {
        $('#alertsDiv').addClass("d-none");        // Enabled for extension
    } else {
        $('#alertsDiv').removeClass("d-none");     // Disabled for extension
    }
}

function optionsToggleMasterSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "masterSwitch"
    })
    sendingMessage.then((result) => {
        if (result) {
            if ($('#switchMaster').prop('checked') === false) {
                //Disable all switches
                $('#switchPageRewrite').prop('disabled', true);
                $('#switchRequestRewrite').prop('disabled', true);
                $('#switchUserAgentRewrite').prop('disabled', true);
                $('#switchCookieRewrite').prop('disabled', true);
                $('#switchLocalStorageRewrite').prop('disabled', true);
                $('#switchIncognitoRewrite').prop('disabled', true);

                //Add warning label in all tabs
                $('#pageCodeDisabledMessage').addClass("d-inline").removeClass("d-none");

                $('#requestCodeDisabledMessage').addClass("d-inline").removeClass("d-none");

                $('#userAgentCodeDisabledMessage').addClass("d-inline").removeClass("d-none");

                $('#cookieCodeDisabledMessage').addClass("d-inline").removeClass("d-none");

                $('#localStorageCodeDisabledMessage').addClass("d-inline").removeClass("d-none");

                $('#incognitoCodeDisabledMessage').addClass("d-inline").removeClass("d-none");
            } else {
                //Enable all switches
                $('#switchPageRewrite').prop('disabled', false);
                $('#switchRequestRewrite').prop('disabled', false);
                $('#switchUserAgentRewrite').prop('disabled', false);
                $('#switchCookieRewrite').prop('disabled', false);
                $('#switchLocalStorageRewrite').prop('disabled', false);
                $('#switchIncognitoRewrite').prop('disabled', false);

                //Remove warning label in all tabs
                $('#pageCodeDisabledMessage').addClass("d-none").removeClass("d-inline");

                $('#requestCodeDisabledMessage').addClass("d-none").removeClass("d-inline");

                $('#userAgentCodeDisabledMessage').addClass("d-none").removeClass("d-inline");

                $('#cookieCodeDisabledMessage').addClass("d-none").removeClass("d-inline");

                $('#localStorageCodeDisabledMessage').addClass("d-none").removeClass("d-inline");

                $('#incognitoCodeDisabledMessage').addClass("d-none").removeClass("d-inline");
            }
        }
    });
}

function optionsTogglePageSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "pageSwitch"
    })
    sendingMessage.then((result) => {
        if (result) {
            if ($('#switchPageRewrite').prop('checked') === false) {
                $('#pageCodeDisabledMessage').addClass("d-inline").removeClass("d-none");
            } else {
                $('#pageCodeDisabledMessage').addClass("d-none").removeClass("d-inline");
            }
        }
    });
}

function optionsToggleRequestSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "requestSwitch"
    })
    sendingMessage.then((result) => {
        if (result) {
            if ($('#switchRequestRewrite').prop('checked') === false) {
                $('#requestCodeDisabledMessage').addClass("d-inline").removeClass("d-none");
            } else {
                $('#requestCodeDisabledMessage').addClass("d-none").removeClass("d-inline");
            }
        }
    });
}

function optionsToggleUserAgentSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "userAgentSwitch"
    })
    sendingMessage.then((result) => {
        if (result) {
            if ($('#switchUserAgentRewrite').prop('checked') === false) {
                $('#userAgentCodeDisabledMessage').addClass("d-inline").removeClass("d-none");
            } else {
                $('#userAgentCodeDisabledMessage').addClass("d-none").removeClass("d-inline");
            }
        }
    });
}

function optionsToggleCookieSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "cookieSwitch"
    })
    sendingMessage.then((result) => {
        if (result) {
            if ($('#switchCookieRewrite').prop('checked') === false) {
                $('#cookieCodeDisabledMessage').addClass("d-inline").removeClass("d-none");
            } else {
                $('#cookieCodeDisabledMessage').addClass("d-none").removeClass("d-inline");
            }
        }
    });
}

function optionsToggleLocalStorageSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "localStorageSwitch"
    })
    sendingMessage.then((result) => {
        if (result) {
            if ($('#switchLocalStorageRewrite').prop('checked') === false) {
                $('#localStorageCodeDisabledMessage').addClass("d-inline").removeClass("d-none");
            } else {
                $('#localStorageCodeDisabledMessage').addClass("d-none").removeClass("d-inline");
            }
        }
    });
}

function optionsToggleIncognitoSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "incognitoSwitch"
    })
    sendingMessage.then((result) => {
        if (result) {
            if ($('#switchIncognitoRewrite').prop('checked') === false) {
                $('#incognitoCodeDisabledMessage').addClass("d-inline").removeClass("d-none");
            } else {
                $('#incognitoCodeDisabledMessage').addClass("d-none").removeClass("d-inline");
            }
        }
    });
}

function optionsToggleDefaultThemeSwitch() {
    let sendingMessage = browser.runtime.sendMessage({
        command: "toggle",
        object: "DefaultTheme"
    });
    sendingMessage.then((result) => {
        toggleDarkMode();
    });
}
