
// Types that we can render directly.
var g_SimpleTypes = {
	"String": 1,
	"CString": 1,


	"Boolean": 2,

	"Int8": 1,
	"UInt8": 1,
	"Uint8": 1,
	"SByte": 1,

	"Int16": 1,
	"UInt16": 1,
	"Uint16": 1,

	"Int32": 3,
	"UInt32": 3,
	"Uint32": 3,

	"Int64": 1,
	"UInt64": 1,
	"Uint64": 1,




	"Float32": 1,
	"Single": 1,

	"Float64": 1,
	"Double": 1,



	"MathOp": 1
}

var g_AdvancedTypes =
{
	"Vec2": ParseVec2,
	"Vec3": ParseVec3,
	"Vec4": ParseVec4,

	//"GUID": true,
	//"Guid": true,

	//"SHA1": true,
	//"Sha1": true,

	//"FileRef": true,
	//"ResourceRef": true,
	"LinearTransform": ParseLinearTransform,
	//"EventSpec": true,
	//"DynamicEvent": true
}



function StringToUInt8(string)
{
	var DataArray = new Uint8Array(string.length);

	for (var i = 0; i < string.length; i++) 
		DataArray[i] = string.charCodeAt(i);
}

function Uint8ArrayToString( array )
{
	var Result = "";

	for (var i = 0; i < array.length; i++) 
		Result += String.fromCharCode(array[i]);

	return Result;
}

function DecryptEEString(inputString, guidString, offset) 
{
	if (guidString.length == 0)
		return null;

	if (inputString.length == 0)
		return null;


	var result = new Uint8Array(inputString.length);

	for (var i = 0; i < inputString.length; i++) 
	{
		var GuidIndex = (i + offset) % guidString.length;

		var InputStringChar = inputString[i];
		var InputGuidChar = guidString[GuidIndex];

		var Char = InputStringChar - InputGuidChar + 0xFF;

		result[i] = ((Char % 0xFF) + 1);
	}

	return result;
}


function Utf16ArrayToString(inputString)
{
	var Result = "";
	for (var i = 0; i < inputString.length; i += 2) 
	{
		if (i + 1 == inputString.length)
		{
			Result += String.fromCharCode(inputString.charCodeAt(i))
		}
		else
		{
			var Byte1 = inputString.charCodeAt(i);
			var Byte2 = inputString.charCodeAt(i + 1);

			Result += String.fromCharCode(((Byte2 << 8) & 0xFF00) + (Byte1 & 0x00FF));
		}
	}
	return Result;
}

var g_TypeFieldHandlers =
{
	"RngCharEntityData": function (classInstance)
	{

		var GuidString = classInstance["$guid"];

		if ((classInstance["$fields"]["Flags"]["$value"] & 0x100) == 0)
			GuidString = "00000000-0000-0000-0000-000000000000";


		var ClassDataArray = StringToUInt8(classInstance["$fields"]["In"]["$value"]);
		var GuidDataArray = StringToUInt8(GuidString);

		var String1 = DecryptEEString(ClassDataArray, GuidDataArray, GuidString.charCodeAt(12)); // classInstance["$fields"]["In"]["$value"]

		var DecryptedString = DecryptEEString(String1, StringToUInt8("xI&O45@3HUhgdfI!I45u&dhs@9U35df3!56IYOhdfI&31@48*56U!uiH)s+e&f-y"), GuidString.charCodeAt(20))


		console.log("String1: " + Uint8ArrayToString(String1));

		console.log("DecryptedString: " + Uint8ArrayToString(DecryptedString));

		//console.log("FindalSize: " + (Math.floor( fieldInstance["$value"].length / 2) + ( fieldInstance["$value"].length % 2 ) ) );

		return "In-Decrypted: " + Uint8ArrayToString(DecryptedString);
	},
	"SFBMEEntityData": function (classInstance, fieldInstance, fieldName)
	{
		if (fieldName != "In")
			return "";

		var GuidString = classInstance["$guid"];

		var ClassDataArray = StringToUInt8(fieldInstance["$value"]);
		var GuidDataArray = StringToUInt8(GuidString);

		var String1 = DecryptEEString(ClassDataArray, GuidDataArray, GuidString.charCodeAt(12));

		var DecryptedString = DecryptEEString(String1, StringToUInt8("xI&O45@3HUhgdfI!I45u&dhs@9U35df3!56IYOhdfI&31@48*56U!uiH)s+e&f-y"), GuidString.charCodeAt(20))


		console.log("DecryptedString: " + Uint8ArrayToString(DecryptedString));

		return fieldName + "-Decrypted: " + Uint8ArrayToString(DecryptedString );
	}

}


