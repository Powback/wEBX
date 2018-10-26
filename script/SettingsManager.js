
class SettingsManager
{
    constructor()
    {
        this.m_Game = "rime-dump";//"Venice" "Warsaw" "Tunguska" "Casablanca"
        this.m_DataPath = "http://webx.powback.com/";
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