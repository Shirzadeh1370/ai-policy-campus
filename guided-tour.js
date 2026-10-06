(function(){
"use strict";
const $=id=>document.getElementById(id);
const docs=window.aipcDocuments=window.aipcDocuments||{};
const SPEAKER_HANDOFF_MS=160;
const state={kind:null,topics:[],lines:[],index:0,playing:false,paused:false,run:0,pendingHandoff:false};
let kokoroEngine=null,kokoroLoadPromise=null,activeAudio=null,activeAudioUrl="",handoffTimer=null,generationTail=Promise.resolve();
const naturalBuffer=new Map();
const handoffMeasurements=[];

let finalPodcast={url:"",audio:null,segments:[],ready:false,run:0};
function clearFinalPodcast(){
 if(finalPodcast.audio){finalPodcast.audio.pause();finalPodcast.audio.src="";finalPodcast.audio=null}
 if(finalPodcast.url){URL.revokeObjectURL(finalPodcast.url)}
 finalPodcast={url:"",audio:null,segments:[],ready:false,run:0};
}
function encodeWav(channels,sampleRate){
 const numChannels=channels.length,frames=channels[0].length;
 const buffer=new ArrayBuffer(44+frames*numChannels*2),view=new DataView(buffer);
 const write=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i))};
 write(0,"RIFF");view.setUint32(4,36+frames*numChannels*2,true);write(8,"WAVE");write(12,"fmt ");
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,numChannels,true);
 view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*numChannels*2,true);
 view.setUint16(32,numChannels*2,true);view.setUint16(34,16,true);write(36,"data");
 view.setUint32(40,frames*numChannels*2,true);
 let off=44;
 for(let i=0;i<frames;i++)for(let c=0;c<numChannels;c++){
   const s=Math.max(-1,Math.min(1,channels[c][i]||0));
   view.setInt16(off,s<0?s*0x8000:s*0x7fff,true);off+=2;
 }
 return new Blob([buffer],{type:"audio/wav"});
}
async function buildSinglePodcast(){
 if(!state.lines.length||$("language").value!=="en")return;
 stop(); clearFinalPodcast();
 const btn=document.getElementById("buildPodcast");
 const bar=document.getElementById("podcastBuildBar");
 const txt=document.getElementById("podcastBuildText");
 if(btn){btn.disabled=true;btn.textContent="Creating Podcast…"}
 setTourPerformanceMode(true);
 try{
   const engine=await getKokoro(),ctx=new (window.AudioContext||window.webkitAudioContext)();
   const decoded=[],gapSec=.18,speed=Number($("tourSpeed").value||1);
   for(let i=0;i<state.lines.length;i++){
     const line=state.lines[i],pct=Math.round((i/state.lines.length)*85);
     if(bar)bar.style.width=pct+"%";
     if(txt)txt.textContent=`Creating voice ${i+1} of ${state.lines.length}…`;
     $("tourStatus").textContent=`Creating complete podcast ${i+1}/${state.lines.length}…`;
     const raw=await engine.generate(line.text.slice(0,260),{voice:line.speaker==="STUDENT"?"am_michael":"af_heart",speed});
     const blob=raw.toBlob(),arr=await blob.arrayBuffer(),buf=await ctx.decodeAudioData(arr.slice(0));
     decoded.push({buf,lineIndex:i});
     await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,10)));
   }
   const sampleRate=decoded[0]?.buf.sampleRate||24000,numChannels=Math.max(...decoded.map(x=>x.buf.numberOfChannels),1);
   const gapFrames=Math.round(sampleRate*gapSec);
   const totalFrames=decoded.reduce((n,x)=>n+x.buf.length,0)+gapFrames*Math.max(0,decoded.length-1);
   const chans=Array.from({length:numChannels},()=>new Float32Array(totalFrames));
   const segments=[];let cursor=0;
   for(let i=0;i<decoded.length;i++){
     const b=decoded[i].buf,start=cursor/sampleRate;
     for(let c=0;c<numChannels;c++){
       const src=b.getChannelData(Math.min(c,b.numberOfChannels-1));chans[c].set(src,cursor);
     }
     cursor+=b.length;
     segments.push({lineIndex:decoded[i].lineIndex,start,end:cursor/sampleRate});
     if(i<decoded.length-1)cursor+=gapFrames;
   }
   if(bar)bar.style.width="92%";if(txt)txt.textContent="Joining all voices into one audio file…";
   const wav=encodeWav(chans,sampleRate),url=URL.createObjectURL(wav);
   finalPodcast={url,audio:null,segments,ready:true,run:state.run};
   if(bar)bar.style.width="100%";
   if(txt)txt.textContent="✓ Podcast Ready — one complete audio file";
   $("tourStatus").textContent="✓ Podcast Ready. Press Play for continuous playback.";
   if(btn){btn.textContent="✓ Podcast Ready";btn.disabled=true}
   await ctx.close();
 }catch(e){
   console.error("Podcast build failed",e);
   $("tourStatus").textContent="Podcast build could not finish. Normal Guided Tour playback is still available.";
   if(txt)txt.textContent="Build stopped. You can still use normal Play.";
   if(btn){btn.disabled=false;btn.textContent="✨ Create Complete Podcast"}
 }finally{setTourPerformanceMode(false)}
}
function syncPodcastUI(time){
 if(!finalPodcast.ready)return;
 let seg=finalPodcast.segments[0];
 for(const s of finalPodcast.segments){if(time>=s.start)seg=s;else break}
 if(seg&&state.index!==seg.lineIndex){state.index=seg.lineIndex;renderLine()}
}
function playFinalPodcast(){
 if(!finalPodcast.ready)return false;
 if(finalPodcast.audio){
   finalPodcast.audio.play();state.playing=true;state.paused=false;setTourPerformanceMode(true);return true;
 }
 const a=new Audio(finalPodcast.url);finalPodcast.audio=a;activeAudio=a;
 a.ontimeupdate=()=>syncPodcastUI(a.currentTime);
 a.onplay=()=>{state.playing=true;state.paused=false;setTourPerformanceMode(true);$("tourStatus").textContent="Playing complete prepared podcast…"};
 a.onpause=()=>{if(!a.ended)state.paused=true};
 a.onended=()=>{state.playing=false;state.paused=false;setTourPerformanceMode(false);$("tourStatus").textContent="✓ Podcast finished."};
 a.onerror=()=>{$("tourStatus").textContent="Prepared podcast could not play. Normal Guided Tour remains available."};
 a.play();return true;
}

