class HashManager
{


	constructor()
	{
		this.m_EventHashes = null;
		this.m_AssetHashes = null;
		this.m_InterfaceIDs = null;

		this.m_UnknownHashes = {}
    }
    


    LoadHashes()
    {
        $.ajax({
			url: "eventHashes.json",
			dataType: 'json',
            success: function(response) 
            {
				console.log("Received eventHashes");
				this.m_EventHashes = response;
			}
		});
		$.ajax({
			url: "assetHashes.json",
			dataType: 'json',
            success: function(response) 
            {
				console.log("Received assetHashes");
				this.m_AssetHashes = response;
			}
		});
		$.ajax({
			url: "InterfaceIDs.json",
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
		/*
		if (knownIDs[hash] != null) 
		{
			return "[Instance] " + knownIDs[hash];
		}
		*/
		if (this.m_EventHashes[hash] != null) 
		{
			return "[Event] " + this.m_EventHashes[hash];
		}
		if (this.m_AssetHashes[hash] != null) 
		{
			return "[Asset] " + this.m_AssetHashes[hash];
		}
		if (this.m_InterfaceIDs[hash] != null) 
		{
			return "(" + this.m_InterfaceIDs[hash] + ")" + hash;
		}
		
		this.m_UnknownHashes[hash] = true;
		return hash;
	}
}

const s_HashManager = new HashManager();
Object.freeze(s_HashManager);

//export default s_HashManager;