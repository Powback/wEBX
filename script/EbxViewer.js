
// Types that we can render directly.
var simpleTypes = {
	"String": true,
	"CString": true,
	"FileRef": true,

	"Int64": true,
	"UInt64": true,
	"Uint64": true,

	"Int32": true,
	"UInt32": true,
	"Uint32": true,

	"Int16": true,
	"UInt16": true,
	"Uint16": true,
	
	"Int8": true,
	"UInt8": true,
	"Uint8": true,

	"SByte": true,
	

	"Float32": true,
	"Single": true,

	"Float64": true,
	"Double": true,

	
	"Boolean": true,
	"MathOp": true
}

var advancedTypes = {
	"Vec2": true,
	"Vec3": true,
	"Vec4": true,
	"GUID": true,
	"Guid": true,
	"Sha1": true,
	"FileRef": true,
	"LinearTransform": true
}

function BuildInstance(partitionGuid, instanceGuid, parentPartition) 
{
	var current = "";
	if (CurrentlyLoaded[partitionGuid+instanceGuid] != null) 
	{
		console.log("Using previously built instance:" + partitionGuid+instanceGuid);
		return CurrentlyLoaded[partitionGuid+instanceGuid];
	}
	console.log("Building instance: " + partitionGuid + " | " +instanceGuid);

	var Instance = s_EbxManager.FindInstance(partitionGuid, instanceGuid)

	if( Instance == null )
		return "*null*"

	// add TypeName 
	if (partitionGuid == parentPartition) 
	{
		current += '<h1 class="localRef">' + Instance["$type"];
		current += '</h1><div class="GuidReferences"><label>Partition:</label><div class="guidReference">' + partitionGuid.toUpperCase() + '</div> <label>Instance: </label><div class="guidReference">' + instanceGuid.toUpperCase() + '</div></div>';
	} 
	else 
	{
		current += '<h1 class="remoteRef">' + Instance["$type"];
		current += ' <partitionReference>' + s_EbxManager.GetPartitionGuidPath(partitionGuid) + '</partitionReference></h1><div class="GuidReferences"><label>Partition:</label><div class="guidReference">' + partitionGuid.toUpperCase() + '</div><label>Instance: </label><div class="guidReference">' + instanceGuid.toUpperCase() + '</div></div>';
	}
	current += '<ul type="first">';

	keys = Object.keys(Instance["$fields"]);
	//keys.sort();

	//keys.slice().reverse().forEach(function(k) 
	keys.forEach(function(k) 
	{
		current += HandleField(Instance["$fields"][k], k);
	});

	current += "</ul>";
	CurrentlyLoaded[partitionGuid+instanceGuid] = current;
	return current;
}

function HandleField(instance, field, subField = false) {
	var content = "";
	if (field != null && subField == false) {
		content = '<li><field>' + field + "</field>:";
	}
	if (field != null && subField) {
		content = ":<subfield>" + field + "</subfield>";
	}
	if (instance["$array"] != null) { // Handle array
		content = '<li class="minimized"><field>' + field + "</field>:";
		content += HandleArray(instance);
	} else if (instance["$ref"] != null) { // Handle reference
		content += HandleReference(instance);
	} else if (simpleTypes[instance["$type"]]) { // Handle simple
		content += HandleSimple(instance["$value"], instance["$type"]);
	} else if (advancedTypes[instance["$type"]]) { // Handle simple
		content += HandleAdvanced(instance["$value"], instance["$type"]);
	} else if (instance["$enum"] != null) {
		content += HandleEnum(instance["$enumValue"])
	} else {
		content += HandleSubField(instance)
	}

	content += "</li>"
	if (content.indexOf("undefined") != -1) {
		console.log("Something went wrong. Debug!");
	}
	return content;
}

function HandleSubField(instance) {
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
		
		Object.keys(instance).forEach(function(subField) 
		{
			content += HandleField(this[subField], subField);
		}, instance);
		content += "</ul>";
	}
	return content;
}

