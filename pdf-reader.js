const PDFJS_VERSION = "6.3.289";
const PDFJS_BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build`;

const messages = {
  en: { reading: "Reading the PDF text…", ready: pages => `PDF read successfully: ${pages} pages. The policy box now contains the syllabus text.`, error: "The PDF was uploaded, but its text could not be read. Paste the AI-policy section below for an accurate result." },
  fa: { reading: "در حال خواندن متن PDF…", ready: pages => `PDF با موفقیت خوانده شد: ${pages} صفحه. متن سیلابس اکنون در کادر قوانین قرار دارد.`, error: "PDF بارگذاری شد، اما متن آن خوانده نشد. برای نتیجه دقیق، بخش قوانین هوش مصنوعی را در کادر پایین وارد کن." },
  es: { reading: "Leyendo el texto del PDF…", ready: pages => `PDF leído: ${pages} páginas. El texto está ahora en el campo de política.`, error: "El PDF se cargó, pero no se pudo leer. Pega la sección sobre IA para obtener un resultado preciso." },
  ar: { reading: "جارٍ قراءة نص PDF…", ready: pages => `تمت قراءة ملف PDF: ${pages} صفحة. أصبح نص المنهج في مربع السياسة.`, error: "تم رفع ملف PDF ولكن تعذرت قراءة نصه. الصق قسم سياسة الذكاء الاصطناعي للحصول على نتيجة دقيقة." },
  fr: { reading: "Lecture du texte PDF…", ready: pages => `PDF lu : ${pages} pages. Le texte est maintenant dans le champ de politique.`, error: "Le PDF a été importé, mais son texte n’a pas pu être lu. Collez la section sur l’IA pour un résultat précis." },
  de: { reading: "PDF-Text wird gelesen…", ready: pages => `PDF gelesen: ${pages} Seiten. Der Text steht jetzt im Richtlinienfeld.`, error: "Die PDF wurde hochgeladen, konnte aber nicht gelesen werden. Fügen Sie den KI-Abschnitt für ein genaues Ergebnis ein." },
  zh: { reading: "正在读取 PDF 文本…", ready: pages => `已读取 PDF：${pages} 页。教学大纲文本已加入政策框。`, error: "PDF 已上传，但无法读取文本。请粘贴 AI 政策部分以获得准确结果。" },
  hi: { reading: "PDF का पाठ पढ़ा जा रहा है…", ready: pages => `PDF पढ़ी गई: ${pages} पृष्ठ। पाठ अब नीति बॉक्स में है।`, error: "PDF अपलोड हुई, लेकिन उसका पाठ नहीं पढ़ा जा सका। सही परिणाम के लिए AI नीति वाला भाग चिपकाएँ।" },
  tr: { reading: "PDF metni okunuyor…", ready: pages => `PDF okundu: ${pages} sayfa. Metin artık politika kutusunda.`, error: "PDF yüklendi ancak metni okunamadı. Doğru sonuç için yapay zekâ politikası bölümünü yapıştırın." },
  ur: { reading: "PDF کا متن پڑھا جا رہا ہے…", ready: pages => `PDF پڑھ لی گئی: ${pages} صفحات۔ نصاب کا متن اب پالیسی باکس میں ہے۔`, error: "PDF اپ لوڈ ہوگئی لیکن متن نہیں پڑھا جا سکا۔ درست نتیجے کے لیے AI پالیسی والا حصہ چسپاں کریں۔" }
};

const saveGuides = {
  en: "💡 Need a copy? Open the syllabus page and press Ctrl + P, then choose Save as PDF. For Word, copy the syllabus text into Word and save it as a .docx file.",
  fa: "💡 نسخه سیلابس را می‌خواهی؟ صفحه سیلابس را باز کن و Ctrl + P را بزن، سپس Save as PDF را انتخاب کن. برای Word، متن سیلابس را در Word کپی و با فرمت .docx ذخیره کن.",
  es: "💡 ¿Necesitas una copia? Abre la página del programa, pulsa Ctrl + P y elige Guardar como PDF. Para Word, copia el texto en Word y guárdalo como .docx.",
  ar: "💡 هل تحتاج إلى نسخة؟ افتح صفحة المنهج واضغط Ctrl + P ثم اختر الحفظ بصيغة PDF. لملف Word، انسخ النص إلى Word واحفظه بصيغة .docx.",
  fr: "💡 Besoin d’une copie ? Ouvrez la page du syllabus, appuyez sur Ctrl + P, puis choisissez Enregistrer au format PDF. Pour Word, copiez le texte dans Word et enregistrez-le en .docx.",
  de: "💡 Eine Kopie benötigt? Öffnen Sie die Kursplanseite, drücken Sie Ctrl + P und wählen Sie Als PDF speichern. Für Word kopieren Sie den Text nach Word und speichern ihn als .docx.",
  zh: "💡 需要副本？打开教学大纲页面，按 Ctrl + P，然后选择另存为 PDF。若要 Word 文件，请将文本复制到 Word 并保存为 .docx。",
  hi: "💡 कॉपी चाहिए? सिलेबस पेज खोलें, Ctrl + P दबाएँ और Save as PDF चुनें। Word के लिए पाठ को Word में कॉपी करके .docx के रूप में सहेजें।",
  tr: "💡 Bir kopya mı gerekiyor? Ders izlencesi sayfasını açın, Ctrl + P tuşlarına basın ve PDF olarak kaydet seçeneğini seçin. Word için metni Word’e kopyalayıp .docx olarak kaydedin.",
  ur: "💡 نقل چاہیے؟ نصاب کا صفحہ کھولیں، Ctrl + P دبائیں اور Save as PDF منتخب کریں۔ Word کے لیے متن Word میں کاپی کرکے .docx کے طور پر محفوظ کریں۔"
};

function translateSaveGuide() {
  const language = document.getElementById("language")?.value || "en";
  const guide = document.getElementById("syllabusSaveGuide");
  if (guide) guide.textContent = saveGuides[language] || saveGuides.en;
}

function currentMessages() {
  return messages[document.getElementById("language")?.value] || messages.en;
}

function setPdfStatus(text, error = false) {
  let status = document.getElementById("pdfReadStatus");
  if (!status) {
    status = document.createElement("p");
    status.id = "pdfReadStatus";
    status.className = "pdf-read-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    document.getElementById("uploadedDocs")?.after(status);
  }
  status.textContent = text;
  status.classList.toggle("error", error);
}

function pageText(content) {
  let output = "";
  for (const item of content.items || []) {
    if (!("str" in item)) continue;
    output += item.str;
    output += item.hasEOL ? "\n" : " ";
  }
  return output.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdf(file) {
  const pdfjsLib = await import(`${PDFJS_BASE}/pdf.mjs`);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.mjs`;
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    pages.push(pageText(await page.getTextContent()));
  }
  await loadingTask.destroy();
  return { pages: pdf.numPages, text: pages.filter(Boolean).join("\n\n") };
}

