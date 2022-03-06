

class EbxManager {
    constructor() {
        this.Reset();

        this.m_PartitionLoadedCallback = [];
        this.m_GuidDictionaryLoadedCallback = [];
    }

    Reset() {
        this.m_GuidDictionary = {};
        this.m_LoadedPartitions = {};

        this.m_FileTree = {};
    }


    AddParitionLoadedCallback(callback) {
        this.m_PartitionLoadedCallback.push(callback);
    }

    AddGuidDictionaryLoadedCallback(callback) {
        this.m_GuidDictionaryLoadedCallback.push(callback);
    }


    GetPartitionGuidPath(partitionGuid) {
        if (this.m_GuidDictionary[partitionGuid] != null){
            return this.m_GuidDictionary[partitionGuid];
        }
            
        return "*unknownRef* " + partitionGuid.toUpperCase();
    }

    AddPartitionGuidPath(partitionGuid, path) {
        if( this.m_GuidDictionary[partitionGuid] != null )
            return;

        this.m_GuidDictionary[partitionGuid] = path;
    }

    FindPartition(partitionGuid, shouldLoad = true) {
        if( partitionGuid == null)
            return null;

        if( this.m_LoadedPartitions[partitionGuid] == null && shouldLoad == true )
            this.LoadEbxFromGuid(partitionGuid); 

        // Ghetto case sensitive fix
        let s_LoadedPartition = this.m_LoadedPartitions[partitionGuid];

        if (s_LoadedPartition == null)
            s_LoadedPartition = this.m_LoadedPartitions[partitionGuid.toLowerCase()];

        if (s_LoadedPartition == null)
            s_LoadedPartition = this.m_LoadedPartitions[partitionGuid.toUpperCase()];

        return s_LoadedPartition
    }

    FindInstance(partitionGuid, instanceGuid, shouldLoad = true) {
        if (instanceGuid == null)
            return null;

        let s_Partition = this.FindPartition(partitionGuid);

        if (s_Partition == null ||
            s_Partition["InstanceGuidMap"] == null)
            return null;


        let s_Instance = s_Partition["InstanceGuidMap"][instanceGuid];

        if (s_Instance == null)
            s_Instance = s_Partition["InstanceGuidMap"][instanceGuid.toLowerCase()];

        if (s_Instance == null)
            s_Instance = s_Partition["InstanceGuidMap"][instanceGuid.toUpperCase()];

        return s_Instance;
    }

    
    LoadEbxFromGuid(partitionGuid, loadCallback = null, instanceGuid = null) {
        // Ghetto case sensitive fix...
        let partitionPath = this.m_GuidDictionary[partitionGuid];

        if (partitionPath == null) 
            partitionPath = this.m_GuidDictionary[partitionGuid.toLowerCase()];

        if (partitionPath == null) 
            partitionPath = this.m_GuidDictionary[partitionGuid.toUpperCase()];

        if (partitionPath == null) {
            console.error("Tried to load a partition that does not exsits: " + partitionGuid)
            return false;
        }
        
        return this.LoadEbxFromPath(partitionPath + ".json", loadCallback, instanceGuid)
    }


    LoadEbxFromPath(path, loadCallback = null, instanceGuid = null, failedCallback = null) {
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

            success: function(response) {
                this.m_LoadedPartitions[response['$guid']] = response;

                this.m_LoadedPartitions[response['$guid']]["InstanceGuidMap"] = {};

                response['$instances'].forEach(function(element) 
                {
                    this.m_LoadedPartitions[response['$guid']]["InstanceGuidMap"][element['$guid']] = element;
                }, this);

                this.AddPartitionGuidPath( response['$guid'], path );

                this.m_PartitionLoadedCallback.forEach( function(callback)      // TODO: Dispatch event instead of callback system?
                {
                    callback( this );
                }, response);

                if (loadCallback != null)
                    loadCallback( response, instanceGuid );
            },

            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                console.log("Failed to load partition: "  + s_SettingsManager.getGameRequestPath() + "/" + path)
                
                if (failedCallback != null)
                    failedCallback(path)
            },
        });
    }


    LoadGuidTable() {
        this.Reset();

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
                console.log(xhr.responseText);

                console.log("Failed to load guidDictionary.json: " + s_SettingsManager.getGameRequestPath()  + "/guidDictionary.json")
            }
        });

    }
}

var s_EbxManager = new EbxManager();