

class EbxManager
{
    constructor()
    {
        this.m_GuidDictionary = {};
        this.m_LoadedPartitions = {};

        this.m_FileTree = {};

        this.m_PartitionLoadedCallback = [];
        this.m_GuidDictionaryLoadedCallback = [];
    }

    SetGame( name )
    {
        this.m_Game = name
    }
    

    AddParitionLoadedCallback( callback )
    {
        this.m_PartitionLoadedCallback.push( callback );
    }

    AddGuidDictionaryLoadedCallback( callback )
    {
        this.m_GuidDictionaryLoadedCallback.push( callback );
    }


    GetPartitionGuidPath( partitionGuid )
    {
        if( this.m_GuidDictionary[partitionGuid] != null)
            return this.m_GuidDictionary[partitionGuid];

        return "*unknownRef* " + partitionGuid.toUpperCase();
    }

    AddPartitionGuidPath( partitionGuid, path )
    {
        if( this.m_GuidDictionary[partitionGuid] != null )
            return;

        this.m_GuidDictionary[partitionGuid] = path;
    }

    FindPartition( partitionGuid, shouldLoad = true ) 
    {
        if( partitionGuid == null)
            return null;

        if( this.m_LoadedPartitions[partitionGuid] == null && shouldLoad == true )
            this.LoadEbxFromGuid(partitionGuid); 

        return this.m_LoadedPartitions[partitionGuid];
    }

    FindInstance( partitionGuid, instanceGuid, shouldLoad = true ) 
    {
        if( instanceGuid == null)
            return null;

        var Partition = this.FindPartition(partitionGuid);

        if (Partition == null ||
            Partition["InstanceGuidMap"][instanceGuid] == null)
            return null;


        return Partition["InstanceGuidMap"][instanceGuid];
    }

    
    LoadEbxFromGuid( partitionGuid, loadCallback = null, instanceGuid = null, ) 
    {
        if (!this.m_GuidDictionary[partitionGuid]) 
        {
            console.error("Tried to load a partition that does not exsits: " + partitionGuid)
            return false;
        }
        
        return this.LoadEbxFromPath( this.m_GuidDictionary[partitionGuid] + ".json", loadCallback, instanceGuid )
    }


    LoadEbxFromPath(path, loadCallback = null, instanceGuid = null) 
    {
        console.log("Loading partition " + s_SettingsManager.getGameRequestPath()+ path)
        $.ajax({
            context: this,
            url: s_SettingsManager.getGameRequestPath() + path,
            dataType: "json",
            //contentType: "application/json; charset=windows-1252", //iso-8859-1
            async: false,

            beforeSend: function(xhr) {
                xhr.setRequestHeader('Accept', "text/html; charset=utf-8");
                //xhr.overrideMimeType('application/json; charset=windows-1252');
            },

            success: function(response) 
            {

                
                this.m_LoadedPartitions[response['$guid']] = response;


                this.m_LoadedPartitions[response['$guid']]["InstanceGuidMap"] = {};

                response['$instances'].forEach(function(element) 
                {
                    this.m_LoadedPartitions[response['$guid']]["InstanceGuidMap"][element['$guid']] = element;
                }, this);

                this.AddPartitionGuidPath( response['$guid'], path );

                this.m_PartitionLoadedCallback.forEach( function(callback)
                {
                    callback( this );
                }, response);

                if (loadCallback != null)
                    loadCallback( response, instanceGuid );
            },
            error: function(xhr, status, error) 
            {
                console.log(xhr.responseText);
                var err = JSON.parse( xhr.responseText );
                console.log("Failed to load partition: "  + this.m_Game + "/" + path)

                console.log( err )
            },
        });
    }


    

    LoadGuidTable()
    {
        console.log( "Loading guidTable \"" + s_SettingsManager.getGameRequestPath() + "guidDictionary.json" +"\"");
        $.ajax({
            context: this,
            url: s_SettingsManager.getGameRequestPath() + "guidDictionary.json",
            dataType: "json",
            success: function(response) 
            {
                console.log("guidDictionary loaded!");

                
                this.m_GuidDictionary = response;

                this.m_GuidDictionaryLoadedCallback.forEach( function(callback)
                {
                    callback( this, this.m_GuidDictionary );
                }, this);
            },
            error: function(xhr, status, error) 
            {
                var err = JSON.parse(xhr.responseText);

                console.log("Failed to load guidDictionary.json: " + this.m_Game  + "/guidDictionary.json")
                console.log( err )
            }
        });

    }
}


var s_EbxManager = new EbxManager();