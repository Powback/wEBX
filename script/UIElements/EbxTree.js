class EbxTree
{
    constructor(container, state)
    {
        this._container = container;
        this._state = state;

        this.m_Data = 
        {
			"type": "folder",
			"text": "",
            "state": 
            {
				"opened": true,
				"selected": true,
			},
			"children": []
        };


        this.m_TreeDom = this.CreateTreeDom();
        this.m_SearchDom = this.CreateSearchDom();

        //this.m_TreeElementName = '#Navigation';

        //this.m_SearchInputName = '#search-input';

        s_MessageSystem.RegisterEventHandler("OnGuidDictionaryLoaded", this.OnGuidDictionaryLoaded.bind(this));
        s_MessageSystem.RegisterEventHandler("OnGameLoaded", this.OnGameLoaded.bind(this));


        this._container.getElement().append(this.m_SearchDom);
        this._container.getElement().append(this.m_TreeDom);
    }

    CreateTreeDom()
    {
        let scope = this;

        let Dom = $(document.createElement("div"));


        Dom.jstree(
        {
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
    
        Dom.on('changed.jstree', function(e, data) 
        {
            if (data.node == null) 
                return;

            console.log(data.node);

            if( data.node.type == "folder")
            {
                let Content = 
                {
                    "name": data.node.text,
                    "children": []
                };
                
                // Get the actual node

                // Attempt to traverse if the node has children
                $.each(data.node.children, function(index, child) 
                {
                    let ChildNode = scope.m_TreeDom.jstree(true).get_node(child);

                    if(ChildNode.type != "file")
                        return true;

                    var FullPath = scope.m_TreeDom.jstree(true).get_path(ChildNode,'/').replace(s_SettingsManager.m_Game + "/", "")

                    Content["children"].push(FullPath);
                });

                console.log(Content);

                s_MessageSystem.ExecuteEventSync("OnFolderSelected", Content);
            }

            if (data.node.type != "file")
                return;


            var path = data.instance.get_path(data.node,'/').replace(s_SettingsManager.m_Game + "/", "");


            s_MessageSystem.ExecuteEventSync("OnFileSelected", path);
        });

        return Dom;
    }

    CreateSearchDom()
    {
        let Scope = this;

		let Dom = $(document.createElement("div"));
        Dom.addClass("contentControls");
        
        let SearchInput = $(document.createElement("input"));
        SearchInput.addClass("search-input form-control");
		SearchInput.attr("placeholder", "Search");
		Dom.append(SearchInput);

		var to = false;
        SearchInput.keyup(function () 
        {
            if(to) 
                clearTimeout(to); 

            to = setTimeout(function () 
            {
				var v = SearchInput.val();
				Scope.m_TreeDom.jstree(true).search(v);
			}, 250);
        });

        return Dom;
    }



    UpdateTreeData()
    {
        this.m_TreeDom.jstree(true).settings.core.data = this.m_Data;

        this.m_TreeDom.jstree(true).refresh();
    }

    OnGameLoaded( data )
    {
        console.log("ongameloaded");
        this.m_Data.text = data;

        this.UpdateTreeData();
    }

    OnGuidDictionaryLoaded( dictionary )
    {
        console.log("Start!");

        for (let [key, path] of Object.entries(dictionary))
        {
            let splitPath = getPaths(path);
            let parentPath = this.m_Data;
            let fileName = getFilename(path);

            splitPath.forEach(function(subPath) 
            {
                let parentIndex = parentPath.children.find(x => x.text.toLowerCase() === subPath.toLowerCase());
                if (parentIndex === undefined) 
                {
                    let a = parentPath.children.push(
                    {
                        "type": "folder",
                        "text": subPath,
                        "children": []
                    });
                    parentPath = parentPath.children[a - 1];
                } 
                else 
                {
                    parentPath = parentIndex;
                    // Sometimes the object is referenced lowercase. If we have a string that has uppercase letters, we can assume it's correct.
                    // Replace lowercase paths with the actual case.
                    if (hasUpperCase(subPath) && hasLowerCase(parentPath.text)) {
                        parentPath.text = subPath;
                    }
                }
            });

            parentPath.children.push(
            {
                "type": "file",
                "text": fileName + ".json",
                "id": key 
            });
        }


        console.log(this.m_Data);

        
        this.UpdateTreeData();
    }

  

    /*
    ContextMenu( node )
    {
        let items =
        {
            EbxViewer: 
            { // The "rename" menu item
                label: "Ebx Viewer",
                action: function () {}
            },
            NodeViewer: 
            { // The "delete" menu item
                label: "NodeGraph Viewer",
                action: function () {}
            },
            CurveViewer: 
            { // The "delete" menu item
                label: "Curve Viewer",
                action: function () {}
            },
            TimelineViewer: 
            { // The "delete" menu item
                label: "Timeline Viewer",
                action: function () {}
            }
        };

        return items;
    }
    */
}

//var s_EbxTree = new EbxTree();