async function readSelectedPdf(event) {
  const file = event.target.files?.[0];
  if (!file || !file.name.toLowerCase().endsWith(".pdf")) return;
  const m = currentMessages();
  setPdfStatus(m.reading);
  try {
    const result = await extractPdf(file);
    if (result.text.length < 40) throw new Error("No readable PDF text");
    const policy = document.getElementById("policy");
    policy.value = result.text.slice(0, 120000);
    policy.dispatchEvent(new Event("input", { bubbles: true }));
    const kind = event.target.id === "assignmentFile" ? "assignment" : "syllabus";
    window.aipcDocuments = window.aipcDocuments || {};
    window.aipcDocuments[kind] = { kind, name: file.name, text: result.text.slice(0, 180000), pages: result.pages, format: "pdf" };
    window.dispatchEvent(new CustomEvent("aipc:document-ready", { detail: window.aipcDocuments[kind] }));
    setPdfStatus(m.ready(result.pages));
    window.createAccessibleAid?.();
  } catch (error) {
    console.error("PDF text extraction failed", error);
    setPdfStatus(m.error, true);
  }
}

document.getElementById("syllabusFile")?.addEventListener("change", readSelectedPdf);
document.getElementById("assignmentFile")?.addEventListener("change", readSelectedPdf);
document.getElementById("language")?.addEventListener("change", translateSaveGuide);
translateSaveGuide();
