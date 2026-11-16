import { S3Client, HeadBucketCommand, ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, GetObjectCommand, ListObjectVersionsCommand, PutBucketCorsCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, GetBucketLifecycleConfigurationCommand, PutBucketLifecycleConfigurationCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function client() {
  const { B2_KEY_ID, B2_APPLICATION_KEY, B2_ENDPOINT, B2_REGION } = process.env;
  if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_ENDPOINT) {
    const e = new Error("Missing B2_KEY_ID, B2_APPLICATION_KEY or B2_ENDPOINT environment variables."); e.status=503; throw e;
  }
  return new S3Client({region:B2_REGION || "us-east-005",endpoint:B2_ENDPOINT,credentials:{accessKeyId:B2_KEY_ID,secretAccessKey:B2_APPLICATION_KEY},forcePathStyle:true});
}
export function admin(req) {
  const expected=process.env.ADMIN_PASSWORD;
  const supplied=(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
  if (!expected) { const e=new Error("Set ADMIN_PASSWORD in environment variables."); e.status=503; throw e; }
  if (!supplied || supplied!==expected) { const e=new Error("Unauthorized"); e.status=401; throw e; }
}
export function send(res,status,data){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(data));}
export function fail(res,e){send(res,e.status||500,{ok:false,error:e.message||"Server error"});}
export function method(req,allowed){if(!allowed.includes(req.method)){const e=new Error("Method not allowed");e.status=405;throw e;}}
export function body(req){return new Promise((resolve,reject)=>{let s="";req.on("data",c=>{s+=c;if(s.length>1e6)reject(new Error("Request too large"));});req.on("end",()=>{try{resolve(s?JSON.parse(s):{});}catch{reject(new Error("Invalid JSON body"));}});});}
export async function signUpload(bucket,key,type,size){const s=client();const cmd=new PutObjectCommand({Bucket:bucket,Key:key,ContentType:type||"application/octet-stream", ...(size?{"ContentLength":Number(size)}:{})});return getSignedUrl(s,cmd,{expiresIn:900});}
export {HeadBucketCommand,ListBucketsCommand,CreateBucketCommand,DeleteBucketCommand,ListObjectsV2Command,PutObjectCommand,DeleteObjectCommand,CopyObjectCommand,GetObjectCommand,ListObjectVersionsCommand,PutBucketCorsCommand,CreateMultipartUploadCommand,UploadPartCommand,CompleteMultipartUploadCommand,AbortMultipartUploadCommand,GetBucketLifecycleConfigurationCommand,PutBucketLifecycleConfigurationCommand,getSignedUrl};
