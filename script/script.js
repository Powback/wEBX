



var g_DefaultLayout = {
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
		borderWidth: 7,
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
				componentName: 'DirectoryTreeView',
				title: 'File Browser',

				isClosable: false,
			},{
				type: 'component',
				componentName: 'InstanceList',
				title: 'Instance List',

				isClosable: true,
			}]
		},{
			type: 'stack',
			title: '',
			content:[{
				type: 'component',
				componentName: 'MainEbxViewer',

				title: "Ebx Viewer",
				isClosable: false,
			},{
				type: 'component',
				componentName: 'ConnectionGraph',

				title: "Graph View",
				isClosable: false,
			},{
				type: 'component',
				componentName: 'ComponentView',

				title: "3d Component view",
				isClosable: false,
			}]
		},{
			type: 'component',
			componentName: 'GraphEbxViewer',

			title: "Graph Ebx View",

			isClosable: false,
		}]
	}]
};

function Load() {
	// Create GoldenLayout panes
	CreatePageLayout();
	// Create game selection toolbar
	CreateToolbar();
	// Show bookmarked partitions
	CreateBookmarks();

	s_MessageSystem.registerEventHandler("OnGuidDictionaryLoaded", function (dictionary) {
		LoadEbxFromHash();
	});

	s_MessageSystem.registerEventHandler("OnObjectsSelected", OnObjectsSelected_PropertyViewer);
	s_MessageSystem.registerEventHandler("OnObjectsSelected", OnObjectsSelected_Nodes);

	// Change hash when selecting a file in the folder tree or instance list
	// A hash change callback will update the page
	s_MessageSystem.registerEventHandler("OnFileSelected", function(path) {
		document.title = getFilename(path)
		window.location.hash = "#" + path;
	});

	s_MessageSystem.registerEventHandler("OnInstanceSelected", function(instance) {
		document.title = ""
		window.location.hash = "#" + instance["partitionGuid"] + "&" + instance["instanceGuid"];
	});

	s_HashManager.loadHashes();

	s_EbxManager.loadGuidDictionary();

	s_MessageSystem.executeEventSync("OnGameLoaded", s_SettingsManager.getGame());

}

window.onload = Load;


let g_PageLayout = null;
let g_GoldenLayoutElement = null;

function CreatePageLayout() {
	g_GoldenLayoutElement = document.getElementById("layout-container");

	// Use stored layout if present
	let savedLayout = localStorage.getItem('page-layout');
	if (savedLayout != null) {
		g_PageLayout = new GoldenLayout(JSON.parse(savedLayout), g_GoldenLayoutElement);
	} else {
		g_PageLayout = new GoldenLayout(g_DefaultLayout, g_GoldenLayoutElement);
	}
		
	// Save changes
	g_PageLayout.on('stateChanged', function() {
		localStorage.setItem('page-layout', JSON.stringify(g_PageLayout.toConfig()));
	});

	// Folder navigation
	g_PageLayout.registerComponent('DirectoryTreeView', EbxTree);

	// Partition instance list
	g_PageLayout.registerComponent('InstanceList', InstanceList);
	
	// Main EBX viewer
	g_PageLayout.registerComponent('MainEbxViewer', function (container, state) {
		container.getElement().append($('<div id="Current"></div>'));
	});

	// Connection graph
	g_PageLayout.registerComponent('ConnectionGraph', GraphView);

	// Graph node EBX viewer
	g_PageLayout.registerComponent('GraphEbxViewer', function (container, state) {
		container.getElement().append($('<div id="PropertyViewer"></div>'));
	});


	// Partition instance list
	g_PageLayout.registerComponent('ComponentView', ComponentView);

	g_PageLayout.init();
}


