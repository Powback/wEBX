class MessageSystem
{
    constructor() {
        this.m_Handlers = {};
    }

    // Register event handlers
    RegisterEventHandler(id, handler) {
        if (this.m_Handlers[id] == null) {
            this.m_Handlers[id] = [];
        }
            
        this.m_Handlers[id].push(handler);
    }

    // Dispatch events
    ExecuteEventSync(id, data, resultArray = null) {
        if (this.m_Handlers[id] == null) {
            return false;
        }
            
        for (let l_Key in this.m_Handlers[id]) {
            let HandlerFunc = this.m_Handlers[id][l_Key];

            if(HandlerFunc == null) {
                continue;
            }
                
            let s_RetVal = HandlerFunc(data);

            if (resultArray != null && (s_RetVal != undefined && s_RetVal != null)) {
                resultArray.push(s_RetVal);
            }
        }

        return this.m_Handlers[id].length > 0;
    }
}

var s_MessageSystem = new MessageSystem();