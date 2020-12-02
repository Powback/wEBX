function DefaultNode() 
{
	this.title = "DefaultNode";
	this.shape = LiteGraph.ROUND_SHAPE;
}

DefaultNode.prototype.onSelected = function() 
{
	console.log(this.id);


	if( this.partitionGuid == null ||
		this.instanceGuid == null)
		return;
		
	$("#PropertyViewer").html("");

	$("#PropertyViewer").append(g_EbxViewer.BuildInstance(this.partitionGuid, this.instanceGuid));

}

DefaultNode.prototype.onDblClick = function(e)
{
	if( this.partitionGuid == null ||
		this.instanceGuid == null)
		return;

	var Data = s_EbxManager.FindInstance( this.partitionGuid, this.instanceGuid);

	if( Data == null )
		return;

	//history.pushState(null, null, "#" + Data["$fields"]["Blueprint"]["$value"]["$partitionGuid"] + "&" + Data["$fields"]["Blueprint"]["$value"]["$instanceGuid"]);
	window.location.hash = "#" + Data["$fields"]["Blueprint"]["$value"]["$partitionGuid"] + "&" + Data["$fields"]["Blueprint"]["$value"]["$instanceGuid"];
	//window.location.reload();
}

LiteGraph.registerNodeType("basic/dummy", DefaultNode);



function InputEvent() 
{
	this.title = "InputEvent";
	this.title_text_color = "#6F6";

	this.shape = LiteGraph.ROUND_SHAPE;
}

InputEvent.prototype.onDrawBackground = function(ctx)
{
	this.boxcolor = "#6F6";
}

InputEvent.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/InputEvent", InputEvent);


function OutputEvent() 
{
	this.title = "OutputEvent";
	this.title_text_color = "#2F2";

	this.shape = LiteGraph.ROUND_SHAPE;
}

OutputEvent.prototype.onDrawBackground = function(ctx)
{
	this.boxcolor = "#2F2";
}

OutputEvent.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/OutputEvent", OutputEvent);





function InputLink() 
{

	this.title = "InputLink";
	this.title_text_color = "#F66";

	this.shape = LiteGraph.ROUND_SHAPE;

}

InputLink.prototype.onDrawBackground = function(ctx)
{
	this.boxcolor = "#F66";
}

InputLink.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/InputLink", InputLink);



function OutputLink() 
{
	this.title = "OutputEvent";
	this.boxcolor = "red";

	this.shape = LiteGraph.ROUND_SHAPE;

}

OutputLink.prototype.onAdded = function(ctx)
{
	this.boxcolor = "red";//"#F22";
}

OutputLink.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/OutputLink", OutputLink);





function InputField() 
{

	this.title = "InputField";
	this.boxcolor = "#66F";

	this.shape = LiteGraph.ROUND_SHAPE;

}

InputField.prototype.onDrawBackground = function(ctx)
{
	this.boxcolor = "#22F";
}

InputField.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/InputField", InputField);


function OutputField() 
{

	this.title = "InputField";
	this.boxcolor = "#22F";

	this.shape = LiteGraph.ROUND_SHAPE;

}

OutputField.prototype.onDrawBackground = function(ctx)
{
	this.boxcolor = "#22F";
}

OutputField.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/OutputField", OutputField);




