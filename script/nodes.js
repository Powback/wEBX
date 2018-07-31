function Dummy() {

}
Dummy.title = "Dummy Node";
Dummy.prototype.onSelected = function() 
{
	console.log(this.id);


	if( this.partitionGuid == null ||
		this.instance == null)
		return;
		
	$("#PropertyViewer").html("");

	$("#PropertyViewer").append(BuildInstance(this.partitionGuid, this.instance));

}

Dummy.prototype.onDblClick = function(e)
{
	if( this.partitionGuid == null ||
		this.instance == null)
		return;

	var Data = s_EbxManager.FindInstance( this.partitionGuid, this.instance);

	if( Data == null )
		return;

	//history.pushState(null, null, "#" + Data["$fields"]["Blueprint"]["$value"]["$partitionGuid"] + "&" + Data["$fields"]["Blueprint"]["$value"]["$instanceGuid"]);
	window.location.hash = "#" + Data["$fields"]["Blueprint"]["$value"]["$partitionGuid"] + "&" + Data["$fields"]["Blueprint"]["$value"]["$instanceGuid"];
	//window.location.reload();
}

LiteGraph.registerNodeType("basic/dummy", Dummy);



function InputEvent() {

}
InputEvent.title = "InputEvent";
InputEvent.boxcolor = "#6F6"
InputEvent.prototype.onSelected = function() {
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/InputEvent", InputEvent);

function OutputEvent() {

}
OutputEvent.title = "OutputEvent";
OutputEvent.boxcolor = "#2F2"
OutputEvent.prototype.onSelected = function() {
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/OutputEvent", OutputEvent);


function InputLink() {

}
InputLink.title = "InputLink";
InputLink.boxcolor = "#F66"

InputLink.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/InputLink", InputLink);

function OutputLink() {

}
OutputLink.title = "OutputEvent";
OutputLink.boxcolor = "#F22"
OutputLink.prototype.onSelected = function() 
{
	console.log(this.id);
}
LiteGraph.registerNodeType("basic/OutputLink", OutputLink);