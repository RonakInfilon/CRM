import API from "../api";

export const updateProfile=async(profileData)=>{
  try{
    const token=localStorage.getItem('token');
    const response=await API.put(
      "/profile",
      profileData
    );
    return response.data;
  }
  catch(error){
    console.log(error);
  }
}