
function LinearTransformToThree(transformObj)
{
	if (transformObj == null)
		return null;


	let m = new THREE.Matrix4();
	
	let s_Transform = [];

	function BuildTransformElement(obj, name, w_val=0.0) {
		const dir = obj?.$value?.[name] ?? obj?.$value?.[name.toLowerCase()];
		if (dir?.$value) {
			const v = dir.$value;
			s_Transform.push(
				v.x?.$value ?? v.X?.$value,
				v.y?.$value ?? v.Y?.$value,
				v.z?.$value ?? v.Z?.$value,
				w_val
			);
		}
	}
	BuildTransformElement(transformObj, "Right");
	BuildTransformElement(transformObj, "Up");
	BuildTransformElement(transformObj, "Forward");
	BuildTransformElement(transformObj, "Trans", 1.0);
	

	m.elements = s_Transform;
	
	// if (transformObj["$value"]["Right"] != null)
	// {
	// 	m.elements = [
	// 		transformObj["$value"]["Right"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["Right"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["Right"]["$value"]["z"]["$value"], 
	// 		0.0,

	// 		transformObj["$value"]["Up"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["Up"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["Up"]["$value"]["z"]["$value"], 
	// 		0.0,

	// 		transformObj["$value"]["Forward"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["Forward"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["Forward"]["$value"]["z"]["$value"], 
	// 		0.0,

	// 		transformObj["$value"]["Trans"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["Trans"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["Trans"]["$value"]["z"]["$value"], 
	// 		1.0
	// 	]
	// }
	// else
	// {
	// 	m.elements = [
	// 		transformObj["$value"]["right"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["right"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["right"]["$value"]["z"]["$value"], 
	// 		0.0,

	// 		transformObj["$value"]["up"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["up"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["up"]["$value"]["z"]["$value"], 
	// 		0.0,

	// 		transformObj["$value"]["forward"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["forward"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["forward"]["$value"]["z"]["$value"], 
	// 		0.0,

	// 		transformObj["$value"]["trans"]["$value"]["x"]["$value"], 
	// 		transformObj["$value"]["trans"]["$value"]["y"]["$value"], 
	// 		transformObj["$value"]["trans"]["$value"]["z"]["$value"], 
	// 		1.0
	// 	];
	// }
	


	return m;
}


function LinearTransformToThreePos(transformObj)
{

	var s_Vec = transformObj?.$value?.Trans?.$value ?? transformObj?.$value?.trans?.$value;

	return new THREE.Vector3(

		s_Vec.x?.$value ?? s_Vec.X?.$value,
		s_Vec.y?.$value ?? s_Vec.Y?.$value,
		s_Vec.z?.$value ?? s_Vec.Z?.$value,
	);
}


class ComponentView {
    constructor(container, state) {
        this._container = container;
        this._state = state;


		this.m_ThreeContainer = $(document.createElement("div"));
        this.m_ThreeContainer.addClass("ThreeContainer");

        this._container.getElement().append(this.m_ThreeContainer);


        this.UpdateSize()
        this.CreateThree();


        this.m_ThreeContainer.append(this.m_Renderer.domElement);
        this._renderUpdate = this.RenderUpdate.bind(this);


		this._container.on("resize", this.UpdateSize.bind(this));
		this.m_Renderer.domElement.addEventListener("click", this.OnClick.bind(this), false);

		s_MessageSystem.registerEventHandler("OnPrimaryInstanceSelected", this.OnPrimaryInstanceSelected.bind(this));
		
		s_MessageSystem.registerEventHandler("OnObjectsSelected", this.OnObjectsSelected.bind(this));

		this.InitPlane();
        this.RenderUpdate();



		this.m_Selected = [];
		this.m_CurrentPartition = null;


		this.m_GuidObjectMap = {};

   }

