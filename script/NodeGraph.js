var graph = null;
var nodes = [];
var Interfaces = [];
var canvas = null;
var chartNode = [];
var edges = [];
var cy = null;
var unknownHashes = [];
var knownIDs = [];
var descriptors = [];

LGraphNode.prototype.disconnectInput = function( slot )
{
	return true;
}


function Init() 
{
	console.log("Clearing node graph")
	Destroy();

	LiteGraph.NODE_TITLE_COLOR = "#fff";
	LGraphCanvas.link_type_colors["Event"] = "#3fcdd2"
	LGraphCanvas.link_type_colors["FieldId"] = "#dcbc42"

	graph.start()
	canvas = new LGraphCanvas("#eventGraph", graph);
	canvas.render_only_selected = false
	canvas.background_image = null;
	canvas.resize($(window).width() - 10, $(window).height() - 10)

}

function Destroy() {

	if( cy != null )
	{
		cy.destroy();
		cy = null;
	}

	if( graph != null )
	{
		graph.clear();
		graph = null;
	}

	if( canvas != null )
	{
		canvas.clear();
		canvas = undefined;
	}

	graph = new LGraph();
	graph.clear();

	nodes = [];
	Interfaces = [];
	chartNode = [];
	edges = [];
	
	

	console.log("Cleared graph");
}

function LoadGraphInstance( MainInstance )
{
	if( MainInstance == null)
		return;

	if( MainInstance["$baseClass"] == "UIGraphAsset" ||
		MainInstance["$type"] == "UIGraphAsset" )
	{
		console.log("Generating UI Nodes");

		HandleUIConnections(MainInstance);
		
	}
	else
	{
		console.log("Generating Nodes");
		//if (Interfaces.length >= 0) 
		{
			HandleConnections(MainInstance);
		}
	}

	ApplyCoordinates();
}


function OnPartitionLoaded(response, instanceguid) 
{
	LoadGraphInstance(FindInstance(response["$guid"], instanceguid))
}

function RegisterInstance(instance) {
	if (instance["$fields"]["Id"] != null) {
		knownIDs[instance["$fields"]["Id"]["$value"]] = instance["$type"];
	}
	if (instance["$fields"]["PropertyConnections"] != null) {
		Interfaces[instance["$guid"]] = instance;
	}
}


function HandleConnections(MainInstance) {
	// PropertyConnections
	if(MainInstance["$fields"]["Descriptor"]["$value"] != null) {
		ProcessDescriptor(FindInstance(MainInstance["$fields"]["Descriptor"]["$value"]["$partitionGuid"], 
		MainInstance["$fields"]["Descriptor"]["$value"]["$instanceGuid"]));
	}

	Object.values(MainInstance["$fields"]["PropertyConnections"]["$value"]).forEach(function(PC) {
		ProcessConnection(PC, "FieldId")
	});

	//EventConnections
	Object.values(MainInstance["$fields"]["EventConnections"]["$value"]).forEach(function(PC) {
		ProcessConnection(PC, "Event")
	});
	/*
		Object.values(Interface["$fields"]["EventConnections"]["$value"]).forEach(function(PC) {
			ProcessConnection(PC, "Event")
		});
		Object.values(Interface["$fields"]["EventConnections"]["$value"]).forEach(function(PC) {
			ProcessConnection(PC, "Event")
		});
		*/
}


function HandleUIConnections(Instance) {
	// Nodes
	

	Object.values(Instance["$fields"]["Nodes"]["$value"]).forEach(function(Interface) 
	{
		ProcessUINode(FindInstance(Interface["$partitionGuid"], 
									   Interface["$instanceGuid"]));

	});



	// Connections
	Object.values(Instance["$fields"]["Connections"]["$value"]).forEach(function(Interface) {
		ProcessUIConnection(FindInstance(Interface["$partitionGuid"], 
									   Interface["$instanceGuid"]));

	});
}

function ProcessDescriptor(descriptor) {
	descriptors[descriptor["$guid"]] = descriptor;

	console.log(descriptor);


	Object.values(descriptor["$fields"]["InputEvents"]["$value"]).forEach(function(inputEvent) {
		AddSpecialNode("InputEvent", inputEvent["Id"]["$value"])
	});
	Object.values(descriptor["$fields"]["OutputEvents"]["$value"]).forEach(function(inputEvent) {
		AddSpecialNode("OutputEvent", inputEvent["Id"]["$value"])
	});
}

