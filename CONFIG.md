## Web.Rewrite Config File

The config file can be edited through the web interface of the extension (sections page.Rewrite, request.Rewrite, userAgent.Rewrite, localStorage.Rewrite, cookie.Rewrite, incognito.Rewrite, executeScript.Rewrite) or directly by editing the JSON file with a regular text editor.

### Editing in the embedded code editor

After selecting the section in the top menu, hit the `Edit` button to enable edit mode in the code editor. The button will light up, indicating the editor is in Edit Mode. If you make changes, the `Save` button will also light up. To save the changes, hit `Save`.

### Editing using your preferred code editor

You can find the structure for the config file in the [example config file](resources/example_config.json5).

You can write your own JSON config file or use the example file `resources/example_config.json5`.. 

To test your changes, use online validators like [JSON Online Checker](https://jsononline.net/json-checker).

Note: a config file may pass JSON validation tests (meaning it's a valid JSON file) and may still be invalid for the application (lacks key/value parameters that are required for the processing). The extension may hang if it cannot find the required parameters.

### Config file structure

Main sections of the config file:
- Rules (one for each section)
- Settings

```json5
{
  "pageRewrite_rules": [],
  "requestRewrite_rules": [],
  "userAgentRewrite_rules": [],
  "localStorageRewrite_rules": [],
  "cookieRewrite_rules": [],
  "incognitoRewrite_rules": [],
  "executeScriptRewrite_rules": [],
  "settings": {
    "general": {
      "default_theme": true
    },
    "switches": {
      "master": {
        "enabled": true
      },
      "pageRewrite": {
        "enabled": true
      },
      "requestRewrite": {
        "enabled": true
      },
      "userAgentRewrite": {
        "enabled": true
      },
      "cookieRewrite": {
        "enabled": false
      },
      "localStorageRewrite": {
        "enabled": true
      },
      "incognitoRewrite": {
        "enabled": true
      }
    }
  }
}
```

### General rules

The parameters in the Settings section receive only true / false values, like shown above. They enable or disable parts of the extension and can be changed using the switches of the Options window.

Boolean parameters don't need to be enclosed in quotes. String parameters do, as shown in the next example.

To create another entrance in that section, you can copy the text between the curly brackets `{}` (curly brackets included) after the initial `[` (bracket), insert a `,` (comma) after the last bracket and paste and text.

Targets and rules must be separated by a `,` (comma):
```text
    },
    {
```

The last target or rule in the section must end without a comma after the closing curly bracket: 
```text
    }
  ]
```

Let's explore the Rules sections.

### page.Rewrite rules

Every entrance must contain these first-level key/value pairs:
```text
"target": [domain name string in double quotes],
"enabled": [ true | false ],
"rules": [list, explained below]
```

Example code snippet:
```json5
  [
    {
      "target": "whatsmyuseragent.org",
      "enabled": true,
      "rules": [
        {
          "enabled": true,
          "rule": "Agent",
          "flags": "g",
          "replace": "Runner",
          "comment": "Title"
        },
        {
          "enabled": true,
          "rule": "3498db",
          "flags": "g",
          "replace": "008000",
          "comment": "Top and middle"
        }
      ]
    },
    {
      "target": "anothertarget.com",
      "rules": [
      ]
    }
  ]
```

Parameters `rule`, `flags` and `replace` are part of the regular expression. You can learn more at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

Acceptable values:
```text
"enabled": [ true | false ],
"rule": [pattern string in double quotes],
"flags": [flag string in double quotes],
"replace": [pattern string in double quotes],
"comment": [string in double quotes]
```

### request.Rewrite rules

Every entrance must contain these first-level key/value pairs:
```text
"target": [domain name string in double quotes],
"enabled": [ true | false ],
"rules": [list, explained below]
```

Example code snippet:
```json5
[
  {
    "target": "ft.com",
    "enabled": true,
    "rules": [
      {
        "enabled": false,
        "url": {
          "rule": "^(https://www.ft.com/content/.*)$",
          "flags": "g",
          "replace": "https://l.facebook.com/l.php?u=$1"
        },
        "comment": "Load with Facebook"
      }
    ]
  }
]
```

Parameters `rule`, `flags` and `replace` are part of the regular expression. You can learn more at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)


Acceptable values:
```text
"enabled": [ true | false ],
"url": {
  "rule": [pattern string in double quotes],
  "flags": [flag string in double quotes],
  "replace": [pattern string in double quotes]
}
```

### userAgent.Rewrite rules

Example code snippet:
```json5
  [
    {
      "enabled": true,
      "target": "example.com",
      "ua": "Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.04",
      "comment": "Test"
    }
  ]
```

If you're looking for User Agent string, this website has many for you to choose from: [http://useragentstring.com/pages/useragentstring.php](http://useragentstring.com/pages/useragentstring.php)

Acceptable values:
```text
"enabled": [ true | false ],
"target": [domain name string in double quotes],
"ua": [ "random" | user agent string in double quotes],
"comment": [string in double quotes]
```
If "ua" is "random", the extension will pick a random user agent string from `resources/ua_strings.json` file.

### cookie.Rewrite rules

Example code snippet:
```json5
  [
    {
      "target": "example.com",
      "enabled": true,
      "rules": [
        {
          "enabled": true,
          "rule": "add",
          "key": "nsdr",
          "value": "true",
          "comment": "JS protection bypass"
        }
      ]
    }
  ]
```

Acceptable values:
```text
"enabled": [ true | false ],
"rule": [ "add" | "remove" ],
"key": [string in double quotes],
"value": [string in double quotes],
"comment": [string in double quotes]
```

### localStorage.Rewrite rules

Every entrance must contain these first-level key/value pairs:
```text
"target": [domain name string in double quotes],
"enabled": [ true | false ],
"rules": [list, explained below]
```

Example code snippet:
```json5
  [
    {
      "target": "example.com",
      "enabled": true,
      "rules": [
        {
          "enabled": true,
          "rule": "add",
          "key": "PREMIUM_USER",
          "value": "true",
          "comment": "JS checks this key"
        }
      ]
    }
  ]
```

Acceptable values:
```text
"enabled": [ true | false ],
"rule": [ "add" | "remove" ],
"key": [string in double quotes],
"value": [string in double quotes],
"comment": [string in double quotes]
```

### incognito.Rewrite rules

Example code snippet:
```json5
  [
    {
      "enabled": true,
      "target": "whatsmychickenagent.org",
      "incognito": false,
      "closecurrenttab": true,
      "comment": ""
    }
  ]
```

Acceptable values:
```text
"enabled": [ true | false ],
"target": [domain name string in double quotes],
"incognito": [ true | false ],
"closecurrenttab": [ true | false ],
"comment": [string in double quotes]
```

### executeScript.Rewrite rules

Example code snippet:
```json5
  [
    {
      "enabled": true,
      "target": "example.com",
      "run": "document.body.removeAttribute(\"data-paywall-overlay-status\");",
      "comment": "Remove invisible overlay"
    }
  ]
```

This component is acessible from the Popup window. When you hit the 'Run JS' button, it will run JavaScript code for all open websites will be processed, not only for the active tab.

Acceptable values:
```text
"enabled": [ true | false ],
"target": [domain name string in double quotes],
"run": [one or more lines of code in JavaScript, separated by semi-colon],
"comment": [string in double quotes]
```
