
class EbxType
{
	constructor(p_Data, p_ParentPartition = null)
	{
		this.m_Data = p_Data;
		this.m_Parent = p_ParentPartition;

		this.m_Edited = false;


		this.m_Fields = [];


		this.m_CachedHtml = null;
	}

	GetGuid()
	{
		return this.m_Data["$guid"];
	}

	GetBaseTypeName()
	{
		return this.m_Data["$baseClass"];
	}

	GetTypeName()
	{
		return this.m_Data["$type"];
	}

	OnChange()
	{
		this.m_Edited = true;

		if( this.m_Parent )
			this.m_Parent.OnChange();
	}

	GetFields()
	{
		if( this.m_Fields.length == 0)
		{
			for(var s_FieldKey in this.m_Data["$fields"])
			{
				this.m_Fields.push(new EbxField(s_FieldKey, this.m_Data["$fields"][s_FieldKey]));
			}
		}


		return this.m_Fields;
	}


	BuildHtml(p_ParentPartiton = null)
	{
		if( this.m_CachedHtml.length )
			return this.m_CachedHtml;

		var s_RefrenceType = document.createElement("h1");

		var s_IsSamePartition = this.m_Parent.GetGuid() == p_ParentPartiton;

		if( s_IsSamePartition )
			s_RefrenceType.classList.add("localRef");
		else
			s_RefrenceType.classList.add("remoteRef");

		s_RefrenceType.innerHTML += ""

		
		var s_FieldType = document.createElement("ul");
		s_FieldType.type = "first";

		for(var s_Field in this.GetFields())
		{
			s_FieldType.appendChild( s_Field.BuildHtml(this) );

		}
		

	}
}