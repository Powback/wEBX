// Folder navigation, also does search
class EbxTree {
    constructor(container, state) {
        this._container = container;
        this._state = state;

        // The file and folder data to create the tree from
        this.m_Data = {
			"type": "folder",
			"text": "",
            "state": 
            {
				"opened": true,
				"selected": true,
			},
			"children": []
        };


        // DOM elements for search input and folder tree
        this.m_TreeDom = this.CreateTreeDom();
        this.m_SearchDom = this.CreateSearchDom();

        this._container.getElement().append(this.m_SearchDom);
        this._container.getElement().append(this.m_TreeDom);

        // Build folder hierarchy from the guidDictionary
        s_MessageSystem.RegisterEventHandler("OnGuidDictionaryLoaded", this.OnGuidDictionaryLoaded.bind(this));

        // Set root folder name
        s_MessageSystem.RegisterEventHandler("OnGameLoaded", this.OnGameLoaded.bind(this));
    }

    CreateTreeDom() {
        let scope = this;

        let dom = $(document.createElement("div"));


        dom.jstree({
            "types": {
                    "folder" : {
                    "icon" : "jstree-folder"
                },
                "file" : {
                    "icon" : "jstree-file"
                }
            },
            "plugins": ["types", "sort", "json_data", "state", "search", "wholerow", /*"contextmenu"*/ ],
            "search": 
            {
                "case_insensitive": true,
                "show_only_matches": true
            },
            "sort" : function(a, b) 
            {
                let a1 = this.get_node(a);
                let b1 = this.get_node(b);

                if (a1.icon == b1.icon)
                    return (a1.text.toLowerCase() > b1.text.toLowerCase()) ? 1 : -1;
                
                return (a1.icon < b1.icon) ? 1 : -1;
            },
            /*
            "contextmenu": {
                items: scope.ContextMenu.bind(scope)
            },
            */
            "core": {
                "check_callback": true,
                'data': this.m_Data,
                "themes": {
                    "name": "default-dark", // default-dark
                    "dots": true,
                    "icons": true
                },
            },
        });
    
        dom.on('changed.jstree', function(e, data) {
            if (data.node == null) {
                return;
            }
        
            // Load selected partition when a file is clicked
            if (data.node.type == "file") {
                var path = data.instance.get_path(data.node,'/').replace(s_SettingsManager.getGame() + "/", "");

                // Send partition path to be loaded
                s_MessageSystem.ExecuteEventSync("OnFileSelected", path);
            
            // Preload all partitions in a folder when the folder is clicked
            } else if (data.node.type == "folder") {
                let eventData = {
                    "name": data.node.text,
                    "children": []
                };
                
                // Traverse folder children
                $.each(data.node.children, function(index, childId) {
                    // Ingore folders
                    let childNode = scope.m_TreeDom.jstree(true).get_node(childId);
                    if(childNode.type != "file") {
                        return true;
                    }
                    
                    // Save partition path
                    var path = scope.m_TreeDom.jstree(true).get_path(childNode,'/').replace(s_SettingsManager.getGame() + "/", "") // TODO: Handle path in event callback
                    eventData["children"].push(path);
                });

                // Send partition paths to be preloaded
                s_MessageSystem.ExecuteEventSync("OnFolderSelected", eventData);
            }
        });

        return dom;
    }

    CreateSearchDom() {
        let scope = this;

		// Create container and input elements
        let dom = $(document.createElement("div"));
        dom.addClass("contentControls");
        
        let searchInput = $(document.createElement("input"));
        searchInput.addClass("search-input form-control");
		searchInput.attr("placeholder", "Search");
		dom.append(searchInput);

		// 
        var timeout = false;
        searchInput.keyup(function() {
            if (timeout) {
                clearTimeout(timeout); 
            }
                
            timeout = setTimeout(function() {
				var v = searchInput.val();
				scope.m_TreeDom.jstree(true).search(v);
			}, 250);
        });

        return dom;
    }

    // Update data
    UpdateTreeData() {
        this.m_TreeDom.jstree(true).settings.core.data = this.m_Data;
        this.m_TreeDom.jstree(true).refresh();
    }

    // Set root folder name 
    OnGameLoaded(data) {
        this.m_Data.text = data;
        this.UpdateTreeData();
    }

    // The guid dictionary has guid/path pairs for all partitions/files.
    // Build the folder structure from the paths.
    OnGuidDictionaryLoaded(dictionary) {
        // Iterate all partitions
        for (let [guid, path] of Object.entries(dictionary)) {
            let folderNames = getPaths(path);
            let fileName = getFilename(path);

            // Root folder for the jstree
            let parentFolder = this.m_Data;
            
            // Iterate folder names and create those that dont exist
            folderNames.forEach(function(folderName) {
                let nextFolder = parentFolder.children.find(x => x.text.toLowerCase() === folderName.toLowerCase());
                // Create folder if it doesnt exist
                if (nextFolder === undefined) {
                    nextFolder = {
                        "type": "folder",
                        "text": folderName,
                        "children": []
                    }

                    parentFolder.children.push(nextFolder)
                
                // Fix paths that have lowercase folder names which we dont want.
                // If the folder name has any uppercase letters, we can assume it's correct.
                } else if (hasUpperCase(folderName) && !hasUpperCase(nextFolder.text)) {
                    nextFolder.text = folderName;
                }

                parentFolder = nextFolder
            });

            // Add the partition file to the final folder
            parentFolder.children.push({
                "type": "file",
                "text": fileName + ".json",
                "id": guid 
            });
        }

        this.UpdateTreeData();
    }
}


//var s_EbxTree = new EbxTree();