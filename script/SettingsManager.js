
class SettingsManager
{
    constructor()
    {
        let Settings = localStorage.getItem("webx_settings");

        if( Settings )
        {
            this.m_Game = Settings["game"];
            this.m_DataPath = Settings["dataPath"];
        }
        else
        {
            this.m_Game = "Venice";//"Venice" "Warsaw" "Tunguska" "Casablanca" "rime-dump"
            this.m_DataPath = ""; // "http://webx.powback.com/"

            saveSettings( );
        }
    }

    saveSettings()
    {
        let SaveData = 
        {
            "game": this.m_Game,
            "dataPath": this.m_DataPath
        };

        localStorage.setItem('webx_settings', JSON.stringify(SaveData));
    }

    getGameRequestPath()
    {
        return this.getRootPath() + this.m_Game + "/";
    }

    getRootPath()
    {
        if( this.m_DataPath != "" && this.m_DataPath != null )
            return this.m_DataPath;

        return "./";
    }
}

var s_SettingsManager = new SettingsManager();