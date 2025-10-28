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
	

	setSetting(key, value) {
		let s_Old = this.m_Settings[key];
		this.m_Settings[key] = value;
		console.log(this.m_Settings, key, value);
		return s_Old;
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