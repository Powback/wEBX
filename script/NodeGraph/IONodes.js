class IONode extends LiteGraph.LGraphNode {
    constructor(_title)	{
		super(_title);

        this.shape = LiteGraph.ROUND_SHAPE;
		//this.title_text_color = "#6F6";
	}

	onDrawBackground(ctx) {
	}

	onSelected() {
		if( this.partitionGuid == null ||
			this.instanceGuid == null)
			return;

		var instance = g_EbxViewer.BuildInstance(this.partitionGuid, this.instanceGuid)

		if (instance == null) {
			return;
		}

		// Clear viewer and build descriptor
		$("#PropertyViewer").html("");
		$("#PropertyViewer").append(instance);
	}
}


class InputEvent extends IONode {
	constructor(_title)	{
		super(_title);

		this.title = "InputEvent";
		this.boxcolor = this.bgcolor = "#597778";
	}
};

LiteGraph.registerNodeType("basic/InputEvent", InputEvent);


class OutputEvent extends IONode {
	constructor(_title) {
		super(_title);

		this.title = "OutputEvent";
		this.boxcolor = this.bgcolor = "#265355";
	}
};

LiteGraph.registerNodeType("basic/OutputEvent", OutputEvent);


class InputLink extends IONode {
	constructor(_title) {
		super(_title);

		this.title = "InputLink";
		this.boxcolor = this.bgcolor = "#785959";
	}
};

LiteGraph.registerNodeType("basic/InputLink", InputLink);


class OutputLink extends IONode {
	constructor(_title) {
		super(_title);

		this.title = "OutputLink";
		this.bgcolor = this.boxcolor = "#552626";
	}
};

LiteGraph.registerNodeType("basic/OutputLink", OutputLink);


class InputField extends IONode {
	constructor(_title) {
		super(_title);

		this.title = "InputField";
		this.bgcolor = this.boxcolor = "#787259";
	}

};

LiteGraph.registerNodeType("basic/InputField", InputField);


class OutputField extends IONode {
	constructor(_title) {
		super(_title);

		this.title = "OutputField";
		this.bgcolor = this.boxcolor = "#554c26";
	}
};

LiteGraph.registerNodeType("basic/OutputField", OutputField);