class EbxViewer
{
	constructor()
	{
		this.m_EbxCache = [];

		this.m_TypeHandlers = {};
	}

	AddToCache(key, data)
	{
		this.m_EbxCache[key] = data;
	}

	GetFromCache(key)
	{
		return this.m_EbxCache[key]
	}

	BuildInstance(partitionGuid, instanceGuid, parentPartition = null)
	{
		let s_Cached = this.GetFromCache(partitionGuid + instanceGuid)
		if (s_Cached != null)
		{
			console.log("Using cached ebx: [partition | instance]" + partitionGuid + " | " + instanceGuid);

			return s_Cached;
		}

		var Instance = s_EbxManager.FindInstance(partitionGuid, instanceGuid)

		if (Instance == null)
			return null;

		let content = "";


		content += `<h1 class="${(partitionGuid == parentPartition) ? "localRef" : "remoteRef"}">
						${Instance["$type"]}
						${(partitionGuid == parentPartition) ? `<partitionReference>${s_EbxManager.GetPartitionGuidPath(partitionGuid)}</partitionReference>` : ""}
					</h1>`

		content += `<div class="GuidReferences">

						<label>Partition: </label>
						<div class="guidReference">${partitionGuid.toUpperCase()}</div>

						<label>Instance: </label>
						<div class="guidReference">${instanceGuid.toUpperCase()}</div>

					</div>`;

		if (g_TypeFieldHandlers[Instance["$type"]] != null)
			current += g_TypeFieldHandlers[Instance["$type"]](Instance)

		content += `<ul type="first">
					${(this.m_TypeHandlers[Instance["$type"]] != null) ? this.m_TypeHandlers[Instance["$type"]]() : ""}`;

		for (let FieldName in Instance["$fields"])
			content += this.HandleField(Instance["$fields"][FieldName], FieldName);
					
					
		content +=`</ul>`;



		this.AddToCache(partitionGuid + instanceGuid, content);

		return content;
	}


