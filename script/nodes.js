class DefaultNode extends LiteGraph.LGraphNode
{
	constructor(_title) 
	{
		super(_title);

		this.title = "DefaultNode";
		this.shape = LiteGraph.ROUND_SHAPE;
	}

	onSelected() 
	{
		console.log(this.id);


		if( this.partitionGuid == null ||
			this.instanceGuid == null)
			return;
			
		$("#PropertyViewer").html("");

		$("#PropertyViewer").append(g_EbxViewer.BuildInstance(this.partitionGuid, this.instanceGuid));

	}


	onDblClick(e)
	{
		if( this.partitionGuid == null ||
			this.instanceGuid == null)
			return;
	/*
		var Data = s_EbxManager.FindInstance( this.partitionGuid, this.instanceGuid);

		if( Data == null )
			return;
			*/

		//history.pushState(null, null, "#" + Data["$fields"]["Blueprint"]["$value"]["$partitionGuid"] + "&" + Data["$fields"]["Blueprint"]["$value"]["$instanceGuid"]);
		window.location.hash = "#" + this.partitionGuid + "&" + this.instanceGuid;
		//window.location.reload();
	}
};

LiteGraph.registerNodeType("basic/dummy", DefaultNode);


class InputEvent extends LiteGraph.LGraphNode
{
	constructor(_title) 
	{
		super(_title);

		this.title = "InputEvent";
		//this.title_text_color = "#6F6";

		this.boxcolor = this.bgcolor = "#597778";

		this.shape = LiteGraph.ROUND_SHAPE;
	}

	onDrawBackground(ctx)
	{
	}

	onSelected() 
	{
		console.log(this.id);
	}
};
LiteGraph.registerNodeType("basic/InputEvent", InputEvent);


class OutputEvent extends LiteGraph.LGraphNode
{
	constructor(_title) 
	{
		super(_title);

		this.title = "OutputEvent";
		//this.title_text_color = "#2F2";

		this.boxcolor = this.bgcolor = "#265355";

		this.shape = LiteGraph.ROUND_SHAPE;
	}

	onDrawBackground(ctx)
	{
	}

	onSelected() 
	{
		console.log(this.id);
	}
};
LiteGraph.registerNodeType("basic/OutputEvent", OutputEvent);



class InputLink extends LiteGraph.LGraphNode
{
	constructor(_title) 
	{
		super(_title);

		this.title = "InputLink";

		this.boxcolor = this.bgcolor = "#785959";

		this.shape = LiteGraph.ROUND_SHAPE;

	}

	onDrawBackground(ctx)
	{
	}

	onSelected() 
	{
		console.log(this.id);
	}
};
LiteGraph.registerNodeType("basic/InputLink", InputLink);


class OutputLink extends LiteGraph.LGraphNode
{
	constructor(_title) 
	{
		super(_title);

		this.title = "OutputLink";
		this.bgcolor = this.boxcolor = "#552626";


		this.shape = LiteGraph.ROUND_SHAPE;

	}

	onAdded(ctx)
	{
	}

	onSelected() 
	{
		console.log(this.id);
	}
};
LiteGraph.registerNodeType("basic/OutputLink", OutputLink);




class InputField extends LiteGraph.LGraphNode
{
	constructor(_title) 
	{
		super(_title);

		this.title = "InputField";
		this.bgcolor = this.boxcolor = "#787259";


		this.shape = LiteGraph.ROUND_SHAPE;

	}


	onSelected() 
	{
		console.log(this.id);
	}
};
LiteGraph.registerNodeType("basic/InputField", InputField);

class OutputField extends LiteGraph.LGraphNode
{
	constructor(_title) 
	{
		super(_title);

		this.title = "OutputField";
		this.bgcolor = this.boxcolor = "#554c26";

		this.shape = LiteGraph.ROUND_SHAPE;

	}

	onDrawBackground(ctx)
	{
		//this.boxcolor = "#22F";
	}

	onSelected() 
	{
		console.log(this.id);
	}
};
LiteGraph.registerNodeType("basic/OutputField", OutputField);