	CreateThree()
    {
        this.m_Scene = new THREE.Scene();
        //this.m_Scene.background = new THREE.Color( 0x6495ed );
        //this.m_Scene.background = new THREE.Color( 0x4a6dab ); 
        this.m_Scene.background = new THREE.Color( 0x2549d9 ); 


        this.m_Camera = new THREE.PerspectiveCamera(70, this.m_Size.x / this.m_Size.y, 0.1, 1000);

        this.m_Renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        });

        this.m_Renderer.setPixelRatio(window.devicePixelRatio);
        this.m_Renderer.setSize(this.m_Size.x, this.m_Size.y);


		this.m_OrbitControls = new OrbitControls( this.m_Camera, this.m_Renderer.domElement );

        this.m_Camera.position.set(10, 10, 10);
        this.m_Camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
		this.m_OrbitControls.update();


		this.m_Caster = new THREE.Raycaster();
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

	RenderUpdate()
    {
        this.UpdateSize();
		this.m_OrbitControls.update();

        this.m_Camera.updateProjectionMatrix();

        this.m_Renderer.render(this.m_Scene, this.m_Camera);
        window.requestAnimationFrame(this._renderUpdate);
    }

	InitPlane()
    {
        //var geo = new THREE.PlaneGeometry(2000, 2000);
        //var mat = new THREE.MeshBasicMaterial({ 
		//	color: 0x101010,
		//	transparent: true,
		//	opacity: 0.5,
		//	side: THREE.DoubleSide 
		//});
        //this.m_Plane = new THREE.Mesh(geo, mat);
        //this.m_Plane.rotateX( -Math.PI / 2);

        //this.m_Scene.add(this.m_Plane);

		this.m_Grid = new THREE.GridHelper( 30, 30 );

		this.m_Scene.add(this.m_Grid);
    }



	OnClick(e)
	{
		if (e.detail != 2)
			return;

		this.Unselect();

		console.log(e);


		let s_Source = new THREE.Vector2();
		s_Source.x = ( e.layerX / this.m_Size.x ) * 2 - 1;
		s_Source.y = - ( e.layerY / this.m_Size.y ) * 2 + 1;



		this.m_Caster.setFromCamera( s_Source, this.m_Camera );


		if (false)
		{

			let s_Points = [
				this.m_Caster.ray.origin,
				this.m_Caster.ray.origin.clone().add(this.m_Caster.ray.direction.clone().multiplyScalar(100))
			];


			let s_Geom = new THREE.BufferGeometry().setFromPoints( s_Points );

			this.m_Scene.add(new THREE.Line( s_Geom, new THREE.LineBasicMaterial( { color: 0x0000ff } ) ))
		}

		let s_Intersections = this.m_Caster.intersectObjects( this.m_Scene.children, true);


		let s_SelectedGuids = [];

		for( let s_IntersectIndex in s_Intersections)
		{
			let s_IntersectObj = s_Intersections[s_IntersectIndex];

			if (s_IntersectObj.object == this.m_Grid)
				continue;

				
			//console.log(s_IntersectObj.object);
			//console.log(s_IntersectObj.object instanceof THREE.Mesh);

			if (!(s_IntersectObj.object instanceof THREE.Mesh))
				continue;
			

			s_SelectedGuids.push(s_IntersectObj.object.userData["$instanceGuid"]);
			//this.SelectObject(s_IntersectObj.object);

			//this.m_Selected.push(s_IntersectObj.object);
		}



		s_MessageSystem.executeEventSync("OnObjectsSelected", {
			"$partitionGuid": this.m_CurrentPartition,
			"$instanceGuids": s_SelectedGuids
		});
	}


	OnObjectsSelected(data)
	{
		if (this.m_CurrentPartition != data["$partitionGuid"])
		{
			console.log("BIG ERROR! partition mismatch! tf have you done?");
			return;
		}

		this.Unselect();


		for (let s_GuidIndex in data["$instanceGuids"])
		{
			let s_Guid = data["$instanceGuids"][s_GuidIndex];

			let s_Object = this.m_GuidObjectMap[s_Guid.toLowerCase()];

			if (s_Object == null)
				continue;

			this.SelectObject(s_Object);
			this.m_Selected.push(s_Object);
		}
	}

	SelectObject(threeObject)
	{


		threeObject.material = new THREE.MeshBasicMaterial({ 
			color: 0xFFFFFF,	//StringToColor(ebxInstance["$type"]), 
			wireframe: true,
			visible: true,
			//depthTest: false,
			//depthWrite: false,
		});



		let s_LastParent = threeObject;
		let s_Parent = s_LastParent.parent;
		while (s_Parent != null && s_Parent != this.m_Scene)
		{

			for (let s_ChildIdx in s_Parent.children)
			{
				let s_ChildObj = s_Parent.children[s_ChildIdx];

				if (s_ChildObj.userData.uuid != s_LastParent.uuid)
					continue;

				s_ChildObj.material = new THREE.LineBasicMaterial( { 
					color: 0x00FF00,
					//depthTest: false,
					//depthWrite: false,
					opacity: 1.0,
					transparent: true,
				} );
			}


			s_LastParent = s_Parent;
			s_Parent = s_Parent.parent;
		}



		let s_CurChildArr = [];
		s_CurChildArr.push(threeObject);
		while (s_CurChildArr.length)
		{
			let s_Child = s_CurChildArr.pop();

			for (let s_ChildIdx in s_Child.children)
			{
				let s_ChildObj = s_Child.children[s_ChildIdx];


				if (s_ChildObj instanceof THREE.Mesh)
				{
					s_CurChildArr.push(s_ChildObj);
					continue;	
				}

				if (s_ChildObj instanceof THREE.Line)
				{
					s_ChildObj.material = new THREE.LineBasicMaterial( { 
						color: 0x0000FF,
						//depthTest: false,
						//depthWrite: false,
						opacity: 1.0,
						transparent: true,
					} );
				}
			}
		}

	}


	Unselect()
	{

		for (let s_SelectedIdx in this.m_Selected)
		{

			let s_Selected = this.m_Selected[s_SelectedIdx];

			s_Selected.material = new THREE.MeshBasicMaterial({ 
				color: s_Selected.userData["color"], 
				wireframe: true,
				visible: true,
				//depthTest: false,
				//depthWrite: false,
			});
	
	
	
			let s_LastParent = s_Selected;
			let s_Parent = s_LastParent.parent;
			while (s_Parent != null && s_Parent != this.m_Scene)
			{
	
				for (let s_ChildIdx in s_Parent.children)
				{
					let s_ChildObj = s_Parent.children[s_ChildIdx];
	
					if (s_ChildObj.userData.uuid != s_LastParent.uuid)
						continue;
	
					s_ChildObj.material = new THREE.LineBasicMaterial( { 
						color: 0xFF0000,
						//depthTest: false,
						//depthWrite: false,
						opacity: 0.2,
						transparent: true,
					} );
				}
	
	
				s_LastParent = s_Parent;
				s_Parent = s_Parent.parent;
			}


			let s_CurChildArr = [];
			s_CurChildArr.push(s_Selected);
			while (s_CurChildArr.length)
			{
				let s_Child = s_CurChildArr.pop();

				for (let s_ChildIdx in s_Child.children)
				{
					let s_ChildObj = s_Child.children[s_ChildIdx];


					if (s_ChildObj instanceof THREE.Mesh)
					{
						s_CurChildArr.push(s_ChildObj);
						continue;	
					}

					if (s_ChildObj instanceof THREE.Line)
					{
						s_ChildObj.material = new THREE.LineBasicMaterial( { 
							color: 0xFF0000,
							//depthTest: false,
							//depthWrite: false,
							opacity: 0.2,
							transparent: true,
						} );
					}
				}
			}
		}

		// clear
		this.m_Selected = [];

	}

	OnPrimaryInstanceSelected(partitionGuid) 
	{
		this.m_GuidObjectMap = {};
		// remove all
		while(this.m_Scene.children.length > 0) 
			this.m_Scene.remove(this.m_Scene.children[0]); 
		
		
		this.InitPlane();

        if (partitionGuid == null)
            return;


        let s_Partition = s_EbxManager.findPartition(partitionGuid)
        
        if (s_Partition == null)
            return;


		let s_PrimaryInstance = s_EbxManager.findInstance(partitionGuid, s_Partition["$primaryInstance"]);

		if (s_PrimaryInstance == null)
			return;

		var s_ObjectField = s_PrimaryInstance["$fields"]["Object"];

		if (s_ObjectField == null)
			return;

		let s_EntityPartitionGuid = s_ObjectField["$value"]["$partitionGuid"];
		let s_EntityInstanceGuid = s_ObjectField["$value"]["$instanceGuid"];


		let s_EntityInstance = s_EbxManager.findInstance(s_EntityPartitionGuid, s_EntityInstanceGuid);

		if (s_EntityInstance == null)
			return;
	

		this.m_CurrentPartition = s_EntityPartitionGuid;

		console.log(s_EntityInstance["$fields"]["Components"]);
		console.log(s_EntityInstance["$fields"]["Transform"]);

		this.AddComponents(s_EntityInstance, this.m_Scene);
	}




	AddComponents(ebxInstance, threeObject)
	{

		//console.log(ebxInstance);

		let s_ThreeTransform = LinearTransformToThree(ebxInstance["$fields"]["Transform"]);
		//console.log(s_ThreeTransform);

		if (s_ThreeTransform == null)
		{
			//console.log("\t skipping");
			return;	
		}


		let s_Geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );

		var s_Mat = new THREE.MeshBasicMaterial({ 
			color: StringToColor(ebxInstance["$type"]), 
			wireframe: true,
			visible: true,
			//depthTest: false,
			//depthWrite: false,
		});
        var s_Mesh = new THREE.Mesh(s_Geometry, s_Mat);

		s_Mesh.matrix = s_ThreeTransform;
		s_Mesh.matrixAutoUpdate = false;

		s_Mesh.userData = {
			"$instanceGuid": ebxInstance["$guid"],
			"color": StringToColor(ebxInstance["$type"])
		}


		this.m_GuidObjectMap[ebxInstance["$guid"].toLowerCase()] = s_Mesh


		if (true)
		{
			let s_Points = [
				new THREE.Vector3(0,0,0),
				LinearTransformToThreePos(ebxInstance["$fields"]["Transform"])
			];


			let s_Geom = new THREE.BufferGeometry().setFromPoints( s_Points );

			let s_Line = new THREE.Line( s_Geom, new THREE.LineBasicMaterial( { 
				color: 0xff0000,
				//depthTest: false,
				//depthWrite: false,
				opacity: 0.2,
				transparent: true,
			} ) );

			s_Line.userData = s_Mesh;

			threeObject.add(s_Line);
		
		}


		threeObject.add(s_Mesh);

		var s_Components = ebxInstance["$fields"]["Components"];

		if (s_Components == null)
			return;

		for (let s_ComponentId in s_Components["$value"])
		{
			let s_ComponentRef = s_Components["$value"][s_ComponentId];


			let s_ComponentInstance = s_EbxManager.findInstance(s_ComponentRef["$partitionGuid"], s_ComponentRef["$instanceGuid"]);

			if (s_ComponentInstance == null)
				return;

			this.AddComponents(s_ComponentInstance, s_Mesh)
		}
	}
}