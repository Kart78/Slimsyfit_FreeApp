// Deploy only to the dedicated FreeApp Supabase project:
// supabase functions deploy delete-account --project-ref rvplxwcoqdlpfchbhlkp
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Comma-separated list; FREEAPP_ORIGIN overrides the default production origin.
const allowedOrigins = (Deno.env.get("FREEAPP_ORIGIN") || "https://healthyfy-eta.vercel.app")
  .split(",").map(s => s.trim()).filter(Boolean);
serve(async req => {
  const origin=req.headers.get("origin")||"";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : "";
  const cors={
    "Access-Control-Allow-Origin":allowedOrigin && origin===allowedOrigin ? origin : "null",
    "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Content-Type":"application/json",
    "Vary":"Origin",
  };
  const json=(status:number,body:object)=>new Response(JSON.stringify(body),{status,headers:cors});
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
  if(req.method!=="POST")return json(405,{error:"Method not allowed"});
  if(!allowedOrigin || origin!==allowedOrigin)return json(403,{error:"Origin not allowed"});
  const token=req.headers.get("Authorization")?.replace(/^Bearer\s+/i,"");
  if(!token)return json(401,{error:"Sign in required"});
  const url=Deno.env.get("SUPABASE_URL");
  const anonKey=Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!anonKey||!serviceKey)return json(503,{error:"Server is not configured"});
  try{
    const body=await req.json();
    if(body?.confirmation!=="DELETE")return json(400,{error:"Type DELETE to confirm"});
    const auth=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error:authError}=await auth.auth.getUser(token);
    if(authError||!data.user)return json(401,{error:"Invalid session"});
    const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
    // The FK ON DELETE CASCADE cleans up wellness_records.
    const {error}=await admin.auth.admin.deleteUser(data.user.id);
    if(error)throw error;
    return json(200,{deleted:true});
  }catch(error){
    console.error("delete-account error",error instanceof Error?error.message:"Unknown error");
    return json(500,{error:"Unable to delete account"});
  }
});