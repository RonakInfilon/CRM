const express=require('express')
const router=express.Router();


const {createContact,updateContact,getAllContacts,deleteContact}=require("../controllers/contact.controller.js")

router.get("/",getAllContacts);
router.post("/",createContact);
router.put("/:id",updateContact);
router.delete("/:id",deleteContact);

module.exports=router;