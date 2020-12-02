
class SettingsManager
{
    constructor()
    {
        let DefaultSettings = 
        {
            "game": "Venice", //"Venice" "Warsaw" "Tunguska" "Casablanca" "rime-dump"
            "gamePath": "./Games/", // "http://webx.powback.com/"
            "hashPath": "./Hash/"
        };

        this.m_Settings = JSON.parse(localStorage.getItem("webx_settings"));

        if( this.m_Settings == null )
        {
            this.m_Settings = DefaultSettings;
        }
        else
        {
            for( let Key in DefaultSettings )
            {
                if( this.m_Settings[Key] == null)
                    this.m_Settings[Key] = DefaultSettings[Key];
            }
        }

        this.saveSettings( );

    }

    saveSettings()
    {
        if( this.m_Settings == null )
            return;

        localStorage.setItem('webx_settings', JSON.stringify(this.m_Settings));
    }

    getSettingsPath(key)
    {
        let DataPath = this.m_Settings[key];

        if( DataPath != "" && DataPath != null )
            return DataPath;

        return "./";
    }


    getGame()
    {
        return this.m_Settings["game"];
    }

    getGameRequestPath()
    {
        return this.getGamePath() + this.m_Settings["game"] + "/";
    }

    getGamePath()
    {
        return this.getSettingsPath("gamePath");
    }

    getHashPath()
    {
        return this.getSettingsPath("hashPath");
    }
}

var s_SettingsManager = new SettingsManager();