function HandleReference(instance, direct, directType) {
	var content = '<div class="ref" ';
	if (instance != null) {

		if (direct && instance['$partitionGuid'] != null && instance['$instanceGuid'] != null) {
			var partitionGuid = instance["$partitionGuid"];
			var instanceGuid = instance["$instanceGuid"];
			instance["$type"] = directType;
		} else {
			if (instance["$value"] != null && instance["$value"]["$partitionGuid"] != null && instance["$value"]["$instanceGuid"] != null) {
				var partitionGuid = instance["$value"]["$partitionGuid"];
				var instanceGuid = instance["$value"]["$instanceGuid"];
			}
		}
	}
	if (partitionGuid == null || instanceGuid == null) {
		return content + "><nilValue>*nullRef*</nilValue></div>"
	} else {
		content += 'partitionGuid="' + partitionGuid + '" instanceGuid="' + instanceGuid + '" ' + 'parentPartition="' + currentPartition + '">'
	}
	if (partitionGuid == currentPartition) {
		content += '<h1 class="localRef">';
	} else {
		content += '<h1 class="remoteRef">';
	}

	
	var Instance = s_EbxManager.FindInstance( partitionGuid, instanceGuid, false );

	if (Instance != null) 
	{
		//content += BuildInstance(loadedPartitions[partitionGuid][instanceGuid]);
		content += Instance["$type"] + '</h1><div class="GuidReferences"><label>Partition:</label><div class="guidReference">' + partitionGuid.toUpperCase() + '</div> <div class="GuidReferences"><label>Instance:</label><div class="guidReference">' + instanceGuid.toUpperCase() + '</div><div class="GuidReferences"><label>Instance:</label><div class="guidReference">' + instanceGuid.toUpperCase() + '</div></div>';

	} 
	else 
	{
		/*
		if (loadedPartitions[partitionGuid] == null) 
		{
			*/
			content += instance["$type"] + ' <partitionReference>' + s_EbxManager.GetPartitionGuidPath(partitionGuid) + '</partitionReference></h1><div class="GuidReferences"><label>Partition:</label><div class="guidReference">' + partitionGuid.toUpperCase() + '</div> <div class="GuidReferences"><label>Instance:</label><div class="guidReference">' + instanceGuid.toUpperCase() + '</div></div>';
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


function HandleReferencePost(partitionGuid, instanceGuid, parentPartition) 
{
	content = ""

	var Instance = s_EbxManager.FindInstance( partitionGuid, instanceGuid );

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
	Object.values(instance['$value']).forEach(function(refInstance) {

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
		i++;
	});
	content += "</ul>";

	return content;

}

function HandleEnum(enumValue) {
	if (enumValue != null) {
		return '<value class="enum">' + enumValue + "</value>";
	} else {
		return "<nilValue>*unknownEnum*</nilValue";
	}
}

function HandleSimple(value, type) {
	// If the value is not null or empty
	var content = "";
	if (type == "Boolean") {
		return content += '<value class="Boolean">' + value + "</value>";
	}
	if ((type == "Int32" || type == "UInt32") && s_HashManager.GetHashResult(value) != null) {
		return '<value class="Hash">' + s_HashManager.GetHashResult(value) + '</value>';
	}
	if (value !== null && value != "") {
		content = '<value class="' + type + '">' + value + "</value>";
	} else { //Value is null or empty.
		content = '<nilValue class="' + type + '">0</nilValue>';
	}
	return content;
}

function HandleAdvanced(value, type) {
	// If the value is not null or empty
	var content = "";
	if (value) 
	{
		content = '<value class="' + type + '">';
	}

	if (type == "Vec2") 
	{
		content += ParseVec2(value);
	} 
	else if (type == "Vec3") 
	{
		content += ParseVec3(value);
	} 
	else if (type == "Vec4") 
	{
		content += ParseVec4(value);
	} 
	else if (type == "LinearTransform") 
	{
		return ParseLinearTransform(value);
	} 
	else if ( type == "EventSpec" || 
				type == "DynamicEvent") 
	{
		return HandleEvent(value);
	}

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
	if (GetHashResult([value["Id"]["$value"]]) != null) {
		content += GetHashResult([value["Id"]["$value"]]);
	} else {
		content += value["Id"]["$value"];
	}

	content += "</value></li></ul>";
	return content;

}


function ParseVec2(value, raw) 
{
	if (value == null) {
		return "<nilValue>*null*</nilValue>";
	} else {
		var content = "";
		if (!raw) {
			content += "Vec3(";
		}
		content += value["x"]["$value"] + ", " + value["y"]["$value"];

		if (!raw) {
			content += ")";
		}

		return content;
	}
}

function ParseVec3(value, raw) 
{
	if (value == null) {
		return "<nilValue>*null*</nilValue>";
	} else {
		var content = "";

		if (!raw) {
			content += "Vec3(";
		}
		content += value["x"]["$value"] + ", " + value["y"]["$value"] + ", " + value["z"]["$value"];
		if (!raw) {
			content += ")";
		}
		return content;
	}
}

function ParseVec4(value, raw) 
{
	if (value == null) {
		return "<nilValue>*null*</nilValue>";
	} else {
		var content = "";
		if (!raw) {
			content += "Vec4(";
		}
		content += value["x"]["$value"] + ", " + value["y"]["$value"] + ", " + value["z"]["$value"] + ", " + value["w"]["$value"];
		if (!raw) {
			content += ")";
		}
		return content;
	}
}

function ParseLinearTransform(value) 
{
	var content = '<ul type="2nd"><value class="LinearTransform"><li>LinearTransform(';
	content += '<li>' + ParseVec3(value["right"]["$value"]) + ",</li>";
	content += '<li>' + ParseVec3(value["up"]["$value"]) + ",</li>";;
	content += '<li>' + ParseVec3(value["forward"]["$value"]) + ",</li>";
	content += '<li>' + ParseVec3(value["trans"]["$value"]) + "</li>";
	content += ')</li></value></ul>'
	return content;
}