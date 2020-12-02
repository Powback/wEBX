// Anti recursive measurements
var CurrentlyLoaded = [];

var currentPartition = null;










function DisplayPartition(partition, instanceGuid)
{

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

function LoadInstance(partitionGuid, instanceGuid)
{
	var Blueprint = s_EbxManager.FindInstance(partitionGuid,
		instanceGuid);


	if (Blueprint == null)
		return;

	currentPartition = Blueprint["$guid"];

	let s_Element = document.getElementById("Current");

	if( s_Element != null)
		s_Element.innerHTML = g_EbxViewer.BuildInstance(partitionGuid, instanceGuid);

	LoadGraphInstance(Blueprint);
}


function LoadEbxFromHash() 
{
	let LoadCallback = function (instance, instanceGuid = null) 
	{
		s_MessageSystem.ExecuteEventSync("OnPrimaryInstanceSelected", instance["$guid"])

		if (instanceGuid != null)
			LoadInstance(instance["$guid"], instanceGuid)
		else
			LoadInstance(instance["$guid"], instance["$primaryInstance"])

		instance['$instances'].forEach(function (element) 
		{
			console.log("Instance ")
			console.log(element);
		}, this);

	};

	var hash = location.hash.replace(/^#/, '');

	if (hash.length == 0)
		return;

	var params = hash.split('&');

	if (params.length == 2)
	{
		s_EbxManager.LoadEbxFromGuid(params[0].toLowerCase(),
			LoadCallback,
			params[1].toLowerCase());
		return;
	}


	currentPath = hash;

	// If hash contains json, get the path and load the selected partition.
	//if (hash.indexOf(".ebx") != -1) 
	{
		s_EbxManager.LoadEbxFromPath(hash.replace(".ebx", "").replace(".json", "") + ".json",
			LoadCallback);
	}
}


var LayoutConfig =
{
	settings:
	{
		hasHeaders: true,
		constrainDragToContainer: true,
		reorderEnabled: true,
		selectionEnabled: false,
		popoutWholeStack: false,
		blockedPopoutsThrowError: true,
		closePopoutsOnUnload: true,
		showPopoutIcon: false,
		showMaximiseIcon: true,
		showCloseIcon: false
	},
	dimensions:
	{
		borderWidth: 5,
		minItemHeight: 10,
		minItemWidth: 10,
		headerHeight: 20,
		dragProxyWidth: 300,
		dragProxyHeight: 200
	},
	labels:
	{
		close: 'close',
		maximise: 'maximise',
		minimise: 'minimise',
		popout: 'open in new window'
	},
	content:
		[
			{
				type: 'row',
				content:
					[
						{
							type: 'column',
							title: '',
							content:
								[
									{
										type: 'component',
										componentName: 'FileEbxTree',
										title: 'File Browser',

										isClosable: false,

									},
									{
										type: 'component',
										componentName: 'FolderView',
										title: 'Instance List',

										isClosable: false,

									},
								]
						},
						{
							type: 'stack',
							title: '',
							content:
								[
									{
										type: 'component',
										componentName: 'EbxViewer',

										title: "Ebx Viewer",
										isClosable: false,
									},
									{
										type: 'component',
										componentName: 'EbxGraph',

										title: "Graph View",
										isClosable: false,
									},
									{
										type: 'component',
										componentName: 'ThreeView',

										title: "3D View",
										isClosable: false,
									}
								]
						},
						{
							type: 'component',
							componentName: 'PropertyViewer',

							title: "Graph Ebx View",

							isClosable: false,
						}
					]
			}
		]
};

let g_PageLayout = null;

let g_GoldenLayoutElement = null;


function CreatePageLayout()
{

	let Page = $('#page');


	g_GoldenLayoutElement = $(document.createElement("div"));
	g_GoldenLayoutElement.attr('id', "GoldenLayoutContainer");

	Page.append(g_GoldenLayoutElement);

/*
	let SavedState = localStorage.getItem('PageLayoutConfig');

	if (SavedState != null)
		g_PageLayout = new GoldenLayout(JSON.parse(SavedState), $('#page'));
	else
	*/
		g_PageLayout = new GoldenLayout(LayoutConfig, "#GoldenLayoutContainer");

	g_PageLayout.on('stateChanged', function ()
	{
		localStorage.setItem('PageLayoutConfig', JSON.stringify(g_PageLayout.toConfig()));
	});

	//g_PageLayout = new GoldenLayout(LayoutConfig, $('#page')); //,  $('#currentWrapper')

	g_PageLayout.registerComponent('FileEbxTree', EbxTree);

	g_PageLayout.registerComponent('FolderView', FolderView);

	g_PageLayout.registerComponent("ThreeView", ThreeView);
/*
	g_PageLayout.registerComponent('FileTree', function (container, state)
	{

		console.log(container);

		// Append it to the DOM
		container.getElement().append($('<div id="NavigationWrapper"><input id="search-input" type="text"><div id="Navigation"></div></div>'));
		//container.getElement().append($('<div id="Navigation"></div>'));

		console.log(container);

	});
	*/

	g_PageLayout.registerComponent('EbxViewer', function (container, state)
	{


		// Append it to the DOM
		container.getElement().append($('<div id="Current"></div>'));
	});

	g_PageLayout.registerComponent('EbxGraph', function (container, state)
	{

		// Append it to the DOM
		container.getElement().append($("<canvas id='eventGraph'></canvas>"));
	});

	g_PageLayout.registerComponent('PropertyViewer', function (container, state)
	{

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


function CreateToolbar()
{
	let s_MenuBar = document.getElementById("menubar");

	if (s_MenuBar == null)
		return;

	{
		let s_GameSelect = document.createElement("select");

		s_GameSelect.onchange = function()
		{
			s_SettingsManager.m_Settings["game"] = this.value;

			s_SettingsManager.saveSettings();

			s_EbxManager.LoadGuidTable();
		};

		let s_Options = [
			"Venice", 
			"Warsaw", 
			"Tunguska",
			"Casablanca",
			"Jupiter-debug"
		];

		for(let s_Key in s_Options)
		{
			let s_Value = s_Options[s_Key];

			let s_Option = document.createElement("option");

			s_Option.innerText = s_Value;
			s_Option.value = s_Value;


			s_GameSelect.appendChild(s_Option);
		}

		s_GameSelect.value = s_SettingsManager.getGame();

		s_MenuBar.appendChild(s_GameSelect);

	}
}

function Load() 
{
	CreatePageLayout();

	CreateToolbar();

	

	s_MessageSystem.RegisterEventHandler("OnFileSelected", function (data)
	{
		window.location.hash = "#" + data;
	});

	s_MessageSystem.RegisterEventHandler("OnInstanceSelected", function (data)
	{
		window.location.hash = "#" + data["partitionGuid"] + "&" + data["instanceGuid"];
	});


	//LoadDirectory();

	s_HashManager.LoadHashes();

	s_EbxManager.AddParitionLoadedCallback(function (response) 
	{
		if (response['$instances'] == null)
			return;

		response['$instances'].forEach(function (element) 
		{
			s_HashManager.RegisterInstance(element);
		}, this);
	});

	s_EbxManager.AddGuidDictionaryLoadedCallback(function (self, dictionary)
	{
		s_MessageSystem.ExecuteEventSync("OnGuidDictionaryLoaded", dictionary);
	})

	s_EbxManager.LoadGuidTable();

	s_MessageSystem.ExecuteEventSync("OnGameLoaded", s_SettingsManager.m_Game);

	LoadEbxFromHash();
}






window.onload = Load;

// hash changed, either load 
$(window).on('hashchange', function (e) 
{
	LoadEbxFromHash();
	//Load();
	//OnLoad();
});

$(window).resize(function () 
{
	g_PageLayout.updateSize();
});


$(document).on('click', 'field', function ()
{
	if ($(this).parent().children().length > 2)
	{
		if ($(this).parent().hasClass("minimized"))
		{
			$(this).parent().removeClass("minimized");
		} else
		{
			$(this).parent().addClass("minimized");
		}
	}
});

$(document).on('click', '.ref h1', function ()
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
			$(this).parent().html(g_EbxViewer.HandleReferencePost(partitionGuid, instanceGuid, parentPartition));

		}


	}
});


$(document).on('dblclick', '.ref h1', function ()
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


$(document).on('click', 'div.guidReference', function ()
{
	$(this).select();
});

$(document).on('click', 'label', function ()
{
	$(this).next().select();
});
$(document).on('click', 'value', function ()
{
	$(this).selectText();
});

$(document).on('click', 'field', function ()
{
	$(this).selectText();
});

jQuery.fn.selectText = function ()
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