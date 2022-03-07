class SettingsManager {
    constructor() {
        let defaultSettings = {
            "game": "Venice", //"Venice" "Warsaw" "Tunguska" "Casablanca" "rime-dump"
            "gameDirectoryPath": "./Games/", // "http://webx.powback.com/"
            "hashDirectoryPath": "./Hash/"
        };

        this.m_Settings = JSON.parse(localStorage.getItem("webx-settings")) || defaultSettings;

        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('webx-settings', JSON.stringify(this.m_Settings));
    }

    getGame() {
        return this.m_Settings["game"];
    }

    getEbxDirectoryPath() {
        return this.getGameDirectoryPath() + this.getGame() + "/";
    }

    getGameDirectoryPath() {
        return this.m_Settings["gameDirectoryPath"] || "./";
    }

    getHashDirectoryPath() {
        return this.m_Settings["hashDirectoryPath"] || "./";
    }
}

var s_SettingsManager = new SettingsManager();