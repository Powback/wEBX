class HashManager {
	constructor() {
		this.m_EventHashes = {};	// source/target ID hashes for Event-, Property- and LinkConnections
		this.m_AssetHashes = {};	// file path/name hashes
		this.m_InterfaceIDs = {};	// idk

		this.m_UnknownHashes = {}	// attempted hashes not present in any of the above
		this.m_KnownIDs = {}		// id/type pairs for any instances that have an Id field?
    }
    
    // Request the hash files from the server 
	LoadHashes() {
        $.ajax({
			context: this,
			url: s_SettingsManager.getHashPath() + "eventHashes.json",
			async: false,
			dataType: "json",
            success: function(response) {
				console.log("Received event hashes");
				this.m_EventHashes = response;
			}
		});
		$.ajax({
			context: this,
			url: s_SettingsManager.getHashPath() + "assetHashes.json",
			async: false,
			dataType: "json",
            success: function(response) {
				console.log("Received asset hashes");
				this.m_AssetHashes = response;
			}
		});
		$.ajax({
			context: this,
			url: s_SettingsManager.getHashPath() + "InterfaceIDs.json",	// TODO: fix case
			async: false,
			dataType: "json",
            success: function(response) {
				console.log("Received interface IDs");
				this.m_InterfaceIDs = response;
			}
		});
    }

	GetHashResult(hash) {
		if (hash == 0)
			return ""

		if (this.m_EventHashes[hash] != null) {
			return this.m_EventHashes[hash];
			//return "[Event] " + this.m_EventHashes[hash];
		}

		if (this.m_KnownIDs[hash] != null) {
			return this.m_KnownIDs[hash];
			//return "[Instance] " + this.m_KnownIDs[hash];
		}
		
		if (this.m_AssetHashes[hash] != null) {
			return this.m_AssetHashes[hash];
			//return "[Asset] " + this.m_AssetHashes[hash];
		}
		
		if (this.m_InterfaceIDs[hash] != null) {
			return "(" + this.m_InterfaceIDs[hash] + ")" + hash;
		}
		
		this.m_UnknownHashes[hash] = true;
		return hash;
	}

	ForceGetHash(hash) {
		if (hash == 0) {
			return null;
		}
			
		if (this.m_EventHashes[hash] != null) {
			return this.m_EventHashes[hash];
			//return "[Event] " + this.m_EventHashes[hash];
		}

		if (this.m_KnownIDs[hash] != null) {
			return this.m_KnownIDs[hash];
			//return "[Instance] " + this.m_KnownIDs[hash];
		}
		
		if (this.m_AssetHashes[hash] != null) {
			return this.m_AssetHashes[hash];
			//return "[Asset] " + this.m_AssetHashes[hash];
		}
		
		if (this.m_InterfaceIDs[hash] != null) {
			return "(" + this.m_InterfaceIDs[hash] + ")" + hash;
		}
		
		this.m_UnknownHashes[hash] = true;
		return null;
	}

	// No clue whats going here
	RegisterInstance(instance) {
		if (instance["$fields"]["Id"] != null) {
			this.m_KnownIDs[instance["$fields"]["Id"]["$value"]] = instance["$type"];
		}
				
        if (instance["$fields"]["PropertyConnections"] != null) {
			this.m_KnownIDs[instance["$guid"]] = instance;
		}
    }
}

var s_HashManager = new HashManager();