const copy={
en:{title:"Your guided course conversation",sub:"Built only from the document you selected.",syllabus:"📘 Start Syllabus Tour",assignment:"📝 Start Assignment Tour",show:"Show transcript",hide:"Hide transcript",ready:"Document ready. Choose Play when you are ready.",noVoice:"No matching browser voice was found. The transcript and visual cards still work.",fallback:"The tour dialogue is in English; the controls remain in your selected language."},
fa:{title:"گفت‌وگوی راهنمای درس شما",sub:"فقط از متن سند انتخاب‌شده ساخته شده است.",syllabus:"📘 شروع تور سیلابس",assignment:"📝 شروع تور اسایمنت",show:"نمایش متن گفتگو",hide:"پنهان‌کردن متن گفتگو",ready:"سند آماده است. هر وقت آماده بودی پخش را بزن.",noVoice:"صدای مناسب این زبان روی دستگاه پیدا نشد؛ متن و کارت‌ها همچنان کار می‌کنند.",fallback:"گفت‌وگوی تور فعلاً انگلیسی است؛ کنترل‌ها با زبان انتخابی شما نمایش داده می‌شوند."},
es:{title:"Conversación guiada del curso",sub:"Creada solo con el documento seleccionado.",syllabus:"📘 Recorrido del programa",assignment:"📝 Recorrido de la tarea",show:"Mostrar transcripción",hide:"Ocultar transcripción",ready:"Documento listo. Pulsa Reproducir cuando quieras.",fallback:"El diálogo está en inglés; los controles siguen en tu idioma."},
ar:{title:"محادثة إرشادية للمقرر",sub:"مبنية فقط على المستند الذي اخترته.",syllabus:"📘 جولة المنهج",assignment:"📝 جولة المهمة",show:"عرض النص",hide:"إخفاء النص",ready:"المستند جاهز. اضغط تشغيل عندما تكون مستعدًا.",fallback:"الحوار باللغة الإنجليزية، وتبقى عناصر التحكم بلغتك."},
fr:{title:"Conversation guidée du cours",sub:"Créée uniquement à partir du document choisi.",syllabus:"📘 Visite du syllabus",assignment:"📝 Visite du devoir",show:"Afficher la transcription",hide:"Masquer la transcription",ready:"Document prêt. Lancez la lecture quand vous voulez.",fallback:"Le dialogue est en anglais ; les commandes restent dans votre langue."},
de:{title:"Geführtes Kursgespräch",sub:"Nur aus dem ausgewählten Dokument erstellt.",syllabus:"📘 Lehrplan-Tour",assignment:"📝 Aufgaben-Tour",show:"Transkript anzeigen",hide:"Transkript ausblenden",ready:"Dokument bereit. Starten Sie, wenn Sie möchten.",fallback:"Der Dialog ist auf Englisch; die Bedienelemente bleiben in Ihrer Sprache."},
zh:{title:"课程引导对话",sub:"仅根据您选择的文档生成。",syllabus:"📘 教学大纲导览",assignment:"📝 作业导览",show:"显示文字稿",hide:"隐藏文字稿",ready:"文档已准备好。准备后点击播放。",fallback:"对话使用英语；控件仍使用您选择的语言。"},
hi:{title:"आपका निर्देशित पाठ्यक्रम संवाद",sub:"केवल चुने हुए दस्तावेज़ से बनाया गया।",syllabus:"📘 सिलेबस टूर",assignment:"📝 असाइनमेंट टूर",show:"ट्रांसक्रिप्ट दिखाएँ",hide:"ट्रांसक्रिप्ट छिपाएँ",ready:"दस्तावेज़ तैयार है। तैयार होने पर चलाएँ।",fallback:"संवाद अंग्रेज़ी में है; नियंत्रण आपकी भाषा में हैं।"},
tr:{title:"Rehberli ders konuşmanız",sub:"Yalnızca seçtiğiniz belgeden oluşturuldu.",syllabus:"📘 Ders planı turu",assignment:"📝 Ödev turu",show:"Metni göster",hide:"Metni gizle",ready:"Belge hazır. Hazır olduğunuzda Oynat'a basın.",fallback:"Diyalog İngilizcedir; kontroller seçtiğiniz dilde kalır."},
ur:{title:"آپ کی رہنمائی شدہ کورس گفتگو",sub:"صرف منتخب دستاویز سے بنائی گئی ہے۔",syllabus:"📘 نصاب کا دورہ",assignment:"📝 اسائنمنٹ کا دورہ",show:"متن دکھائیں",hide:"متن چھپائیں",ready:"دستاویز تیار ہے۔ تیار ہوں تو پلے دبائیں۔",fallback:"گفتگو انگریزی میں ہے؛ کنٹرول آپ کی زبان میں رہتے ہیں۔"}
};
const normalize=t=>String(t||"").replace(/\r/g,"").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
const lines=t=>normalize(t).split(/\n+/).map(x=>x.trim()).filter(x=>x.length>2);
const clip=(s,n=260)=>s.length>n?s.slice(0,n).replace(/\s+\S*$/,"")+"…":s;
function find(text,patterns,max=3){const all=lines(text),hits=[];for(let i=0;i<all.length;i++){if(patterns.some(p=>p.test(all[i]))){const value=[all[i],all[i+1],all[i+2]].filter(Boolean).join(" ");if(value.length>8&&!hits.some(h=>h===value))hits.push(clip(value));if(hits.length>=max)break}}return hits}
function emails(text){return [...new Set((text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)||[]))].slice(0,3)}
const policyPatterns={red:[/\b(no|not|never|prohibit|forbid|unauthorized).{0,45}(ai|chatgpt|generative)/i,/(ai|chatgpt|generative).{0,45}\b(not allowed|prohibited|forbidden)/i],green:[/(ai|chatgpt|generative).{0,50}\b(may|can|allowed|permitted)/i,/acceptable use.{0,60}(ai|chatgpt)/i],limits:[/(cite|disclose|acknowledge|permission|instructor|only|unless|must).{0,55}(ai|chatgpt|generative)/i,/(ai|chatgpt|generative).{0,55}(cite|disclose|acknowledge|permission|only|must)/i]};
function policyResult(primary,secondary){for(const source of [{text:primary,label:"Assignment instructions"},{text:secondary,label:"Course syllabus"}]){if(!source.text)continue;const red=find(source.text,policyPatterns.red,1)[0];if(red)return{status:"red",label:"🔴 NOT ALLOWED",source:source.label,evidence:red};const green=find(source.text,policyPatterns.green,1)[0],limit=find(source.text,policyPatterns.limits,1)[0];if(green)return{status:limit?"yellow":"green",label:limit?"🟡 CHECK CONDITIONS":"🟢 APPEARS ALLOWED",source:source.label,evidence:limit||green}}
return{status:"yellow",label:"🟡 CHECK FIRST",source:"No explicit rule found",evidence:"The uploaded documents do not clearly authorize this AI use. Ask the professor before using AI."}}
function topic(key,title,icon,items,status){return{key,title,icon,items:items.filter(Boolean),status}}
function syllabusTopics(text){const out=[];const title=lines(text)[0]||"Course overview";out.push(topic("overview","Course overview","🎓",[clip(title,160),...find(text,[/course description|overview|catalog description/i],2)]));
const contact=[...find(text,[/instructor|professor|faculty|office hours|contact/i],3),...emails(text)];if(contact.length)out.push(topic("instructor","Instructor & contact","👩‍🏫",contact));
const schedule=find(text,[/meeting|schedule|class time|location|room|online|zoom/i],4);if(schedule.length)out.push(topic("schedule","Schedule & location","🗓️",schedule));
const materials=find(text,[/textbook|materials|required text|software|technology/i],4);if(materials.length)out.push(topic("materials","Materials","📚",materials));
const dates=find(text,[/due date|deadline|midterm|final exam|important date|calendar/i],5);if(dates.length)out.push(topic("dates","Important dates","📅",dates));
const grading=find(text,[/grading|grade scale|points|percentage|assessment/i],5);if(grading.length)out.push(topic("grading","Grading","📊",grading));
const work=find(text,[/assignment|project|quiz|exam|discussion|homework/i],5);if(work.length)out.push(topic("work","Assignments & assessments","📝",work));
const attendance=find(text,[/attendance|absence|late work|participation|make.?up/i],5);if(attendance.length)out.push(topic("attendance","Attendance & late work","⏰",attendance));
const integrity=find(text,[/academic integrity|plagiarism|cheating|honesty/i],4);if(integrity.length)out.push(topic("integrity","Academic integrity","🛡️",integrity));
const pr=policyResult("",text);out.push(topic("ai","AI-use policy","🤖",[pr.evidence],pr));
const support=find(text,[/disability|accessibility|accommodation|tutoring|support service|counsel/i],4);if(support.length)out.push(topic("support","Support & accessibility","♿",support));
return out}
function assignmentTopics(text){const out=[];const first=lines(text)[0]||"Assignment";out.push(topic("overview","Assignment overview","📝",[clip(first,160),...find(text,[/purpose|objective|overview|learning outcome/i],3)]));
[["deliverable","What to submit","📦",/deliverable|submit|submission|turn in|upload/i],["due","Due date","📅",/due|deadline|by \w+day/i],["format","Format & length","📐",/word count|page|length|format|font|spacing|file type/i],["sources","Sources & evidence","🔎",/source|reference|citation|bibliography|evidence/i],["rubric","Rubric & grading","📊",/rubric|criteria|points|grade|evaluation/i],["steps","Recommended steps","🧭",/step|first|then|draft|revise|process/i],["warnings","Restrictions & warnings","⚠️",/do not|must not|required|late|penalty|warning/i]].forEach(([k,t,i,p])=>{const x=find(text,[p],5);if(x.length)out.push(topic(k,t,i,x))});
const pr=policyResult(text,docs.syllabus?.text||"");out.push(topic("ai","AI-use rules","🤖",[pr.evidence,`Source checked first: ${pr.source}.`],pr));
out.push(topic("next","Your next steps","✅",["Review the deliverable and deadline above.","Check every rubric item before submitting.",pr.status==="yellow"?"Ask your professor about AI before using it.":"Follow the stated AI rule and keep your own drafts."]));return out}
function makeDialogue(topics,length){const take=length==="quick"?topics.slice(0,Math.min(4,topics.length)):length==="detailed"?topics:topics.slice(0,Math.min(7,topics.length));const dialogue=[];take.forEach((t,n)=>{dialogue.push({speaker:"GUIDE",topic:n,text:`Let's look at ${t.title.toLowerCase()}. ${t.items[0]||"This section was not clearly found in the document."}`});dialogue.push({speaker:"STUDENT",topic:n,text:n===take.length-1?"What should I do next?":"What is the most important thing for me to remember here?"});const detail=t.items.slice(1,length==="detailed"?4:2).join(" ");dialogue.push({speaker:"GUIDE",topic:n,text:detail||"Use the original document as your source, and ask your professor if anything is unclear."})});return{topics:take,dialogue}}
async function readFile(kind,file){if(!file)return;const name=file.name.toLowerCase();if(name.endsWith(".pdf")){$("tourStatus").textContent="Reading PDF text locally…";return}
try{let text="";if(name.endsWith(".txt"))text=await file.text();else if(name.endsWith(".docx")){if(!window.mammoth)throw new Error("Word reader not ready");text=(await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value}else throw new Error("Legacy .doc files are not supported; save as .docx or PDF.");register({kind,name:file.name,text,format:name.split(".").pop()})}catch(e){setReady(kind,false);$("tourStatus").textContent=e.message}}
function register(doc){doc.text=normalize(doc.text);if(doc.text.length<30){$("tourStatus").textContent="The document did not contain enough readable text.";return}docs[doc.kind]=doc;setReady(doc.kind,true);$("tourStatus").textContent=`${doc.name} is ready for a guided tour.`}
function setReady(kind,ready){const b=$(kind==="syllabus"?"syllabusTourButton":"assignmentTourButton");if(b)b.disabled=!ready}
function openTour(kind){if(!docs[kind])return;stop();clearFinalPodcast();state.kind=kind;const length=document.querySelector('input[name="tourLength"]:checked')?.value||"standard";const built=makeDialogue(kind==="syllabus"?syllabusTopics(docs[kind].text):assignmentTopics(docs[kind].text),length);state.topics=built.topics;state.lines=built.dialogue;state.index=0;state.lines=compactTourLines(state.lines); renderAll();$("guidedTour").classList.remove("hidden");$("guidedTour").scrollIntoView({behavior:"smooth",block:"start"});$("tourStatus").textContent=(copy[$("language").value]||copy.en).ready;
if($("language").value==="en"){
 const ready=document.getElementById("naturalVoiceReady");
 if(ready) ready.textContent="⏳ Preparing natural voices…";
 getKokoro().then(()=>{
   if(ready) ready.textContent="✓ Natural Voice Ready";
   $("tourStatus").textContent="✓ Natural Voice Ready. Press Play when you are ready.";
 }).catch(()=>{
   if(ready) ready.textContent="Browser voice fallback ready";
   $("tourStatus").textContent="Natural voice could not preload. Browser voice fallback is ready.";
 });
}
}


function compactTourLines(lines){
  if(!Array.isArray(lines)) return lines;
  const cleaned=lines.map(line=>{
    if(!line || typeof line.text!=="string") return line;
    let t=line.text.replace(/\s+/g," ").trim();
    // Keep each spoken turn concise for live demo.
    const sentences=t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [t];
    if(sentences.length>2) t=sentences.slice(0,2).join(" ").trim();
    if(t.length>260) t=t.slice(0,257).replace(/\s+\S*$/,"")+"…";
    return {...line,text:t};
  });
  // Avoid an overlong tour while preserving all major topics.
  return cleaned.slice(0,18);
}

function preShowLine(i){
  const line=state.lines && state.lines[i];
  if(!line) return;
  const topic=line.topic || line.section || line.title;
  if(!topic) return;
  const title=document.getElementById("tourTopicTitle") || document.getElementById("tourSectionTitle");
  if(title && title.textContent!==topic) title.textContent=topic;
}
function renderAll(){$("tourTopics").innerHTML=state.topics.map((t,i)=>`<button type="button" data-topic="${i}">${t.icon} ${escapeHtml(t.title)}</button>`).join("");$("tourTranscript").innerHTML=state.lines.map((l,i)=>`<li data-line="${i}"><b>${l.speaker}</b>${escapeHtml(l.text)}</li>`).join("");renderLine()}
function renderLine(){if(!state.lines.length)return;const l=state.lines[state.index],t=state.topics[l.topic];$("tourTopicLabel").textContent=t.title;$("tourIcon").textContent=t.icon;$("tourCardTitle").textContent=t.title;$("tourCardItems").innerHTML=t.items.map(x=>`<li>${escapeHtml(x)}</li>`).join("");const p=$("tourPolicyStatus");if(t.status){p.className=`tour-policy-status ${t.status.status}`;p.textContent=`${t.status.label} — ${t.status.source}`;}else p.className="tour-policy-status hidden";const box=$("tourCurrentLine");box.className="tour-current-line "+(l.speaker==="STUDENT"?"student":"guide");box.innerHTML=`<b>${l.speaker}</b><p>${escapeHtml(l.text)}</p>`;document.querySelectorAll("#tourTopics button").forEach((b,i)=>b.classList.toggle("active",i===l.topic));document.querySelectorAll("#tourTranscript li").forEach((x,i)=>x.classList.toggle("active",i===state.index));document.querySelector("#tourTranscript li.active")?.scrollIntoView({block:"nearest"})}
function voices(){return speechSynthesis.getVoices()||[]}
function finishLine(run,endedAt=performance.now()){if(run!==state.run||!state.playing)return;if(state.index>=state.lines.length-1){state.playing=false;state.pendingHandoff=false;$("tourStatus").textContent="Tour complete. You can replay or choose any topic.";return}state.pendingHandoff=true;if(!naturalBuffer.get(state.index+1)?.ready)$("tourStatus").textContent="Preparing next voice…";scheduleHandoff(run,endedAt)}
function scheduleHandoff(run,endedAt){clearTimeout(handoffTimer);if(state.paused||run!==state.run||!state.playing)return;handoffTimer=setTimeout(()=>{handoffTimer=null;if(state.paused||run!==state.run||!state.playing)return;state.pendingHandoff=false;state.index++;requestAnimationFrame(()=>{renderLine();requestAnimationFrame(()=>speakCurrent(endedAt))})},SPEAKER_HANDOFF_MS)}
async function getKokoro(){if(kokoroEngine)return kokoroEngine;if(kokoroLoadPromise)return kokoroLoadPromise;$("tourStatus").textContent="Loading the free natural voice for the first time… The model stays cached in this browser.";kokoroLoadPromise=import("./vendor/kokoro.web.js").then(({KokoroTTS})=>KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q8",device:"wasm",progress_callback:p=>{if(p?.status==="progress"&&p.total){const percent=Math.round(100*p.loaded/p.total);$("tourStatus").textContent=`Loading free natural voice… ${percent}%`}}})).then(engine=>(kokoroEngine=engine)).catch(error=>{kokoroLoadPromise=null;throw error});return kokoroLoadPromise}
function clearNaturalAudio(){if(activeAudio){activeAudio.onended=null;activeAudio.onerror=null;activeAudio.pause();activeAudio=null}if(activeAudioUrl){URL.revokeObjectURL(activeAudioUrl);activeAudioUrl=""}}
function clearNaturalBuffer(){for(const entry of naturalBuffer.values())if(entry.url)URL.revokeObjectURL(entry.url);naturalBuffer.clear()}
function prepareNatural(index,run){if(index<0||index>=state.lines.length)return null;const existing=naturalBuffer.get(index);if(existing&&existing.run===run)return existing.promise;const entry={run,index,ready:false,url:"",promise:null};entry.promise=generationTail.then(async()=>{const engine=await getKokoro();if(run!==state.run)throw new Error("stale tour run");const line=state.lines[index],speed=Number($("tourSpeed").value||1);const raw=await engine.generate(line.text.slice(0,220),{voice:line.speaker==="STUDENT"?"am_michael":"af_heart",speed});if(run!==state.run)throw new Error("stale tour run");entry.url=URL.createObjectURL(raw.toBlob());entry.ready=true;return entry}).catch(error=>{if(naturalBuffer.get(index)===entry)naturalBuffer.delete(index);throw error});generationTail=entry.promise.catch(()=>{});naturalBuffer.set(index,entry);return entry.promise}

async 
function setTourPerformanceMode(on){
 document.documentElement.classList.toggle("tour-performance-mode",!!on);
}
function warmFirstTurns(run){
 if($("language").value!=="en"||!state.lines?.length)return;
 const status=$("tourStatus");
 try{
   if(status)status.textContent="Preparing first voices for smooth playback…";
   await prepareNatural(state.index,run);
   if(run!==state.run)return;
   await new Promise(r=>requestAnimationFrame(()=>r()));
   if(state.index+1<state.lines.length) await prepareNatural(state.index+1,run);
   if(run===state.run&&status)status.textContent="✓ Smooth playback ready";
 }catch(e){
   if(status)status.textContent="Natural voice is still preparing; browser fallback remains available.";
 }
}
function prefetchUpcoming(run){prepareNatural(state.index+1,run)?.catch(()=>{})}
async function speakNatural(run,line,endedAt){try{const cached=naturalBuffer.get(state.index);if(!cached?.ready)$("tourStatus").textContent="Preparing next voice…";const entry=await prepareNatural(state.index,run);if(run!==state.run||!state.playing||state.paused)return;naturalBuffer.delete(state.index);clearNaturalAudio();activeAudioUrl=entry.url;entry.url="";activeAudio=new Audio(activeAudioUrl);activeAudio.onended=()=>{const finishedAt=performance.now();clearNaturalAudio();finishLine(run,finishedAt)};activeAudio.onerror=()=>{clearNaturalAudio();speakBrowserLine(run,line,endedAt)};await activeAudio.play();if(Number.isFinite(endedAt)){handoffMeasurements.push(performance.now()-endedAt);if(handoffMeasurements.length>50)handoffMeasurements.shift()}$("tourStatus").textContent=`Free natural voice — ${line.speaker.toLowerCase()} speaking…`;requestAnimationFrame(()=>setTimeout(()=>{if(run===state.run&&state.playing&&!state.paused)prefetchUpcoming(run)},40))}catch(error){if(run!==state.run)return;console.warn("Kokoro voice unavailable; using browser voice.",error);$("tourStatus").textContent="Natural voice could not load. Using the free browser voice instead.";speakBrowserLine(run,line,endedAt)}}
function speakBrowserLine(run,l,endedAt){clearNaturalAudio();if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window)){$("tourStatus").textContent="Audio is unavailable in this browser. The transcript and visual cards still work.";return}const available=voices().filter(v=>v.lang.toLowerCase().startsWith("en"));const u=new SpeechSynthesisUtterance(l.text);u.lang="en-US";u.rate=Number($("tourSpeed").value||1)*(l.speaker==="STUDENT"?1.04:.94);u.pitch=l.speaker==="STUDENT"?1.12:.92;if(available.length)u.voice=available[l.speaker==="STUDENT"&&available.length>1?1:0];u.onstart=()=>{if(Number.isFinite(endedAt)){handoffMeasurements.push(performance.now()-endedAt);if(handoffMeasurements.length>50)handoffMeasurements.shift()}};u.onend=()=>finishLine(run,performance.now());u.onerror=e=>{if(e.error!=="canceled")$("tourStatus").textContent="Audio could not play. Use the transcript and visual cards."};speechSynthesis.speak(u)}
function speakCurrent(endedAt){if(!state.playing||!state.lines.length)return;const run=state.run,l=state.lines[state.index];if($("language").value==="en")speakNatural(run,l,endedAt);else speakBrowserLine(run,l,endedAt)}
function play(){if(finalPodcast.ready){playFinalPodcast();return}if(state.paused){state.paused=false;state.playing=true;if(state.pendingHandoff)scheduleHandoff(state.run,performance.now()-SPEAKER_HANDOFF_MS);else if(activeAudio)activeAudio.play();else if($("language").value==="en")speakCurrent();else if("speechSynthesis" in window)speechSynthesis.resume();return}if("speechSynthesis" in window)speechSynthesis.cancel();clearTimeout(handoffTimer);clearNaturalAudio();clearNaturalBuffer();state.run++;state.playing=true;state.pendingHandoff=false;speakCurrent()}
function pause(){if(finalPodcast.ready&&finalPodcast.audio){finalPodcast.audio.pause();state.paused=true;state.playing=false;setTourPerformanceMode(false);return}if(!state.playing)return;clearTimeout(handoffTimer);handoffTimer=null;if(activeAudio)activeAudio.pause();else if("speechSynthesis" in window)speechSynthesis.pause();state.paused=true}
function stop(){setTourPerformanceMode(false);if(finalPodcast.audio){finalPodcast.audio.pause();finalPodcast.audio.currentTime=0;finalPodcast.audio=null;activeAudio=null}state.run++;state.playing=false;state.paused=false;setTourPerformanceMode(false);state.pendingHandoff=false;clearTimeout(handoffTimer);handoffTimer=null;clearNaturalAudio();clearNaturalBuffer();if("speechSynthesis" in window)speechSynthesis.cancel();if(state.lines.length)$("tourStatus").textContent="Tour stopped. Press Play to continue from this section."}
function move(delta){stop();state.index=Math.max(0,Math.min(state.lines.length-1,state.index+delta));renderLine()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function translate(){const lang=$("language").value,t=copy[lang]||copy.en;$("guidedTourTitle").textContent=t.title;$("guidedTourSubtitle").textContent=t.sub;$("syllabusTourButton").textContent=t.syllabus;$("assignmentTourButton").textContent=t.assignment;$("transcriptToggle").textContent=$("tourTranscript").classList.contains("hidden")?t.show:t.hide;$("tourLanguageNote").textContent=lang==="en"?"":t.fallback}
$("buildPodcast")?.addEventListener("click",buildSinglePodcast);$("syllabusFile")?.addEventListener("change",e=>readFile("syllabus",e.target.files?.[0]));$("assignmentFile")?.addEventListener("change",e=>readFile("assignment",e.target.files?.[0]));window.addEventListener("aipc:document-ready",e=>register(e.detail));
$("syllabusTourButton").onclick=()=>openTour("syllabus");$("assignmentTourButton").onclick=()=>openTour("assignment");$("tourPlay").onclick=play;$("tourPause").onclick=pause;$("tourStop").onclick=stop;$("tourPrevious").onclick=()=>move(-1);$("tourNext").onclick=()=>move(1);$("closeTour").onclick=()=>{stop();$("guidedTour").classList.add("hidden")};$("transcriptToggle").onclick=()=>{const hidden=$("tourTranscript").classList.toggle("hidden");$("transcriptToggle").setAttribute("aria-expanded",String(!hidden));translate()};$("tourTopics").onclick=e=>{const b=e.target.closest("button[data-topic]");if(!b)return;stop();const topic=Number(b.dataset.topic),i=state.lines.findIndex(x=>x.topic===topic);if(i>=0){state.index=i;renderLine()}};document.querySelectorAll('input[name="tourLength"]').forEach(x=>x.addEventListener("change",()=>{if(state.kind)openTour(state.kind)}));$("language")?.addEventListener("change",()=>{stop();translate()});translate();
window.GuidedTourV1={syllabusTopics,assignmentTopics,policyResult,makeDialogue,register,SPEAKER_HANDOFF_MS,getHandoffMeasurements:()=>[...handoffMeasurements]};
})();
