

class MessageSystem
{
    constructor()
    {
        this.m_Handlers = {};
    }

    RegisterEventHandler(id, handler)
    {
        if (this.m_Handlers[id] == null)
            this.m_Handlers[id] = [];

        this.m_Handlers[id].push(handler);
    }

    ExecuteEventSync(id, data, resultArray = null)
    {
        if (this.m_Handlers[id] == null)
            return false;


        for (let Key in this.m_Handlers[id])
        {
            let HandlerFunc = this.m_Handlers[Key];

            if (HandlerFunc == null)
                continue;

            let RetVal = HandlerFunc(data);

            if (resultArray != null &&
                (RetVal != undefined && RetVal != null))
                resultArray.push(RetVal);


        }

        return this.m_Handlers[id].length > 0;
    }
}

var s_MessageSystem = new MessageSystem();