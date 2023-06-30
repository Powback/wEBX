var delay = (function() 
{
	var timer = 0;
	return function(callback, ms) 
	{
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
})();


function hasLowerCase(str) 
{
	return (/[a-z]/.test(str));
}

function hasUpperCase(str) 
{
	return (/[A-Z]/.test(str));
}


function getPaths(path) 
{
	var paths = path.split(/[/\\]+/);
	paths.pop();
	return paths;
}

function getFilename(path) 
{
    return path.split(/[/\\]+/).filter(function(value) 
    {
		return value && value.length;
	}).reverse()[0];
}


function StringToColor(string) {
	let fbHash = function(str) {
		var hash = 5381;
		for (var i = 0; i < str.length; i++) 
		{
			hash = ((hash << 5) + hash) ^ str.charCodeAt(i); /* hash * 33 + c */
		}
		return hash;
	}
		
	let hashStringToColor = function(str, hashFunc) {
		var hash = hashFunc(str);
		var r = (hash & 0xFF0000) >> 16;
		var g = (hash & 0x00FF00) >> 8;
		var b = hash & 0x0000FF;


		//TODO: fix luminance

		


		return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
	}

	return hashStringToColor(string, fbHash);
}
