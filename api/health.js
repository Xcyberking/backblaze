import {admin,send,fail,method,client,ListBucketsCommand} from "./_lib/b2.js";
export default async function handler(req,res){try{method(req,["GET"]);admin(req);const s=client();const out=await s.send(new ListBucketsCommand({}));send(res,200,{ok:true,connected:true,buckets:out.Buckets?.length||0});}catch(e){fail(res,e);}}
