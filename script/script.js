var basePath = "rime-dump//";
var currentPath = "";
var currentPartition = null;
var currentPartitionGuid = null;
var guidDictionary = null;
var eventHashes = null;
var assetHashes = null;
var interfaceIDs = null;
// Loaded partitions sorted by GUID
var loadedPartitions = [];

// Loaded instances, sorted by GUID
var loadedInstances = [];

// Anti recursive measurements
var CurrentlyLoaded = [];

// Types that we can render directly.
var simpleTypes = {
	"String": true,
	"Int32": true,
	"UInt32": true,
	"UInt16": true,
	"Int16": true,
	"Float32": true,
	"Double": true,
	"Single": true,
	"Boolean": true,
	"SByte": true,
	"MathOp": true
}

var advancedTypes = {
	"Vec2": true,
	"Vec3": true,
	"Vec4": true,
	"GUID": true,
	"LinearTransform": true
}



function DisplayPartition(partition, instanceGuid) {
	
	$("#Current").html("");
	var container = document.createElement('ul');
	currentPartition = partition["$guid"];
	partition['$instances'].forEach(function(element) {
		if (element["$guid"] == instanceGuid) {
			$('#Current').append(BuildInstance(partition['$guid'], partition['$primaryInstance']));
		} else {
			$(container).append('<li>' + element['$type'] + '</li>');
			//			BuildInstance(element, false);
		}
	});
	
	//$('#Content').html(container);
}

function LoadInstance(partitionGuid, instanceGuid)
{
	var Blueprint = FindInstance( partitionGuid, 
								  instanceGuid );

	
	if( Blueprint == null )
		return;


	$("#Current").html("");
	$('#Current').append( BuildInstance( partitionGuid, 
										instanceGuid ) );

	Init();
	LoadGraphInstance(Blueprint);
}








window.onload = function() 
{
	LoadDirectory();

	s_HashManager.LoadHashes( );
	
	$.ajax({
		url: "guidDictionary.json",
		dataType: 'json',
		success: function(response) {
			console.log("Received guidDictionary");
			guidDictionary = response;
			OnLoad();
		}
	});
}

function OnLoad() {
	Init();

	console.log( "Loc: " + window.location.href );

	var hash = location.hash.replace(/^#/, '');

	var params = hash.split('&');

	if( params.length == 2 )
	{
		LoadPartitionFromGuid(params[0].toLowerCase(), params[1].toLowerCase())
		return;
	}


	currentPath = hash;

	// If hash contains json, get the path and load the selected partition.
	if (hash.indexOf(".ebx") != -1) 
	{
		LoadPartitionFromPath(hash.replace(".ebx", ".json"), true);
	}
};

// hash changed, either load 
$(window).on('hashchange', function(e) {
	OnLoad();
});


$(document).on('click', 'field', function() {
	if ($(this).parent().children().length > 2) {
		if ($(this).parent().hasClass("minimized")) {
			$(this).parent().removeClass("minimized");
		} else {
			$(this).parent().addClass("minimized");
		}
	}
});

$(document).on('click', '.ref h1', function() {
	if ($(this).parent().hasClass("selected")) {
		$(this).parent().removeClass("selected");
	} else {
		$(this).parent().addClass("selected");
		var partitionGuid = $(this).parent().attr("partitionGuid");
		var instanceGuid = $(this).parent().attr("instanceGuid");
		var parentPartition = $(this).parent().attr("parentPartition");
		var loaded = $(this).parent().hasClass("loaded");
		if (partitionGuid != null && instanceGuid != null && loaded == false) {
			$(this).parent().addClass("loaded");
			$(this).parent().html(HandleReferencePost(partitionGuid, instanceGuid, parentPartition));

		}


	}
});


$(document).on('dblclick', '.ref h1', function() 
{
	console.log("DoubleClick");


	var partitionGuid = $(this).parent().attr("partitionGuid");
	var instanceGuid = $(this).parent().attr("instanceGuid");

	if (partitionGuid == null && instanceGuid == null) 
		return;


	//history.pushState(null, null, "#" + partitionGuid + "&" + instanceGuid);
	window.location.hash = "#" + partitionGuid + "&" + instanceGuid;
	//window.location.reload();

});


$(document).on('click', 'div.guidReference', function() 
{
	$(this).select();
});

$(document).on('click', 'label', function() 
{
	$(this).next().select();
});
$(document).on('click', 'value', function() 
{
	$(this).selectText();
});

$(document).on('click', 'field', function() 
{
	$(this).selectText();
});

jQuery.fn.selectText = function() 
{
	var doc = document;
	var element = this[0];
	if (doc.body.createTextRange) 
	{
		var range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} 
	else if (window.getSelection) 
	{
		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
};