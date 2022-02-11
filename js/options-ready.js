// Web.ReWrite 0.1
// Written by Marcelo Martins, exploitedbunker.com
//

$(document).ready(function() {
    // Clean import file name
    $('#outputList').val("");

    $('#btnCodeExport').click(function() {
        getRulesForExport();
    });

    $('#btnCodeImport').click(function() {
        console.log("Loading rules from external file...");
        prepareRead('files');
    });


    // Page Events

    $('#liPageRewrite').click(function() {
        editorTimeoutSetFocus(edPage);
    });

    $('#tabPageContCode').click(function() {
        editorTimeoutSetFocus(edPage);
    });

    $('#btnCodePageEdit').click(function() {
        if (edPage.getOption('readOnly')) {
            edPage.setOption('readOnly', false);
            $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
            edPage.focus();
        } else {
            edPage.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
        }
        edPage.markClean();
    });

    $('#btnCodePageSave').click(function() {
        if (isValidJSONString(edPage.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""))) {
            disableSavePageButtons();

            // Code
            edPage.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-danger");
            $('#btnCodePageEdit').addClass("btn-outline-secondary").removeClass("btn-secondary");
            $(this).prop('disabled', true);
            $('#pageCodeErrorMessage').addClass("d-none").removeClass("d-inline");

            // Save the new rules to JSON object
            pageRewriteRules["pageRewrite_rules"] = JSON.parse(edPage.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""));
            saveToLocalStorage(pageRewriteRules); //Send a JSON object
        } else {
            $('#pageCodeErrorMessage').addClass("d-inline").removeClass("d-none");
        }
    });
    // End of Page Events

    // Request Events

    $('#liRequestRewrite').click(function() {
        editorTimeoutSetFocus(edRequest);
    });

    $('#tabRequestContCode').click(function() {
        editorTimeoutSetFocus(edRequest);
    });

    $('#btnCodeRequestEdit').click(function() {
        if (edRequest.getOption('readOnly')) {
            edRequest.setOption('readOnly', false);
            $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
            edRequest.focus();
        } else {
            edRequest.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
        }
        edRequest.markClean();
    });

    $('#btnCodeRequestSave').click(function() {
        if (isValidJSONString(edRequest.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""))) {
            disableSaveRequestButtons();

            // Code
            edRequest.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-danger");
            $('#btnCodeRequestEdit').addClass("btn-outline-secondary").removeClass("btn-secondary");
            $(this).prop('disabled', true);
            $('#requestCodeErrorMessage').addClass("d-none").removeClass("d-inline");

            // Save the new rules to JSON
            pageRewriteRules["requestRewrite_rules"] = JSON.parse(edRequest.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""));
            saveToLocalStorage(pageRewriteRules);
        } else {
            $('#requestCodeErrorMessage').addClass("d-inline").removeClass("d-none");
        }
    });
    // End of Request Events

    // UserAgent

    $('#liUserAgentRewrite').click(function() {
        editorTimeoutSetFocus(edUserAgent);
    });

    $('#tabUserAgentContCode').click(function() {
        editorTimeoutSetFocus(edUserAgent);
    });

    $('#btnCodeUserAgentEdit').click(function() {
        if (edUserAgent.getOption('readOnly')) {
            edUserAgent.setOption('readOnly', false);
            $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
            edUserAgent.focus();
        } else {
            edUserAgent.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
        }
        edUserAgent.markClean();
    });

    $('#btnCodeUserAgentSave').click(function() {
        if (isValidJSONString(edUserAgent.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm, ""))) {
            disableSaveUserAgentButtons();

            // Code
            edUserAgent.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-danger");
            $('#btnCodeUserAgentEdit').addClass("btn-outline-secondary").removeClass("btn-secondary");
            $(this).prop('disabled', true);
            $('#userAgentCodeErrorMessage').addClass("d-none").removeClass("d-inline");

            // Save the new rules to JSON
            pageRewriteRules["userAgentRewrite_rules"] = JSON.parse(edUserAgent.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""));
            saveToLocalStorage(pageRewriteRules);
        } else {
            $('#userAgentCodeErrorMessage').addClass("d-inline").removeClass("d-none");
        }
    });
    // End of UserAgent Events

    // Cookie Events

    $('#liCookieRewrite').click(function() {
        editorTimeoutSetFocus(edCookie);
    });

    $('#tabCookieContCode').click(function() {
        editorTimeoutSetFocus(edCookie);
    });

    $('#btnCodeCookieEdit').click(function() {
        if (edCookie.getOption('readOnly')) {
            edCookie.setOption('readOnly', false);
            $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
            edCookie.focus();
        } else {
            edCookie.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
        }
        edCookie.markClean();
    });

    $('#btnCodeCookieSave').click(function() {
        if (isValidJSONString(edCookie.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""))) {
            disableSaveCookieButtons();

            // Code
            edCookie.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-danger");
            $('#btnCodeCookieEdit').addClass("btn-outline-secondary").removeClass("btn-secondary");
            $(this).prop('disabled', true);
            $('#cookieCodeErrorMessage').addClass("d-none").removeClass("d-inline");

            // Save the new rules to JSON
            pageRewriteRules["cookieRewrite_rules"] = JSON.parse(edCookie.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""));
            saveToLocalStorage(pageRewriteRules);
        } else {
            $('#cookieCodeErrorMessage').addClass("d-inline").removeClass("d-none");
        }
    });
    // End of Cookie Events

    // LocalStorage Events

    $('#liLocalStorageRewrite').click(function() {
        editorTimeoutSetFocus(edLocalStorage);
    });

    $('#tabLocalStorageContCode').click(function() {
        editorTimeoutSetFocus(edLocalStorage);
    });

    $('#btnCodeLocalStorageEdit').click(function() {
        if (edLocalStorage.getOption('readOnly')) {
            edLocalStorage.setOption('readOnly', false);
            $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
            edLocalStorage.focus();
        } else {
            edLocalStorage.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
        }
        edLocalStorage.markClean();
    });

    $('#btnCodeLocalStorageSave').click(function() {
        if (isValidJSONString(edLocalStorage.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""))) {
            disableSaveLocalStorageButtons();

            // Code
            edLocalStorage.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-danger");
            $('#btnCodeLocalStorageEdit').addClass("btn-outline-secondary").removeClass("btn-secondary");
            $(this).prop('disabled', true);
            $('#localStorageCodeErrorMessage').addClass("d-none").removeClass("d-inline");

            // Save the new rules to JSON
            pageRewriteRules["localStorageRewrite_rules"] = JSON.parse(edLocalStorage.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""));
            saveToLocalStorage(pageRewriteRules);
        } else {
            $('#localStorageCodeErrorMessage').addClass("d-inline").removeClass("d-none");
        }
    });
    // End of LocalStorage Events

    // Incognito Events

    $('#liIncognitoRewrite').click(function() {
        editorTimeoutSetFocus(edIncognito);
    });

    $('#tabIncognitoContCode').click(function() {
        editorTimeoutSetFocus(edIncognito);
    });

    $('#btnCodeIncognitoEdit').click(function() {
        if (edIncognito.getOption('readOnly')) {
            edIncognito.setOption('readOnly', false);
            $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
            edIncognito.focus();
        } else {
            edIncognito.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
        }
        edIncognito.markClean();
    });

    $('#btnCodeIncognitoSave').click(function() {
        if (isValidJSONString(edIncognito.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""))) {
            disableSaveIncognitoButtons();

            // Code
            edIncognito.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-danger");
            $('#btnCodeIncognitoEdit').addClass("btn-outline-secondary").removeClass("btn-secondary");
            $(this).prop('disabled', true);
            $('#incognitoCodeErrorMessage').addClass("d-none").removeClass("d-inline");

            // Save the new rules to JSON
            pageRewriteRules["incognitoRewrite_rules"] = JSON.parse(edIncognito.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""));
            saveToLocalStorage(pageRewriteRules);
        } else {
            $('#incognitoCodeErrorMessage').addClass("d-inline").removeClass("d-none");
        }
    });
    // End of Incognito Events

    // ExecuteScript Events

    $('#liExecuteScriptRewrite').click(function() {
        editorTimeoutSetFocus(edExecuteScript);
    });

    $('#tabExecuteScriptContCode').click(function() {
        editorTimeoutSetFocus(edExecuteScript);
    });

    // Code, Edit button
    $('#btnCodeExecuteScriptEdit').click(function() {
        if (edExecuteScript.getOption('readOnly')) {
            edExecuteScript.setOption('readOnly', false);
            $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
            edExecuteScript.focus();
        } else {
            edExecuteScript.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
        }
        edExecuteScript.markClean();
    });

    // Code, Save button
    $('#btnCodeExecuteScriptSave').click(function() {
        if (isValidJSONString(edExecuteScript.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""))) {
            disableSaveExecuteScriptButtons();
            concatRules();
            edExecuteScript.setOption('readOnly', true);
            $(this).addClass("btn-outline-secondary").removeClass("btn-danger");
            $('#btnCodeExecuteScriptEdit').addClass("btn-outline-secondary").removeClass("btn-secondary");
            $(this).prop('disabled', true);
            $('#executeScriptCodeErrorMessage').addClass("d-none").removeClass("d-inline");

            // Save the new rules to JSON
            pageRewriteRules["executeScriptRewrite_rules"] = JSON.parse(edExecuteScript.doc.getValue().replace(/(\r\n|\n|\r|\t)/gm,""));
            saveToLocalStorage(pageRewriteRules);
        } else {
            $('#executeScriptCodeErrorMessage').addClass("d-inline").removeClass("d-none");
        }
    });


    // Code Editor Events

    edPage.on("change", function() {
        if (edPage.isClean()) {
            $('#btnCodePageSave')
                .addClass("btn-outline-secondary")
                .removeClass("btn-danger")
                .prop('disabled', true);
            $('#pageCodeErrorMessage').addClass("d-none").removeClass("d-inline");
        } else {
            $('#btnCodePageSave')
                .prop('disabled', false)
                .addClass("btn-danger")
                .removeClass("btn-outline-secondary");
        }
    });

    edRequest.on("change", function() {
        if (edRequest.isClean()) {
            $('#btnCodeRequestSave')
                .addClass("btn-outline-secondary")
                .removeClass("btn-danger")
                .prop('disabled', true);
            $('#requestCodeErrorMessage').addClass("d-none").removeClass("d-inline");
        } else {
            $('#btnCodeRequestSave')
                .prop('disabled', false)
                .addClass("btn-danger")
                .removeClass("btn-outline-secondary");
        }
    });

    edUserAgent.on("change", function() {
        if (edUserAgent.isClean()) {
            $('#btnCodeUserAgentSave')
                .addClass("btn-outline-secondary")
                .removeClass("btn-danger")
                .prop('disabled', true);
            $('#userAgentCodeErrorMessage').addClass("d-none").removeClass("d-inline");
        } else {
            $('#btnCodeUserAgentSave')
                .prop('disabled', false)
                .addClass("btn-danger")
                .removeClass("btn-outline-secondary");
        }
    });

    edCookie.on("change", function() {
        if (edCookie.isClean()) {
            $('#btnCodeCookieSave')
                .addClass("btn-outline-secondary")
                .removeClass("btn-danger")
                .prop('disabled', true);
            $('#cookieErrorMessage').addClass("d-none").removeClass("d-inline");
        } else {
            $('#btnCodeCookieSave')
                .prop('disabled', false)
                .addClass("btn-danger")
                .removeClass("btn-outline-secondary");
        }
    });

    edLocalStorage.on("change", function() {
        if (edLocalStorage.isClean()) {
            $('#btnCodeLocalStorageSave')
                .addClass("btn-outline-secondary")
                .removeClass("btn-danger")
                .prop('disabled', true);
            $('#localStorageCodeErrorMessage').addClass("d-none").removeClass("d-inline");
        } else {
            $('#btnCodeLocalStorageSave')
                .prop('disabled', false)
                .addClass("btn-danger")
                .removeClass("btn-outline-secondary");
        }
    });

    edIncognito.on("change", function() {
        if (edIncognito.isClean()) {
            $('#btnCodeIncognitoSave')
                .prop('disabled', true)
                .removeClass("btn-danger")
                .addClass("btn-outline-secondary");
            $('#incognitoCodeErrorMessage').addClass("d-none").removeClass("d-inline");
        } else {
            $('#btnCodeIncognitoSave')
                .prop('disabled', false)
                .addClass("btn-danger")
                .removeClass("btn-outline-secondary");
        }
    });

    edExecuteScript.on("change", function() {
        if (edExecuteScript.isClean()) {
            $('#btnCodeExecuteScriptSave')
                .prop('disabled', true)
                .removeClass("btn-danger")
                .addClass("btn-outline-secondary");
        } else {
            $('#btnCodeExecuteScriptSave')
                .prop('disabled', false)
                .addClass("btn-danger")
                .removeClass("btn-outline-secondary");
        }
    });
    // End of Code Editor Events

    // Options, Switch Events
    $('#switchMaster').click(function () {
        optionsToggleMasterSwitch();
    });

    $('#switchPageRewrite').click(function () {
        optionsTogglePageSwitch();
    });

    $('#switchRequestRewrite').click(function () {
        optionsToggleRequestSwitch();
    });

    $('#switchUserAgentRewrite').click(function () {
        optionsToggleUserAgentSwitch();
    });

    $('#switchCookieRewrite').click(function () {
        optionsToggleCookieSwitch();
    });

    $('#switchLocalStorageRewrite').click(function () {
        optionsToggleLocalStorageSwitch();
    });

    $('#switchIncognitoRewrite').click(function () {
        optionsToggleIncognitoSwitch();
    });
    // End of Options, Switch Events

    // Options, Settings
    $('#switchSettingsTheme').click(function () {
        optionsToggleDefaultThemeSwitch();
    });
    // End of Options, Settings

    // Options, Listener Events
    $('#btnPageAddListener').click(function () {
        sendListenerMessage("addlistener", "pageRewrite");
    });
    $('#btnPageRemoveListener').click(function () {
        sendListenerMessage("removelistener", "pageRewrite");
    });
    $('#btnRequestAddListener').click(function () {
        sendListenerMessage("addlistener", "requestRewrite");
    });
    $('#btnRequestRemoveListener').click(function () {
        sendListenerMessage("removelistener", "requestRewrite");
    });
    $('#btnUserAgentAddListener').click(function () {
        sendListenerMessage("addlistener", "userAgentRewrite");
    });
    $('#btnUserAgentRemoveListener').click(function () {
        sendListenerMessage("removelistener", "userAgentRewrite");
    });
    $('#btnCookieAddListener').click(function () {
        sendListenerMessage("addlistener", "cookieRewrite");
    });
    $('#btnCookieRemoveListener').click(function () {
        sendListenerMessage("removelistener", "cookieRewrite");
    });
    $('#btnLocalStorageAddListener').click(function () {
        sendListenerMessage("addlistener", "localStorageRewrite");
    });
    $('#btnLocalStorageRemoveListener').click(function () {
        sendListenerMessage("removelistener", "localStorageRewrite");
    });
    $('#btnIncognitoAddListener').click(function () {
        sendListenerMessage("addlistener", "incognitoRewrite");
    });
    $('#btnIncognitoRemoveListener').click(function () {
        sendListenerMessage("removelistener", "incognitoRewrite");
    });
    // End of Options, Listener Events

    // Updates Listener buttons when displayed
    sendListenerUpdateMessage();

    // Updates Incognito status
    isAllowedIncognito();

    // Get rules from background.js, which should come from localStorage
    getRules();
});
