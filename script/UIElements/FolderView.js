// List with all instances in current partition. The list shows guid and type
// Why is it called FolderView?
class FolderView {
    constructor(container, state) {
        this._container = container;
        this._state = state;

        // div container
        this.m_Dom = $(document.createElement("div"));
        this.m_Dom.addClass("instanceTree");

        // The instance list is a table element
        this.m_Table = $(document.createElement("table"));
        this.m_Table.attr("width", "100%");

        this.m_Dom.append(this.m_Table);

        this.InitTable();

        //Register with goldenlayout
        this._container.getElement().append(this.m_Dom);

        //Register handler
        s_MessageSystem.registerEventHandler("OnFolderSelected", this.OnFolderSelected.bind(this));
        s_MessageSystem.registerEventHandler("OnPrimaryInstanceSelected", this.OnPrimaryInstanceSelected.bind(this));
    }

    InitTable() {
        this.m_Table.html("");

        // Table head
        this.m_Table.append(`
            <thead>
                <tr>
                    <th></th>
                    <th><b>Name</b></th>
                    <th><b>Type</b></th>
                </tr>
            </thead>
        `);
    }


    CreateTableEntry(tableData) {
        let entry = $(document.createElement("tr"));

        entry.addClass("instanceTreeElement");

        let icon = $(document.createElement("i"));
        let name = $(document.createElement("td"));
        let type = $(document.createElement("td"));

        entry.append(icon);
        entry.append(name);
        entry.append(type);

        icon.addClass("jstree-icon");
        icon.addClass(tableData["type"]);

        name.html(tableData["name"]);

        type.html(tableData["type"]);

        let Callback = function(e, data) {
            s_MessageSystem.executeEventSync("OnInstanceSelected", {
                "partitionGuid": tableData["partitionGuid"],
                "instanceGuid": tableData["instanceGuid"]
            });
        };

        entry.on('click', Callback);

        return [entry, icon, name, type];
    }

    OnPrimaryInstanceSelected(partitionGuid) {
        if (partitionGuid == null)
            return;

        this.InitTable();

        let Partition = s_EbxManager.findPartition(partitionGuid)
        
        if(Partition["$instances"] == null)
            return;

        for (let InstanceIndex in Partition["$instances"]) {
            let Instance = Partition["$instances"][InstanceIndex];

            let TypeName = ( Instance["$type"] != null ? Instance["$type"] : "<unknown type>");


            let [EntryElement, IconElement, NameElement, TypeElement] = this.CreateTableEntry(
            {
                "name": Instance["$guid"],
                "type": TypeName,
                "partitionGuid": Partition["$guid"],
                "instanceGuid": Instance["$guid"]
            });


            this.m_Table.append(EntryElement);
        }
    }

    OnFolderSelected(data) {
        this.InitTable();

        if( data["children"] == null )
            return;

        for(let Key in data["children"]) {
            let Path = data["children"][Key];

            s_EbxManager.LoadEbxFromPath(Path, function(result, instanceGuid) {
                let Instance = s_EbxManager.findInstance(result["$guid"], result["$primaryInstance"] );

                let TypeName = ( Instance["$type"] != null ? Instance["$type"] : "<unknown>");

                let [EntryElement, IconElement, NameElement, TypeElement] = this.CreateTableEntry(
                {
                    "name": result["$name"],
                    "type": TypeName,
                    "partitionGuid":result["$guid"],
                    "instanceGuid": result["$primaryInstance"]
                });
    
                this.m_Table.append(EntryElement);
            }.bind(this));
        }
    }
};