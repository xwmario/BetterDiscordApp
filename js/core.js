/* BetterDiscordApp Core JavaScript
 * Version: 1.5
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 24/010/2015 - 17:27
 * https://github.com/Jiiks/BetterDiscordApp
 */

/*
 * =Changelog=
 * -v1.5
 * --Synchronized loading
 * --jsv 1.3
 * --Voice mode
 */

var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode;
var jsVersion = 1.3;
var supportedVersion = "0.1.5";

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "";
var bttvEmoteUrlEnd = "";

var mainCore;

var settings = {
    "Save logs locally":          { "id": "bda-gs-0", "info": "Saves chat logs locally", "implemented":false },
    "Public Servers":             { "id": "bda-gs-1", "info": "BETA : Display public servers button", "implemented":true},
    "Minimal Mode":               { "id": "bda-gs-2", "info": "Hide elements and reduce the size of elements.", "implemented":true},
    "Voice Mode":                 { "id": "bda-gs-4", "info": "Only show voice chat", "implemented":true},
    "Hide Channels":              { "id": "bda-gs-3", "info": "Hide channels in minimal mode", "implemented":true},
    "Quick Emote Menu":           { "id": "bda-es-0", "info": "Show quick emote menu for adding emotes", "implemented":true },
    "FrankerFaceZ Emotes":        { "id": "bda-es-1", "info": "Show FrankerFaceZ Emotes", "implemented":true },
    "BetterTTV Emotes":           { "id": "bda-es-2", "info": "Show BetterTTV Emotes", "implemented":true },
    "Emote Autocomplete":         { "id": "bda-es-3", "info": "Autocomplete emote commands", "implemented":false },
    "Emote Auto Capitalization":  { "id": "bda-es-4", "info": "Autocapitalize emote commands", "implemented":true },
    "Override Default Emotes":    { "id": "bda-es-5", "info": "Override default emotes", "implemented":false }
};

var defaultCookie = {
    "version":jsVersion,
    "bda-gs-0":false,
    "bda-gs-1":true,
    "bda-gs-2":false,
    "bda-gs-3":false,
    "bda-gs-4":false,
    "bda-es-0":true,
    "bda-es-1":false,
    "bda-es-2":false,
    "bda-es-3":false,
    "bda-es-4":false,
    "bda-es-5":true
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function() {

    if(version < supportedVersion) {
        alert("BetterDiscord v" + version + "(your version)" + " is not supported by the latest js("+jsVersion+"). Please download the latest version from GitHub.");
        return;
    }

    utils = new Utils();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    voiceMode = new VoiceMode();

    emoteModule.init();
    emoteModule.autoCapitalize();

    this.initSettings();
    this.initObserver();

    //Incase were too fast
    function gwDefer() {
        console.log(new Date().getTime() + " Defer");
        if($(".guilds-wrapper").size() > 0) {
            console.log(new Date().getTime() + " Defer Loaded");
            var guilds = $(".guilds li:first-child");

            guilds.after($("<li></li>", { id: "bd-pub-li", css: { "height": "20px", "display": settingsCookie["bda-gs-1"] == true ? "" : "none" } }).append($("<div/>", { class: "guild-inner", css: { "height": "20px", "border-radius": "4px" } }).append($("<a/>").append($("<div/>", { css: { "line-height": "20px", "font-size": "12px" }, text: "public", id: "bd-pub-button" })))));
            guilds.after($("<li/>", {id:"tc-settings-li"}).append($("<div/>", { class: "guild-inner" }).append($("<a/>").append($("<div/>", { class: "avatar-small", id: "tc-settings-button" })))));

            settingsPanel = new SettingsPanel();
            settingsPanel.init();

            opublicServers = new PublicServers();
            opublicServers.init();

            quickEmoteMenu.init(false);

            $("#tc-settings-button").on("click", function() { settingsPanel.show(); });
            $("#bd-pub-button").on("click", function() { opublicServers.show(); });

        } else {
            setTimeout(gwDefer(), 100);
        }
    }


    $(document).ready(function() {
        setTimeout(gwDefer, 500);
    });
};

Core.prototype.initSettings = function() {
    if($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();

        for(var setting in defaultCookie) {
            if(settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function() {
    $.cookie("better-discord", JSON.stringify(settingsCookie), { expires: 365, path: '/' });
};

Core.prototype.loadSettings = function() {
    settingsCookie = JSON.parse($.cookie("better-discord"));
};

Core.prototype.initObserver = function() {

    mainObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.target.getAttribute('class') != null) {
                if(mutation.target.getAttribute('class').indexOf("titlebar") != -1) {
                    quickEmoteMenu.obsCallback();
                }
            }
            emoteModule.obsCallback(mutation);

        });
    });

    //noinspection JSCheckFunctionSignatures
    mainObserver.observe(document, { childList: true, subtree: true });
};