	HandleField(instance, field = null, subField = false, includeType = false) 
	{
		if (instance == null)
			return "";


		var content = "";

		var s_TypeElement = "";
		if (includeType && instance["$type"] != null)
			s_TypeElement = `<type class="aligned">${instance["$type"]}</type> `;


		content += 
`<li class="${(instance["$array"] != null) ? "minimized" : ""}">
	${s_TypeElement}`;

		if( field != null)
			content += `<field class="${subField ? "subField" : ""}">${field}</field>: `;


		if (instance["$array"] != null) // Handle array
		{
			content += ":";
			content += this.HandleArray(instance);
		}
		else if (instance["$ref"] != null) // Handle reference
		{
			content += this.HandleReference(instance);
		}
		else if (instance["$type"] != null && g_SimpleTypes[instance["$type"]]) // Handle simple
		{
			content += this.HandleSimple(instance["$value"], instance["$type"]);
		}
		else if (instance["$type"] != null && g_AdvancedTypes[instance["$type"]] != null) // Handle advanced
		{
			content += this.HandleAdvanced(instance["$value"], instance["$type"]);
		}
		else if (instance["$enum"] != null)
		{
			content += this.HandleEnum(instance["$enumValue"]);
		}
		else if ( typeof(instance) == "string" || 
				  instance instanceof String || 
				  typeof(instance) == "number" || 
				  instance instanceof Number)
			content += this.HandleSimple(instance, null);
		else 
		{
			//if this is a ValueType, we fix it
			if (instance["$value"] != null)
			{
				content += `<label>${instance["$type"]}</label>`;

				content += `<ul type="2nd">`;

				content += this.HandleField(instance["$value"], null, true); //

				content += `</ul>`;
			}
			else
			{

				//content += `<ul type="2nd">`;
				//just do it, i think array uses this
				for (let key in instance)
				{
					content += this.HandleField(instance[key], key)
				}

				//content += `</ul>`;

			}
		}

		content += "</li>";

		if (content.indexOf("undefined") != -1)
		{
			console.log("Something went wrong. Debug!");
			debugger;
		}
		return content;
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

	HandleReference(instance, direct, directType)
	{
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
									parentPartition="${currentPartition}">`;

		content += `<h1 class="${(PartitionGuid == currentPartition) ? "localRef" : "remoteRef"}">`;



		var Instance = s_EbxManager.FindInstance(PartitionGuid, InstanceGuid, false);

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
				<partitionReference>${s_EbxManager.GetPartitionGuidPath(PartitionGuid)}</partitionReference>
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

	HandleReferencePost(partitionGuid, instanceGuid, parentPartition)
	{
		var content = "";

		var Instance = s_EbxManager.FindInstance(partitionGuid, instanceGuid);

		if (Instance != null)
			content += this.BuildInstance(partitionGuid, instanceGuid, parentPartition);
		else
			content += "<nilValue>Failed to fetch</nilValue>";

		return content;
	}

	HandleArray(instance)
	{
		

		if (Object.values(instance['$value']).length == 0)
			return `<nilValue>*nullArray*</nilValue> \t| ${instance["$type"]}`;

		var content = "";

		// array length
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

	HandleSimple(value, type)
	{
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

	HandleAdvanced(value, type)
	{
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

	HandleEnum(enumValue)
	{
		if (enumValue != null)
			return `<value class="enum">${enumValue}</value>`;
		
		return "<nilValue>*unknownEnum*</nilValue";
	}
}

var g_EbxViewer = new EbxViewer();

/*
function BuildInstance(partitionGuid, instanceGuid, parentPartition = null)
{
	var current = "";
	if (CurrentlyLoaded[partitionGuid + instanceGuid] != null)
	{
		console.log("Using previously built instance:" + partitionGuid + instanceGuid);
		return CurrentlyLoaded[partitionGuid + instanceGuid];
	}
	console.log("Building instance: " + partitionGuid + " | " + instanceGuid);

	var Instance = s_EbxManager.FindInstance(partitionGuid, instanceGuid)

	if (Instance == null)
		return "*null*"

	// add TypeName 
	if (partitionGuid == parentPartition)
	{

		current += `<h1 class="localRef">${Instance["$type"]}</h1>`;
/*
current += 
`<div class="GuidReferences">
<label>Partition:</label>
<div class="guidReference">${partitionGuid.toUpperCase()}
</div> 
<label>Instance: </label>
<div class="guidReference">${instanceGuid.toUpperCase()}</div>
</div>`;
*
	}
	else
	{
		current += 
`<h1 class="remoteRef">${Instance["$type"]}
	<partitionReference>${s_EbxManager.GetPartitionGuidPath(partitionGuid)}</partitionReference>
</h1>`;
	}

	current += 
`<div class="GuidReferences">
	<label>Partition:</label>
	<div class="guidReference">${partitionGuid.toUpperCase()}</div> 
	<label>Instance: </label>
	<div class="guidReference">${instanceGuid.toUpperCase()}</div>
</div>`;

	current += '<ul type="first">';
	{
		keys = Object.keys(Instance["$fields"]);


		if (g_TypeFieldHandlers[Instance["$type"]] != null)
			current += g_TypeFieldHandlers[Instance["$type"]](Instance)

		keys.forEach(function (fieldName)
		{
			var FieldInstance = Instance["$fields"][fieldName];




			current += HandleField(FieldInstance, fieldName);
		});
	}
	current += "</ul>";
	CurrentlyLoaded[partitionGuid + instanceGuid] = current;
	return current;
}

function HandleField(instance, field = null, subField = false, includeType = false)
{
	var content = "";

	if (field != null && subField == false)
	{
		if( includeType )
			content += `<li><type>${instance["$type"]}</type> `;

		content += `<field>${field}</field>: `;
	}

	if (field != null && subField)
		content += ":<subfield>" + field + "</subfield>";

	if (instance["$array"] != null) // Handle array
	{
		content = '<li class="minimized"><type>' + instance["$type"] + '</type> <field>' + field + "</field>: ";
		content += HandleArray(instance);
		content += "</li>"
	}
	else if (instance["$ref"] != null) // Handle reference
	{
		content += HandleReference(instance);
	}
	else if (instance["$type"] != null && simpleTypes[instance["$type"]]) // Handle simple
	{
		content += HandleSimple(instance["$value"], instance["$type"]);
	}
	else if (instance["$type"] != null && advancedTypes[instance["$type"]] != null) // Handle advanced
	{
		content += HandleAdvanced(instance["$value"], instance["$type"]);
	}
	else if (instance["$enum"] != null)
	{
		content += HandleEnum(instance["$enumValue"]);
	}
	else if (typeof instance == "string" || instance instanceof String)
		content += instance;
	else if (typeof instance == "number" || instance instanceof Number)
		content += instance;
	else
		content += HandleSubField(instance);


	if (content.indexOf("undefined") != -1)
	{
		console.log("Something went wrong. Debug!");
	}
	return content;
}


function HandleSubField(instance)
{
	var content = "";
	if (instance["$value"] != null)
	{
		content += HandleField(instance["$value"], null, true); //
	}
	else
	{
		//if (instance["$type"] == null)
		//	return;

		content += '<ul type="2nd">';

		Object.keys(instance).forEach(function (subField)
		{
			content += HandleField(this[subField], subField);
		}, instance);
		content += "</ul>";
	}
	return content;
}

function HandleReference(instance, direct, directType)
{
	var content = "";

	if (instance != null)
	{

		if (direct &&
			instance['$partitionGuid'] != null &&
			instance['$instanceGuid'] != null)
		{
			var PartitionGuid = instance["$partitionGuid"];
			var InstanceGuid = instance["$instanceGuid"];
			instance["$type"] = directType;
		}
		else
		{
			if (instance["$value"] != null && instance["$value"]["$partitionGuid"] != null && instance["$value"]["$instanceGuid"] != null)
			{
				var PartitionGuid = instance["$value"]["$partitionGuid"];
				var InstanceGuid = instance["$value"]["$instanceGuid"];
			}
		}
	}

	if (PartitionGuid == null || InstanceGuid == null)
	{
		return '<div class="ref" ' + "><nilValue>*nullRef*</nilValue></div>"
	}

	content += `<div class="ref" partitionGuid="${PartitionGuid}" 
								 instanceGuid="${InstanceGuid}" 
								 parentPartition="${currentPartition}">`;

	content += `<h1 class="${(PartitionGuid == currentPartition) ? "localRef" : "remoteRef"}">`;




	var Instance = s_EbxManager.FindInstance(PartitionGuid, InstanceGuid, false);

	if (Instance != null)
	{

		//content += BuildInstance(loadedPartitions[partitionGuid][instanceGuid]);
		content += Instance["$type"] +
			'</h1>' +
			'<div class="GuidReferences">' +
			'<label>Partition:</label>' +
			'<div class="guidReference">' + PartitionGuid.toUpperCase() + '</div>' +
			' ' +
			'<div class="GuidReferences">' +
			'<label>Instance:</label>' +
			'<div class="guidReference">' + InstanceGuid.toUpperCase() + '</div>' +
			'</div>';

	}
	else
	{
		/*
		if (loadedPartitions[partitionGuid] == null) 
		{
			*
		content += instance["$type"] +
			' <partitionReference>' + s_EbxManager.GetPartitionGuidPath(PartitionGuid) + '</partitionReference>' +
			'</h1>' +
			'<div class="GuidReferences">' +
			'<label>Partition:</label>' +
			'<div class="guidReference">' + PartitionGuid.toUpperCase() + '</div>' +
			' <div class="GuidReferences">' +
			'<label>Instance:</label>' +
			'<div class="guidReference">' + InstanceGuid.toUpperCase() + '</div>' +
			'</div>';
		return content;
		/*
		}
		if (loadedPartitions[partitionGuid][instanceGuid] != null) {
			content += loadedPartitions[partitionGuid][instanceGuid]["$type"] + ' <partitionReference>' + TryGetPartitionName(partitionGuid) + '</partitionReference></h1><div class="GuidReferences"><label>Partition:</label><div class="guidReference">' + partitionGuid.toUpperCase() + '</div> <div class="GuidReferences"><label>Instance:</label><div class="guidReference">' + instanceGuid.toUpperCase() + '</div></div>';
			//content += BuildInstance(loadedPartitions[partitionGuid][instanceGuid])
		} else {
			content += "<nilValue>Failed to fetch</nilValue>";
		}
		*

	}
	content += '</div>';
	return content;
}

function HandleReferencePost(partitionGuid, instanceGuid, parentPartition)
{
	var content = ""

	var Instance = s_EbxManager.FindInstance(partitionGuid, instanceGuid);

	if (Instance != null)
		content += BuildInstance(partitionGuid, instanceGuid, parentPartition);
	else
		content += "<nilValue>Failed to fetch</nilValue>";

	return content;
}

function HandleArray(instance)
{
	var content = "";
	content = " <count>(" + Object.values(instance['$value']).length + ")</count>";

	if (Object.values(instance['$value']).length == 0)
	{
		return content + "<nilValue>*nullArray*</nilValue>";
	}


	content += '<ul class="array">';
	var i = 1;
	Object.values(instance['$value']).forEach(function (refInstance)
	{
		if (instance["$ref"] != null) // Handle ref
		{
			content += "<li><index>[" + i + "]</index>";
			content += HandleReference(refInstance, true, instance['$type']);
			content += "</li>"
		}
		else
		{
			content += "<li><index>[" + i + "]</index>";
			content += HandleField(refInstance);
			content += "</li>";
		}
		/*
		if (instance["$ref"] != null) { // Handle ref
			content += "<li><index>[" + i + "]</index>";
			content += HandleReference(refInstance, true, instance['$type']);
			content += "</li>"
		} else { // Handle other types.
			if (simpleTypes[instance["$type"]]) { // Handle simple
				content += "<li><index>[" + i + "]</index>";
				content += HandleSimple(refInstance, instance["$type"]);
				content += "</li>"
			} else if (advancedTypes[instance["$type"]]) { // Handle simple
				content += "<li><index>[" + i + "]</index>";
				content += HandleAdvanced(refInstance, instance["$type"]);
				content += "</li>"
			} else {
				content += "<li><index>[" + i + "]</index>";
				content += HandleField(refInstance)
				content += "</li>"
			}
		}
		*
		i++;
	});
	content += "</ul>";

	return content;

}

function HandleEnum(enumValue)
{
	if (enumValue != null)
	{
		return '<value class="enum">' + enumValue + "</value>";
	}
	else
	{
		return "<nilValue>*unknownEnum*</nilValue";
	}
}

function HandleSimple(value, type)
{
	// If the value is not null or empty
	var content = "";
	if (simpleTypes[type] != null &&
		simpleTypes[type] == 2)
		content += '<value contenteditable="true" class="Boolean">' + value + "</value>";
	else if (simpleTypes[type] != null &&
		simpleTypes[type] == 3 &&
		s_HashManager.GetHashResult(value) != null)
		content += '<value class="Hash">' + s_HashManager.GetHashResult(value) + '</value>';
	else if (value !== null)
		content = '<value contenteditable="true" class="' + type + '">' + value + "</value>";
	else
		content = '<nilValue class="' + type + '">0</nilValue>';
	return content;
}

function HandleAdvanced(value, type)
{
	// If the value is not null or empty
	var content = "";

	if (value)
	{
		content = '<value class="' + type + '">';
	}

	if (advancedTypes[type] != null && advancedTypes[type] != true)
		content += advancedTypes[type](value);
	else
		content += value;

	if (content != '<value class="' + type + '">')
	{
		content += "</value>"
	}
	else
	{ //Value is null or empty.
		content = "<nilValue>*null*</nilValue>";
	}
	return content;
}

function HandleEvent(value)
{
	var content = ':<subfield>EventSpec</subfield><ul type="2nd">';

	content += '<li><field>Id</field><value class="EventSpec">';

	if (GetHashResult([value["Id"]["$value"]]) != null)
		content += GetHashResult([value["Id"]["$value"]]);
	else
		content += value["Id"]["$value"];

	content += "</value></li></ul>";
	return content;

}
*/


function ParseVec2(value, raw = false)
{
	if (value == null)
		return "<nilValue>*null*</nilValue>";

	var content = "";

	if (raw == true)
		content += "Vec3(";

	content += value["x"]["$value"] + ", " + value["y"]["$value"];

	if (raw == true)
		content += ")";

	return content;
}

function ParseVec3(value, raw = false)
{
	if (value == null)
		return "<nilValue>*null*</nilValue>";


	var content = "";

	if (raw == true)
		content += "Vec3(";


	content += value["x"]["$value"] + ", " + value["y"]["$value"] + ", " + value["z"]["$value"];

	if (raw == true)
		content += ")";

	return content;
}

function ParseVec4(value, raw = false)
{
	if (value == null)
		return "<nilValue>*null*</nilValue>";


	var content = "";
	if (raw == true)
		content += "Vec4(";

	content += value["x"]["$value"] + ", " + value["y"]["$value"] + ", " + value["z"]["$value"] + ", " + value["w"]["$value"];

	if (raw == true)
		content += ")";

	return content;
}

function ParseLinearTransform(value)
{
	if (value == null)
		return "<nilValue>*null*</nilValue>";

	// Fix for uppercase members

	let s_Right = null;
	let s_Up = null;
	let s_Forward = null;
	let s_Trans = null;

	if (value["right"] != null)
	{
		s_Right = value["right"]["$value"];
		s_Up = value["up"]["$value"];
		s_Forward = value["forward"]["$value"];
		s_Trans = value["trans"]["$value"];
	}
	else
	{
		s_Right = value["Right"]["$value"];
		s_Up = value["Up"]["$value"];
		s_Forward = value["Forward"]["$value"];
		s_Trans = value["Trans"]["$value"];
	}

	var content = '<ul type="2nd">' +
		'<value class="LinearTransform">' +
		'<li>LinearTransform(';
	content += '<li>' + ParseVec3(s_Right) + ",</li>";
	content += '<li>' + ParseVec3(s_Up) + ",</li>";;
	content += '<li>' + ParseVec3(s_Forward) + ",</li>";
	content += '<li>' + ParseVec3(s_Trans) + "</li>";
	content += ')</li>' +
		'</value>' +
		'</ul>';
	return content;
}