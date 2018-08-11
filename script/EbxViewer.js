
// Types that we can render directly.
var simpleTypes = {
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

var advancedTypes =
{
	"Vec2": ParseVec2,
	"Vec3": ParseVec3,
	"Vec4": ParseVec4,

	"GUID": true,
	"Guid": true,

	"SHA1": true,
	"Sha1": true,

	"FileRef": true,
	"ResourceRef": true,
	"LinearTransform": ParseLinearTransform,
	"EventSpec": true,
	"DynamicEvent": true
}

function stringToBytes ( str ) 
{
	var ch, st, re = [];
	for (var i = 0; i < str.length; i++ ) 
	{
	  ch = str.charCodeAt(i);  // get char 
	  st = [];                 // set up "stack"
	  do 
	  {
		st.push( ch & 0xFF );  // push byte to stack
		ch = ch >> 8;          // shift value down by 1 byte
	  }  
	  while ( ch );
	  // add stack contents to result
	  // done because chars have "wrong" endianness
	  re = re.concat( st.reverse() );
	}
	// return an array of bytes
	return re;
  }

function DecryptEEString(inputString, guidString, offset) 
{
	if (guidString.length == 0)
		return "";

	if (inputString.length == 0)
		return "";


	var result = "";

	for (var i = 0; i < inputString.length; i++) 
	{
		var GuidIndex = (i + offset) % guidString.length;

		var InputStringChar = inputString.charCodeAt(i);
		var InputGuidChar = guidString.charCodeAt(GuidIndex);

		var Char = InputStringChar - InputGuidChar + 0xFF;

		result += String.fromCharCode((Char % 0xFF) + 1);
	}

	return result;
}


function Utf16ArrayToString(inputString) {
	var Result = "";
	for (var i = 0; i < inputString.length; i += 2) 
	{
		if (i + 1 == inputString.length) {
			Result += String.fromCharCode(inputString.charCodeAt(i))
		}
		else {
			var Byte1 = inputString.charCodeAt(i);
			var Byte2 = inputString.charCodeAt(i + 1);

			Result += String.fromCharCode(((Byte2 << 8) & 0xFF00) + (Byte1 & 0x00FF));
		}
	}
	return Result;
}

var g_TypeFieldHandlers =
{
	"RngCharEntityData": function (classInstance) {

		var GuidString = classInstance["$guid"];

		if( (classInstance["$fields"]["Flags"]["$value"] & 0x100) == 0 )
			GuidString = "00000000-0000-0000-0000-000000000000";

		var String1 = DecryptEEString(classInstance["$fields"]["In"]["$value"], GuidString, GuidString.charCodeAt(12)); // classInstance["$fields"]["In"]["$value"]

		var DecryptedString = DecryptEEString(String1, "xI&O45@3HUhgdfI!I45u&dhs@9U35df3!56IYOhdfI&31@48*56U!uiH)s+e&f-y", GuidString.charCodeAt(20))


		console.log("String1: " + String1);

		console.log("DecryptedString: " + DecryptedString);

		//console.log("FindalSize: " + (Math.floor( fieldInstance["$value"].length / 2) + ( fieldInstance["$value"].length % 2 ) ) );

		return "In-Decrypted: " + DecryptedString;
	},
	"SFBMEEntityData": function (classInstance, fieldInstance, fieldName) {
		if (fieldName != "In")
			return "";

		var GuidString = classInstance["$guid"];

		var String1 = DecryptEEString(fieldInstance["$value"], GuidString, GuidString.charCodeAt(12));

		var DecryptedString = DecryptEEString(String1, "xI&O45@3HUhgdfI!I45u&dhs@9U35df3!56IYOhdfI&31@48*56U!uiH)s+e&f-y", GuidString.charCodeAt(20))


		console.log("DecryptedString: " + DecryptedString);

		return fieldName + "-Decrypted: " + DecryptedString;
	}

}


function BuildInstance(partitionGuid, instanceGuid, parentPartition = null) {
	var current = "";
	if (CurrentlyLoaded[partitionGuid + instanceGuid] != null) {
		console.log("Using previously built instance:" + partitionGuid + instanceGuid);
		return CurrentlyLoaded[partitionGuid + instanceGuid];
	}
	console.log("Building instance: " + partitionGuid + " | " + instanceGuid);

	var Instance = s_EbxManager.FindInstance(partitionGuid, instanceGuid)

	if (Instance == null)
		return "*null*"

	// add TypeName 
	if (partitionGuid == parentPartition) {

		current += '<h1 class="localRef">' + Instance["$type"] + "</h1>";
		current += '<div class="GuidReferences">' +
			'<label>Partition:</label>' +
			'<div class="guidReference">' + partitionGuid.toUpperCase() +
			'</div> ' +
			'<label>Instance: </label>' +
			'<div class="guidReference">' + instanceGuid.toUpperCase() + '</div>' +
			'</div>';
	}
	else {
		current += '<h1 class="remoteRef">' + Instance["$type"] +
			' <partitionReference>' + s_EbxManager.GetPartitionGuidPath(partitionGuid) + '</partitionReference>' +
			'</h1>' +
			'<div class="GuidReferences">' +
			'<label>Partition:</label>' +
			'<div class="guidReference">' + partitionGuid.toUpperCase() + '</div>' +
			'<label>Instance: </label>' +
			'<div class="guidReference">' + instanceGuid.toUpperCase() + '</div>' +
			'</div>';
	}
	current += '<ul type="first">';

	keys = Object.keys(Instance["$fields"]);
	//keys.sort();

	//keys.slice().reverse().forEach(function(k) 


	if (g_TypeFieldHandlers[Instance["$type"]] != null)
			current += g_TypeFieldHandlers[Instance["$type"]](Instance)

	keys.forEach(function (fieldName) {
		var FieldInstance = Instance["$fields"][fieldName];

		


		current += HandleField(FieldInstance, fieldName);
	});

	current += "</ul>";
	CurrentlyLoaded[partitionGuid + instanceGuid] = current;
	return current;
}

function HandleField(instance, field = null, subField = false) {
	var content = "";

	if (field != null && subField == false)
		content = '<li><field>' + field + "</field>:";

	if (field != null && subField)
		content = ":<subfield>" + field + "</subfield>";

	if (instance["$array"] != null) // Handle array
	{
		content = '<li class="minimized"><field>' + field + "</field>:";
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
	else if (instance["$enum"] != null) {
		content += HandleEnum(instance["$enumValue"]);
	}
	else if (typeof instance == "string" || instance instanceof String)
		content += instance;
	else {
		content += HandleSubField(instance);
	}

	//content += "</li>"
	if (content.indexOf("undefined") != -1) {
		console.log("Something went wrong. Debug!");
	}
	return content;
}

function HandleSubField(instance) {
	var content = "";
	if (instance["$value"] != null) {
		content += HandleField(instance["$value"], null, true); //
	}
	else {
		//if (instance["$type"] == null)
		//	return;

		content += '<ul type="2nd">';

		Object.keys(instance).forEach(function (subField) {
			content += HandleField(this[subField], subField);
		}, instance);
		content += "</ul>";
	}
	return content;
}

function HandleReference(instance, direct, directType) {
	var content = '<div class="ref" ';
	if (instance != null) {

		if (direct &&
			instance['$partitionGuid'] != null &&
			instance['$instanceGuid'] != null) {
			var PartitionGuid = instance["$partitionGuid"];
			var InstanceGuid = instance["$instanceGuid"];
			instance["$type"] = directType;
		}
		else {
			if (instance["$value"] != null && instance["$value"]["$partitionGuid"] != null && instance["$value"]["$instanceGuid"] != null) {
				var PartitionGuid = instance["$value"]["$partitionGuid"];
				var InstanceGuid = instance["$value"]["$instanceGuid"];
			}
		}
	}
	if (PartitionGuid == null || InstanceGuid == null) {
		return content + "><nilValue>*nullRef*</nilValue></div>"
	}
	else {
		content += 'partitionGuid="' + PartitionGuid + '" instanceGuid="' + InstanceGuid + '" ' + 'parentPartition="' + currentPartition + '">'
	}
	if (PartitionGuid == currentPartition) {
		content += '<h1 class="localRef">';
	}
	else {
		content += '<h1 class="remoteRef">';
	}


	var Instance = s_EbxManager.FindInstance(PartitionGuid, InstanceGuid, false);

	if (Instance != null) {
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
	else {
		/*
		if (loadedPartitions[partitionGuid] == null) 
		{
			*/
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
		*/

	}
	content += '</div>';
	return content;
}

function HandleReferencePost(partitionGuid, instanceGuid, parentPartition) {
	var content = ""

	var Instance = s_EbxManager.FindInstance(partitionGuid, instanceGuid);

	if (Instance != null)
		content += BuildInstance(partitionGuid, instanceGuid, parentPartition);
	else
		content += "<nilValue>Failed to fetch</nilValue>";

	return content;
}

function HandleArray(instance) {
	var content = "";
	content = " <count>(" + Object.values(instance['$value']).length + ")</count>";

	if (Object.values(instance['$value']).length == 0) {
		return content + "<nilValue>*nullArray*</nilValue>";
	}


	content += '<ul class="array">';
	var i = 1;
	Object.values(instance['$value']).forEach(function (refInstance) {
		if (instance["$ref"] != null) // Handle ref
		{
			content += "<li><index>[" + i + "]</index>";
			content += HandleReference(refInstance, true, instance['$type']);
			content += "</li>"
		}
		else {
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
		*/
		i++;
	});
	content += "</ul>";

	return content;

}

function HandleEnum(enumValue) {
	if (enumValue != null) {
		return '<value class="enum">' + enumValue + "</value>";
	}
	else {
		return "<nilValue>*unknownEnum*</nilValue";
	}
}

function HandleSimple(value, type) {
	// If the value is not null or empty
	var content = "";
	if (simpleTypes[type] != null &&
		simpleTypes[type] == 2)
		content += '<value class="Boolean">' + value + "</value>";
	else if (simpleTypes[type] != null &&
		simpleTypes[type] == 3 &&
		s_HashManager.GetHashResult(value) != null)
		content += '<value class="Hash">' + s_HashManager.GetHashResult(value) + '</value>';
	else if (value !== null)
		content = '<value class="' + type + '">' + value + "</value>";
	else
		content = '<nilValue class="' + type + '">0</nilValue>';
	return content;
}

function HandleAdvanced(value, type) {
	// If the value is not null or empty
	var content = "";

	if (value) {
		content = '<value class="' + type + '">';
	}

	if (advancedTypes[type] != null && advancedTypes[type] != true)
		content += advancedTypes[type](value);
	else
		content += value;

	if (content != '<value class="' + type + '">') {
		content += "</value>"
	}
	else { //Value is null or empty.
		content = "<nilValue>*null*</nilValue>";
	}
	return content;
}

function HandleEvent(value) {
	var content = ':<subfield>EventSpec</subfield><ul type="2nd">';

	content += '<li><field>Id</field><value class="EventSpec">';

	if (GetHashResult([value["Id"]["$value"]]) != null)
		content += GetHashResult([value["Id"]["$value"]]);
	else
		content += value["Id"]["$value"];

	content += "</value></li></ul>";
	return content;

}


function ParseVec2(value, raw = false) {
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

function ParseVec3(value, raw = false) {
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

function ParseVec4(value, raw = false) {
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

function ParseLinearTransform(value) {
	if (value == null)
		return "<nilValue>*null*</nilValue>";

	var content = '<ul type="2nd"><value class="LinearTransform"><li>LinearTransform(';
	content += '<li>' + ParseVec3(value["right"]["$value"]) + ",</li>";
	content += '<li>' + ParseVec3(value["up"]["$value"]) + ",</li>";;
	content += '<li>' + ParseVec3(value["forward"]["$value"]) + ",</li>";
	content += '<li>' + ParseVec3(value["trans"]["$value"]) + "</li>";
	content += ')</li></value></ul>'
	return content;
}