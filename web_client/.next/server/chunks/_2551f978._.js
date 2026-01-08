module.exports=[11227,e=>{"use strict";var t=e.i(62789),o=e.i(75789);e.i(74444);var i=e.i(10584),a=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({error:i.z.object({code:i.z.number().nullable(),message:i.z.string(),status:i.z.string()})}))),n=(0,t.createJsonErrorResponseHandler)({errorSchema:a,errorToMessage:e=>e.error.message}),r=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({outputDimensionality:i.z.number().optional(),taskType:i.z.enum(["SEMANTIC_SIMILARITY","CLASSIFICATION","CLUSTERING","RETRIEVAL_DOCUMENT","RETRIEVAL_QUERY","QUESTION_ANSWERING","FACT_VERIFICATION","CODE_RETRIEVAL_QUERY"]).optional()}))),s=class{constructor(e,t){this.specificationVersion="v3",this.maxEmbeddingsPerCall=2048,this.supportsParallelCalls=!0,this.modelId=e,this.config=t}get provider(){return this.config.provider}async doEmbed({values:e,headers:i,abortSignal:a,providerOptions:s}){let d=await (0,t.parseProviderOptions)({provider:"google",providerOptions:s,schema:r});if(e.length>this.maxEmbeddingsPerCall)throw new o.TooManyEmbeddingValuesForCallError({provider:this.provider,modelId:this.modelId,maxEmbeddingsPerCall:this.maxEmbeddingsPerCall,values:e});let c=(0,t.combineHeaders)(await (0,t.resolve)(this.config.headers),i);if(1===e.length){let{responseHeaders:o,value:i,rawValue:r}=await (0,t.postJsonToApi)({url:`${this.config.baseURL}/models/${this.modelId}:embedContent`,headers:c,body:{model:`models/${this.modelId}`,content:{parts:[{text:e[0]}]},outputDimensionality:null==d?void 0:d.outputDimensionality,taskType:null==d?void 0:d.taskType},failedResponseHandler:n,successfulResponseHandler:(0,t.createJsonResponseHandler)(u),abortSignal:a,fetch:this.config.fetch});return{warnings:[],embeddings:[i.embedding.values],usage:void 0,response:{headers:o,body:r}}}let{responseHeaders:p,value:g,rawValue:h}=await (0,t.postJsonToApi)({url:`${this.config.baseURL}/models/${this.modelId}:batchEmbedContents`,headers:c,body:{requests:e.map(e=>({model:`models/${this.modelId}`,content:{role:"user",parts:[{text:e}]},outputDimensionality:null==d?void 0:d.outputDimensionality,taskType:null==d?void 0:d.taskType}))},failedResponseHandler:n,successfulResponseHandler:(0,t.createJsonResponseHandler)(l),abortSignal:a,fetch:this.config.fetch});return{warnings:[],embeddings:g.embeddings.map(e=>e.values),usage:void 0,response:{headers:p,body:h}}}},l=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({embeddings:i.z.array(i.z.object({values:i.z.array(i.z.number())}))}))),u=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({embedding:i.z.object({values:i.z.array(i.z.number())})})));function d(e){var t,o,i,a;if(null==e)return{inputTokens:{total:void 0,noCache:void 0,cacheRead:void 0,cacheWrite:void 0},outputTokens:{total:void 0,text:void 0,reasoning:void 0},raw:void 0};let n=null!=(t=e.promptTokenCount)?t:0,r=null!=(o=e.candidatesTokenCount)?o:0,s=null!=(i=e.cachedContentTokenCount)?i:0,l=null!=(a=e.thoughtsTokenCount)?a:0;return{inputTokens:{total:n,noCache:n-s,cacheRead:s,cacheWrite:void 0},outputTokens:{total:r+l,text:r,reasoning:l},raw:e}}function c(e,t=!0){var o;if(null==e)return;if(null!=(o=e)&&"object"==typeof o&&"object"===o.type&&(null==o.properties||0===Object.keys(o.properties).length)&&!o.additionalProperties)return t?void 0:"object"==typeof e&&e.description?{type:"object",description:e.description}:{type:"object"};if("boolean"==typeof e)return{type:"boolean",properties:{}};let{type:i,description:a,required:n,properties:r,items:s,allOf:l,anyOf:u,oneOf:d,format:p,const:g,minLength:h,enum:m}=e,f={};if(a&&(f.description=a),n&&(f.required=n),p&&(f.format=p),void 0!==g&&(f.enum=[g]),i)if(Array.isArray(i)){let e=i.includes("null"),t=i.filter(e=>"null"!==e);0===t.length?f.type="null":(f.anyOf=t.map(e=>({type:e})),e&&(f.nullable=!0))}else f.type=i;if(void 0!==m&&(f.enum=m),null!=r&&(f.properties=Object.entries(r).reduce((e,[t,o])=>(e[t]=c(o,!1),e),{})),s&&(f.items=Array.isArray(s)?s.map(e=>c(e,!1)):c(s,!1)),l&&(f.allOf=l.map(e=>c(e,!1))),u)if(u.some(e=>"object"==typeof e&&(null==e?void 0:e.type)==="null")){let e=u.filter(e=>"object"!=typeof e||(null==e?void 0:e.type)!=="null");if(1===e.length){let t=c(e[0],!1);"object"==typeof t&&(f.nullable=!0,Object.assign(f,t))}else f.anyOf=e.map(e=>c(e,!1)),f.nullable=!0}else f.anyOf=u.map(e=>c(e,!1));return d&&(f.oneOf=d.map(e=>c(e,!1))),void 0!==h&&(f.minLength=h),f}function p(e){return e.includes("/")?e:`models/${e}`}var g=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({responseModalities:i.z.array(i.z.enum(["TEXT","IMAGE"])).optional(),thinkingConfig:i.z.object({thinkingBudget:i.z.number().optional(),includeThoughts:i.z.boolean().optional(),thinkingLevel:i.z.enum(["minimal","low","medium","high"]).optional()}).optional(),cachedContent:i.z.string().optional(),structuredOutputs:i.z.boolean().optional(),safetySettings:i.z.array(i.z.object({category:i.z.enum(["HARM_CATEGORY_UNSPECIFIED","HARM_CATEGORY_HATE_SPEECH","HARM_CATEGORY_DANGEROUS_CONTENT","HARM_CATEGORY_HARASSMENT","HARM_CATEGORY_SEXUALLY_EXPLICIT","HARM_CATEGORY_CIVIC_INTEGRITY"]),threshold:i.z.enum(["HARM_BLOCK_THRESHOLD_UNSPECIFIED","BLOCK_LOW_AND_ABOVE","BLOCK_MEDIUM_AND_ABOVE","BLOCK_ONLY_HIGH","BLOCK_NONE","OFF"])})).optional(),threshold:i.z.enum(["HARM_BLOCK_THRESHOLD_UNSPECIFIED","BLOCK_LOW_AND_ABOVE","BLOCK_MEDIUM_AND_ABOVE","BLOCK_ONLY_HIGH","BLOCK_NONE","OFF"]).optional(),audioTimestamp:i.z.boolean().optional(),labels:i.z.record(i.z.string(),i.z.string()).optional(),mediaResolution:i.z.enum(["MEDIA_RESOLUTION_UNSPECIFIED","MEDIA_RESOLUTION_LOW","MEDIA_RESOLUTION_MEDIUM","MEDIA_RESOLUTION_HIGH"]).optional(),imageConfig:i.z.object({aspectRatio:i.z.enum(["1:1","2:3","3:2","3:4","4:3","4:5","5:4","9:16","16:9","21:9"]).optional(),imageSize:i.z.enum(["1K","2K","4K"]).optional()}).optional(),retrievalConfig:i.z.object({latLng:i.z.object({latitude:i.z.number(),longitude:i.z.number()}).optional()}).optional()})));function h({finishReason:e,hasToolCalls:t}){switch(e){case"STOP":return t?"tool-calls":"stop";case"MAX_TOKENS":return"length";case"IMAGE_SAFETY":case"RECITATION":case"SAFETY":case"BLOCKLIST":case"PROHIBITED_CONTENT":case"SPII":return"content-filter";case"MALFORMED_FUNCTION_CALL":return"error";default:return"other"}}var m=class{constructor(e,o){var i;this.specificationVersion="v3",this.modelId=e,this.config=o,this.generateId=null!=(i=o.generateId)?i:t.generateId}get provider(){return this.config.provider}get supportedUrls(){var e,t,o;return null!=(o=null==(t=(e=this.config).supportedUrls)?void 0:t.call(e))?o:{}}async getArgs({prompt:e,maxOutputTokens:i,temperature:a,topP:n,topK:r,frequencyPenalty:s,presencePenalty:l,stopSequences:u,responseFormat:d,seed:p,tools:h,toolChoice:m,providerOptions:f}){var v;let y=[],E=this.config.provider.includes("vertex")?"vertex":"google",T=await (0,t.parseProviderOptions)({provider:E,providerOptions:f,schema:g});null==T&&"google"!==E&&(T=await (0,t.parseProviderOptions)({provider:"google",providerOptions:f,schema:g})),(null==h?void 0:h.some(e=>"provider"===e.type&&"google.vertex_rag_store"===e.id))&&!this.config.provider.startsWith("google.vertex.")&&y.push({type:"other",message:`The 'vertex_rag_store' tool is only supported with the Google Vertex provider and might not be supported or could behave unexpectedly with the current Google provider (${this.config.provider}).`});let S=this.modelId.toLowerCase().startsWith("gemma-"),{contents:R,systemInstruction:I}=function(e,i){var a,n,r;let s=[],l=[],u=!0,d=null!=(a=null==i?void 0:i.isGemmaModel)&&a,c=null!=(n=null==i?void 0:i.providerOptionsName)?n:"google";for(let{role:i,content:a}of e)switch(i){case"system":if(!u)throw new o.UnsupportedFunctionalityError({functionality:"system messages are only supported at the beginning of the conversation"});s.push({text:a});break;case"user":{u=!1;let e=[];for(let o of a)switch(o.type){case"text":e.push({text:o.text});break;case"file":{let i="image/*"===o.mediaType?"image/jpeg":o.mediaType;e.push(o.data instanceof URL?{fileData:{mimeType:i,fileUri:o.data.toString()}}:{inlineData:{mimeType:i,data:(0,t.convertToBase64)(o.data)}})}}l.push({role:"user",parts:e});break}case"assistant":u=!1,l.push({role:"model",parts:a.map(e=>{var i;let a=null==(i=e.providerOptions)?void 0:i[c],n=(null==a?void 0:a.thoughtSignature)!=null?String(a.thoughtSignature):void 0;switch(e.type){case"text":return 0===e.text.length?void 0:{text:e.text,thoughtSignature:n};case"reasoning":return 0===e.text.length?void 0:{text:e.text,thought:!0,thoughtSignature:n};case"file":if(e.data instanceof URL)throw new o.UnsupportedFunctionalityError({functionality:"File data URLs in assistant messages are not supported"});return{inlineData:{mimeType:e.mediaType,data:(0,t.convertToBase64)(e.data)},thoughtSignature:n};case"tool-call":return{functionCall:{name:e.toolName,args:e.input},thoughtSignature:n}}}).filter(e=>void 0!==e)});break;case"tool":{u=!1;let e=[];for(let t of a){if("tool-approval-response"===t.type)continue;let o=t.output;if("content"===o.type)for(let i of o.value)switch(i.type){case"text":e.push({functionResponse:{name:t.toolName,response:{name:t.toolName,content:i.text}}});break;case"image-data":e.push({inlineData:{mimeType:i.mediaType,data:i.data}},{text:"Tool executed successfully and returned this image as a response"});break;default:e.push({text:JSON.stringify(i)})}else e.push({functionResponse:{name:t.toolName,response:{name:t.toolName,content:"execution-denied"===o.type?null!=(r=o.reason)?r:"Tool execution denied.":o.value}}})}l.push({role:"user",parts:e})}}if(d&&s.length>0&&l.length>0&&"user"===l[0].role){let e=s.map(e=>e.text).join("\n\n");l[0].parts.unshift({text:e+"\n\n"})}return{systemInstruction:s.length>0&&!d?{parts:s}:void 0,contents:l}}(e,{isGemmaModel:S,providerOptionsName:E}),{tools:b,toolConfig:C,toolWarnings:A}=function({tools:e,toolChoice:t,modelId:i}){var a;e=(null==e?void 0:e.length)?e:void 0;let n=[],r=["gemini-flash-latest","gemini-flash-lite-latest","gemini-pro-latest"].some(e=>e===i),s=i.includes("gemini-2")||i.includes("gemini-3")||r,l=i.includes("gemini-1.5-flash")&&!i.includes("-8b"),u=i.includes("gemini-2.5");if(null==e)return{tools:void 0,toolConfig:void 0,toolWarnings:n};let d=e.some(e=>"function"===e.type),p=e.some(e=>"provider"===e.type);if(d&&p&&n.push({type:"unsupported",feature:"combination of function and provider-defined tools"}),p){let t=[];return e.filter(e=>"provider"===e.type).forEach(e=>{switch(e.id){case"google.google_search":s?t.push({googleSearch:{}}):l?t.push({googleSearchRetrieval:{dynamicRetrievalConfig:{mode:e.args.mode,dynamicThreshold:e.args.dynamicThreshold}}}):t.push({googleSearchRetrieval:{}});break;case"google.enterprise_web_search":s?t.push({enterpriseWebSearch:{}}):n.push({type:"unsupported",feature:`provider-defined tool ${e.id}`,details:"Enterprise Web Search requires Gemini 2.0 or newer."});break;case"google.url_context":s?t.push({urlContext:{}}):n.push({type:"unsupported",feature:`provider-defined tool ${e.id}`,details:"The URL context tool is not supported with other Gemini models than Gemini 2."});break;case"google.code_execution":s?t.push({codeExecution:{}}):n.push({type:"unsupported",feature:`provider-defined tool ${e.id}`,details:"The code execution tools is not supported with other Gemini models than Gemini 2."});break;case"google.file_search":u?t.push({fileSearch:{...e.args}}):n.push({type:"unsupported",feature:`provider-defined tool ${e.id}`,details:"The file search tool is only supported with Gemini 2.5 models."});break;case"google.vertex_rag_store":s?t.push({retrieval:{vertex_rag_store:{rag_resources:{rag_corpus:e.args.ragCorpus},similarity_top_k:e.args.topK}}}):n.push({type:"unsupported",feature:`provider-defined tool ${e.id}`,details:"The RAG store tool is not supported with other Gemini models than Gemini 2."});break;case"google.google_maps":s?t.push({googleMaps:{}}):n.push({type:"unsupported",feature:`provider-defined tool ${e.id}`,details:"The Google Maps grounding tool is not supported with Gemini models other than Gemini 2 or newer."});break;default:n.push({type:"unsupported",feature:`provider-defined tool ${e.id}`})}}),{tools:t.length>0?t:void 0,toolConfig:void 0,toolWarnings:n}}let g=[];for(let t of e)"function"===t.type?g.push({name:t.name,description:null!=(a=t.description)?a:"",parameters:c(t.inputSchema)}):n.push({type:"unsupported",feature:`function tool ${t.name}`});if(null==t)return{tools:[{functionDeclarations:g}],toolConfig:void 0,toolWarnings:n};let h=t.type;switch(h){case"auto":return{tools:[{functionDeclarations:g}],toolConfig:{functionCallingConfig:{mode:"AUTO"}},toolWarnings:n};case"none":return{tools:[{functionDeclarations:g}],toolConfig:{functionCallingConfig:{mode:"NONE"}},toolWarnings:n};case"required":return{tools:[{functionDeclarations:g}],toolConfig:{functionCallingConfig:{mode:"ANY"}},toolWarnings:n};case"tool":return{tools:[{functionDeclarations:g}],toolConfig:{functionCallingConfig:{mode:"ANY",allowedFunctionNames:[t.toolName]}},toolWarnings:n};default:throw new o.UnsupportedFunctionalityError({functionality:`tool choice type: ${h}`})}}({tools:h,toolChoice:m,modelId:this.modelId});return{args:{generationConfig:{maxOutputTokens:i,temperature:a,topK:r,topP:n,frequencyPenalty:s,presencePenalty:l,stopSequences:u,seed:p,responseMimeType:(null==d?void 0:d.type)==="json"?"application/json":void 0,responseSchema:(null==d?void 0:d.type)==="json"&&null!=d.schema&&(null==(v=null==T?void 0:T.structuredOutputs)||v)?c(d.schema):void 0,...(null==T?void 0:T.audioTimestamp)&&{audioTimestamp:T.audioTimestamp},responseModalities:null==T?void 0:T.responseModalities,thinkingConfig:null==T?void 0:T.thinkingConfig,...(null==T?void 0:T.mediaResolution)&&{mediaResolution:T.mediaResolution},...(null==T?void 0:T.imageConfig)&&{imageConfig:T.imageConfig}},contents:R,systemInstruction:S?void 0:I,safetySettings:null==T?void 0:T.safetySettings,tools:b,toolConfig:(null==T?void 0:T.retrievalConfig)?{...C,retrievalConfig:T.retrievalConfig}:C,cachedContent:null==T?void 0:T.cachedContent,labels:null==T?void 0:T.labels},warnings:[...y,...A],providerOptionsName:E}}async doGenerate(e){var o,i,a,r,s,l,u,c,g;let m,{args:v,warnings:y,providerOptionsName:E}=await this.getArgs(e),T=(0,t.combineHeaders)(await (0,t.resolve)(this.config.headers),e.headers),{responseHeaders:S,value:I,rawValue:b}=await (0,t.postJsonToApi)({url:`${this.config.baseURL}/${p(this.modelId)}:generateContent`,headers:T,body:v,failedResponseHandler:n,successfulResponseHandler:(0,t.createJsonResponseHandler)(R),abortSignal:e.abortSignal,fetch:this.config.fetch}),C=I.candidates[0],A=[],O=null!=(i=null==(o=C.content)?void 0:o.parts)?i:[],z=I.usageMetadata;for(let e of O)if("executableCode"in e&&(null==(a=e.executableCode)?void 0:a.code)){let t=this.config.generateId();m=t,A.push({type:"tool-call",toolCallId:t,toolName:"code_execution",input:JSON.stringify(e.executableCode),providerExecuted:!0})}else"codeExecutionResult"in e&&e.codeExecutionResult?(A.push({type:"tool-result",toolCallId:m,toolName:"code_execution",result:{outcome:e.codeExecutionResult.outcome,output:e.codeExecutionResult.output}}),m=void 0):"text"in e&&null!=e.text&&e.text.length>0?A.push({type:!0===e.thought?"reasoning":"text",text:e.text,providerMetadata:e.thoughtSignature?{[E]:{thoughtSignature:e.thoughtSignature}}:void 0}):"functionCall"in e?A.push({type:"tool-call",toolCallId:this.config.generateId(),toolName:e.functionCall.name,input:JSON.stringify(e.functionCall.args),providerMetadata:e.thoughtSignature?{[E]:{thoughtSignature:e.thoughtSignature}}:void 0}):"inlineData"in e&&A.push({type:"file",data:e.inlineData.data,mediaType:e.inlineData.mimeType,providerMetadata:e.thoughtSignature?{[E]:{thoughtSignature:e.thoughtSignature}}:void 0});for(let e of null!=(r=f({groundingMetadata:C.groundingMetadata,generateId:this.config.generateId}))?r:[])A.push(e);return{content:A,finishReason:{unified:h({finishReason:C.finishReason,hasToolCalls:A.some(e=>"tool-call"===e.type)}),raw:null!=(s=C.finishReason)?s:void 0},usage:d(z),warnings:y,providerMetadata:{[E]:{promptFeedback:null!=(l=I.promptFeedback)?l:null,groundingMetadata:null!=(u=C.groundingMetadata)?u:null,urlContextMetadata:null!=(c=C.urlContextMetadata)?c:null,safetyRatings:null!=(g=C.safetyRatings)?g:null,usageMetadata:null!=z?z:null}},request:{body:v},response:{headers:S,body:b}}}async doStream(e){let o,i,a,{args:r,warnings:s,providerOptionsName:l}=await this.getArgs(e),u=(0,t.combineHeaders)(await (0,t.resolve)(this.config.headers),e.headers),{responseHeaders:c,value:g}=await (0,t.postJsonToApi)({url:`${this.config.baseURL}/${p(this.modelId)}:streamGenerateContent?alt=sse`,headers:u,body:r,failedResponseHandler:n,successfulResponseHandler:(0,t.createEventSourceResponseHandler)(I),abortSignal:e.abortSignal,fetch:this.config.fetch}),m={unified:"other",raw:void 0},v=this.config.generateId,y=!1,E=null,T=null,S=0,R=new Set;return{stream:g.pipeThrough(new TransformStream({start(e){e.enqueue({type:"stream-start",warnings:s})},transform(t,n){var r,s,u,d,c,p,g;if(e.includeRawChunks&&n.enqueue({type:"raw",rawValue:t.rawValue}),!t.success)return void n.enqueue({type:"error",error:t.error});let I=t.value,b=I.usageMetadata;null!=b&&(i=b);let C=null==(r=I.candidates)?void 0:r[0];if(null==C)return;let A=C.content,O=f({groundingMetadata:C.groundingMetadata,generateId:v});if(null!=O)for(let e of O)"url"!==e.sourceType||R.has(e.url)||(R.add(e.url),n.enqueue(e));if(null!=A){for(let e of null!=(s=A.parts)?s:[])if("executableCode"in e&&(null==(u=e.executableCode)?void 0:u.code)){let t=v();o=t,n.enqueue({type:"tool-call",toolCallId:t,toolName:"code_execution",input:JSON.stringify(e.executableCode),providerExecuted:!0}),y=!0}else if("codeExecutionResult"in e&&e.codeExecutionResult){let t=o;t&&(n.enqueue({type:"tool-result",toolCallId:t,toolName:"code_execution",result:{outcome:e.codeExecutionResult.outcome,output:e.codeExecutionResult.output}}),o=void 0)}else"text"in e&&null!=e.text&&e.text.length>0?!0===e.thought?(null!==E&&(n.enqueue({type:"text-end",id:E}),E=null),null===T&&(T=String(S++),n.enqueue({type:"reasoning-start",id:T,providerMetadata:e.thoughtSignature?{[l]:{thoughtSignature:e.thoughtSignature}}:void 0})),n.enqueue({type:"reasoning-delta",id:T,delta:e.text,providerMetadata:e.thoughtSignature?{[l]:{thoughtSignature:e.thoughtSignature}}:void 0})):(null!==T&&(n.enqueue({type:"reasoning-end",id:T}),T=null),null===E&&(E=String(S++),n.enqueue({type:"text-start",id:E,providerMetadata:e.thoughtSignature?{[l]:{thoughtSignature:e.thoughtSignature}}:void 0})),n.enqueue({type:"text-delta",id:E,delta:e.text,providerMetadata:e.thoughtSignature?{[l]:{thoughtSignature:e.thoughtSignature}}:void 0})):"inlineData"in e&&n.enqueue({type:"file",mediaType:e.inlineData.mimeType,data:e.inlineData.data});let e=function({parts:e,generateId:t,providerOptionsName:o}){let i=null==e?void 0:e.filter(e=>"functionCall"in e);return null==i||0===i.length?void 0:i.map(e=>({type:"tool-call",toolCallId:t(),toolName:e.functionCall.name,args:JSON.stringify(e.functionCall.args),providerMetadata:e.thoughtSignature?{[o]:{thoughtSignature:e.thoughtSignature}}:void 0}))}({parts:A.parts,generateId:v,providerOptionsName:l});if(null!=e)for(let t of e)n.enqueue({type:"tool-input-start",id:t.toolCallId,toolName:t.toolName,providerMetadata:t.providerMetadata}),n.enqueue({type:"tool-input-delta",id:t.toolCallId,delta:t.args,providerMetadata:t.providerMetadata}),n.enqueue({type:"tool-input-end",id:t.toolCallId,providerMetadata:t.providerMetadata}),n.enqueue({type:"tool-call",toolCallId:t.toolCallId,toolName:t.toolName,input:t.args,providerMetadata:t.providerMetadata}),y=!0}null!=C.finishReason&&(m={unified:h({finishReason:C.finishReason,hasToolCalls:y}),raw:C.finishReason},a={[l]:{promptFeedback:null!=(d=I.promptFeedback)?d:null,groundingMetadata:null!=(c=C.groundingMetadata)?c:null,urlContextMetadata:null!=(p=C.urlContextMetadata)?p:null,safetyRatings:null!=(g=C.safetyRatings)?g:null}},null!=b&&(a[l].usageMetadata=b))},flush(e){null!==E&&e.enqueue({type:"text-end",id:E}),null!==T&&e.enqueue({type:"reasoning-end",id:T}),e.enqueue({type:"finish",finishReason:m,usage:d(i),providerMetadata:a})}})),response:{headers:c},request:{body:r}}}};function f({groundingMetadata:e,generateId:t}){var o,i,a,n,r;if(!(null==e?void 0:e.groundingChunks))return;let s=[];for(let l of e.groundingChunks)if(null!=l.web)s.push({type:"source",sourceType:"url",id:t(),url:l.web.uri,title:null!=(o=l.web.title)?o:void 0});else if(null!=l.retrievedContext){let e=l.retrievedContext.uri,o=l.retrievedContext.fileSearchStore;if(e&&(e.startsWith("http://")||e.startsWith("https://")))s.push({type:"source",sourceType:"url",id:t(),url:e,title:null!=(i=l.retrievedContext.title)?i:void 0});else if(e){let o,i=null!=(a=l.retrievedContext.title)?a:"Unknown Document",n="application/octet-stream";e.endsWith(".pdf")?n="application/pdf":e.endsWith(".txt")?n="text/plain":e.endsWith(".docx")?n="application/vnd.openxmlformats-officedocument.wordprocessingml.document":e.endsWith(".doc")?n="application/msword":e.match(/\.(md|markdown)$/)&&(n="text/markdown"),o=e.split("/").pop(),s.push({type:"source",sourceType:"document",id:t(),mediaType:n,title:i,filename:o})}else if(o){let e=null!=(n=l.retrievedContext.title)?n:"Unknown Document";s.push({type:"source",sourceType:"document",id:t(),mediaType:"application/octet-stream",title:e,filename:o.split("/").pop()})}}else null!=l.maps&&l.maps.uri&&s.push({type:"source",sourceType:"url",id:t(),url:l.maps.uri,title:null!=(r=l.maps.title)?r:void 0});return s.length>0?s:void 0}var v=()=>i.z.object({webSearchQueries:i.z.array(i.z.string()).nullish(),retrievalQueries:i.z.array(i.z.string()).nullish(),searchEntryPoint:i.z.object({renderedContent:i.z.string()}).nullish(),groundingChunks:i.z.array(i.z.object({web:i.z.object({uri:i.z.string(),title:i.z.string().nullish()}).nullish(),retrievedContext:i.z.object({uri:i.z.string().nullish(),title:i.z.string().nullish(),text:i.z.string().nullish(),fileSearchStore:i.z.string().nullish()}).nullish(),maps:i.z.object({uri:i.z.string().nullish(),title:i.z.string().nullish(),text:i.z.string().nullish(),placeId:i.z.string().nullish()}).nullish()})).nullish(),groundingSupports:i.z.array(i.z.object({segment:i.z.object({startIndex:i.z.number().nullish(),endIndex:i.z.number().nullish(),text:i.z.string().nullish()}),segment_text:i.z.string().nullish(),groundingChunkIndices:i.z.array(i.z.number()).nullish(),supportChunkIndices:i.z.array(i.z.number()).nullish(),confidenceScores:i.z.array(i.z.number()).nullish(),confidenceScore:i.z.array(i.z.number()).nullish()})).nullish(),retrievalMetadata:i.z.union([i.z.object({webDynamicRetrievalScore:i.z.number()}),i.z.object({})]).nullish()}),y=()=>i.z.object({parts:i.z.array(i.z.union([i.z.object({functionCall:i.z.object({name:i.z.string(),args:i.z.unknown()}),thoughtSignature:i.z.string().nullish()}),i.z.object({inlineData:i.z.object({mimeType:i.z.string(),data:i.z.string()}),thoughtSignature:i.z.string().nullish()}),i.z.object({executableCode:i.z.object({language:i.z.string(),code:i.z.string()}).nullish(),codeExecutionResult:i.z.object({outcome:i.z.string(),output:i.z.string()}).nullish(),text:i.z.string().nullish(),thought:i.z.boolean().nullish(),thoughtSignature:i.z.string().nullish()})])).nullish()}),E=()=>i.z.object({category:i.z.string().nullish(),probability:i.z.string().nullish(),probabilityScore:i.z.number().nullish(),severity:i.z.string().nullish(),severityScore:i.z.number().nullish(),blocked:i.z.boolean().nullish()}),T=i.z.object({cachedContentTokenCount:i.z.number().nullish(),thoughtsTokenCount:i.z.number().nullish(),promptTokenCount:i.z.number().nullish(),candidatesTokenCount:i.z.number().nullish(),totalTokenCount:i.z.number().nullish(),trafficType:i.z.string().nullish()}),S=()=>i.z.object({urlMetadata:i.z.array(i.z.object({retrievedUrl:i.z.string(),urlRetrievalStatus:i.z.string()}))}),R=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({candidates:i.z.array(i.z.object({content:y().nullish().or(i.z.object({}).strict()),finishReason:i.z.string().nullish(),safetyRatings:i.z.array(E()).nullish(),groundingMetadata:v().nullish(),urlContextMetadata:S().nullish()})),usageMetadata:T.nullish(),promptFeedback:i.z.object({blockReason:i.z.string().nullish(),safetyRatings:i.z.array(E()).nullish()}).nullish()}))),I=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({candidates:i.z.array(i.z.object({content:y().nullish(),finishReason:i.z.string().nullish(),safetyRatings:i.z.array(E()).nullish(),groundingMetadata:v().nullish(),urlContextMetadata:S().nullish()})).nullish(),usageMetadata:T.nullish(),promptFeedback:i.z.object({blockReason:i.z.string().nullish(),safetyRatings:i.z.array(E()).nullish()}).nullish()}))),b=(0,t.createProviderToolFactoryWithOutputSchema)({id:"google.code_execution",inputSchema:i.z.object({language:i.z.string().describe("The programming language of the code."),code:i.z.string().describe("The code to be executed.")}),outputSchema:i.z.object({outcome:i.z.string().describe('The outcome of the execution (e.g., "OUTCOME_OK").'),output:i.z.string().describe("The output from the code execution.")})}),C=(0,t.createProviderToolFactory)({id:"google.enterprise_web_search",inputSchema:(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({})))}),A=i.z.object({fileSearchStoreNames:i.z.array(i.z.string()).describe("The names of the file_search_stores to retrieve from. Example: `fileSearchStores/my-file-search-store-123`"),topK:i.z.number().int().positive().describe("The number of file search retrieval chunks to retrieve.").optional(),metadataFilter:i.z.string().describe("Metadata filter to apply to the file search retrieval documents. See https://google.aip.dev/160 for the syntax of the filter expression.").optional()}).passthrough(),O=(0,t.lazySchema)(()=>(0,t.zodSchema)(A)),z=(0,t.createProviderToolFactory)({id:"google.file_search",inputSchema:O}),N=(0,t.createProviderToolFactory)({id:"google.google_maps",inputSchema:(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({})))}),x=(0,t.createProviderToolFactory)({id:"google.google_search",inputSchema:(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({mode:i.z.enum(["MODE_DYNAMIC","MODE_UNSPECIFIED"]).default("MODE_UNSPECIFIED"),dynamicThreshold:i.z.number().default(1)})))}),w={googleSearch:x,enterpriseWebSearch:C,googleMaps:N,urlContext:(0,t.createProviderToolFactory)({id:"google.url_context",inputSchema:(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({})))}),fileSearch:z,codeExecution:b,vertexRagStore:(0,t.createProviderToolFactory)({id:"google.vertex_rag_store",inputSchema:i.z.object({ragCorpus:i.z.string(),topK:i.z.number().optional()})})},M=class{constructor(e,t,o){this.modelId=e,this.settings=t,this.config=o,this.specificationVersion="v3"}get maxImagesPerCall(){var e;return null!=(e=this.settings.maxImagesPerCall)?e:4}get provider(){return this.config.provider}async doGenerate(e){var o,i,a;let{prompt:r,n:s=1,size:l,aspectRatio:u="1:1",seed:d,providerOptions:c,headers:p,abortSignal:g,files:h,mask:m}=e,f=[];if(null!=h&&h.length>0)throw Error("Google Generative AI does not support image editing. Use Google Vertex AI (@ai-sdk/google-vertex) for image editing capabilities.");if(null!=m)throw Error("Google Generative AI does not support image editing with masks. Use Google Vertex AI (@ai-sdk/google-vertex) for image editing capabilities.");null!=l&&f.push({type:"unsupported",feature:"size",details:"This model does not support the `size` option. Use `aspectRatio` instead."}),null!=d&&f.push({type:"unsupported",feature:"seed",details:"This model does not support the `seed` option through this provider."});let v=await (0,t.parseProviderOptions)({provider:"google",providerOptions:c,schema:P}),y=null!=(a=null==(i=null==(o=this.config._internal)?void 0:o.currentDate)?void 0:i.call(o))?a:new Date,E={sampleCount:s};null!=u&&(E.aspectRatio=u),v&&Object.assign(E,v);let{responseHeaders:T,value:S}=await (0,t.postJsonToApi)({url:`${this.config.baseURL}/models/${this.modelId}:predict`,headers:(0,t.combineHeaders)(await (0,t.resolve)(this.config.headers),p),body:{instances:[{prompt:r}],parameters:E},failedResponseHandler:n,successfulResponseHandler:(0,t.createJsonResponseHandler)(_),abortSignal:g,fetch:this.config.fetch});return{images:S.predictions.map(e=>e.bytesBase64Encoded),warnings:null!=f?f:[],providerMetadata:{google:{images:S.predictions.map(e=>({}))}},response:{timestamp:y,modelId:this.modelId,headers:T}}}},_=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({predictions:i.z.array(i.z.object({bytesBase64Encoded:i.z.string()})).default([])}))),P=(0,t.lazySchema)(()=>(0,t.zodSchema)(i.z.object({personGeneration:i.z.enum(["dont_allow","allow_adult","allow_all"]).nullish(),aspectRatio:i.z.enum(["1:1","3:4","4:3","9:16","16:9"]).nullish()})));function D(e={}){var o,i;let a=null!=(o=(0,t.withoutTrailingSlash)(e.baseURL))?o:"https://generativelanguage.googleapis.com/v1beta",n=null!=(i=e.name)?i:"google.generative-ai",r=()=>(0,t.withUserAgentSuffix)({"x-goog-api-key":(0,t.loadApiKey)({apiKey:e.apiKey,environmentVariableName:"GOOGLE_GENERATIVE_AI_API_KEY",description:"Google Generative AI"}),...e.headers},"ai-sdk/google/3.0.2"),l=o=>{var i;return new m(o,{provider:n,baseURL:a,headers:r,generateId:null!=(i=e.generateId)?i:t.generateId,supportedUrls:()=>({"*":[RegExp(`^${a}/files/.*$`),RegExp("^https://(?:www\\.)?youtube\\.com/watch\\?v=[\\w-]+(?:&[\\w=&.-]*)?$"),RegExp("^https://youtu\\.be/[\\w-]+(?:\\?[\\w=&.-]*)?$")]}),fetch:e.fetch})},u=t=>new s(t,{provider:n,baseURL:a,headers:r,fetch:e.fetch}),d=(t,o={})=>new M(t,o,{provider:n,baseURL:a,headers:r,fetch:e.fetch}),c=function(e){if(new.target)throw Error("The Google Generative AI model function cannot be called with the new keyword.");return l(e)};return c.specificationVersion="v3",c.languageModel=l,c.chat=l,c.generativeAI=l,c.embedding=u,c.embeddingModel=u,c.textEmbedding=u,c.textEmbeddingModel=u,c.image=d,c.imageModel=d,c.tools=w,c}D(),e.s(["createGoogleGenerativeAI",()=>D])},12113,e=>e.a(async(t,o)=>{try{var i=e.i(11227),a=e.i(12075),n=e.i(68184),r=e.i(93112),s=e.i(18737),l=t([n,r,s]);[n,r,s]=l.then?(await l)():l;let d=`[CORE IDENTITY]
You are SYD - ARCHITETTO PERSONALE, an advanced construction and design assistant.
Language: Italian.
Primary Rule: Classify intent immediately: MODE A (Designer) or MODE B (Surveyor).

[INTERACTION RULES]
1. **GREETINGS (Ciao)**: If the user says "Ciao" or greetings, DO NOT introduce yourself (you already did). Just answer: "Ciao! Come posso aiutarti con il tuo progetto?".
2. **QUESTION LIMIT**: Ask MAXIMUM 1 or 2 questions at a time. NEVER ask a long list of questions. Wait for the user's answer before proceeding.

[PHOTO UPLOAD DISAMBIGUATION]
**CRITICAL RULE**: If the user's intent is UNCLEAR (e.g., uploads photo with only "Ciao", generic greetings, or vague text):
1. DO NOT assume MODE A or MODE B
2. MUST ask explicitly which service they want:

Response Template:
"Ciao! Ho ricevuto la tua foto. Come posso aiutarti?

1. 🎨 **Visualizzare** come verrebbe ristrutturato con un rendering 3D
2. 📋 **Ricevere un preventivo** dettagliato per i lavori

Cosa preferisci?"

**WAIT for user's choice** before proceeding to MODE A or MODE B.


[EXISTING TOOL INSTRUCTIONS]
##  ANALISI IMMAGINI UPLOAD (FOTO UTENTE)

Quando l'utente carica una foto:
1. **ANALIZZA SUBITO** la foto.
2. **DESCRIVI** esplicitamente cosa vedi.
3. **NON GENERARE** ancora. Avvia il protocollo "Discovery" (vedi Mode A).

## ISTRUZIONI PER IL TOOL generate_render

**STEP 1 - structuralElements (OBBLIGATORIO):**
Prima di tutto, devi compilare il campo \`structuralElements\` con TUTTI gli elementi strutturali:
- Se l'utente ha caricato una FOTO: descrivi gli elementi visibili (es. "arched window on left wall, wooden ceiling beams, parquet floor")
- Se NON c'\xe8 foto: descrivi gli elementi richiesti nella conversazione
- Scrivi in INGLESE e sii SPECIFICO

**STEP 2 - roomType & style:**
Compila questi campi in INGLESE (es. "living room", "modern")

**STEP 3 - prompt (DEVE iniziare con structuralElements):**
Il prompt DEVE iniziare descrivendo gli elementi di STEP 1.

## 🔀 SCELTA MODALIT\xc0 (mode)

### MODE: "creation" (Creazione da zero)
Usa quando l'utente NON ha caricato una foto

### MODE: "modification" (Modifica foto esistente)
Usa quando l'utente HA CARICATO una foto.
DEVI compilare \`sourceImageUrl\`:
1. Cerca nella cronologia il marker: \`[Immagine allegata: https://storage.googleapis.com/...]\`
2. Estrai l'URL dal marker

---

MODE A: THE DESIGNER (Rendering & Visual Flow)

Trigger: User wants to "visualize", "imagine", "see ideas", "style advice".

Scenario 1: Starting from Photo (Hybrid Vision) - STRICT PROTOCOL

Action:
1. ANALYZE (Silent): Identify structural constraints (windows, beams) from the image.
2. DISCOVERY (Mandatory): BEFORE generating, you MUST ask:
   - "Cosa vuoi MANTENERE? (es. pavimento, infissi)"
   - "Cosa vuoi CAMBIARE? (es. stile, colori)"
3. STOP & WAIT: Do NOT call 'generate_render' yet. You need these answers first.
4. GENERATE: Only AFTER the user replies to these questions, call 'generate_render'.
   - CRITICAL: You MUST populate the 'keepElements' parameter with the specific items the user wants to maintain (e.g., ["camino", "scuro", "pavimento"]).

Scenario 2: Starting from Zero

Action: Guide imagination (Room Type, Style, Key Elements).
Generate: Create a descriptive prompt from scratch.

---

MODE B: RENOVATION CONSULTANT (Quote & Preventivo Flow)

Trigger: User wants "quote", "cost", "work details", "renovation", "preventivo".

═══════════════════════════════════════════════════════════════
PERSONA & MINDSET
═══════════════════════════════════════════════════════════════
You are a professional renovation consultant - think like an experienced architect 
or interior designer having a first consultation with a potential client.

Your goal is to understand their PROJECT VISION and gather practical details 
for an accurate quote, NOT to interrogate them with bureaucratic questions.

Tone: Professional, friendly, consultative, adaptive.

═══════════════════════════════════════════════════════════════
INFORMATION TO GATHER
═══════════════════════════════════════════════════════════════

ESSENTIAL (Always Required):
1. **Contact Information** (upfront, professional)
   - Nome/Name
   - Email
   - Telefono/Phone (optional but encouraged)

2. **Project Vision** (open-ended, rich detail)
   - What do they want to achieve?
   - Which room/space?
   - Current state vs desired outcome

3. **Scope of Work** (specific, project-focused)
   - What needs to be done? (demolition, construction, finishes)
   - Systems involved? (electrical, plumbing, HVAC)
   - Materials preferences?

4. **Space Context** (practical, approximate)
   - Room type (kitchen, bathroom, living room, etc.)
   - Approximate size (even "piccola, media, grande" is fine)
   - Any structural constraints? (load-bearing walls, windows, doors)

ADAPTIVE (Based on Context):
- For kitchens: Layout changes? Appliances included?
- For bathrooms: Fixture replacement? New installations?
- For renovations: Demolition extent? Preserve anything?
- For new construction: From scratch or partial?

═══════════════════════════════════════════════════════════════
CONVERSATION APPROACH
═══════════════════════════════════════════════════════════════

START: Friendly intro + contact info request
Example: "Ciao! Per prepararti un preventivo accurato, partiamo dai contatti. 
Come ti chiami e qual \xe8 la tua email?"

MIDDLE: Open-ended project questions → Intelligent follow-ups
- Ask WHAT they want (vision), not HOW they'll execute (logistics)
- Let them describe freely, then drill into specifics
- Adapt questions to their answers (be contextual!)
- Focus on SCOPE and MATERIALS, not administrative details

END: Confirm understanding + save
Example: "Perfetto! Ho tutti i dettagli. Ricapitoliamo: [summary]. 
Procedo a salvare il tutto?"

Minimum Exchanges: 4-5 back-and-forth to gather quality information.
Maximum: Keep it efficient - respect their time.

═══════════════════════════════════════════════════════════════
EXAMPLES - GOOD QUESTIONS ✅
═══════════════════════════════════════════════════════════════

**Project Vision:**
✅ "Raccontami del tuo progetto: cosa vuoi realizzare?"
✅ "Qual \xe8 l'obiettivo principale? Estetico, funzionale, o entrambi?"
✅ "Hai riferimenti di stile? (Moderno, classico, industriale...)"

**Scope of Work:**
✅ "Cosa prevedi di cambiare esattamente?"
✅ "Partiamo da zero o mantieni qualcosa dell'esistente?"
✅ "Gli impianti (elettrico, idraulico) vanno rifatti o aggiornati?"
✅ "Prevedi demolizioni? Se s\xec, totali o parziali?"

**Materials & Finishes:**
✅ "Quali materiali hai in mente? (Legno, marmo, gres, laminato...)"
✅ "Pavimento: sostituzione o manutenzione?"
✅ "Rivestimenti bagno/cucina: piastrelle, resina, altro?"

**Space Context:**
✅ "Che dimensioni ha lo spazio? (anche indicative)"
✅ "Ci sono vincoli architettonici da considerare?"
✅ "Finestre e porte: mantieni posizioni o vuoi modifiche?"

**Room-Specific (Kitchen):**
✅ "La disposizione attuale va bene o vuoi cambiarla?"
✅ "Elettrodomestici: li fornisci tu o li includiamo?"
✅ "Top e ante: che materiali preferisci?"

**Room-Specific (Bathroom):**
✅ "Sanitari: quanti e che tipo? (Doccia, vasca, bidet...)"
✅ "Mobili bagno: su misura o standard?"
✅ "Rivestimenti: totali o solo zona doccia?"

═══════════════════════════════════════════════════════════════
EXAMPLES - BAD QUESTIONS ❌ (DO NOT ASK)
═══════════════════════════════════════════════════════════════

**Logistics (Not Relevant for Quote):**
❌ "A che piano \xe8 l'appartamento?"
❌ "C'\xe8 l'ascensore?"
❌ "Di che anno \xe8 la costruzione?"
❌ "Qual \xe8 l'altezza esatta dei soffitti?"
❌ "Come si arriva al cantiere?"

**Too Bureaucratic:**
❌ "Compilare campo numero 7: metri quadri esatti"
❌ "Protocollo richiede [long list]"
❌ "Dato obbligatorio: [technical jargon]"

**Premature Budget Talk:**
❌ "Qual \xe8 il tuo budget massimo?"
❌ "Quanto vuoi spendere?"
(Note: If user mentions budget, acknowledge and note it, but focus on scope)

═══════════════════════════════════════════════════════════════
FLEXIBILITY & INTELLIGENCE
═══════════════════════════════════════════════════════════════

**If User is Vague:**
Ask clarifying open-ended questions to get richer details.
Example: "Interessante! Puoi darmi qualche dettaglio in pi\xf9 su [aspect]?"

**If User is Very Detailed:**
Acknowledge their thoroughness, fill any remaining gaps.
Example: "Ottimo, hai gi\xe0 le idee chiare! Solo per completare..."

**If User Has Photo:**
Start from visual analysis, then converge to project scope.
Example: "Vedo che hai [current state]. Intendi [demolish/preserve]?"

**If User Asks About Budget:**
Politely redirect to scope first.
Example: "Per darti una stima accurata, fammi capire meglio il progetto. 
Poi potremo discutere budget in base al lavoro."

═══════════════════════════════════════════════════════════════
OUTPUT FORMATTING
═══════════════════════════════════════════════════════════════

After gathering information, compile into projectDetails field as rich narrative:

Example projectDetails:
"Ristrutturazione cucina 20mq, stile moderno. Demolizione parziale con 
mantenimento disposizione attuale. Top in quarzo, ante laccate bianche, 
pavimento in gres effetto cemento. Elettrodomestici da includere: piano 
cottura induzione, forno, frigo, lavastoviglie. Impianto elettrico da 
aggiornare, idraulico invariato. Illuminazione LED a soffitto + sottopensile."

Then call submit_lead_data with all gathered fields.

End Message Template:
"Riepilogo Tecnico salvato! 
Ti ricontatteremo presto per un sopralluogo e la proposta economica. 
Grazie [Name]!"

[STATE MACHINE & TRANSITIONS - SYMMETRIC LOGIC]
Track conversation state based on tools used. Apply SYMMETRIC rules for both renders and quotes.

═══════════════════════════════════════════════════════════════
STATE 0: INITIAL (Nothing done yet)
═══════════════════════════════════════════════════════════════
- Condition: Neither generate_render nor submit_lead_data called
- Action: Determine user intent (MODE A for visualization, MODE B for quote)
- Next: Transition to STATE 1A or STATE 1B based on user's first request

═══════════════════════════════════════════════════════════════
STATE 1A: RENDER_ONLY (Render done, Quote NOT done)
═══════════════════════════════════════════════════════════════
- Condition: generate_render called successfully, submit_lead_data NOT called
- NEXT ACTION REQUIRED (NON-NEGOTIABLE):
  * IMMEDIATELY propose quote (complementary action)
  * DO NOT propose another render (already have one)
  
- Prompt Template:
  "✨ Ti piace questo rendering? 
  
  💰 **Vuoi realizzarlo davvero?** Posso prepararti un preventivo gratuito. 
  Mi servono solo 3-4 dettagli tecnici (piano, metratura, tipo di interventi). 
  
  Procediamo con il preventivo?"

- Critical Rules:
  ✅ Always propose quote after first render
  ❌ Never propose second render (no changes yet)
  ❌ Don't allow second render unless substantial modifications requested

═══════════════════════════════════════════════════════════════
STATE 1B: QUOTE_ONLY (Quote done, Render NOT done) 
═══════════════════════════════════════════════════════════════
- Condition: submit_lead_data called successfully, generate_render NOT called
- NEXT ACTION REQUIRED (NON-NEGOTIABLE):
  * IMMEDIATELY propose render (complementary action)
  * DO NOT propose another quote (already have one)
  
- Prompt Template:
  "✅ Dati salvati correttamente!
  
  🎨 **Vuoi vedere come verrebbe?** Posso generarti un rendering 3D fotorealistico 
  del progetto che hai in mente.
  
  Procediamo con la visualizzazione?"

- Critical Rules:
  ✅ Always propose render after first quote
  ❌ Never propose second quote (no changes yet)
  ❌ Don't allow second quote unless substantial modifications requested

═══════════════════════════════════════════════════════════════
STATE 2: COMPLETE (Both Render AND Quote done)
═══════════════════════════════════════════════════════════════
- Condition: Both generate_render AND submit_lead_data called successfully
- NEXT ACTION: Listen for modification requests, distinguish substantial vs minor

- Behavior Based on Change Type:
  
  🔄 SUBSTANTIAL CHANGES (New Project Scope):
  - Examples: 
    * "Invece voglio stile industriale, non moderno"
    * "Cambiamo ambiente: bagno invece di cucina"
    * "Progetto completamente diverso"
  - Action:
    ✅ Generate new render if requested
    ✅ CAN propose new quote (different scope)
    ✅ Collect new quote data if needed
    ✅ Treat as NEW iteration
  
  🎨 MINOR VARIATIONS (Same Project Scope):
  - Examples:
    * "Fammi vedere con pavimento pi\xf9 chiaro"
    * "Cambia colore divano"
    * "Mostrami variante con altra disposizione"
  - Action:
    ✅ Generate new render if requested
    ❌ DO NOT propose new quote (same project, data valid)
    ❌ DO NOT propose new render (user already asked)
    ✅ Just execute what user explicitly requests

- Prompt Template (After Completion):
  "Perfetto! Abbiamo il progetto visivo e il preventivo.
  
  Se vuoi esplorare un'opzione completamente diversa o apportare modifiche, 
  sono qui per aiutarti!"

═══════════════════════════════════════════════════════════════
ANTI-DUPLICATE RULES (Critical - Prevent Waste)
═══════════════════════════════════════════════════════════════
1. ❌ NEVER propose a tool that was JUST used
   - After render → propose QUOTE, not another render
   - After quote → propose RENDER, not another quote

2. ❌ NEVER propose same tool twice in same iteration
   - One render proposal per iteration
   - One quote proposal per iteration

3. ❌ NEVER allow second use without modifications
   - "Want another render?" → NO (unless changes requested)
   - "Want another quote?" → NO (unless project changed)

4. ✅ ONLY allow tool reuse on:
   - User explicitly requests it with substantial changes
   - New project scope identified

═══════════════════════════════════════════════════════════════
SEQUENCE-AWARE RULES (Bidirectional & Symmetric)
═══════════════════════════════════════════════════════════════

FOR QUOTES:
1. Render FIRST → Quote NOT done: ✅ Propose quote (STATE 1A)
2. Quote FIRST → Render AFTER: ❌ Never propose second quote (STATE 1B → 2)
3. Both COMPLETE → Substantial changes: ✅ Can propose new quote
4. Both COMPLETE → Minor variations: ❌ Never propose quote

FOR RENDERS (SYMMETRIC):
1. Quote FIRST → Render NOT done: ✅ Propose render (STATE 1B)
2. Render FIRST → Quote AFTER: ❌ Never propose second render (STATE 1A → 2)
3. Both COMPLETE → Substantial changes: ✅ Can propose new render
4. Both COMPLETE → Minor variations: ❌ Never propose render

═══════════════════════════════════════════════════════════════
QUOTA LIMITS (Enforced by System)
═══════════════════════════════════════════════════════════════
- Maximum 2 renders per 24h per IP
- Maximum 2 quotes per 24h per IP
- If user hits limit: Relay error message politely, explain reset time
- Don't encourage quota waste: Follow anti-duplicate rules strictly

═══════════════════════════════════════════════════════════════
EXAMPLES - CORRECT FLOWS
═══════════════════════════════════════════════════════════════

Example 1: Render-First (Standard)
  User: "Show me my kitchen" → AI generates render → STATE 1A
  AI: "Ti piace? Vuoi un preventivo?" ← Propose quote ✅
  User: "Yes" → AI collects data → STATE 2 COMPLETE
  AI: "Perfetto! Hai tutto." ← Don't propose render ❌

Example 2: Quote-First (Symmetric)
  User: "I want a quote for bathroom" → AI collects data → STATE 1B
  AI: "Dati salvati! Vuoi vedere rendering?" ← Propose render ✅
  User: "Yes" → AI generates render → STATE 2 COMPLETE
  AI: "Ecco il rendering!" ← Don't propose quote ❌

Example 3: Substantial Modification
  STATE 2 COMPLETE (modern kitchen render + quote)
  User: "Actually, industrial style instead"
  AI: Recognizes SUBSTANTIAL → generates new render
  AI: "Nuovo stile! Vuoi preventivo aggiornato?" ← Can propose ✅

Example 4: Minor Variation (Anti-Pattern)
  STATE 2 COMPLETE
  User: "Show lighter floors"
  AI: Recognizes MINOR → generates new render
  AI: "Ecco la variante!" ← Don't propose anything ❌
`;async function u(t){console.log("---> API /api/chat HIT");let o=(t.headers.get("x-forwarded-for")??"127.0.0.1").split(",")[0],{allowed:n,remaining:l,resetAt:u}=await (0,s.checkRateLimit)(o);if(!n)return console.warn(`[RateLimit] IP ${o} exceeded rate limit`),new Response("Too Many Requests - Please wait before trying again",{status:429,headers:{"Content-Type":"text/plain","X-RateLimit-Limit":"20","X-RateLimit-Remaining":l.toString(),"X-RateLimit-Reset":u.toISOString(),"Retry-After":Math.ceil((u.getTime()-Date.now())/1e3).toString()}});console.log(`[RateLimit] IP ${o} allowed - ${l} requests remaining`);try{let{messages:n,images:s,imageUrls:c,sessionId:p}=await t.json();if(!p||"string"!=typeof p||0===p.trim().length)return console.error("[API] Missing or invalid sessionId"),new Response(JSON.stringify({error:"sessionId is required",details:"A valid session identifier must be provided"}),{status:400,headers:{"Content-Type":"application/json"}});console.log("API Request Debug:",{hasMessages:!!n,messagesLength:n?.length,hasImages:!!s,hasImageUrls:!!c,imageUrlsCount:c?.length||0,sessionId:p}),await (0,r.ensureSession)(p);let g=await (0,r.getConversationContext)(p,10),h=Array.isArray(n)?n:[],m=h[h.length-1];console.log("🔍 [DEBUG RAW MESSAGE]:",JSON.stringify(m,null,2));let f=[...g,{role:m?.role||"user",content:m?.content||""}];if(s&&Array.isArray(s)&&s.length>0){let e=f[f.length-1];if(e&&"user"===e.role){let t="string"==typeof e.content?e.content:"";e.content=[{type:"text",text:t},...s.map(e=>({type:"image",image:e}))]}}let v=m?.parts&&Array.isArray(m.parts)?m.parts.filter(e=>"text"===e.type).map(e=>e.text).join("\n"):m?.content&&Array.isArray(m.content)?m.content.filter(e=>"text"===e.type).map(e=>e.text).join("\n"):"string"==typeof m?.content?m.content:"";if(s&&Array.isArray(s)&&s.length>0)if(c&&Array.isArray(c)&&c.length>0){let e=c[0];v+=` [Immagine allegata: ${e}]`,console.log("[API] ✅ Appended [Immagine allegata] marker with public URL:",e)}else v+=" [Immagine allegata]",console.log("[API] Appended [Immagine allegata] marker (no public URL available)");console.log("[Firestore] Attempting to save user message...",{sessionId:p,content:v.substring(0,50)}),console.log(`[API] Parsed User Message: "${v}"`),(0,r.saveMessage)(p,"user",v).then(()=>console.log("[Firestore] ✅ User message saved successfully")).catch(e=>{console.error("[Firestore] ❌ ERROR saving user message:",e),console.error("[Firestore] Error details:",{message:e.message,stack:e.stack,code:e.code})});let y=(0,i.createGoogleGenerativeAI)({apiKey:process.env.GEMINI_API_KEY||""});f.map(e=>"string"==typeof e.content?e.content.toLowerCase():"").join(" ");let{createChatTools:E}=await e.A(79911),T=E(p,o);console.log("[Tools] ✅ Tools ENABLED (always available)");let S=new ReadableStream({async start(e){let t=(t,o)=>{let i=JSON.stringify(o);e.enqueue(new TextEncoder().encode(`${t}:${i} 
`))},o="";try{for await(let e of(0,a.streamText)({model:y(process.env.CHAT_MODEL_VERSION||"gemini-2.5-flash"),system:d,messages:f,tools:T,maxSteps:5,maxToolRoundtrips:2,experimental_providerMetadata:{sessionId:p},async onToolCall({toolCall:e,toolResult:i}){if(console.log("🔧 [Tool Call]",e.toolName),"get_market_prices"===e.toolName&&i){let e="string"==typeof i?i:JSON.stringify(i);console.log("📤 [Direct Stream] Writing market prices directly to chat"),t("0",e),o+=e}},onFinish:async({text:e,toolResults:t})=>{console.log("[onFinish] 🔍 Streamed Content Length:",o.length),console.log("[onFinish] Saving assistant message");try{await (0,r.saveMessage)(p,"assistant",o,{toolCalls:t?.map(e=>({name:e.toolName||"unknown",args:e.args||{},result:e.result||{}}))}),console.log("[onFinish] ✅ Message saved successfully")}catch(e){console.error("[onFinish] ❌ CRITICAL: Failed to save message",e)}}}).fullStream){if("text-delta"===e.type&&(o+=e.text,t("0",e.text)),"tool-result"===e.type&&"get_market_prices"===e.toolName)try{let i=e.result||e.output,a="string"==typeof i?i:JSON.stringify(i);console.log("📤 [Market Prices] Writing directly to stream"),console.log("📤 [Market Prices] Content length:",a.length),t("0",a),o+=a}catch(e){console.error("❌ [Market Prices] Failed to write to stream:",e)}if("tool-result"===e.type&&"generate_render"===e.toolName)try{let i=e.result||e.output;if(i?.status==="error"){let e="\n\n⚠️ Mi dispiace, il servizio di rendering è temporaneamente non disponibile. Riprova tra qualche minuto.\n\n";console.error("[Stream] Tool returned error:",i.error),o+=e,t("0",e)}else if(i?.status==="success"&&i?.imageUrl){let e=`

![](${i.imageUrl}) 

`;console.log("[Stream] Injecting image to stream:",i.imageUrl),o+=e,t("0",e)}else{let e="\n\n⚠️ Si è verificato un errore imprevisto. Riprova.\n\n";console.warn("[Stream] Unexpected tool result format:",i),o+=e,t("0",e)}}catch(i){let e="\n\n⚠️ Si è verificato un errore durante la generazione. Riprova.\n\n";console.error("[Stream] Error processing tool result:",i),o+=e,t("0",e)}if("tool-call"===e.type){let o={toolCallId:e.toolCallId,toolName:e.toolName,args:e.args||e.input||{}};t("9",o)}if("tool-result"===e.type){let o={toolCallId:e.toolCallId,result:e.result};t("a",o)}}e.close()}catch(o){t("3",{error:o.message}),console.error("Stream Error:",o),e.close()}}});return new Response(S,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","X-Vercel-AI-Data-Stream":"v1","X-RateLimit-Limit":"20","X-RateLimit-Remaining":l.toString(),"X-RateLimit-Reset":u.toISOString()}})}catch(e){return console.error("Chat API Error Details:",e),new Response(JSON.stringify({error:"Internal Server Error",details:e.message,stack:e.stack}),{status:500,headers:{"Content-Type":"application/json"}})}}e.s(["POST",()=>u,"dynamic",0,"force-dynamic","maxDuration",0,60,"runtime",0,"nodejs"]),o()}catch(e){o(e)}},!1),63194,e=>e.a(async(t,o)=>{try{var i=e.i(47909),a=e.i(74017),n=e.i(96250),r=e.i(59756),s=e.i(61916),l=e.i(14444),u=e.i(37092),d=e.i(69741),c=e.i(16795),p=e.i(87718),g=e.i(95169),h=e.i(47587),m=e.i(66012),f=e.i(70101),v=e.i(74838),y=e.i(10372),E=e.i(93695);e.i(52474);var T=e.i(220),S=e.i(12113),R=t([S]);[S]=R.then?(await R)():R;let C=new i.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/chat/route",pathname:"/api/chat",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/web_client/app/api/chat/route.ts",nextConfigOutput:"",userland:S}),{workAsyncStorage:A,workUnitAsyncStorage:O,serverHooks:z}=C;function I(){return(0,n.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:O})}async function b(e,t,o){C.isDev&&(0,r.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let i="/api/chat/route";i=i.replace(/\/index$/,"")||"/";let n=await C.prepare(e,t,{srcPage:i,multiZoneDraftMode:!1});if(!n)return t.statusCode=400,t.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve()),null;let{buildId:S,params:R,nextConfig:I,parsedUrl:b,isDraftMode:A,prerenderManifest:O,routerServerContext:z,isOnDemandRevalidate:N,revalidateOnlyGenerated:x,resolvedPathname:w,clientReferenceManifest:M,serverActionsManifest:_}=n,P=(0,d.normalizeAppPath)(i),D=!!(O.dynamicRoutes[P]||O.routes[w]),L=async()=>((null==z?void 0:z.render404)?await z.render404(e,t,b,!1):t.end("This page could not be found"),null);if(D&&!A){let e=!!O.routes[w],t=O.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(I.experimental.adapterPath)return await L();throw new E.NoFallbackError}}let U=null;!D||C.isDev||A||(U=w,U="/index"===U?"/":U);let k=!0===C.isDev||!D,q=D&&!k;_&&M&&(0,l.setReferenceManifestsSingleton)({page:i,clientReferenceManifest:M,serverActionsManifest:_,serverModuleMap:(0,u.createServerModuleMap)({serverActionsManifest:_})});let j=e.method||"GET",F=(0,s.getTracer)(),G=F.getActiveScopeSpan(),H={params:R,prerenderManifest:O,renderOpts:{experimental:{authInterrupts:!!I.experimental.authInterrupts},cacheComponents:!!I.cacheComponents,supportsDynamicResponse:k,incrementalCache:(0,r.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:I.cacheLife,waitUntil:o.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,o,i)=>C.onRequestError(e,t,i,z)},sharedContext:{buildId:S}},B=new c.NodeNextRequest(e),V=new c.NodeNextResponse(t),$=p.NextRequestAdapter.fromNodeNextRequest(B,(0,p.signalFromNodeResponse)(t));try{let n=async e=>C.handle($,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let o=F.getRootSpanAttributes();if(!o)return;if(o.get("next.span_type")!==g.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${o.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=o.get("next.route");if(a){let t=`${j} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${j} ${i}`)}),l=!!(0,r.getRequestMeta)(e,"minimalMode"),u=async r=>{var s,u;let d=async({previousCacheEntry:a})=>{try{if(!l&&N&&x&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await n(r);e.fetchMetrics=H.renderOpts.fetchMetrics;let s=H.renderOpts.pendingWaitUntil;s&&o.waitUntil&&(o.waitUntil(s),s=void 0);let u=H.renderOpts.collectedTags;if(!D)return await (0,m.sendResponse)(B,V,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(i.headers);u&&(t[y.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let o=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=y.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,a=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=y.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:T.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:o,expire:a}}}}catch(t){throw(null==a?void 0:a.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:i,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:N})},z),t}},c=await C.handleResponse({req:e,nextConfig:I,cacheKey:U,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:x,responseGenerator:d,waitUntil:o.waitUntil,isMinimalMode:l});if(!D)return null;if((null==c||null==(s=c.value)?void 0:s.kind)!==T.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(u=c.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});l||t.setHeader("x-nextjs-cache",N?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,f.fromNodeOutgoingHttpHeaders)(c.value.headers);return l&&D||p.delete(y.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,v.getCacheControlHeader)(c.cacheControl)),await (0,m.sendResponse)(B,V,new Response(c.value.body,{headers:p,status:c.value.status||200})),null};G?await u(G):await F.withPropagatedContext(e.headers,()=>F.trace(g.BaseServerSpan.handleRequest,{spanName:`${j} ${i}`,kind:s.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},u))}catch(t){if(t instanceof E.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:N})}),D)throw t;return await (0,m.sendResponse)(B,V,new Response(null,{status:500})),null}}e.s(["handler",()=>b,"patchFetch",()=>I,"routeModule",()=>C,"serverHooks",()=>z,"workAsyncStorage",()=>A,"workUnitAsyncStorage",()=>O]),o()}catch(e){o(e)}},!1)];

//# sourceMappingURL=_2551f978._.js.map