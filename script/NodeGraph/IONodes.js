class IONode extends LiteGraph.LGraphNode {
    constructor(_title)	{
		super(_title);

        this.shape = LiteGraph.ROUND_SHAPE;
		//this.title_text_color = "#6F6";


		this.m_EnableSelectCallback = true;
	}

	onDrawBackground(ctx) {
	}

	onSelected() 
	{
		if (this.m_EnableSelectCallback == false)
			return;


		if (this.partitionGuid == null || 
			this.instanceGuid == null)
			return;

		s_MessageSystem.executeEventSync("OnObjectsSelected", {
			"$partitionGuid": this.partitionGuid,
			"$instanceGuids": [this.instanceGuid]
		});
	}

	onDeselected()
	{
		if (this.m_EnableSelectCallback == false)
			return;

		s_MessageSystem.executeEventSync("OnObjectsSelected", {
			"$partitionGuid": this.partitionGuid,
			"$instanceGuids": []
		});
	}

};


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