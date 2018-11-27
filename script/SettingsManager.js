
class SettingsManager
{
    constructor()
    {
        this.m_Settings = JSON.parse(localStorage.getItem("webx_settings"));

        if( this.m_Settings == null )
        {
            this.m_Settings = 
            {
                "game": "Venice", //"Venice" "Warsaw" "Tunguska" "Casablanca" "rime-dump"
                "dataPath": "" // "http://webx.powback.com/"
            };

           this.saveSettings( );

        }
    }

    saveSettings()
    {
        if( this.m_Settings == null )
            return;

        localStorage.setItem('webx_settings', JSON.stringify(this.m_Settings));
    }

    getGameRequestPath()
    {
        return this.getRootPath() + this.m_Settings["game"] + "/";
    }

    getRootPath()
    {
        let DataPath = this.m_Settings["dataPath"];

        if( DataPath != "" && DataPath != null )
            return DataPath;

        return "./";
    }
}

var s_SettingsManager = new SettingsManager();