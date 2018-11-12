
class SettingsManager
{
    constructor()
    {
        this.m_Game = "Casablanca";//"Venice" "Warsaw" "Tunguska" "Casablanca" "rime-dump"
        this.m_DataPath = ""; // "http://webx.powback.com/"
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