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

LGraphNode.prototype.disconnectInput = function (slot) {
	return true;
}


class CytoscapeSorter {
	constructor() {
		//Cytoscape for node positioning algorithm
		this.m_ChartNode = [];
		this.m_Edges = [];
		this.m_Cytoscape = null;
	}


	AddNode(id) {
		var index = this.m_ChartNode.length;
		this.m_ChartNode[index] =
		{
			data:
			{
				id: instance["$guid"]
			}
		};

		return index;
	}
}

let s_CytoScape = new CytoscapeSorter();


class Graph {
	constructor() {
		this.m_LiteGraph = null;
		this.m_Nodes = [];

		this.m_Canvas = null;


	}



	Reset() {
		console.log("Clearing node graph");
		Destroy();

		LiteGraph.NODE_TITLE_COLOR = "#fff";
		LGraphCanvas.link_type_colors["Event"] = "#3fcdd2";
		LGraphCanvas.link_type_colors["Property"] = "#dcbc42";
		LGraphCanvas.link_type_colors["Link"] = "#dc4242";

		//LGraphCanvas.link_type_colors["Event"] = "#4bdc4b"
		//LGraphCanvas.link_type_colors["Property"] = "#dcbc42"
		//LGraphCanvas.link_type_colors["Link"] = "#4ea3d8"

		graph.start()
		canvas = new LGraphCanvas("#eventGraph", graph);
		canvas.render_only_selected = false
		canvas.background_image = null;
		canvas.resize($(window).width() - 10, $(window).height() - 10);

	}

	Destroy() {

		if (m_Cytoscape != null) {
			m_Cytoscape.destroy();
			m_Cytoscape = null;
		}

		if (m_LiteGraph != null) {
			m_LiteGraph.clear();
			m_LiteGraph = null;
		}

		if (canvas != null) {
			canvas.clear();
			canvas = undefined;
		}

		m_LiteGraph = new LGraph();
		m_LiteGraph.clear();

		nodes = [];
		Interfaces = [];
		chartNode = [];
		edges = [];



		console.log("Cleared graph");
	}

	/*
	CreateNode(id, )

	*/
	CreateNode(nodeType) {
		if (instance == null)
			return null;

		// Node does not exist. Let's create it.
		if (graph.getNodeById(instance["$guid"]) == null) {
			var type = instance["$type"];


			var node = LiteGraph.createNode(nodeType);


			nodes[instance["$guid"]] = node;

			node.partitionGuid = partitionGuid;
			node.instanceGuid = instance["$guid"];
			node.id = instance["$guid"];

			node.CytoscapeIndex = s_CytoScape.AddNode(node.id);

			graph.add(node);

		}
		// Set twice for redundancy.
		return graph.getNodeById(instance["$guid"]);

	}
}

function Reset() {
	console.log("Clearing node graph");
	Destroy();

	LiteGraph.NODE_TITLE_COLOR = "#fff";
	LGraphCanvas.link_type_colors["Event"] = "#3fcdd2";
	LGraphCanvas.link_type_colors["Property"] = "#dcbc42";
	LGraphCanvas.link_type_colors["Link"] = "#dc4242";

	//LGraphCanvas.link_type_colors["Event"] = "#4bdc4b"
	//LGraphCanvas.link_type_colors["Property"] = "#dcbc42"
	//LGraphCanvas.link_type_colors["Link"] = "#4ea3d8"

	graph.start()
	canvas = new LGraphCanvas("#eventGraph", graph);
	canvas.render_only_selected = false
	canvas.background_image = null;
	canvas.resize($(window).width() - 10, $(window).height() - 10);

}

