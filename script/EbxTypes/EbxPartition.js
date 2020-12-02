
class EbxPartition
{
	constructor(p_Data)
	{
		this.m_Data = p_Data;

		this.m_Edited = false;
	}

	OnChange()
	{
		this.m_Edited = true;
	}

	GetName()
	{
		return this.m_Data["$name"];
	}

	GetGuid()
	{
		return this.m_Data["$guid"];
	}

	GetPrimaryInstanceGuid()
	{
		return this.m_Data["$primaryInstance"];
	}

	GetPrimaryInstance()
	{
		var s_Data = s_EbxManager.FindInstance(this.GetGuid(), this.GetPrimaryInstanceGuid());

		if( s_Data == null )
			return null;

		return new EbxType(s_Data, this);
	}
}