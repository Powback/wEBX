
class EbxViewer {
	constructor() {
		this.m_EbxCache = [];

		this.m_TypeHandlers = {};

		this.latestInstanceGuid = null;

		this.m_CurrentBuildingPartition = null;
	}

	AddToCache(key, data) {
		this.m_EbxCache[key] = data;
	}

	GetFromCache(key) {
		return this.m_EbxCache[key]
	}

	BuildInstance(partitionGuid, instanceGuid, parentPartition = null) {
		let s_Cached = this.GetFromCache(partitionGuid + instanceGuid)
		if (s_Cached != null) {
			console.log("Using cached ebx: [partition | instance]" + partitionGuid + " | " + instanceGuid);

			/*
			if (this.latestInstanceGuid != null && this.latestInstanceGuid == instanceGuid) {
				console.log("Instance already displayed.")
				return null;
			}

			if (parentPartition == null) {
				this.latestInstanceGuid = instanceGuid;
			}
			*/

			return s_Cached;
		}

		var s_Instance = s_EbxManager.findInstance(partitionGuid, instanceGuid)
		if (s_Instance == null) {
			return null;
		}

		if (parentPartition == null) {
			this.latestInstanceGuid = instanceGuid;
		}

		this.m_CurrentBuildingPartition = partitionGuid;
	
		let s_Content = "";


		let s_IsLocalRef = false;
		if (parentPartition != null)
			s_IsLocalRef = partitionGuid.toLowerCase() == parentPartition.toLowerCase(); // doesnt work because 'parentPartition' is primary instance guid instead of partition guid
		
		// Instance header (= type)
		s_Content += 
			`<h1 class="${s_IsLocalRef ? "localRef" : "remoteRef"}">
				${s_Instance["$type"]}
				${s_IsLocalRef ? `<partitionReference>${s_EbxManager.getPartitionPath(partitionGuid) ?? "*unknownRef* " + partitionGuid.toUpperCase()}</partitionReference>` : ""}
			</h1>`

		// Instance and partition guids
		s_Content += 
			`<div class="guidReferences">

				<label>Partition: </label>
				<div class="guidReference">${partitionGuid.toUpperCase()}</div>

				<label>Instance: </label>
				<div class="guidReference">${instanceGuid.toUpperCase()}</div>
			</div>`

		/* // Instance field list (preceded by special content certain types) 
		s_Content += 
			`<ul type="first">
				${(this.m_TypeHandlers[s_Instance["$type"]] != null) ? this.m_TypeHandlers[s_Instance["$type"]]() : ""}`;
 		*/

		// Instance field list 
		s_Content += `<ul type="first">`	// type for alternating background

		// Field list items
		for (let l_FieldName in s_Instance["$fields"]) {
			s_Content += this.HandleField(s_Instance["$fields"][l_FieldName], l_FieldName);
		}
			
		s_Content +=`</ul>`;


		this.AddToCache(partitionGuid + instanceGuid, s_Content);

		this.m_CurrentBuildingPartition = null;

		return s_Content;
	}


	HandleField(instance, field = null, isSubField = false, includeType = false) {
		if (instance == null) {
			return "";
		}
			
		var s_Content = "";
		var s_TypeElement = "";							// What is a type element?
		if (includeType && instance["$type"] != null) {
			s_TypeElement = `<type class="aligned">${instance["$type"]}</type> `;
		}
			
		s_Content += 
			`<li class="${(instance["$array"] != null) ? "minimized" : ""}">
				${s_TypeElement}`;

		if (field != null) {
			s_Content += `<field class="${isSubField ? "subField" : ""}">${field}</field>: `;
		}
		
		if (instance["$array"] != null) {
			s_Content += this.HandleArray(instance);

		} else if (instance["$ref"] != null) {
			s_Content += this.HandleReference(instance);

		} else if (instance["$type"] != null && g_SimpleTypes[instance["$type"]]) {
			s_Content += this.HandleSimple(instance["$value"], instance["$type"]);

		} else if (instance["$type"] != null && g_AdvancedTypes[instance["$type"]] != null) {
			s_Content += this.HandleAdvanced(instance["$value"], instance["$type"]);

		} else if (instance["$enum"] != null) {
			s_Content += this.HandleEnum(instance["$enumValue"]);

		} else if (
			typeof(instance) == "string" || instance instanceof String || 
			typeof(instance) == "number" || instance instanceof Number) {
			s_Content += this.HandleSimple(instance, null);

		//if this is a ValueType, we fix it
		} else {
			if (instance["$value"] != null) {
				s_Content += `<label>${instance["$type"]}</label>`;

				s_Content += `<ul type="2nd">`;

				s_Content += this.HandleField(instance["$value"], null, true); //

				s_Content += `</ul>`;

			} else {
				//s_Content += `<ul type="2nd">`;
				//just do it, i think array uses this
				for (let l_Key in instance) {
					s_Content += this.HandleField(instance[l_Key], l_Key)
				}

				//s_Content += `</ul>`;
			}
		}

		s_Content += "</li>";

		if (s_Content.indexOf("undefined") != -1) {
			console.log("Something went wrong. Debug!");
			debugger;
		}
		return s_Content;
	}

