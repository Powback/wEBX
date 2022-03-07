class EbxManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.m_GuidDictionary = {};
        this.m_LoadedPartitions = {};
    }

    getPartitionPath(partitionGuid) {
        return this.m_GuidDictionary[partitionGuid] ?? "*unknownRef* " + partitionGuid.toUpperCase();
    }

    findInstance(partitionGuid, instanceGuid, shouldLoad = true) {
        let partition = this.findPartition(partitionGuid, shouldLoad);

        if (partition == null || partition["$instanceGuidMap"] == null) {
            return null;
        }

        return partition["$instanceGuidMap"][instanceGuid];
    }

    findPartition(partitionGuid, shouldLoad = true) {
        if (this.m_LoadedPartitions[partitionGuid] == null && shouldLoad) {
            this.loadPartition(partitionGuid); 
        }

        return this.m_LoadedPartitions[partitionGuid];
    }

    loadPartition(partitionGuid, loadCallback = null, instanceGuid = null) {
        let partitionPath = this.m_GuidDictionary[partitionGuid];

        if (partitionPath == null) {
            console.error("Could not find path for partition: " + partitionGuid)
            return false;
        }
        
        return this.loadPartitionFromPath(partitionPath + ".json", loadCallback, instanceGuid)
    }


    loadPartitionFromPath(path, loadCallback = null, failedCallback = null) {
        $.ajax({
            context: this,
            url: s_SettingsManager.getEbxDirectoryPath() + path,
            dataType: "json",
            async: false,

            beforeSend: function(xhr) {
                xhr.setRequestHeader('Accept', "text/html; charset=utf-8");
            },

            success: function(partition) {
                // Build guid/instance map
                let map = {}
                $.each(partition['$instances'], function(index, instance) {
                    map[instance['$guid']] = instance
                })
                partition['$instanceGuidMap'] = map

                // Save partition
                this.m_LoadedPartitions[partition['$guid']] = partition;
                
                
                if (loadCallback != null) {
                    loadCallback(partition);
                }     
            },

            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                console.log("Failed to load partition: "  + s_SettingsManager.getEbxDirectoryPath() + "/" + path)
                
                if (failedCallback != null) {
                    failedCallback(path)
                } 
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
            }
        });
    }
}

var s_EbxManager = new EbxManager()