class FolderView
{
    constructor(container, state)
    {
        this._container = container;
        this._state = state;

        this.m_Dom = $(document.createElement("div"));
        this.m_Table = $(document.createElement("table"));

        this.m_Dom.append(this.m_Table);


        //Register with goldenlayout
        this._container.getElement().append(this.m_Dom);

        //Register handler
        s_MessageSystem.RegisterEventHandler("OnFolderSelected", this.OnFolderSelected.bind(this));
    }

    OnFolderSelected( data )
    {
        this.m_Table.html("");

        this.m_Table.append(`
			<tr>
				<th></th>
				<th><b>Name</b></th>
				<th><b>Type</b></th>
			</tr>
        `);
        
        if( data["children"] == null )
            return;

        for(let Key in data["children"] )
        {
            let Path = data["children"][Key];

            s_EbxManager.LoadEbxFromPath(Path, function(result, instanceGuid)
            {
                let Instance = s_EbxManager.FindInstance(result["$guid"], result["$primaryInstance"] );

                let TypeName = ( Instance["$type"] != null ? Instance["$type"] : "<unknown>");


                let entry = $(document.createElement("tr"));
                let icon = $(document.createElement("i"));
                let name = $(document.createElement("td"));
                let type = $(document.createElement("td"));
                entry.append(icon);
                entry.append(name);
                entry.append(type);


                icon.addClass("jstree-icon");
                icon.addClass(TypeName);

                name.html(result["$name"]);

                type.html(TypeName);


                name.on('click', function(e, data) 
                {
                    s_MessageSystem.ExecuteEventSync("OnInstanceSelected", {
                        "partitionGuid": result["$guid"],
                        "instanceGuid": result["$primaryInstance"]
                    } );
                });

                this.m_Table.append(entry);
            }.bind(this));
        }
    }
};