function CreateToolbar() {
	let s_Toolbar = document.getElementById("toolbar");
	if (s_Toolbar == null) {
		return;
	}
		
	// Create dropdown
	let s_GameSelect = document.getElementById("game-select");
	s_GameSelect.onchange = function() {
		s_SettingsManager.m_Settings["game"] = this.value;

		s_SettingsManager.saveSettings();

		s_EbxManager.loadGuidDictionary();
	};

	// TODO: Get options from server?
	let s_Options = [
		"Venice", 
		"Warsaw", 
		"Tunguska",
		"Casablanca",
		"Jupiter-debug",
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
}

function CreateBookmarks() {
	let centerContainer = document.getElementById("Current");

	let bookmarkedPartitions = localStorage.getItem('bookmarks');
	if (bookmarkedPartitions != null) {
		let bookmarks = CreateList(bookmarkedPartitions, 'Bookmarks');
		centerContainer.appendChild(bookmarks);
	}

	let recentlyVisited = localStorage.getItem('recently-visited');
	if (recentlyVisited != null) {
		let recents = CreateList(recentlyVisited, 'Recently visited');
		centerContainer.appendChild(recents);
	}
}

function CreateList(data, title) {
	let listContainer = document.createElement("div");

	let header = document.createElement('p');
	header.classList.add("bookmark-list-title");
	header.innerHTML = title;
	listContainer.appendChild(header);

	let list = document.createElement('ul');
	list.classList.add('bookmark-list');
	listContainer.appendChild(list)

	JSON.parse(data).forEach(function(path) {
		let item = document.createElement('li');
		item.innerHTML = `<a href="#${path}">${path.slice(0, -5)} </a>`;
		item.classList.add('bookmark');
		list.appendChild(item);
	});

	return listContainer;
}


function LoadEbxFromHash() {
	// Load Callback to display the primary instance (hash = path) or regular instance (hash = guids)
	let LoadCallback = function (partition, instanceGuid = null) {
		s_MessageSystem.executeEventSync("OnPrimaryInstanceSelected", partition["$guid"])


		// just replace hash with partition guid path, makes url cleaner but adds more processing.
		if (instanceGuid != null &&
			instanceGuid.toLowerCase() == partition["$primaryInstance"].toLowerCase())
		{
			window.location.hash = "#" + s_EbxManager.getPartitionPath(partition["$guid"]) + ".json";

			//LoadInstance(partition["$guid"], partition["$primaryInstance"]);
			return;
		}

		if (instanceGuid != null)
			LoadInstance(partition["$guid"], instanceGuid);
		else
			LoadInstance(partition["$guid"], partition["$primaryInstance"]);
	};

	var hash = location.hash.replace(/^#/, '');
	if (hash.length == 0)
		return;
	
	// Hash is guid pair
	var params = hash.split('&');
	if (params.length == 2)	{
		s_EbxManager.loadPartition(params[0], LoadCallback, params[1]);
		return;
	}

	// Hash is path
	currentPath = hash;

	// If hash contains json, get the path and load the selected partition.
	let s_DotIndex = hash.lastIndexOf(".");
	if (s_DotIndex != -1) {
		let cleanedHash = hash.substring(0, s_DotIndex);
		
		s_EbxManager.loadPartitionFromPath(cleanedHash + ".json", LoadCallback);
	} else {
		s_EbxManager.loadPartition(hash, LoadCallback);
	}

	// TODO: Improve path vs guid handling
}

function LoadInstance(partitionGuid, instanceGuid) {
	var instance = s_EbxManager.findInstance(partitionGuid, instanceGuid);
	if (instance == null)
		return;
		
	if (document.title === "") 
		document.title = instance['$type']

	// s_EbxManager.findPartition(partitionGuid)
	// s_MessageSystem.executeEventSync("PartitionLoaded", partition["$guid"])

	let s_Element = document.getElementById("Current");
	if (s_Element != null)
		s_Element.innerHTML = g_EbxViewer.BuildInstance(partitionGuid, instanceGuid);
		
	LoadGraphInstance(instance);
}


// Not used
function DisplayPartition(partition, instanceGuid) {

	$("#Current").html("");
	var container = document.createElement('ul');
	partition['$instances'].forEach(function (element)
	{
		if (element["$guid"] == instanceGuid)
		{
			$('#Current').append(g_EbxViewer.BuildInstance(partition['$guid'], partition['$primaryInstance']));
		} 
		else
		{
			$(container).append('<li>' + element['$type'] + '</li>');
		}
	});

}


function OnObjectsSelected_PropertyViewer(data)
{

	if(data["$instanceGuids"].length == 0)
		return;

	$("#PropertyViewer").html("");

	for (let s_GuidIndex in data["$instanceGuids"])
	{
		let s_Guid = data["$instanceGuids"][s_GuidIndex];

		$("#PropertyViewer").append(g_EbxViewer.BuildInstance(data["$partitionGuid"], s_Guid));
	}
}

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


$(document).on('click', '.ref h1', function(evt) {

	if (evt.detail != 3)
		return;

	var partitionGuid = $(this).parent().attr("partitionGuid");
	var instanceGuid = $(this).parent().attr("instanceGuid");

	if (partitionGuid == null && instanceGuid == null)
		return;

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