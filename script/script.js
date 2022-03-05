function Load() {
	// Create GoldenLayout panes
	CreatePageLayout();
	// Create game selection toolbar
	CreateToolbar();

	// Change hash when selecting a file in the folder tree or instance list
	// A hash change callback will update the page
	s_MessageSystem.RegisterEventHandler("OnFileSelected", function(path) {
		window.location.hash = "#" + path;
	});

	s_MessageSystem.RegisterEventHandler("OnInstanceSelected", function(instance) {
		window.location.hash = "#" + instance["partitionGuid"] + "&" + instance["instanceGuid"];
	});

	s_HashManager.LoadHashes();

	s_EbxManager.AddGuidDictionaryLoadedCallback(function(self, dictionary) {
		s_MessageSystem.ExecuteEventSync("OnGuidDictionaryLoaded", dictionary);
	})

	s_EbxManager.LoadGuidTable();

	s_MessageSystem.ExecuteEventSync("OnGameLoaded", s_SettingsManager.getGame());
}

window.onload = Load;


let g_PageLayout = null;
let g_GoldenLayoutElement = null;

function CreatePageLayout() {
	let s_Page = $('#page');

	g_GoldenLayoutElement = $(document.createElement("div"));
	g_GoldenLayoutElement.attr('id', "GoldenLayoutContainer");

	s_Page.append(g_GoldenLayoutElement);

	/*
	let SavedState = localStorage.getItem('PageLayoutConfig');

	if (SavedState != null)
		g_PageLayout = new GoldenLayout(JSON.parse(SavedState), $('#page'));
	else
	*/
		g_PageLayout = new GoldenLayout(LayoutConfig, "#GoldenLayoutContainer");

	g_PageLayout.on('stateChanged', function() {
		localStorage.setItem('PageLayoutConfig', JSON.stringify(g_PageLayout.toConfig()));
	});

	//g_PageLayout = new GoldenLayout(LayoutConfig, $('#page')); //,  $('#currentWrapper')

	g_PageLayout.registerComponent('FileEbxTree', EbxTree);
	g_PageLayout.registerComponent('FolderView', FolderView);
	//g_PageLayout.registerComponent("ThreeView", ThreeView);

	/*
	g_PageLayout.registerComponent('FileTree', function (container, state) {

		console.log(container);

		// Append it to the DOM
		container.getElement().append($('<div id="NavigationWrapper"><input id="search-input" type="text"><div id="Navigation"></div></div>'));
		//container.getElement().append($('<div id="Navigation"></div>'));

		console.log(container);

	});
	*/

	// Main EBX viewer
	g_PageLayout.registerComponent('EbxViewer', function (container, state) {
		// Append it to the DOM
		container.getElement().append($('<div id="Current"></div>'));
	});

	g_PageLayout.registerComponent('EbxGraph', GraphView);

	// Graph node EBX viewer
	g_PageLayout.registerComponent('PropertyViewer', function (container, state) {
		// Append it to the DOM
		container.getElement().append($('<div id="PropertyViewer"></div>'));
	});

	/*
	g_PageLayout.registerComponent('test', function (container, state)
	{

		// Append it to the DOM
		container.getElement().append($(`<table id="testtable">
											<tbody>
												<tr class='clickable-row' data-href='url://'>
													<td>Blah Blah</td> <td>1234567</td> <td>£158,000</td>
												</tr>
											</tbody>
										</table>`));
	});
	*/

	g_PageLayout.init();
}


function CreateToolbar() {
	let s_MenuBar = document.getElementById("menubar");
	if (s_MenuBar == null) {
		return;
	}
		
	// Create dropdown
	let s_GameSelect = document.createElement("select");
	s_GameSelect.onchange = function() {
		s_SettingsManager.m_Settings["game"] = this.value;

		s_SettingsManager.saveSettings();

		s_EbxManager.LoadGuidTable();
	};

	// TODO: Get options from server?
	let s_Options = [
		"Venice", 
		"Warsaw", 
		"Tunguska",
		"Casablanca",
		"Jupiter-debug"
	];

	// Add dropdown options
	for (let s_Key in s_Options) {
		let s_Value = s_Options[s_Key];

		let s_Option = document.createElement("option");

		s_Option.innerText = s_Value;
		s_Option.value = s_Value;

		s_GameSelect.appendChild(s_Option);
	}

	// Set active game
	s_GameSelect.value = s_SettingsManager.getGame();

	// Add to page
	s_MenuBar.appendChild(s_GameSelect);
}


