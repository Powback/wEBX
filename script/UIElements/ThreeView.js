
class ThreeView
{
    constructor(container, state)
    {
        this._container = container;
        this._state = state;


        this.m_ThreeContainer = $(document.createElement("div"));

        this.m_ThreeContainer.addClass("ThreeContainer");



        this._container.getElement().append(this.m_ThreeContainer);


        this.m_ThreeContainer.append(this.CreateThree(this.m_ThreeContainer.width(), this.m_ThreeContainer.height()));



        this._renderUpdate = this.RenderUpdate.bind(this);


        this.InitObjects();
        this.RenderUpdate();
    }

    InitObjects()
    {
        var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
        var mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        var plane = new THREE.Mesh(geo, mat);

        this.m_Scene.add(plane);
    }


    CreateThree(width, height)
    {
        this.m_Scene = new THREE.Scene();


        this.m_Camera = new THREE.PerspectiveCamera(90, width / height, 1, 5000);

        this.m_FPSCamera = new THREE.FirstPersonControls(this.m_Camera);

        this.m_FPSCamera.lookSpeed = 0.7;
        this.m_FPSCamera.movementSpeed = 20;
        this.m_FPSCamera.noFly = false;
        this.m_FPSCamera.lookVertical = true;
        this.m_FPSCamera.constrainVertical = true;
        this.m_FPSCamera.verticalMin = 1.0;
        this.m_FPSCamera.verticalMax = 2.0;
        this.m_FPSCamera.lon = -150;
        this.m_FPSCamera.lat = 120;

        this.m_Renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        });

        this.m_Renderer.setPixelRatio(window.devicePixelRatio);
        this.m_Renderer.setSize(width, height);


        return this.m_Renderer.domElement;
    }

    RenderUpdate()
    {
        this.m_FPSCamera.update(1 / 30);

        let Width = this.m_ThreeContainer.width();
        let Height = this.m_ThreeContainer.height();

        this.m_Camera.aspect = Width / Height;

        this.m_Renderer.setSize(Width, Height);

        this.m_Renderer.render(this.m_Scene, this.m_Camera);
        window.requestAnimationFrame(this._renderUpdate);
    }
}