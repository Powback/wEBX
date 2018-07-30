
function LoadDirectory() {
	$.ajax({
		url: "directory.json",
		dataType: 'json',
		success: function(response) {
			console.log("Received hashes");
			var directory = response;

			// Modify the json response to add the open attribute to the path, until we reach the node.
			directory = SelectNodeFromHash(directory);
			Populate(directory);
		}
	});
}

function SelectNodeFromHash(directory) {
	var hash = location.hash.replace(/^#/, '');

	// If hash contains ebx, get the path and load the selected partition.
	if (hash.indexOf(".ebx") == -1) {
		return directory;
	}
		

	var path = hash.split("/");
	var i = 0;
	var i2 = 0;
	var found = false;
	var currentlevel = directory;

	while(found == false && i2 < 10) {
		Object.values(currentlevel.children).some(function(node) {
			if(node.type != "file") {
				if(node.text == path[i]) {
					currentlevel = node;
					node.state = {
						"opened": true
					}
					i++;
					return true;
				}
			} else {
				if(node.text == path[i]) {
					found = true;
					node.state = {
						"selected": true
					}
					return true;
				};				
			}
		});		
		i2++;
	}

	return directory;
}



function Populate(directory) {

	$('#Navigation').jstree({
	    "types": {
	 		"folder" : {
	            "icon" : "jstree-folder"
	        },
	        "file" : {
	            "icon" : "jstree-file"
	        }
	    },
	    "plugins": ["types", "sort", "json_data", "state", ],
	    "sort" : function(a, b) {
	    				a1 = this.get_node(a);
	            b1 = this.get_node(b);
	            if (a1.icon == b1.icon){
	                return (a1.text.toLowerCase() > b1.text.toLowerCase()) ? 1 : -1;
	            } else {
	            	return (a1.icon < b1.icon) ? 1 : -1;
	            }
	    },
	    "core": {
    	    "check_callback": true,
        	'data': directory,
        	"themes": {
                "name": "default-dark",
                "dots": true,
                "icons": true
            },
    	},

    });
    $("#Navigation").on('changed.jstree', function (e, data) {
    	if(data.node == null) {
    		return
    	}

		var path = data.instance.get_path(data.node,'/');
		if (path.indexOf(".ebx") != -1) {
			window.location.hash = "#"+path.substring(7);
		}
		console.log('Selected: ' + path); 
	});

	$("#Navigation").on('loaded.jstree', function(e, data) {
		console.log("loaded");
		PostInit();
	})

}

function PostInit() {
	/*
	$( "#NavigationWrapper" ).resizable({
		handles: "e",
		containment: 'document',
	});
	*/
}