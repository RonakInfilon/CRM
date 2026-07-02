import API from "../api";

export const getOrganization=(page,limit,status,search,sort)=>{
  let sortField="CreatedAt";
  let sortOrder="DESC";

  if(sort && typeof sort=='string'){
    if(sort.includes(':')){
      const parts=sort.split(':');
      sortField=parts[0];
      sortOrder=parts[1];
    }else{
      sortField=sort;
    }
  }
  return API.get('/accounts',{
    params:{
      page,
      limit,
      status:status || undefined,
      name:search||undefined,
      sort:sortField,
      order:sortOrder
    }
  });
};

export const createOrganization=(data)=>{
  return API.post(`/accounts`,data);
}


export const updateOrganization=(id,data)=>{
  return API.put(`/accounts/${id}`,data);
}

export const deleteOrganization=(id)=>{
  return API.delete(`/accounts/${id}`);
}