class DefaultNode extends LiteGraph.LGraphNode {
	constructor(_title) {
		super(_title);

		this.title = "DefaultNode";
		this.shape = LiteGraph.ROUND_SHAPE;


		this.m_EnableSelectCallback = true;
	}

	onSelected() {
		console.log(this.id);


		if (this.m_EnableSelectCallback == false)
			return;


		if( this.partitionGuid == null ||
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


	onDblClick(e) {
		if( this.partitionGuid == null ||
			this.instanceGuid == null)
			return;

		let s_CurrentHashLocation =  "#" + this.partitionGuid + "&" + this.instanceGuid;
	
		var s_Data = s_EbxManager.findInstance(this.partitionGuid, this.instanceGuid);

		if( s_Data != null )
		{
			if (s_Data["$fields"] != null &&
				s_Data["$fields"]["Blueprint"] != null &&
				s_Data["$fields"]["Blueprint"]["$value"] != null)
				s_CurrentHashLocation = "#" + s_Data["$fields"]["Blueprint"]["$value"]["$partitionGuid"] + "&" + s_Data["$fields"]["Blueprint"]["$value"]["$instanceGuid"];
		}

		//history.pushState(null, null, "#" + Data["$fields"]["Blueprint"]["$value"]["$partitionGuid"] + "&" + Data["$fields"]["Blueprint"]["$value"]["$instanceGuid"]);
		window.location.hash = s_CurrentHashLocation;
		//window.location.reload();
	}
};

LiteGraph.registerNodeType("basic/dummy", DefaultNode);
