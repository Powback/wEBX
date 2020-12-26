
class GraphView
{
    constructor(container, state)
    {
        this._container = container;
        this._state = state;

		this.m_GraphCanvas = document.createElement("canvas");
		this.m_GraphCanvas.id = "eventGraph";

        this._container.getElement().append(this.m_GraphCanvas);


		this._container.on("resize",this.UpdateSize.bind(this));
    }

    UpdateSize()
    {
        canvas.resize(this._container.width, this._container.height);
    }
}