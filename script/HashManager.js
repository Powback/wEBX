class HashManager
{


	constructor()
	{
		this.m_EventHashes = {};
		this.m_AssetHashes = {};
		this.m_InterfaceIDs = {};


		this.m_KnownIDs = {}
		this.m_UnknownHashes = {}
    }
    


    LoadHashes()
    {
        $.ajax({
			context: this,
			url: "Hash/eventHashes.json",
			dataType: 'json',
            success: function(response) 
            {
				console.log("Received eventHashes");
				this.m_EventHashes = response;
			}
		});
		$.ajax({
			context: this,
			url: "Hash/assetHashes.json",
			dataType: 'json',
            success: function(response) 
            {
				console.log("Received assetHashes");
				this.m_AssetHashes = response;
			}
		});
		$.ajax({
			context: this,
			url: "Hash/InterfaceIDs.json",
			dataType: 'json',
            success: function(response) 
            {
				console.log("Received assetHashes");
				this.m_InterfaceIDs = response;
			}
		});
    }

	GetHashResult(hash) 
	{
		if (hash == 0)
			return ""


		if (this.m_EventHashes[hash] != null) 
		{
			return this.m_EventHashes[hash];
			//return "[Event] " + this.m_EventHashes[hash];
		}

		if (this.m_KnownIDs[hash] != null) 
		{
			return this.m_KnownIDs[hash];
			//return "[Instance] " + this.m_KnownIDs[hash];
		}
		
		if (this.m_AssetHashes[hash] != null) 
		{
			return this.m_AssetHashes[hash];
			//return "[Asset] " + this.m_AssetHashes[hash];
		}
		
		if (this.m_InterfaceIDs[hash] != null) 
		{
			return "(" + this.m_InterfaceIDs[hash] + ")" + hash;
		}
		
		this.m_UnknownHashes[hash] = true;
		return hash;
	}


	RegisterInstance( instance ) 
    {
		if (instance["$fields"]["Id"] != null) 
			this.m_KnownIDs[instance["$fields"]["Id"]["$value"]] = instance["$type"];
			
        if (instance["$fields"]["PropertyConnections"] != null) 
            this.m_KnownIDs[instance["$guid"]] = instance;
    }
}

var s_HashManager = new HashManager();