function AddSpecialNode(type, id) {
	// Node does not exist. Let's create it.
	console.log(type + id);
	if (graph.getNodeById(type + id) == null) {

		var node = CreateNode(type);
		nodes[type + id] = node;

		node.partitionGuid = null;
		node.instance = null;

		node.id = type + id;

		if(type == "InputEvent") {
			node.addOutput(GetHashResult(id))
		}
		if(type == "OutputEvent") {
			node.addInput(GetHashResult(id))
		}
		graph.add(node);

		chartNode[chartNode.length] = {
			data: {
				id: type + id
			}
		};
	}
	// Set twice for redundancy.
	var node = graph.getNodeById(type + id);
	return node;
}


function ProcessUINode(PC) 
{
	var node = AddNode(PC);

	if( node == null ) 
	{
		console.log("Something is wrong 2");
		return;
	}

	if( node.findInputSlot(PC["$fields"]["Name"]["$value"]) == -1 )
	{
		node.addInput(PC["$fields"]["Name"]["$value"], LiteGraph.EVENT, 
		{
			locked: true
		});
	}



	switch( PC["$type"] )
	{
	case "ActionNode":
		Object.values(PC["$fields"]["Params"]["$value"]).forEach(function(object) 
		{
			AddInputMember( node, object );
		});

		AddOutputMember( node, "ActionKey - " + GetHashResult(PC["$fields"]["ActionKey"]["$value"]));

		
		AddNodePort(node, 
					FindInstance(PC["$fields"]["In"]["$value"]["$partitionGuid"], 
								 PC["$fields"]["In"]["$value"]["$instanceGuid"]),
					false);


		AddNodePort(node, 
					FindInstance(PC["$fields"]["Out"]["$value"]["$partitionGuid"], 
								 PC["$fields"]["Out"]["$value"]["$instanceGuid"]),
					true);
		
		break;
	
	case "ComparisonLogicNode":
		Object.values(PC["$fields"]["Outputs"]["$value"]).forEach(function(object) 
		{
			AddNodePort(node, 
						FindInstance(object["$partitionGuid"], 
									 object["$instanceGuid"]),
						true);
		});

		
		AddNodePort(node, 
					FindInstance(PC["$fields"]["In"]["$value"]["$partitionGuid"], 
								 PC["$fields"]["In"]["$value"]["$instanceGuid"]),
					false);


		break;

	case "InstanceInputNode":

		AddNodePort(node, 
					FindInstance(PC["$fields"]["Out"]["$value"]["$partitionGuid"], 
								 PC["$fields"]["Out"]["$value"]["$instanceGuid"]),
					true);
		break;

	case "InstanceOutputNode":
		
		AddInputMember( node, "Id - " + GetHashResult(PC["$fields"]["Id"]["$value"]));

		AddNodePort(node, 
					FindInstance(PC["$fields"]["In"]["$value"]["$partitionGuid"], 
								 PC["$fields"]["In"]["$value"]["$instanceGuid"]),
					false);
		break;

	case "WidgetNode":
		
		

		AddInputMember( node, "InstanceName  - " + PC["$fields"]["InstanceName"]["$value"]);
		AddInputMember( node, "VerticalAlign - " + PC["$fields"]["VerticalAlign"]["$value"]);
		AddInputMember( node, "HorisontalAlign - " + PC["$fields"]["HorisontalAlign"]["$value"]);
		
		Object.values(PC["$fields"]["WidgetProperties"]["$value"]).forEach(function(object) 
		{
			AddInputMember( node,  object["Name"]["$value"] + " = " + object["Value"]["$value"]);
		});

		AddInputMember( node, "VerticalAlign - " + GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
		AddInputMember( node, "VerticalAlign - " + GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
		AddInputMember( node, "VerticalAlign - " + GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
		AddInputMember( node, "VerticalAlign - " + GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
		AddInputMember( node, "VerticalAlign - " + GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
		AddInputMember( node, "VerticalAlign - " + GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));

		Object.values(PC["$fields"]["Outputs"]["$value"]).forEach(function(object) 
		{
			AddNodePort(node, 
						FindInstance(object["$partitionGuid"], 
									object["$instanceGuid"]),
						true);
		});

		Object.values(PC["$fields"]["Inputs"]["$value"]).forEach(function(object) 
		{
			AddNodePort(node, 
						FindInstance(object["$partitionGuid"], 
									object["$instanceGuid"]),
						false);
		});

		break;
	}
}

function AddInputMember(node, value)
{
	if( node.findInputSlot(value) == -1 )
	{
		node.addInput(value, LiteGraph.EVENT, 
		{
			locked: true
		});
	}
}

function AddOutputMember(node, value)
{
	if( node.findInputSlot(value) == -1 )
	{
		node.addOutput(value, LiteGraph.EVENT, 
		{
			locked: true
		});
	}
}

function ProcessUIConnection(PC) 
{
	var sourcePartitionGuid = PC["$fields"]["SourceNode"]["$value"]["$partitionGuid"];
	var sourceInstanceGuid = PC["$fields"]["SourceNode"]["$value"]["$instanceGuid"];

	var targetPartitionGuid = PC["$fields"]["TargetNode"]["$value"]["$partitionGuid"];
	var targetInstanceGuid = PC["$fields"]["TargetNode"]["$value"]["$instanceGuid"];

	{
		var sourcePortPartitionGuid = PC["$fields"]["SourcePort"]["$value"]["$partitionGuid"];

		var targetPortPartitionGuid = PC["$fields"]["TargetPort"]["$value"]["$partitionGuid"];

		if (loadedPartitions[sourcePortPartitionGuid] == null)
			LoadPartitionFromGuid(sourcePortPartitionGuid);

		if (loadedPartitions[targetPortPartitionGuid] == null) 
			LoadPartitionFromGuid(targetPortPartitionGuid);

	}
	if (loadedPartitions[sourcePartitionGuid] == null) 
		LoadPartitionFromGuid(sourcePartitionGuid);

	if (loadedPartitions[targetPartitionGuid] == null) 
		LoadPartitionFromGuid(targetPartitionGuid);


	var sourceInstance = FindInstance(sourcePartitionGuid, sourceInstanceGuid);
	var targetInstance = FindInstance(targetPartitionGuid, targetInstanceGuid);


	
	var sourceNode = AddNode(sourceInstance, sourcePartitionGuid);
	var targetNode = AddNode(targetInstance, targetPartitionGuid);

	if( sourceNode == null || 
		targetNode == null ) 
	{
		console.log("Something is wrong");
		return;
	}

	var sourcePort = FindInstance(PC["$fields"]["SourcePort"]["$value"]["$partitionGuid"], 
								  PC["$fields"]["SourcePort"]["$value"]["$instanceGuid"]);


	var targetPort = FindInstance(PC["$fields"]["TargetPort"]["$value"]["$partitionGuid"], 
								  PC["$fields"]["TargetPort"]["$value"]["$instanceGuid"]);

	AddNodePort( sourceNode, sourcePort, true );
	AddNodePort( targetNode, targetPort, false );
	AddUIConnections(PC, sourceNode, targetNode, sourcePort, targetPort);
}

function ProcessConnection(PC, type) {
	var sourcePartitionGuid = PC["Source"]["$value"]["$partitionGuid"]
	var sourceInstanceGuid = PC["Source"]["$value"]["$instanceGuid"]

	var targetPartitionGuid = PC["Target"]["$value"]["$partitionGuid"]
	var targetInstanceGuid = PC["Target"]["$value"]["$instanceGuid"]

	if (loadedPartitions[sourcePartitionGuid] == null) {
		LoadPartitionFromGuid(sourcePartitionGuid);
	}
	if (loadedPartitions[targetPartitionGuid] == null) {
		LoadPartitionFromGuid(targetPartitionGuid);
	}
	var sourceInstance = FindInstance(sourcePartitionGuid, sourceInstanceGuid);
	var targetInstance = FindInstance(targetPartitionGuid, targetInstanceGuid);

	var targetNode = AddNode(targetInstance, targetPartitionGuid);
	var sourceNode = AddNode(sourceInstance, sourcePartitionGuid);

	if(type != "FieldId") 
	{
		if( descriptors[targetInstanceGuid] != null && 
			graph.getNodeById("OutputEvent" + PC['Target' + type]["$value"]["Id"]["$value"]) != null) 
		{
			targetNode = graph.getNodeById("OutputEvent" + PC['Target' + type]["$value"]["Id"]["$value"]);
		}

		if( descriptors[sourceInstanceGuid] != null && 
			graph.getNodeById("InputEvent" + PC['Source' + type]["$value"]["Id"]["$value"]) != null) 
		{
			sourceNode = graph.getNodeById("InputEvent" + PC['Source' + type]["$value"]["Id"]["$value"]);
		}	
	}	
	
	if( sourceNode == null || 
		targetNode == null) 
	{
		console.log("Something is wrong");
	}

	AddFields(PC, sourceNode, targetNode, type)
	AddConnections(PC, sourceNode, targetNode, type);
}

function AddConnections(PC, source, target, type) {
	if (PC['Source' + type]["$value"]["Id"] != null) {
		var sourceHash = GetHashResult(PC['Source' + type]["$value"]["Id"]["$value"]);
		var targetHash = GetHashResult(PC['Target' + type]["$value"]["Id"]["$value"])
	} else {
		var sourceHash = GetHashResult(PC['Source' + type]["$value"]);
		var targetHash = GetHashResult(PC['Target' + type]["$value"])
	}
	var sourceFieldSlot = source.findOutputSlot(sourceHash);
	var targetFieldSlot = target.findInputSlot(targetHash);

	var mass = 1;
	if (source.inputs != null) {
		mass += source.inputs.length
	}
	if (source.outputs != null) {
		mass += source.outputs.length
	}
	if(target.isInputConnected(targetFieldSlot)) {
		console.log("Tried to add multiple inputs." + targetHash)
		var offset = 0;

		while(target.findInputSlot(targetHash) != -1) {
			targetHash = offset + targetHash;
			offset++;
		}
		target.addInput(targetHash, type, {
			locked: true
		});
		targetFieldSlot = target.findInputSlot(targetHash);


	}
	source.connect(sourceFieldSlot, target, targetFieldSlot);

	edges[edges.length] = {
		data: {
			source: source.id,
			target: target.id
		}
	};


}

function AddFields(PC, source, target, type) 
{
	if (PC['Source' + type]["$value"]["Id"] != null) {
		var sourceHash = GetHashResult(PC['Source' + type]["$value"]["Id"]["$value"]);
		var targetHash = GetHashResult(PC['Target' + type]["$value"]["Id"]["$value"])
	} else {
		var sourceHash = GetHashResult(PC['Source' + type]["$value"]);
		var targetHash = GetHashResult(PC['Target' + type]["$value"])
	}



	var sourceInstance = FindInstance(PC["Source"]["$value"]["$partitionGuid"], PC["Source"]["$value"]["$instanceGuid"]);
	var targetInstance = FindInstance(PC["Target"]["$value"]["$partitionGuid"], PC["Target"]["$value"]["$instanceGuid"]);

	AddSubFields(source, sourceInstance);
	AddSubFields(target, targetInstance);

	if (source.findOutputSlot(sourceHash) == -1) {
		source.addOutput(sourceHash, type, {
			locked: true
		});
	}
	if (target.findInputSlot(targetHash) == -1) {
		target.addInput(targetHash, type, {
			locked: true
		});
	}

	var size = source.computeSize();
	size[0] += 20;
	source.size = size


}

function AddNodePort(node, port, IsOutput) 
{
	if ((IsOutput ? node.findOutputSlot(port["$fields"]["Name"]["$value"]) : node.findInputSlot(port["$fields"]["Name"]["$value"])) == -1) 
	{
		if( IsOutput == true)
			node.addOutput(port["$fields"]["Name"]["$value"], null, 
			{
				locked: true
			});
		else
			node.addInput(port["$fields"]["Name"]["$value"], null, 
			{
				locked: true
			});

		var size = node.computeSize();
		size[0] += 20;
		node.size = size
	}
}

function AddUIConnections(PC, source, target, sourcePort, targetPort) 
{

	var sourceFieldSlot = source.findOutputSlot(sourcePort["$fields"]["Name"]["$value"]);

	if( sourceFieldSlot == -1 )
	{
		source.addOutput(sourcePort["$fields"]["Name"]["$value"], null, {
			locked: true
		});

		sourceFieldSlot = source.findOutputSlot(sourcePort["$fields"]["Name"]["$value"]);
	}


	var targetFieldSlot = target.findInputSlot(targetPort["$fields"]["Name"]["$value"]);

	if( targetFieldSlot == -1 )
	{
		target.addInput(targetPort["$fields"]["Name"]["$value"], null, {
			locked: true
		});

		targetFieldSlot = target.findInputSlot(targetPort["$fields"]["Name"]["$value"]);
	}


	var mass = 1;
	if (source.inputs != null) {
		mass += source.inputs.length
	}
	if (source.outputs != null) {
		mass += source.outputs.length
	}

	if(target.isInputConnected(targetFieldSlot)) {
		console.log("Tried to add multiple inputs." + targetPort["$fields"]["Name"]["$value"])
		var offset = 0;

		while(target.findInputSlot(targetPort["$fields"]["Name"]["$value"] + offset) != -1) 
			offset++;

		target.addInput(targetPort["$fields"]["Name"]["$value"] + offset, null, {
			locked: true
		});
		targetFieldSlot = target.findInputSlot(targetPort["$fields"]["Name"]["$value"] + offset);
	}

	source.connect(sourceFieldSlot, target, targetFieldSlot);

	edges[edges.length] = {
		data: {
			source: source.id,
			target: target.id
		}
	};


}


function AddSubFields(node, instance) 
{
	Object.keys(instance["$fields"]).forEach(function(key) 
	{
		if (key != 'Realm' && key != 'IndexInBlueprint' && key != 'IsEventConnectionTarget' && key != 'IsPropertyConnectionTarget') 
		{
			if (key == "Blueprint" ||
				key == "UnlockAsset" ||
				key == "Sound" ||
				key == "ImpulseResponse" ||
				key == "Effect" ||
				key == "Mesh" ||
				key == "GraphAsset" ) 
			{
				if (instance["$fields"][key]["$value"] != null) 
				{
					var value = key + ": " + TryGetPartitionName(instance["$fields"][key]["$value"]["$partitionGuid"]);
				} 
				else
				{
					var value = "nullRef";
				}
			}

			if (key == "Default" ||
				key == "DefaultValue" ||
				key == "MessageSid" ||
				key == "AutoActivate" ||
				key == "SendAsPlayerEvent" ||
				key == "Enabled" ||
				key == "RunOnce" ||
				key == "Delay" ||
				key == "DamageGiverName" ||
				key == "IsFirstPerson" ||
				key == "In" || 
				key == "CommandName" || 
				key == "Text" ||
				key == "IntValue" ||
				key == "FloatValue" ||
				key == "BoolValue" ||
				key == "StringValue") 
			{
				var value = key + ": " + instance["$fields"][key]["$value"];
			}
			if (key == "EntryClass") 
			{
				var value = key + ": " + instance["$fields"][key]["$enumValue"];
			}
			if (key == "DataSource" ) 
			{
				var value = key + ": " + TryGetPartitionName(instance["$fields"][key]["$value"]["DataCategory"]["$value"]["$partitionGuid"]);
				node.addInput(value, LiteGraph.EVENT, 
				{
					locked: true
				});
				var value =  "DataKey: " + GetHashResult(instance["$fields"][key]["$value"]["DataKey"]["$value"]);
			}
			if (value != null && node.findInputSlot(value) == -1) 
			{
				node.addInput(value, LiteGraph.EVENT, 
				{
					locked: true
				});
				
			}

		}
	});
}



function AddNode(instance, partitionGuid) 
{
	if (instance == null) 
		return null;

	// Node does not exist. Let's create it.
	if (graph.getNodeById(instance["$guid"]) == null) 
	{
		var type = instance["$type"];

		var node = CreateNode(type);
		nodes[instance["$guid"]] = node;

		node.partitionGuid = partitionGuid;
		node.instance = instance["$guid"];
		node.id = instance["$guid"];
		graph.add(node);
		chartNode[chartNode.length] = 
		{
			data: 
			{
				id: instance["$guid"]
			}
		};
	}
	// Set twice for redundancy.
	return graph.getNodeById(instance["$guid"]);
}

function CreateNode(type) {
	switch(type) {
		case "InputEvent":
		    var node = LiteGraph.createNode("basic/InputEvent");
		case "OutputEvent":
		    var node = LiteGraph.createNode("basic/OutputEvent");
		default:
			var node = LiteGraph.createNode("basic/dummy");
			node.title = type;
		}
	return node;
	//	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}


function FindNode(instanceGuid) {
	if (nodes[instanceGuid]) {
		return nodes[instanceGuid];
	}
}

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

function ApplyCoordinates() {
	cy = window.cy = cytoscape({

		boxSelectionEnabled: false,
		autounselectify: true,
		elements: {
			nodes: chartNode,
			edges: edges
		},
		layout: {
			name: 'dagre',
			rankDir: "LR",
			ranker: "longest-path",
			padding: 50,
			spacingFactor: 1.5,

		}
	});
	cy.nodes().forEach(function(node) {
		nodes[node["_private"]["data"]["id"]].pos = [node["_private"]["position"].x * 10, node["_private"]["position"].y];
	});
}

Init();

$(window).resize(function() {
	canvas.resize($('.canvasHolder').width(), $('.canvasHolder').height())
});