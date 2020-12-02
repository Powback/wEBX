
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
			//Subfield
			if (instance["$value"] != null)
			{
				content += `<label>${instance["$type"]}</label>`;

				content += this.HandleField(instance["$value"], null, true); //
			}
			else
			{

				content += `<ul type="2nd">`;

				for (let key in instance)
				{
					content += this.HandleField(instance[key], key)
				}

				content += `</ul>`;

			}
		}

		content += "</li>"
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

			if (instance["$ref"] != null) // Handle ref
				content += this.HandleReference(refInstance, true, instance['$type']);
			else
				content += this.HandleField(refInstance);
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

	var content = '<ul type="2nd">' +
		'<value class="LinearTransform">' +
		'<li>LinearTransform(';
	content += '<li>' + ParseVec3(value["right"]["$value"]) + ",</li>";
	content += '<li>' + ParseVec3(value["up"]["$value"]) + ",</li>";;
	content += '<li>' + ParseVec3(value["forward"]["$value"]) + ",</li>";
	content += '<li>' + ParseVec3(value["trans"]["$value"]) + "</li>";
	content += ')</li>' +
		'</value>' +
		'</ul>';
	return content;
}