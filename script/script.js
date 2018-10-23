// Anti recursive measurements
var CurrentlyLoaded = [];

var currentPartition = null;


function DisplayPartition(partition, instanceGuid) {
	
	$("#Current").html("");
	var container = document.createElement('ul');
	currentPartition = partition["$guid"];
	partition['$instances'].forEach(function(element) 
	{
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
	var Blueprint = s_EbxManager.FindInstance( partitionGuid, 
								               instanceGuid );

	
	if( Blueprint == null )
		return;

	currentPartition = Blueprint["$guid"];


	$("#Current").html("");
	$('#Current').append( BuildInstance( partitionGuid, 
										 instanceGuid ) );

	LoadGraphInstance(Blueprint);
}


function LoadEbxFromHash()
{
	LoadCallback = function( instance, instanceGuid=null )
	{
		if( instanceGuid != null)
			LoadInstance(instance["$guid"], instanceGuid)
		else
			LoadInstance(instance["$guid"], instance["$primaryInstance"])
	};

	var hash = location.hash.replace( /^#/, '' );

	if(hash.length == 0)
		return;

	var params = hash.split( '&' );

	if( params.length == 2 )
	{
		s_EbxManager.LoadEbxFromGuid( params[0].toLowerCase( ),
									  LoadCallback,
									  params[1].toLowerCase( ) );
		return;
	}


	currentPath = hash;

	// If hash contains json, get the path and load the selected partition.
	//if (hash.indexOf(".ebx") != -1) 
	{
		s_EbxManager.LoadEbxFromPath( hash.replace(".ebx", "").replace(".json", "") + ".json", 
									  LoadCallback );
	}
}


function Load() 
{
	//LoadDirectory();

	s_HashManager.LoadHashes( );
	
	s_EbxManager.AddParitionLoadedCallback( function( response ) 
	{
		if( response['$instances'] == null )
			return;

		response['$instances'].forEach(function(element) 
		{
			s_HashManager.RegisterInstance( element );
		}, this);
	});

	s_EbxManager.AddGuidDictionaryLoadedCallback( function( self, dictionary )
	{
		s_EbxTree.GenerateData( self.m_Game, dictionary );
	} )

	s_EbxManager.LoadGuidTable( );

	LoadEbxFromHash( );
}






window.onload = Load;

// hash changed, either load 
$(window).on('hashchange', function( e ) 
{
	LoadEbxFromHash( );
	//Load();
	//OnLoad();
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

$(document).on('click', '.ref h1', function() 
{
	if ($(this).parent().hasClass("selected")) 
	{
		$(this).parent().removeClass("selected");
	} 
	else 
	{
		$(this).parent().addClass("selected");
		var partitionGuid = $(this).parent().attr("partitionGuid");
		var instanceGuid = $(this).parent().attr("instanceGuid");
		var parentPartition = $(this).parent().attr("parentPartition");
		var loaded = $(this).parent().hasClass("loaded");

		if (partitionGuid != null && instanceGuid != null && loaded == false) 
		{
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