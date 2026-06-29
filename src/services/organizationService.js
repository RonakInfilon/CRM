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
  return API.get('/organization',{
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
  return API.post(`/organization`,data);
}


export const updateOrganization=(id,data)=>{
  return API.put(`/organization/${id}`,data);
}

export const deleteOrganization=(id)=>{
  return API.delete(`/organization/${id}`);
}