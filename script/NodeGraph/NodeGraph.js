var graph = null;
var nodes = [];
var Interfaces = [];
var canvas = null;
var unknownHashes = [];
var knownIDs = [];
var descriptors = [];


var dagre_graph = null;

LGraphNode.prototype.disconnectInput = function(slot) {
	return true;
}


function OnObjectsSelected_Nodes(data)
{

	let s_Nodes = [];

	for (let s_GuidIndex in data["$instanceGuids"])
	{
		let s_Guid = data["$instanceGuids"][s_GuidIndex];

		
		
		let s_Node = nodes[s_Guid.toLowerCase()];
		
		if (s_Node == null)
			continue;

		s_Nodes.push(s_Node);
	}

	for (let s_NodeGuid in nodes)
	{
		let s_Node = nodes[s_NodeGuid];

		s_Node.m_EnableSelectCallback = false;
	}


	canvas.selectNodes(s_Nodes);

	for (let s_NodeGuid in nodes)
	{
		let s_Node = nodes[s_NodeGuid];

		s_Node.m_EnableSelectCallback = true;
	}
}

// The blueprint node graph is made using LiteGraph

// A Cytoscape graph is also created with nodes reprenting the LiteGraph nodes
// The Cytoscape graph is sorted using a clever algorithm and those positions are applied to the LiteGraph nodes
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


		graph.start()
		canvas = new LGraphCanvas("#eventGraph", graph, {"autoresize": true});
		canvas.render_only_selected = false
		canvas.background_image = null;
		canvas.resize($(window).width() - 10, $(window).height() - 10);


		dagre_graph = new dagre.graphlib.Graph({
			compound: true
		});

		

		// Default to assigning a new object as a label for each new edge.
		dagre_graph.setDefaultEdgeLabel(function() { return {}; });
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
	canvas = new LGraphCanvas("#eventGraph", graph, {"autoresize": true});
	canvas.render_only_selected = false
	canvas.background_image = null;
	canvas.allow_searchbox = false
	//canvas.resize($(window).width() - 10, $(window).height() - 10); // TODO: set proper dimensions

}

function Destroy() {

	if (graph != null) {
		graph.clear();
		graph = null;
	}

	if (canvas != null) {
		canvas.clear();
		canvas = undefined;
	}


	dagre_graph = new dagre.graphlib.Graph({
		compound: true
	});

	// Default to assigning a new object as a label for each new edge.
	dagre_graph.setDefaultEdgeLabel(function() { return {}; });
	
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
		ProcessDescriptor(s_EbxManager.findInstance(MainInstance["$fields"]["Descriptor"]["$value"]["$partitionGuid"],
			MainInstance["$fields"]["Descriptor"]["$value"]["$instanceGuid"]));
	}

	if (MainInstance["$fields"]["Interface"] != null &&
		MainInstance["$fields"]["Interface"]["$value"] != null) {
		ProcessDescriptor(s_EbxManager.findInstance(MainInstance["$fields"]["Interface"]["$value"]["$partitionGuid"],
			MainInstance["$fields"]["Interface"]["$value"]["$instanceGuid"]));
	}


	// LinkConnections
	if (MainInstance["$fields"]["LinkConnections"] != null &&
		MainInstance["$fields"]["LinkConnections"]["$value"] != null)
		Object.values(MainInstance["$fields"]["LinkConnections"]["$value"]).forEach(function (PC) {
			ProcessConnection(PC, "FieldId", "Link")
		});

	// PropertyConnections
	if (MainInstance["$fields"]["PropertyConnections"] != null &&
		MainInstance["$fields"]["PropertyConnections"]["$value"] != null)
		Object.values(MainInstance["$fields"]["PropertyConnections"]["$value"]).forEach(function (PC) {
			ProcessConnection(PC, "FieldId", "Property")
		});

	//EventConnections
	if (MainInstance["$fields"]["EventConnections"] != null &&
		MainInstance["$fields"]["EventConnections"]["$value"] != null)
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
	Object.values(Instance["$fields"]["Nodes"]["$value"]).forEach(function (NodeReference) {
		ProcessUINode(NodeReference);
	});


	// Connections
	Object.values(Instance["$fields"]["Connections"]["$value"]).forEach(function (NodeConnection) {
		ProcessUIConnection(s_EbxManager.findInstance(NodeConnection["$partitionGuid"],
			NodeConnection["$instanceGuid"]));
	});
}

