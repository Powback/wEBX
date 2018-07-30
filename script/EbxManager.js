
function FindInstance(partitionGuid, instanceGuid) 
{
	if( partitionGuid == null)
		return null;

	if( loadedPartitions[partitionGuid] == null)
		LoadPartitionFromGuid(partitionGuid);

	if( instanceGuid == null)
		return null;

	if (loadedPartitions[partitionGuid] != null && loadedPartitions[partitionGuid][instanceGuid] != null)
		return loadedPartitions[partitionGuid][instanceGuid];
	
	return null;
}


function LoadPartitionFromGuid(guid, instanceGuid=null) 
{
	console.log("loading partition " + basePath + guidDictionary[guid])
	if (!guidDictionary[guid]) 
	{
		console.error("Tried to load a partition that does not exsits: " + guid)
		loadedPartitions[guid] == "nonexistant";
		return true;
	}
	$.ajax({
		url: basePath + guidDictionary[guid] + ".json",
		dataType: 'json',
		async: false,
		success: function(response) {
			loadedPartitions[response['$guid']] = [];
			response['$instances'].forEach(function(element) {
				loadedPartitions[response['$guid']][element['$guid']] = element;
				RegisterInstance(element);

			});

			if (instanceGuid != null)
				LoadInstance(guid, instanceGuid);

			console.log("Partition loaded");
			return false;
		},
		error: function() {
			return true;
		},
	});

}


function LoadPartitionFromPath(path, display = false) 
{
	$.ajax({
		url: basePath + path,
		dataType: 'json',
		async: false,
		success: function(response) {
			loadedPartitions[response['$guid']] = [];
			response['$instances'].forEach(function(element) {
				loadedPartitions[response['$guid']][element['$guid']] = element;
				RegisterInstance(element);
			});

			if (display) {
				CurrentlyLoaded = [];
				LoadInstance(response["$guid"], response["$primaryInstance"])
				//DisplayPartition(response, partition["$primaryInstance"]);
				return false;
			}

		},
		error: function() {
			console.log("Failed to load partition: " + path)
			return true;

		},
	});


	


}