
class ThreeView
{
    constructor(container, state)
    {
        this._container = container;
        this._state = state;


        this.m_ThreeContainer = $(document.createElement("div"));

        this.m_ThreeContainer.addClass("ThreeContainer");



        this._container.getElement().append(this.m_ThreeContainer);


        this.UpdateSize()
        this.CreateThree();

        this.m_ThreeContainer.append(this.m_Renderer.domElement);

        this._renderUpdate = this.RenderUpdate.bind(this);


        this.InitObjects();


        this.RenderUpdate();
    }

    UpdateSize()
    {
        let SizeData = 
        {
            "x": this.m_ThreeContainer.width(),
            "y": this.m_ThreeContainer.height() 
        };

        let Init = ( this.m_Size == null );

        if( Init ||
            
            this.m_Size.x != SizeData.x || 
            this.m_Size.y != SizeData.y)
        {
            console.log("Resize!");
            this.m_Size = SizeData;


            if( !Init )
                this.OnResize();
        }
    }


    OnResize()
    {
        this.m_Camera.aspect = this.m_Size.x / this.m_Size.y;

        this.m_Renderer.setSize(this.m_Size.x, this.m_Size.y);


        //this.m_FPSCamera.handleResize();
    }

    InitObjects()
    {
        var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
        var mat = new THREE.MeshBasicMaterial(
            { 
                color: 0x000000, 
                visible: true,
                wireframe: true
            });
        var plane = new THREE.Mesh(geo, mat);

        plane.rotateX( -Math.PI / 2);

        this.m_Scene.add(plane);
    }


    CreateThree()
    {
        this.m_Scene = new THREE.Scene();
        this.m_Scene.background = new THREE.Color( 0xbfd1e5 );


        this.m_Camera = new THREE.PerspectiveCamera(90, this.m_Size.x / this.m_Size.y, 1, 5000);

        this.m_Camera.position.set(30, 30, 30);
        this.m_Camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

        this.m_FPSCamera = new THREE.FlyControls(this.m_Camera, this.m_ThreeContainer);

        this.m_FPSCamera.rollSpeed = 1.2;
        this.m_FPSCamera.movementSpeed = 20;
        this.m_FPSCamera.noFly = false;
        this.m_FPSCamera.lookVertical = true;
        this.m_FPSCamera.constrainVertical = true;
        this.m_FPSCamera.verticalMin = 1.0;
        this.m_FPSCamera.verticalMax = 2.0;
        this.m_FPSCamera.lon = -150;
        this.m_FPSCamera.lat = 120;
        this.m_FPSCamera.dragToLook = true;

        this.m_Renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        });

        this.m_Renderer.setPixelRatio(window.devicePixelRatio);
        this.m_Renderer.setSize(this.m_Size.x, this.m_Size.y);
    }

    RenderUpdate()
    {
        this.UpdateSize();

        
        this.m_FPSCamera.update(0.04);
        this.m_Camera.updateProjectionMatrix();

        this.m_Renderer.render(this.m_Scene, this.m_Camera);
        window.requestAnimationFrame(this._renderUpdate);
    }
}