function ProcessDescriptor(descriptor) {
	if (descriptor == null)
		return;

	descriptors[descriptor["$guid"]] = descriptor; //TODO: add partition to descriptor

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

	});
	*/

}

function AddSpecialNode(type, id, instanceGuid, partitionGuid) {
	// Node does not exist. Let's create it.
	console.log(type + id);
	if (graph.getNodeById(type + id) == null) {

		var node = CreateNode(type);
		nodes[type + id] = node;


		node.partitionGuid = partitionGuid;
		node.instanceGuid = instanceGuid;

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


		dagre_graph.setNode(type + id, 
			{ 
				width: node.size[0],
				height: node.size[1],

				special: true,
				specialType: type
			});
	}
	// Set twice for redundancy.
	var node = graph.getNodeById(type + id);
	return node;
}


function ProcessUINode(NodeReference) {
	var NodeInstance = s_EbxManager.findInstance(NodeReference["$partitionGuid"],
		NodeReference["$instanceGuid"])

	if (NodeInstance == null)
		return;

	var node = AddNode(NodeInstance, NodeReference["$partitionGuid"]);

	if (node == null) {
		console.log("Something is wrong 2");
		return;
	}

	if (node.findInputSlot(NodeInstance["$fields"]["Name"]["$value"]) == -1) {
		node.addInput(NodeInstance["$fields"]["Name"]["$value"], LiteGraph.EVENT,
			{
				locked: true
			});
	}



	switch (NodeInstance["$type"]) {
		case "ActionNode":
			Object.values(NodeInstance["$fields"]["Params"]["$value"]).forEach(function (object) {
				AddInputMember(node, object);
			});

			AddOutputMember(node, "ActionKey - " + s_HashManager.GetHashResult(NodeInstance["$fields"]["ActionKey"]["$value"]));


			AddNodePort(node,
				s_EbxManager.findInstance(NodeInstance["$fields"]["In"]["$value"]["$partitionGuid"],
					NodeInstance["$fields"]["In"]["$value"]["$instanceGuid"]),
				false);


			AddNodePort(node,
				s_EbxManager.findInstance(NodeInstance["$fields"]["Out"]["$value"]["$partitionGuid"],
					NodeInstance["$fields"]["Out"]["$value"]["$instanceGuid"]),
				true);

			break;

		case "ComparisonLogicNode":
			Object.values(NodeInstance["$fields"]["Outputs"]["$value"]).forEach(function (object) {
				AddNodePort(node,
					s_EbxManager.findInstance(object["$partitionGuid"],
						object["$instanceGuid"]),
					true);
			});


			AddNodePort(node,
				s_EbxManager.findInstance(NodeInstance["$fields"]["In"]["$value"]["$partitionGuid"],
					NodeInstance["$fields"]["In"]["$value"]["$instanceGuid"]),
				false);


			break;

		case "InstanceInputNode":

			AddNodePort(node,
				s_EbxManager.findInstance(NodeInstance["$fields"]["Out"]["$value"]["$partitionGuid"],
					NodeInstance["$fields"]["Out"]["$value"]["$instanceGuid"]),
				true);
			break;

		case "InstanceOutputNode":

			AddInputMember(node, "Id - " + s_HashManager.GetHashResult(NodeInstance["$fields"]["Id"]["$value"]));

			AddNodePort(node,
				s_EbxManager.findInstance(NodeInstance["$fields"]["In"]["$value"]["$partitionGuid"],
					NodeInstance["$fields"]["In"]["$value"]["$instanceGuid"]),
				false);
			break;

		case "WidgetNode":



			AddInputMember(node, "InstanceName  - " + NodeInstance["$fields"]["InstanceName"]["$value"]);
			AddInputMember(node, "VerticalAlign - " + NodeInstance["$fields"]["VerticalAlign"]["$value"]);
			AddInputMember(node, "HorisontalAlign - " + NodeInstance["$fields"]["HorisontalAlign"]["$value"]);

			Object.values(NodeInstance["$fields"]["WidgetProperties"]["$value"]).forEach(function (object) {
				AddInputMember(node, object["Name"]["$value"] + " = " + object["Value"]["$value"]);
			});

			AddInputMember(node, "VerticalAlign - " + s_HashManager.GetHashResult(NodeInstance["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));
			//AddInputMember( node, "VerticalAlign - " + s_HashManager.GetHashResult(PC["$fields"]["VerticalAlign"]["$value"]));

			Object.values(NodeInstance["$fields"]["Outputs"]["$value"]).forEach(function (object) {
				AddNodePort(node,
					s_EbxManager.findInstance(object["$partitionGuid"],
						object["$instanceGuid"]),
					true);
			});

			Object.values(NodeInstance["$fields"]["Inputs"]["$value"]).forEach(function (object) {
				AddNodePort(node,
					s_EbxManager.findInstance(object["$partitionGuid"],
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


	var sourceInstance = s_EbxManager.findInstance(sourcePartitionGuid, sourceInstanceGuid);
	var targetInstance = s_EbxManager.findInstance(targetPartitionGuid, targetInstanceGuid);


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

	var sourcePort = s_EbxManager.findInstance(PC["$fields"]["SourcePort"]["$value"]["$partitionGuid"],
		PC["$fields"]["SourcePort"]["$value"]["$instanceGuid"]);


	var targetPort = s_EbxManager.findInstance(PC["$fields"]["TargetPort"]["$value"]["$partitionGuid"],
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

	// updated json support
	if (PC["$value"] != null)
		PC = PC["$value"];

	let s_Source = PC.Source?.$value ?? PC.source?.$value;
	if (s_Source == null ||
		PC["Target"]["$value"] == null) {
		console.log("Source or target value null: " + s_Source + " | " + PC["Target"]["$value"]);
		return;
	}


	var sourcePartitionGuid = s_Source["$partitionGuid"]
	var sourceInstanceGuid = s_Source["$instanceGuid"]

	var targetPartitionGuid = PC["Target"]["$value"]["$partitionGuid"]
	var targetInstanceGuid = PC["Target"]["$value"]["$instanceGuid"]


	var sourceInstance = s_EbxManager.findInstance(sourcePartitionGuid, sourceInstanceGuid);
	var targetInstance = s_EbxManager.findInstance(targetPartitionGuid, targetInstanceGuid);

	if (sourceInstance == null ||
		targetInstance == null) {
		console.log("ddint load node instances: " + sourceInstance + " | " + targetInstance);
		return;
	}

	var sourceNode = null;
	var targetNode = null;



	if (type == "Event") 
	{
		if (descriptors[sourceInstanceGuid] != null) 
		{
			if (graph.getNodeById("InputEvent" + PC['Source' + variableName]["$value"]["Id"]["$value"]) == null)
				sourceNode = AddSpecialNode("InputEvent", PC['Source' + variableName]["$value"]["Id"]["$value"], sourceInstanceGuid, sourcePartitionGuid);
			else
				sourceNode = graph.getNodeById("InputEvent" + PC['Source' + variableName]["$value"]["Id"]["$value"]);
		}

		if (descriptors[targetInstanceGuid] != null) 
		{
			if (graph.getNodeById("OutputEvent" + PC['Target' + variableName]["$value"]["Id"]["$value"]) == null)
				targetNode = AddSpecialNode("OutputEvent", PC['Target' + variableName]["$value"]["Id"]["$value"], targetInstanceGuid, targetPartitionGuid);
			else
				targetNode = graph.getNodeById("OutputEvent" + PC['Target' + variableName]["$value"]["Id"]["$value"]);
		}
	}
	else if (type == "Link") 
	{
		if (descriptors[sourceInstanceGuid] != null) 
		{
			if (graph.getNodeById("InputLink" + PC["Source" + variableName]["$value"]) == null)
				sourceNode = AddSpecialNode("InputLink", PC["Source" + variableName]["$value"], sourceInstanceGuid, sourcePartitionGuid);
			else
				sourceNode = graph.getNodeById("InputLink" + PC['Source' + variableName]["$value"]);
		}

		if (descriptors[targetInstanceGuid] != null) 
		{
			if (graph.getNodeById("OutputLink" + PC["Target" + variableName]["$value"]) == null)
				targetNode = AddSpecialNode("OutputLink", PC["Target" + variableName]["$value"], targetInstanceGuid, targetPartitionGuid);
			else
				targetNode = graph.getNodeById("OutputLink" + PC["Target" + variableName]["$value"]);
		}
	}
	else if (type == "Property") 
	{
		if (descriptors[sourceInstanceGuid] != null) 
		{
			var s_NodeId = "InputField" + PC["Source" + variableName]["$value"];

			sourceNode = graph.getNodeById(s_NodeId);
			if (sourceNode == null) 
			{
				sourceNode = AddSpecialNode("InputField", PC["Source" + variableName]["$value"], sourceInstanceGuid, sourcePartitionGuid);

				Object.values(descriptors[sourceInstanceGuid]["$fields"]["Fields"]["$value"]).forEach(function (value) {

					// updated json support
					if (value["$value"] != null)
						value = value["$value"];

					if (value["Id"]["$value"] != PC["Source" + variableName]["$value"])
						return;

					var s_InputValue = value?.Value?.$value;
					if (s_InputValue != null &&
						sourceNode.findInputSlot(s_InputValue) == -1) 
					{
						sourceNode.addInput(value["Value"]["$value"], LiteGraph.EVENT,
							{
								locked: true
							});

					}

				});
			}
		}

		if (descriptors[targetInstanceGuid] != null) 
		{
			var s_NodeId = "OutputField" + PC["Target" + variableName]["$value"];
			
			targetNode = graph.getNodeById(s_NodeId);
			if (targetNode == null) 
			{
				targetNode = AddSpecialNode("OutputField", PC["Target" + variableName]["$value"], targetInstanceGuid, targetPartitionGuid);

				Object.values(descriptors[targetInstanceGuid]["$fields"]["Fields"]["$value"]).forEach(function (value) 
				{

					// updated json support
					if (value["$value"] != null)
						value = value["$value"];

					if (value["Id"]["$value"] != PC["Target" + variableName]["$value"])
						return;

					var s_InputValue = value?.Value?.$value;
					if (s_InputValue != null &&
						targetNode.findInputSlot(s_InputValue) == -1) 
					{
						targetNode.addInput(s_InputValue, LiteGraph.EVENT,
							{
								locked: true
							});
					}

				});
			}

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


	let s_Mass = 1;
	if (source.inputs != null)
		s_Mass += source.inputs.length
	
	if (source.outputs != null)
		s_Mass += source.outputs.length


	if (target.isInputConnected(targetFieldSlot)) 
	{
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


	dagre_graph.setEdge(source.id, target.id, {
		//weight: s_Mass,
		name: SourceHashString + TargetHashString,
	});



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



	let s_Source = PC.Source?.$value ?? PC.source?.$value;
	var sourceInstance = s_EbxManager.findInstance(s_Source["$partitionGuid"], s_Source["$instanceGuid"]);
	var targetInstance = s_EbxManager.findInstance(PC["Target"]["$value"]["$partitionGuid"], PC["Target"]["$value"]["$instanceGuid"]);

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


	dagre_graph.setEdge(source.id, target.id, {
		//weight: s_Mass,
		//name: sourcePort["$fields"]["Name"]["$value"] + targetPort["$fields"]["Name"]["$value"],
	});



}


function AddSubFields(node, instance) {
	Object.keys(instance["$fields"]).forEach(function (key) {
		if (key != 'Realm' && key != 'IndexInBlueprint' && key != 'IsEventConnectionTarget' && key != 'IsPropertyConnectionTarget') {
			
			let s_Value = null;
			
			if (key == "Blueprint" ||
				key == "UnlockAsset" ||
				key == "Sound" ||
				key == "ImpulseResponse" ||
				key == "Effect" ||
				key == "Mesh" ||
				key == "GraphAsset") 
			{
				if (instance["$fields"][key]["$value"] != null) 
				{
					let s_PartitionGuid = instance["$fields"][key]["$value"]["$partitionGuid"];

					s_Value = key + ": " + s_EbxManager.getPartitionPath(s_PartitionGuid) ?? "*unknownRef* " + s_PartitionGuid.toUpperCase();
				}
				else 
				{
					s_Value = "nullRef";
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
					s_Value = key + ": " + instance["$fields"][key]["$value"];
			}

			if (key == "EntryClass") 
			{
				s_Value = key + ": " + instance["$fields"][key]["$enumValue"];
			}

			if (key == "DataSource") 
			{
				let s_DataCategoryPartitionId = instance["$fields"][key]["$value"]["DataCategory"]["$value"]["$partitionGuid"];

				s_Value = key + ": " + s_EbxManager.getPartitionPath(s_DataCategoryPartitionId) ?? "*unknownRef* " + s_DataCategoryPartitionId.toUpperCase();;
				
				node.addInput(s_Value, LiteGraph.EVENT,
					{
						locked: true
					});

				s_Value = "DataKey: " + s_HashManager.GetHashResult(instance["$fields"][key]["$value"]["DataKey"]["$value"]);
			}


			if (s_Value != null && node.findInputSlot(s_Value) == -1) 
			{
				node.addInput(s_Value, LiteGraph.EVENT,
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



		dagre_graph.setNode(instance["$guid"], 
			{ 
				width: node.size[0],
				height: node.size[1],
			});


	}
	// Set twice for redundancy.
	return graph.getNodeById(instance["$guid"]);
}



function CreateNode(type) {
	switch (type) 
	{
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

			node.boxcolor = StringToColor(type);

			break;
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


	let s_SpecialNodeMap = {};

	for (let s_NodeId in nodes)
	{

		let s_GraphNode = nodes[s_NodeId];

		let s_DagreNode = dagre_graph.node(s_NodeId);

		s_DagreNode.width = s_GraphNode.size[0] + 20;
		s_DagreNode.height = s_GraphNode.size[1] + 20;

		// add special nodes to cluster
		if ("specialType" in s_DagreNode)
		{
			var s_SpecialNodeType = s_DagreNode["specialType"];

			if (!(s_SpecialNodeType in s_SpecialNodeMap))
			{
				dagre_graph.setNode(s_SpecialNodeType, {label: s_SpecialNodeType, clusterLabelPos: 'top'});


				// add individial input and output grpups to a larger input and output group
				if (s_SpecialNodeType.toLowerCase().startsWith("input"))
				{
					dagre_graph.setNode("Input", {label: "Input", clusterLabelPos: 'top'});

					dagre_graph.setParent(s_SpecialNodeType, "Input");
				}
				else if (s_SpecialNodeType.toLowerCase().startsWith("output"))
				{
					dagre_graph.setNode("Output", {label: "Output", clusterLabelPos: 'top'});

					dagre_graph.setParent(s_SpecialNodeType, "Output");
				}
			}

			dagre_graph.setParent(s_NodeId, s_SpecialNodeType);
		}
	}


	if (dagre_graph.nodes().length == 0)
		return;


	dagre_graph.setGraph({
		rankdir: "LR",
		//ranker: "longest-path", // 1
		//ranker: "network-simplex", // 2
		//ranker: "tight-tree", // 3
		
		marginx: 50,
		marginy: 50,
	});

	dagre.layout(dagre_graph);


	let s_Min = [99999999,99999999];
	let s_Max = [-99999999,-99999999];

	// calc min,max
	dagre_graph.nodes().forEach(function(id) 
	{
		let s_NodeData = dagre_graph.node(id);
		//console.log("Node " + id + ": " + JSON.stringify(dagre_graph.node(id)));
		//nodes[id].pos = [s_NodeData.x*1.5, s_NodeData.y*1.5];
		

		let s_NodePos = [s_NodeData.x - s_NodeData.width/2.0,
						 s_NodeData.y - s_NodeData.height/2.0];

		let s_MaxCoords = [s_NodePos[0] + s_NodeData.width,
						  s_NodePos[1] + s_NodeData.height];

		
		if (s_NodePos[0] < s_Min[0])
			s_Min[0] = s_NodePos[0];

		if (s_NodePos[1] < s_Min[1])
			s_Min[1] = s_NodePos[1];
		

		
		if (s_MaxCoords[0] > s_Max[0])
			s_Max[0] = s_MaxCoords[0];

		if (s_MaxCoords[1] > s_Max[1])
			s_Max[1] = s_MaxCoords[1];
	});

	//if (dagre_graph.graph().width > s_Max[0])
	//	s_Max[0] = dagre_graph.graph().width;
	//if (dagre_graph.graph().height > s_Max[0])
	//	s_Max[1] = dagre_graph.graph().height;


	// why is it /4 ?
	let s_GraphCenter = [(s_Min[0] + s_Max[0]) / 4.0,
						 (s_Min[1] + s_Max[1]) / 4.0];

	// set node and offset it to center
	dagre_graph.nodes().forEach(function(id) 
	{

		let s_GraphNode = nodes[id];

		if (s_GraphNode == null)
			return;


		let s_DagreNode = dagre_graph.node(id);

		let s_NodeCenter = [s_DagreNode.width/2.0, s_DagreNode.height/2.0];

		s_GraphNode.pos = [((s_DagreNode.x - s_GraphCenter[0]) - s_NodeCenter[0])*1.1 , 
						   ((s_DagreNode.y - s_GraphCenter[1]) - s_NodeCenter[0])*1.5];

	});
	
}

//Init();

$(window).resize(function() {
	if (canvas != null)
		canvas.resize($('.canvasHolder').width(), $('.canvasHolder').height())
});
