class EbxTree
{
    constructor()
    {
        this.m_Data = null;
        this.m_Tree = null;

        this.m_TreeElementName = '#Navigation';

        this.m_SearchInputName = '#search-input';
    }

    GenerateData( game, dictionary )
    {
        let scope = this;
        console.log("Start!");

        let data = 
        {
			"type": "folder",
			"text": game,
            "state": 
            {
				"opened": true,
				"selected": true,
			},
			"children": []
        };

        for (let [key, path] of Object.entries(dictionary))
        {
            let splitPath = getPaths(path);
            let parentPath = data;
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

        scope.m_Data = data;

        console.log(scope.m_Data);

        scope.InitializeTree();
        scope.RegisterEvents();
    }

    InitializeTree()
    {
        let scope = this;


        scope.m_Tree = $(scope.m_TreeElementName).jstree(
        {
            "types": {
                 "folder" : {
                    "icon" : "jstree-folder"
                },
                "file" : {
                    "icon" : "jstree-file"
                }
            },
            "plugins": ["types", "sort", "json_data", "state", "search" ],
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
            "core": {
                "check_callback": true,
                'data': scope.m_Data,
                "themes": {
                    "name": "default-dark",
                    "dots": true,
                    "icons": true
                },
            },
    
        });
    };

    RegisterEvents()
    {
        let scope = this;

        $(this.m_SearchInputName).keyup(function() 
        {
            console.log("update serach!");
			
            delay(function() 
            {
                console.log("Delayed update serach!");

                let searchString = $(this).val();


				console.log(searchString);
				$(scope.m_TreeElementName).jstree('search', searchString);
            }.bind(this), 500);
        });

        $(this.m_TreeElementName).on('changed.jstree', function(e, data) 
        {
            if (data.node == null) 
                return;

            var path = data.instance.get_path(data.node,'/').replace(s_EbxManager.m_Game + "/", "");

            window.location.hash = "#"+path;

		    console.log('Selected: ' + path); 
                
        });
    }
}

var s_EbxTree = new EbxTree();