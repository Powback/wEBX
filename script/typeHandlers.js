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

var g_AdvancedTypes = {
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

var g_TypeFieldHandlers = {
	"RngCharEntityData": function(classInstance) {
		var GuidString = classInstance["$guid"];

		if ((classInstance["$fields"]["Flags"]["$value"] & 0x100) == 0)
			GuidString = "00000000-0000-0000-0000-000000000000";


		var ClassDataArray = StringToUint8Array(classInstance["$fields"]["In"]["$value"]);
		var GuidDataArray = StringToUint8Array(GuidString);

		var String1 = DecryptEEString(ClassDataArray, GuidDataArray, GuidString.charCodeAt(12)); // classInstance["$fields"]["In"]["$value"]

		var DecryptedString = DecryptEEString(String1, StringToUint8Array("xI&O45@3HUhgdfI!I45u&dhs@9U35df3!56IYOhdfI&31@48*56U!uiH)s+e&f-y"), GuidString.charCodeAt(20))


		console.log("String1: " + Uint8ArrayToString(String1));

		console.log("DecryptedString: " + Uint8ArrayToString(DecryptedString));

		//console.log("FindalSize: " + (Math.floor( fieldInstance["$value"].length / 2) + ( fieldInstance["$value"].length % 2 ) ) );

		return "In-Decrypted: " + Uint8ArrayToString(DecryptedString);
	},

	"SFBMEEntityData": function(classInstance, fieldInstance, fieldName) {
		if (fieldName != "In")
			return "";

		var GuidString = classInstance["$guid"];

		var ClassDataArray = StringToUint8Array(fieldInstance["$value"]);
		var GuidDataArray = StringToUint8Array(GuidString);

		var String1 = DecryptEEString(ClassDataArray, GuidDataArray, GuidString.charCodeAt(12));

		var DecryptedString = DecryptEEString(String1, StringToUint8Array("xI&O45@3HUhgdfI!I45u&dhs@9U35df3!56IYOhdfI&31@48*56U!uiH)s+e&f-y"), GuidString.charCodeAt(20))


		console.log("DecryptedString: " + Uint8ArrayToString(DecryptedString));

		return fieldName + "-Decrypted: " + Uint8ArrayToString(DecryptedString );
	}
}


function StringToUint8Array(string) {
	var s_DataArray = new Uint8Array(string.length);

	for (var i = 0; i < string.length; i++) {
        s_DataArray[i] = string.charCodeAt(i);
    }
    
    return s_DataArray
}

function Uint8ArrayToString(array) {
	var s_Result = "";

	for (var i = 0; i < array.length; i++) {
        s_Result += String.fromCharCode(array[i]);
    }
    
	return s_Result;
}

function DecryptEEString(inputString, guidString, offset) {
	if (guidString.length == 0) {
		return null;
	}
		
	if (inputString.length == 0) {
		return null;
	}
		
	var result = new Uint8Array(inputString.length);

	for (var i = 0; i < inputString.length; i++) {
		var GuidIndex = (i + offset) % guidString.length;

		var InputStringChar = inputString[i];
		var InputGuidChar = guidString[GuidIndex];

		var Char = InputStringChar - InputGuidChar + 0xFF;

		result[i] = ((Char % 0xFF) + 1);
	}

	return result;
}


function Utf16ArrayToString(inputString) {
	var Result = "";
	for (var i = 0; i < inputString.length; i += 2) {
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

function ParseLinearTransform(value) {
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