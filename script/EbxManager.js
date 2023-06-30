class EbxManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.m_GuidDictionary = {};
        this.m_LoadedPartitions = {};
    }

    getPartitionPath(partitionGuid) {

        let s_PartitionPath = this.m_GuidDictionary[partitionGuid];

        if (s_PartitionPath == null) 
            s_PartitionPath = this.m_GuidDictionary[partitionGuid.toLowerCase()];

        if (s_PartitionPath == null) 
            s_PartitionPath = this.m_GuidDictionary[partitionGuid.toUpperCase()];

        //if (s_PartitionPath == null) 
        //    return "*unknownRef* " + partitionGuid.toUpperCase()


        return s_PartitionPath;
    }

    findInstance(partitionGuid, instanceGuid, shouldLoad = true) 
    {
        let partition = this.findPartition(partitionGuid, shouldLoad);

        if (partition == null || 
            partition["$instanceGuidMap"] == null)
            return null;

        return partition["$instanceGuidMap"][instanceGuid.toLowerCase()];
    }

    findPartition(partitionGuid, shouldLoad = true) 
    {
        if (this.m_LoadedPartitions[partitionGuid.toLowerCase()] == null && shouldLoad) 
            this.loadPartition(partitionGuid); 

        return this.m_LoadedPartitions[partitionGuid];
    }

    loadPartition(partitionGuid, loadCallback = null, instanceGuid = null) 
    {
        let partitionPath = this.getPartitionPath(partitionGuid);

        if (partitionPath == null) 
        {
            console.error("Could not find path for partition: " + partitionGuid)
            return false;
        }
        
        return this.loadPartitionFromPath(partitionPath + ".json", loadCallback, instanceGuid)
    }


    loadPartitionFromPath(path, loadCallback = null, instanceGuid = null) 
    {
        $.ajax({
            context: this,
            url: s_SettingsManager.getEbxDirectoryPath() + path,
            dataType: "json",
            async: false,

            beforeSend: function(xhr) 
            {
                xhr.setRequestHeader('Accept', "text/html; charset=utf-8");
            },

            success: function(partition) 
            {
                // Build guid/instance map
                let map = {}
                $.each(partition['$instances'], function(index, instance) {
                    map[instance['$guid'].toLowerCase()] = instance
                });

                partition['$instanceGuidMap'] = map;

                // Save partition
                this.m_LoadedPartitions[partition['$guid'].toLowerCase()] = partition;
                
                if (loadCallback != null)
                    loadCallback(partition, instanceGuid);
            },

            error: function(xhr, status, error) 
            {
                console.log(xhr.statusText);
                console.log("Failed to load partition: "  + s_SettingsManager.getEbxDirectoryPath() + "/" + path)
                
                //if (failedCallback != null)
                //    failedCallback(path);
            },
        });
    }

    loadGuidDictionary() {
        this.reset();

        $.ajax({
            context: this,
            url: s_SettingsManager.getEbxDirectoryPath() + "guidDictionary.json",
            dataType: "json",
            success: function(dictionary) {
                this.m_GuidDictionary = dictionary;

                s_MessageSystem.executeEventSync("OnGuidDictionaryLoaded", dictionary);
            },
            error: function(xhr, status, error) {
                console.log(xhr);
                console.log("Failed to load guidDictionary.json: " + s_SettingsManager.getEbxDirectoryPath()  + "guidDictionary.json")
            
                alert("Failed to load guidDictionary.json..\n Does this game exist on server?");
            }
        });
    }
}

var s_EbxManager = new EbxManager()