	/*
	HandleSubField(instance)
	{
		var content = "";
		if (instance["$value"] != null)
		{
			content += this.HandleField(instance["$value"], null, false); //
		}
		else
		{
			//if (instance["$type"] == null)
			//	return;

			content += '<ul type="2nd">';

			for( let key in instance)
				content += HandleField(instance[key], subField);

			content += "</ul>";
		}
		return content;
	}
	*/

	HandleReference(instance, direct, directType) {
		// updated json support
		if (direct && instance != null && instance["$value"] != null) {
			instance = instance["$value"];
		}
			
		var content = "";

		let PartitionGuid = null;
		let InstanceGuid = null;

		if (instance != null)
		{

			if (direct &&
				instance['$partitionGuid'] != null &&
				instance['$instanceGuid'] != null)
			{
				PartitionGuid = instance["$partitionGuid"];
				InstanceGuid = instance["$instanceGuid"];
				instance["$type"] = directType;
			}
			else if (instance["$value"] != null && 
					 instance["$value"]["$partitionGuid"] != null && 
					 instance["$value"]["$instanceGuid"] != null)
			{
				PartitionGuid = instance["$value"]["$partitionGuid"];
				InstanceGuid = instance["$value"]["$instanceGuid"];
			}
		}

		if (PartitionGuid == null || InstanceGuid == null)
			return '<div class="ref"><nilValue>*nullRef*</nilValue></div>'

		content += `<div class="ref" partitionGuid="${PartitionGuid}" 
									instanceGuid="${InstanceGuid}" 
									parentPartition="${this.m_CurrentBuildingPartition}">`;

		content += `<h1 class="${(PartitionGuid.toLowerCase() == this.m_CurrentBuildingPartition.toLowerCase()) ? "localRef" : "remoteRef"}">`;



		var Instance = s_EbxManager.findInstance(PartitionGuid, InstanceGuid, false);

		if (Instance != null)
		{
			content += `${Instance["$type"]}
				</h1>
				
				<div class="GuidReferences">
					<label>Partition:</label>
					<div class="guidReference">${PartitionGuid.toUpperCase()}</div>
				
					<label>Instance:</label>
					<div class="guidReference">${InstanceGuid.toUpperCase()}</div>
				</div>`;

		}
		else
		{
			content += `${instance["$type"]}
				<partitionReference>${s_EbxManager.getPartitionPath(PartitionGuid) ?? "*unknownRef* " + PartitionGuid.toUpperCase()}</partitionReference>
				</h1>
				
				<div class="GuidReferences">
					<label>Partition:</label>
					<div class="guidReference">${PartitionGuid.toUpperCase()}</div>
				
					<label>Instance:</label>
					<div class="guidReference">${InstanceGuid.toUpperCase()}</div>
				</div>`;
			return content;

		}
		content += '</div>';
		return content;
	}

	HandleReferencePost(partitionGuid, instanceGuid, parentPartition) {
		var content = "";

		var Instance = s_EbxManager.findInstance(partitionGuid, instanceGuid);

		if (Instance != null)
			content += this.BuildInstance(partitionGuid, instanceGuid, parentPartition);
		else
			content += "<nilValue>Failed to fetch</nilValue>";

		return content;
	}

	HandleArray(instance) {
		// Return *nullArray* for empty arrays
		if (instance['$value'] == null || Object.values(instance['$value']).length == 0) {
			return `<nilValue>*nullArray*</nilValue> \t| ${instance["$type"]}`;
		}
			
		var content = "";

		// Array length
		content += " <count>(" + Object.values(instance['$value']).length + ")</count>";

		// Array field type
		content += ` \t| ${instance["$type"]}`;


		content += '<ul class="array">';
		var i = 0;

		for( let key in instance['$value'])
		{
			let refInstance = instance['$value'][key];

			content += `<li><index>[${key}]</index>`;


			content += `<ul type="2nd">`;
			if (instance["$ref"] != null) // Handle ref
				content += this.HandleReference(refInstance, true, instance['$type']);
			else
				content += this.HandleField(refInstance);
			
			content += `</ul>`;
			content += "</li>";

			i++;
		}
		content += "</ul>";

		return content;

	}

	HandleSimple(value, type) {
		// If the value is not null or empty
		var content = "";
		if (g_SimpleTypes[type] != null &&
			g_SimpleTypes[type] == 2)
			content += `<value contenteditable="false" class="Boolean">${value}</value>`;
		else if (g_SimpleTypes[type] != null &&
			g_SimpleTypes[type] == 3 &&
			s_HashManager.ForceGetHash(value) != null)
			content += `<value class="Hash">${value} (\"${s_HashManager.ForceGetHash(value)}\")</value>`;
		else if (value !== null)
			content = `<value contenteditable="false" class="${type}">${value}</value>`;
		else
			content = `<nilValue class="${type}">0</nilValue>`;

		return content;
	}

	HandleAdvanced(value, type) {
		// If the value is not null or empty
		var content = "";

		if( !value)
			return "<nilValue>*null*</nilValue>";

		if (value)
			content = `<value class="${type}">`;

		if (g_AdvancedTypes[type] != null && g_AdvancedTypes[type] != true)
			content += g_AdvancedTypes[type](value);
		else
			content += value;

		content += "</value>";
		
		return content;
	}

	HandleEnum(enumValue) {
		if (enumValue != null)
			return `<value class="enum">${enumValue}</value>`;
		
		return "<nilValue>*unknownEnum*</nilValue";
	}
}

var g_EbxViewer = new EbxViewer();
