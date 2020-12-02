
const g_BasicTypeNames = [
	"String",
	"CString",
	"Enum",
	"FileRef",
	"Boolean",
	"Int8",
	"Uint8",
	"Int16",
	"Uint16",
	"Int32",
	"Uint32",
	"Int64",
	"Uint64",
	"Float32",
	"Float64",
	"Guid",
	"SHA1",
	"ResourceRef",
]


const g_TypeIds = {
    BasicType: 1,
    ValueType: 2,
	RefrenceType: 2,
    ArrayType: 3,
}

class EbxField
{
	constructor(p_Name, p_Data, p_ParentType = null)
	{
		this.m_Name = p_Name;
		this.m_Data = p_Data;
		this.m_Parent = p_ParentType;

		this.m_Edited = false;


		this.m_CachedHtml = null;
	}

	FindTypeId()
	{

	}

	IsArray()
	{
		return this.m_IsArray;
	}

	GetName()
	{
		return this.m_Name;
	}


	GetType()
	{
		return this.m_Data["$type"]
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
}