function LoadEbxFromHash() {
	// Load Callback to display the primary instance (hash = path) or regular instance (hash = guids)
	let LoadCallback = function (instance, instanceGuid = null) {
		s_MessageSystem.ExecuteEventSync("OnPrimaryInstanceSelected", instance["$guid"])

		if (instanceGuid != null) {
			LoadInstance(instance["$guid"], instanceGuid)
		} else {
			LoadInstance(instance["$guid"], instance["$primaryInstance"])
		}
			

		// instance['$instances'].forEach(function(element) {
		// 	console.log("Instance ")
		// 	console.log(element);
		// }, this);
	};

	var hash = location.hash.replace(/^#/, '');
	if (hash.length == 0) {
		return;
	}
	
	// Hash is guid pair
	var params = hash.split('&');
	if (params.length == 2)	{
		s_EbxManager.LoadEbxFromGuid(params[0], LoadCallback, params[1]);
		return;
	}

	// Hash is path
	currentPath = hash;

	// If hash contains json, get the path and load the selected partition.
	let s_DotIndex = hash.lastIndexOf(".");
	if (s_DotIndex != -1) {
		let s_CleanedHash = hash.substring(0, s_DotIndex);
		
		s_EbxManager.LoadEbxFromPath(s_CleanedHash + ".json", LoadCallback);
	} else {
		s_EbxManager.LoadEbxFromGuid(hash, LoadCallback);
	}

	// TODO: Improve path vs guid handling
}

function LoadInstance(partitionGuid, instanceGuid) {
	var Blueprint = s_EbxManager.FindInstance(partitionGuid, instanceGuid);
	if (Blueprint == null) {
		return;
	}
		
	//currentPartition = Blueprint["$guid"];

	let s_Element = document.getElementById("Current");
	if( s_Element != null) {
		s_Element.innerHTML = g_EbxViewer.BuildInstance(partitionGuid, instanceGuid);
	}
		
	LoadGraphInstance(Blueprint);
}

// Anti recursive measurements
var CurrentlyLoaded = [];
var currentPartition = null;

// Not used
function DisplayPartition(partition, instanceGuid) {

	$("#Current").html("");
	var container = document.createElement('ul');
	currentPartition = partition["$guid"];
	partition['$instances'].forEach(function (element)
	{
		if (element["$guid"] == instanceGuid)
		{
			$('#Current').append(g_EbxViewer.BuildInstance(partition['$guid'], partition['$primaryInstance']));
		} else
		{
			$(container).append('<li>' + element['$type'] + '</li>');
			//			BuildInstance(element, false);
		}
	});

	//$('#Content').html(container);
}






var LayoutConfig = {
	settings: {
		hasHeaders: true,
		constrainDragToContainer: true,
		reorderEnabled: true,
		selectionEnabled: false,
		popoutWholeStack: true,
		blockedPopoutsThrowError: true,
		closePopoutsOnUnload: true,
		showPopoutIcon: false,
		showMaximiseIcon: true,
		showCloseIcon: false
	},
	dimensions: {
		borderWidth: 5,
		minItemHeight: 10,
		minItemWidth: 10,
		headerHeight: 20,
		dragProxyWidth: 300,
		dragProxyHeight: 200
	},
	labels:	{
		close: 'close',
		maximise: 'maximise',
		minimise: 'minimise',
		popout: 'open in new window'
	},
	content: [{
		type: 'row',
		content: [{
			type: 'stack',
			title: '',
			content: [{
				type: 'component',
				componentName: 'FileEbxTree',
				title: 'File Browser',

				isClosable: false,
			},{
				type: 'component',
				componentName: 'FolderView',
				title: 'Instance List',

				isClosable: true,
			}]
		},{
			type: 'stack',
			title: '',
			content:[{
				type: 'component',
				componentName: 'EbxViewer',

				title: "Ebx Viewer",
				isClosable: false,
			},{
				type: 'component',
				componentName: 'EbxGraph',

				title: "Graph View",
				isClosable: false,
			}]
		},{
			type: 'component',
			componentName: 'PropertyViewer',

			title: "Graph Ebx View",

			isClosable: false,
		}]
	}]
};

// TODO: Improve file selecting and loading
$(window).on('hashchange', function(e) {
	LoadEbxFromHash();
});

$(window).resize(function() {
	if (g_PageLayout != null) {
		g_PageLayout.updateSize();
	}	
});

$(document).on('click', 'field', function() {
	if ($(this).parent().children().length > 2)	{
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
			$(this).parent().html(g_EbxViewer.HandleReferencePost(partitionGuid, instanceGuid, parentPartition));

		}
	}
});


$(document).on('dblclick', '.ref h1', function() {
	var partitionGuid = $(this).parent().attr("partitionGuid");
	var instanceGuid = $(this).parent().attr("instanceGuid");

	if (partitionGuid == null && instanceGuid == null) {
		return;
	}

	//history.pushState(null, null, "#" + partitionGuid + "&" + instanceGuid);
	window.location.hash = "#" + partitionGuid + "&" + instanceGuid;
	//window.location.reload();

});


$(document).on('click', 'div.guidReference', function() {
	$(this).select();
});

$(document).on('click', 'label', function() {
	$(this).next().select();
});
$(document).on('click', 'value', function() {
	$(this).selectText();
});

$(document).on('click', 'field', function() {
	$(this).selectText();
});

jQuery.fn.selectText = function() {
	var doc = document;
	var element = this[0];
	if (doc.body.createTextRange) {
		var range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();

	} else if (window.getSelection) {
		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
};