function Destroy() {

	if (cy != null) {
		cy.destroy();
		cy = null;
	}

	if (graph != null) {
		graph.clear();
		graph = null;
	}

	if (canvas != null) {
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

function LoadGraphInstance(MainInstance) {
	Reset();

	if (MainInstance == null)
		return;

	if (MainInstance["$baseClass"] == "UIGraphAsset" ||
		MainInstance["$type"] == "UIGraphAsset") {
		console.log("Generating UI Nodes");

		HandleUIConnections(MainInstance);

	}
	else {
		console.log("Generating Nodes");
		//if (Interfaces.length >= 0) 
		{
			HandleConnections(MainInstance);
		}
	}

	ApplyCoordinates();
}



function HandleConnections(MainInstance) {

	if (MainInstance["$fields"]["Descriptor"] != null &&
		MainInstance["$fields"]["Descriptor"]["$value"] != null) {
		ProcessDescriptor(s_EbxManager.FindInstance(MainInstance["$fields"]["Descriptor"]["$value"]["$partitionGuid"],
			MainInstance["$fields"]["Descriptor"]["$value"]["$instanceGuid"]));
	}

	if (MainInstance["$fields"]["Interface"] != null &&
		MainInstance["$fields"]["Interface"]["$value"] != null) {
		ProcessDescriptor(s_EbxManager.FindInstance(MainInstance["$fields"]["Interface"]["$value"]["$partitionGuid"],
			MainInstance["$fields"]["Interface"]["$value"]["$instanceGuid"]));
	}


	// LinkConnections
	if (MainInstance["$fields"]["LinkConnections"] != null)
		Object.values(MainInstance["$fields"]["LinkConnections"]["$value"]).forEach(function (PC) {
			ProcessConnection(PC, "FieldId", "Link")
		});

	// PropertyConnections
	if (MainInstance["$fields"]["PropertyConnections"] != null)
		Object.values(MainInstance["$fields"]["PropertyConnections"]["$value"]).forEach(function (PC) {
			ProcessConnection(PC, "FieldId", "Property")
		});

	//EventConnections
	if (MainInstance["$fields"]["EventConnections"] != null)
		Object.values(MainInstance["$fields"]["EventConnections"]["$value"]).forEach(function (PC) {
			ProcessConnection(PC, "Event", "Event")
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


	Object.values(Instance["$fields"]["Nodes"]["$value"]).forEach(function (Interface) {
		ProcessUINode(s_EbxManager.FindInstance(Interface["$partitionGuid"],
			Interface["$instanceGuid"]));

	});



	// Connections
	Object.values(Instance["$fields"]["Connections"]["$value"]).forEach(function (Interface) {
		ProcessUIConnection(s_EbxManager.FindInstance(Interface["$partitionGuid"],
			Interface["$instanceGuid"]));

	});
}

function ProcessDescriptor(descriptor) {
	if (descriptor == null)
		return;

	descriptors[descriptor["$guid"]] = descriptor; //TODO: add partition to decriptor

	console.log(descriptor);

	/*
		Object.values(descriptor["$fields"]["InputEvents"]["$value"]).forEach(function(value) 
		{
			AddSpecialNode("InputEvent", value["Id"]["$value"])
		});
		Object.values(descriptor["$fields"]["OutputEvents"]["$value"]).forEach(function(value)
		 {
			AddSpecialNode("OutputEvent", value["Id"]["$value"])
		});
	
		Object.values(descriptor["$fields"]["InputLinks"]["$value"]).forEach(function(value) 
		{
			AddSpecialNode("InputLink", value["Id"]["$value"])
		});
		Object.values(descriptor["$fields"]["OutputLinks"]["$value"]).forEach(function(value) 
		{
			AddSpecialNode("OutputLink", value["Id"]["$value"])
		});
	
	
		
		Object.values(descriptor["$fields"]["Fields"]["$value"]).forEach(function(value) 
		{
			var Node = AddSpecialNode("InputField", value["Id"]["$value"]);
	
			if (value["Value"]["$value"] != null && 
			Node.findInputSlot(value["Value"]["$value"]) == -1) 
			{
				Node.addInput(value["Value"]["$value"], LiteGraph.EVENT, 
				{
					locked: true
				});
				
			}
	
		});*/

}

function AddSpecialNode(type, id) {
	// Node does not exist. Let's create it.
	console.log(type + id);
	if (graph.getNodeById(type + id) == null) {

		var node = CreateNode(type);
		nodes[type + id] = node;


		node.partitionGuid = null;
		node.instanceGuid = null;

		node.id = type + id;

		/*
		if (type == "InputEvent" ||
			type == "InputLink") {
			node.addOutput(s_HashManager.GetHashResult(id))
		}
		if (type == "OutputEvent" ||
			type == "OutputLink") {
			node.addInput(s_HashManager.GetHashResult(id))
		}
		*/

		graph.add(node);

		chartNode[chartNode.length] =
		{
			data:
			{
				id: type + id,
				special: true,
				specialType: type
			}
		};
	}
	// Set twice for redundancy.
	var node = graph.getNodeById(type + id);
	return node;
}


function ProcessUINode(PC) {
	if (PC == null)
		return;

	var node = AddNode(PC);

	if (node == null) {
		console.log("Something is wrong 2");
		return;
	}

	if (node.findInputSlot(PC["$fields"]["Name"]["$value"]) == -1) {
		node.addInput(PC["$fields"]["Name"]["$value"], LiteGraph.EVENT,
			{
				locked: true
			});
	}



	switch (PC["$type"]) {
		case "ActionNode":
			Object.values(PC["$fields"]["Params"]["$value"]).forEach(function (object) {
				AddInputMember(node, object);
			});

			AddOutputMember(node, "ActionKey - " + s_HashManager.GetHashResult(PC["$fields"]["ActionKey"]["$value"]));


			AddNodePort(node,
				s_EbxManager.FindInstance(PC["$fields"]["In"]["$value"]["$partitionGuid"],
					PC["$fields"]["In"]["$value"]["$instanceGuid"]),
				false);


			AddNodePort(node,
				s_EbxManager.FindInstance(PC["$fields"]["Out"]["$value"]["$partitionGuid"],
					PC["$fields"]["Out"]["$value"]["$instanceGuid"]),
				true);

			break;

		case "ComparisonLogicNode":
			Object.values(PC["$fields"]["Outputs"]["$value"]).forEach(function (object) {
				AddNodePort(node,
					s_EbxManager.FindInstance(object["$partitionGuid"],
						object["$instanceGuid"]),
					true);
			});


			AddNodePort(node,
				s_EbxManager.FindInstance(PC["$fields"]["In"]["$value"]["$partitionGuid"],
					PC["$fields"]["In"]["$value"]["$instanceGuid"]),
				false);


			break;

		case "InstanceInputNode":

			AddNodePort(node,
				s_EbxManager.FindInstance(PC["$fields"]["Out"]["$value"]["$partitionGuid"],
					PC["$fields"]["Out"]["$value"]["$instanceGuid"]),
				true);
			break;

		case "InstanceOutputNode":

			AddInputMember(node, "Id - " + s_HashManager.GetHashResult(PC["$fields"]["Id"]["$value"]));

			AddNodePort(node,
				s_EbxManager.FindInstance(PC["$fields"]["In"]["$value"]["$partitionGuid"],
					PC["$fields"]["In"]["$value"]["$instanceGuid"]),
				false);
			break;

		case "WidgetNode":



			AddInputMember(node, "InstanceName  - " + PC["$fields"]["InstanceName"]["$value"]);
			AddInputMember(node, "VerticalAlign - " + PC["$fields"]["VerticalAlign"]["$value"]);
			AddInputMember(node, "HorisontalAlign - " + PC["$fields"]["HorisontalAlign"]["$value"]);

			Object.values(PC["$fields"]["WidgetProperties"]["$value"]).forEach(function (object) {
				AddInputMember(node, object["Name"]["$value"] + " = " + object["Value"]["$value"]);
			});

			AddInputMember(node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));

			Object.values(PC["$fields"]["Outputs"]["$value"]).forEach(function (object) {
				AddNodePort(node,
					s_EbxManager.FindInstance(object["$partitionGuid"],
						object["$instanceGuid"]),
					true);
			});

			Object.values(PC["$fields"]["Inputs"]["$value"]).forEach(function (object) {
				AddNodePort(node,
					s_EbxManager.FindInstance(object["$partitionGuid"],
						object["$instanceGuid"]),
					false);
			});

			break;
	}
}

function AddInputMember(node, value) {
	if (node.findInputSlot(value) == -1) {
		node.addInput(value, LiteGraph.EVENT,
			{
				locked: true
			});
	}
}

function AddOutputMember(node, value) {
	if (node.findInputSlot(value) == -1) {
		node.addOutput(value, LiteGraph.EVENT,
			{
				locked: true
			});
	}
}

function ProcessUIConnection(PC) {
	if (PC == null)
		return;

	var sourcePartitionGuid = PC["$fields"]["SourceNode"]["$value"]["$partitionGuid"];
	var sourceInstanceGuid = PC["$fields"]["SourceNode"]["$value"]["$instanceGuid"];

	var targetPartitionGuid = PC["$fields"]["TargetNode"]["$value"]["$partitionGuid"];
	var targetInstanceGuid = PC["$fields"]["TargetNode"]["$value"]["$instanceGuid"];



	var sourceInstance = s_EbxManager.FindInstance(sourcePartitionGuid, sourceInstanceGuid);
	var targetInstance = s_EbxManager.FindInstance(targetPartitionGuid, targetInstanceGuid);


	if (sourceInstance == null ||
		targetInstance == null) {
		console.log("ddint load node instances: " + sourceInstance + " | " + targetInstance);
		return;
	}


	var sourceNode = AddNode(sourceInstance, sourcePartitionGuid);
	var targetNode = AddNode(targetInstance, targetPartitionGuid);

	if (sourceNode == null ||
		targetNode == null) {
		console.log("Something is wrong2");
		return;
	}

	var sourcePort = s_EbxManager.FindInstance(PC["$fields"]["SourcePort"]["$value"]["$partitionGuid"],
		PC["$fields"]["SourcePort"]["$value"]["$instanceGuid"]);


	var targetPort = s_EbxManager.FindInstance(PC["$fields"]["TargetPort"]["$value"]["$partitionGuid"],
		PC["$fields"]["TargetPort"]["$value"]["$instanceGuid"]);

	if (sourcePort == null ||
		targetPort == null) {
		console.log("Something is wrong3");
		return;
	}

	AddNodePort(sourceNode, sourcePort, true);
	AddNodePort(targetNode, targetPort, false);
	AddUIConnections(PC, sourceNode, targetNode, sourcePort, targetPort);
}

function ProcessConnection(PC, variableName, type) {
	if (PC["Source"]["$value"] == null ||
		PC["Target"]["$value"] == null) {
		console.log("Source or target value null: " + PC["Source"]["$value"] + " | " + PC["Target"]["$value"]);
		return;
	}


	var sourcePartitionGuid = PC["Source"]["$value"]["$partitionGuid"]
	var sourceInstanceGuid = PC["Source"]["$value"]["$instanceGuid"]

	var targetPartitionGuid = PC["Target"]["$value"]["$partitionGuid"]
	var targetInstanceGuid = PC["Target"]["$value"]["$instanceGuid"]


	var sourceInstance = s_EbxManager.FindInstance(sourcePartitionGuid, sourceInstanceGuid);
	var targetInstance = s_EbxManager.FindInstance(targetPartitionGuid, targetInstanceGuid);

	if (sourceInstance == null ||
		targetInstance == null) {
		console.log("ddint load node instances: " + sourceInstance + " | " + targetInstance);
		return;
	}

	var sourceNode = null;
	var targetNode = null;



	if (type == "Event") {
		if (descriptors[sourceInstanceGuid] != null) {
			if (graph.getNodeById("InputEvent" + PC['Source' + variableName]["$value"]["Id"]["$value"]) == null)
				sourceNode = AddSpecialNode("InputEvent", PC['Source' + variableName]["$value"]["Id"]["$value"]);
			else
				sourceNode = graph.getNodeById("InputEvent" + PC['Source' + variableName]["$value"]["Id"]["$value"]);
		}

		if (descriptors[targetInstanceGuid] != null) {
			if (graph.getNodeById("OutputEvent" + PC['Target' + variableName]["$value"]["Id"]["$value"]) == null)
				targetNode = AddSpecialNode("OutputEvent", PC['Target' + variableName]["$value"]["Id"]["$value"]);
			else
				targetNode = graph.getNodeById("OutputEvent" + PC['Target' + variableName]["$value"]["Id"]["$value"]);
		}
	}
	else if (type == "Link") {
		if (descriptors[sourceInstanceGuid] != null) {
			if (graph.getNodeById("InputLink" + PC["Source" + variableName]["$value"]) == null)
				sourceNode = AddSpecialNode("InputLink", PC["Source" + variableName]["$value"]);
			else
				sourceNode = graph.getNodeById("InputLink" + PC['Source' + variableName]["$value"]);
		}

		if (descriptors[targetInstanceGuid] != null) {
			if (graph.getNodeById("OutputLink" + PC["Target" + variableName]["$value"]) == null)
				targetNode = AddSpecialNode("OutputLink", PC["Target" + variableName]["$value"]);
			else
				targetNode = graph.getNodeById("OutputLink" + PC["Target" + variableName]["$value"]);
		}
	}
	else if (type == "Property") {
		if (descriptors[sourceInstanceGuid] != null) {
			var s_NodeId = "InputField" + PC["Source" + variableName]["$value"];

			if (graph.getNodeById(s_NodeId) == null) {
				sourceNode = AddSpecialNode("InputField", PC["Source" + variableName]["$value"]);

				Object.values(descriptors[sourceInstanceGuid]["$fields"]["Fields"]["$value"]).forEach(function (value) {
					if (value["Id"]["$value"] != PC["Source" + variableName]["$value"])
						return;

					if (value["Value"]["$value"] != null &&
						sourceNode.findInputSlot(value["Value"]["$value"]) == -1) {
						sourceNode.addInput(value["Value"]["$value"], LiteGraph.EVENT,
							{
								locked: true
							});

					}

				});
			}
			else
				sourceNode = graph.getNodeById(s_NodeId);
		}

		if (descriptors[targetInstanceGuid] != null) {
			var s_NodeId = "OutputField" + PC["Target" + variableName]["$value"];

			if (graph.getNodeById(s_NodeId) == null) {
				targetNode = AddSpecialNode("OutputField", PC["Target" + variableName]["$value"]);

				Object.values(descriptors[targetInstanceGuid]["$fields"]["Fields"]["$value"]).forEach(function (value) {
					if (value["Id"]["$value"] != PC["Target" + variableName]["$value"])
						return;

					if (value["Value"]["$value"] != null &&
						targetNode.findInputSlot(value["Value"]["$value"]) == -1) {
						targetNode.addInput(value["Value"]["$value"], LiteGraph.EVENT,
							{
								locked: true
							});
					}

				});
			}
			else
				targetNode = graph.getNodeById(s_NodeId);
		}

	}


	if (targetNode == null)
		targetNode = AddNode(targetInstance, targetPartitionGuid);

	if (sourceNode == null)
		sourceNode = AddNode(sourceInstance, sourcePartitionGuid);





	if (sourceNode == null ||
		targetNode == null) {
		console.log("nodes is null, Something is wrong");
	}

	AddFields(PC, sourceNode, targetNode, variableName, type);
	AddConnections(PC, sourceNode, targetNode, variableName, type);
}

function AddConnections(PC, source, target, variableName, type) {
	if (PC['Source' + variableName]["$value"]["Id"] != null) {
		var sourceHash = s_HashManager.GetHashResult(PC['Source' + variableName]["$value"]["Id"]["$value"]);
		var targetHash = s_HashManager.GetHashResult(PC['Target' + variableName]["$value"]["Id"]["$value"])
	}
	else {
		var sourceHash = s_HashManager.GetHashResult(PC['Source' + variableName]["$value"]);
		var targetHash = s_HashManager.GetHashResult(PC['Target' + variableName]["$value"])
	}

	var SourceHashString = s_HashManager.GetHashResult(sourceHash);
	var TargetHashString = s_HashManager.GetHashResult(targetHash);



	var sourceFieldSlot = source.findOutputSlot(SourceHashString);
	var targetFieldSlot = target.findInputSlot(TargetHashString);


	var mass = 1;
	if (source.inputs != null) {
		mass += source.inputs.length
	}
	if (source.outputs != null) {
		mass += source.outputs.length
	}


	if (target.isInputConnected(targetFieldSlot)) {
		console.log("Tried to add multiple inputs." + TargetHashString)
		var offset = 0;

		while (target.findInputSlot(TargetHashString + " - " + offset) != -1) {
			offset++;
		}

		target.addInput(targetHash + " - " + offset, type,
			{
				locked: true
			});
		targetFieldSlot = target.findInputSlot(targetHash + " - " + offset);
	}



	source.connect(sourceFieldSlot, target, targetFieldSlot);

	edges[edges.length] =
	{
		data:
		{
			source: source.id,
			target: target.id
		}
	};


}

function AddFields(PC, source, target, variableName, type) {

	if (PC['Source' + variableName]["$value"]["Id"] != null) {
		var sourceHash = s_HashManager.GetHashResult(PC['Source' + variableName]["$value"]["Id"]["$value"]);
		var targetHash = s_HashManager.GetHashResult(PC['Target' + variableName]["$value"]["Id"]["$value"])
	}
	else {
		var sourceHash = s_HashManager.GetHashResult(PC['Source' + variableName]["$value"]);
		var targetHash = s_HashManager.GetHashResult(PC['Target' + variableName]["$value"])
	}

	var SourceHashString = s_HashManager.GetHashResult(sourceHash);
	var TargetHashString = s_HashManager.GetHashResult(targetHash);



	var sourceInstance = s_EbxManager.FindInstance(PC["Source"]["$value"]["$partitionGuid"], PC["Source"]["$value"]["$instanceGuid"]);
	var targetInstance = s_EbxManager.FindInstance(PC["Target"]["$value"]["$partitionGuid"], PC["Target"]["$value"]["$instanceGuid"]);

	if (sourceInstance == null ||
		targetInstance == null) {
		console.log("Addfields something went wrong!");
		return;
	}



	AddSubFields(source, sourceInstance);
	AddSubFields(target, targetInstance);




	if (source.findOutputSlot(SourceHashString) == -1) {
		source.addOutput(SourceHashString, type,
			{
				locked: true
			});
	}
	if (target.findInputSlot(TargetHashString) == -1) {
		target.addInput(TargetHashString, type,
			{
				locked: true
			});
	}

	var size = source.computeSize();
	size[0] += 20;
	source.size = size


}

function AddNodePort(node, port, IsOutput) {
	if (port == null)
		return;

	if ((IsOutput ? node.findOutputSlot(port["$fields"]["Name"]["$value"]) : node.findInputSlot(port["$fields"]["Name"]["$value"])) == -1) {
		if (IsOutput == true)
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

function AddUIConnections(PC, source, target, sourcePort, targetPort) {

	var sourceFieldSlot = source.findOutputSlot(sourcePort["$fields"]["Name"]["$value"]);

	if (sourceFieldSlot == -1) {
		source.addOutput(sourcePort["$fields"]["Name"]["$value"], null, {
			locked: true
		});

		sourceFieldSlot = source.findOutputSlot(sourcePort["$fields"]["Name"]["$value"]);
	}


	var targetFieldSlot = target.findInputSlot(targetPort["$fields"]["Name"]["$value"]);

	if (targetFieldSlot == -1) {
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

	if (target.isInputConnected(targetFieldSlot)) {
		console.log("Tried to add multiple inputs." + targetPort["$fields"]["Name"]["$value"])
		var offset = 0;

		while (target.findInputSlot(targetPort["$fields"]["Name"]["$value"] + offset) != -1)
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


function AddSubFields(node, instance) {
	Object.keys(instance["$fields"]).forEach(function (key) {
		if (key != 'Realm' && key != 'IndexInBlueprint' && key != 'IsEventConnectionTarget' && key != 'IsPropertyConnectionTarget') {
			if (key == "Blueprint" ||
				key == "UnlockAsset" ||
				key == "Sound" ||
				key == "ImpulseResponse" ||
				key == "Effect" ||
				key == "Mesh" ||
				key == "GraphAsset") {
				if (instance["$fields"][key]["$value"] != null) {
					var value = key + ": " + s_EbxManager.GetPartitionGuidPath(instance["$fields"][key]["$value"]["$partitionGuid"]);
				}
				else {
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
				key == "StringValue") {
				var value = key + ": " + instance["$fields"][key]["$value"];
			}
			if (key == "EntryClass") {
				var value = key + ": " + instance["$fields"][key]["$enumValue"];
			}
			if (key == "DataSource") {
				var value = key + ": " + s_EbxManager.GetPartitionGuidPath(instance["$fields"][key]["$value"]["DataCategory"]["$value"]["$partitionGuid"]);
				node.addInput(value, LiteGraph.EVENT,
					{
						locked: true
					});
				var value = "DataKey: " + s_HashManager.GetHashResult(instance["$fields"][key]["$value"]["DataKey"]["$value"]);
			}
			if (value != null && node.findInputSlot(value) == -1) {
				node.addInput(value, LiteGraph.EVENT,
					{
						locked: true
					});

			}

		}
	});
}



function AddNode(instance, partitionGuid) {
	if (instance == null)
		return null;

	// Node does not exist. Let's create it.
	if (graph.getNodeById(instance["$guid"]) == null) {
		var type = instance["$type"];

		var node = CreateNode(type);

		nodes[instance["$guid"]] = node;

		node.partitionGuid = partitionGuid;
		node.instanceGuid = instance["$guid"];
		node.id = instance["$guid"];




		graph.add(node);





		chartNode[chartNode.length] =
		{
			data:
			{
				id: instance["$guid"],
				special: false
			}
		};
	}
	// Set twice for redundancy.
	return graph.getNodeById(instance["$guid"]);
}

function CreateNode(type) {
	switch (type) {
		case "InputEvent":
			var node = LiteGraph.createNode("basic/InputEvent");
			break;
		case "OutputEvent":
			var node = LiteGraph.createNode("basic/OutputEvent");
			break;
		case "InputLink":
			var node = LiteGraph.createNode("basic/InputLink");
			break;
		case "OutputLink":
			var node = LiteGraph.createNode("basic/OutputLink");
			break;
		case "InputField":
			var node = LiteGraph.createNode("basic/InputField");
			break;
		case "OutputField":
			var node = LiteGraph.createNode("basic/OutputField");
			break;

		default:
			var node = LiteGraph.createNode("basic/dummy");
			node.title = type;

	}


	node.mode = LiteGraph.ALWAYS;
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
	cy.nodes().forEach(function (node) {
		if (node["_private"]["data"]["special"] != null &&
			node["_private"]["data"]["special"] == true) {
			if (node["_private"]["data"]["specialType"].startsWith("Input"))
				node["_private"]["position"].x -= 100;
			else
				node["_private"]["position"].x += 100;
		}

		nodes[node["_private"]["data"]["id"]].pos = [node["_private"]["position"].x * 10, node["_private"]["position"].y];




	});
}

//Init();

$(window).resize(function () {
	if (canvas != null)
		canvas.resize($('.canvasHolder').width(), $('.canvasHolder').height())
});
