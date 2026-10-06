/* Additive, link-only state resource. This module never fetches or evaluates WaTech content. */
(() => {
  const officialURL = 'https://watech.wa.gov/policies/artificial-intelligence';
  const keys = ['title','subtitle','official','link','newTab','rules','course','college','state','explanation','checked','evaluated','missing','collegeMissing','available','based','unclear','green','red','provided','limits','stale'];
  const translations = {
    en: ['Washington State AI Policy','Official Washington State guidance and policy resources for responsible use of artificial intelligence.','OFFICIAL STATE SOURCE','View Official Washington State AI Policy ↗','opens in a new tab','Your AI Rules','Course / Assignment','College Policy','Washington State Guidance','Your course and assignment instructions come first. College and state resources provide additional guidance and context.','Sources checked','Provided policy text evaluated','No policy text evaluated','Not provided / not evaluated','Washington State — Official resource available','Based on','unclear — ask your professor','permission language found; review the stated limits','restriction language found','Student-provided policy / instructions','Only the text in the policy box is evaluated. File selection and external links alone are not evidence. The source of pasted text is not independently verified.','Inputs changed — run the check again.'],
    fa: ['قوانین هوش مصنوعی ایالت واشنگتن','راهنماها و منابع رسمی ایالت واشنگتن برای استفاده مسئولانه از هوش مصنوعی.','منبع رسمی ایالتی','مشاهده قوانین رسمی هوش مصنوعی واشنگتن ↗','در زبانه جدید باز می‌شود','قوانین هوش مصنوعی برای تو','درس / تکلیف','قوانین دانشگاه','راهنمای ایالت واشنگتن','دستورهای درس و تکلیف تو در اولویت هستند. منابع دانشگاه و ایالت راهنما و زمینه تکمیلی ارائه می‌کنند.','منابع بررسی‌شده','متن قوانین واردشده بررسی شد','متنی از قوانین بررسی نشده','ارائه نشده / بررسی نشده','واشنگتن — منبع رسمی در دسترس است','بر اساس','نامشخص — از استاد بپرس','عبارت اجازه یافت شد؛ محدودیت‌های آن را بررسی کن','عبارت محدودکننده یافت شد','متن قوانین / دستورهای ارائه‌شده توسط دانشجو','فقط متن کادر قوانین بررسی می‌شود. انتخاب فایل یا وجود لینک به‌تنهایی مدرک نیست. منشأ متن واردشده مستقلاً تأیید نشده است.','اطلاعات تغییر کرده؛ بررسی را دوباره اجرا کن.'],
    es: ['Política de IA del estado de Washington','Orientación y recursos oficiales del estado de Washington para el uso responsable de la inteligencia artificial.','FUENTE ESTATAL OFICIAL','Ver la política oficial de IA de Washington ↗','se abre en otra pestaña','Tus reglas de IA','Curso / Tarea','Política universitaria','Guía del estado de Washington','Las instrucciones del curso y de la tarea van primero. Los recursos universitarios y estatales aportan orientación y contexto.','Fuentes revisadas','Texto de política proporcionado evaluado','No se evaluó texto de política','No proporcionada / no evaluada','Washington — Recurso oficial disponible','Basado en','poco claro — pregunta al profesor','se encontró permiso; revisa sus límites','se encontró una restricción','Política / instrucciones aportadas por el estudiante','Solo se evalúa el texto del cuadro. Seleccionar archivos o tener enlaces no constituye evidencia. No se verifica de forma independiente el origen del texto.','Los datos cambiaron — vuelve a comprobar.'],
    ar: ['سياسة الذكاء الاصطناعي لولاية واشنطن','إرشادات وموارد رسمية من ولاية واشنطن للاستخدام المسؤول للذكاء الاصطناعي.','مصدر رسمي للولاية','عرض سياسة واشنطن الرسمية للذكاء الاصطناعي ↗','يفتح في علامة تبويب جديدة','قواعد استخدامك للذكاء الاصطناعي','المقرر / التكليف','سياسة الكلية','إرشادات ولاية واشنطن','تعليمات المقرر والتكليف تأتي أولًا. توفر موارد الكلية والولاية إرشادات وسياقًا إضافيًا.','المصادر التي تمت مراجعتها','تم تقييم نص السياسة المقدم','لم يتم تقييم نص سياسة','غير مقدمة / غير مقيّمة','واشنطن — مصدر رسمي متاح','بناءً على','غير واضح — اسأل أستاذك','وُجد نص يسمح؛ راجع الحدود','وُجد نص يقيّد الاستخدام','السياسة / التعليمات المقدمة من الطالب','يتم تقييم النص داخل المربع فقط. اختيار ملف أو وجود رابط ليس دليلًا. لم يتم التحقق المستقل من مصدر النص.','تغيرت المدخلات — أعد التحقق.'],
    fr: ['Politique IA de l’État de Washington','Orientations et ressources officielles de l’État de Washington pour une utilisation responsable de l’intelligence artificielle.','SOURCE OFFICIELLE DE L’ÉTAT','Consulter la politique IA officielle de Washington ↗','ouvre un nouvel onglet','Vos règles IA','Cours / Devoir','Politique de l’établissement','Guide de l’État de Washington','Les consignes du cours et du devoir passent en premier. Les ressources de l’établissement et de l’État apportent un contexte complémentaire.','Sources examinées','Texte de politique fourni évalué','Aucun texte de politique évalué','Non fournie / non évaluée','Washington — Ressource officielle disponible','Fondé sur','incertain — demandez au professeur','autorisation trouvée ; vérifiez ses limites','restriction trouvée','Politique / consignes fournies par l’étudiant','Seul le texte du champ est évalué. Un fichier sélectionné ou un lien ne constitue pas une preuve. L’origine du texte n’est pas vérifiée indépendamment.','Données modifiées — relancez la vérification.'],
    de: ['KI-Richtlinie des Bundesstaats Washington','Offizielle Orientierung und Richtlinien des Bundesstaats Washington zum verantwortungsvollen KI-Einsatz.','OFFIZIELLE STAATLICHE QUELLE','Offizielle KI-Richtlinie von Washington ansehen ↗','öffnet einen neuen Tab','Deine KI-Regeln','Kurs / Aufgabe','Hochschulrichtlinie','Leitlinien von Washington','Die Anweisungen für Kurs und Aufgabe stehen an erster Stelle. Hochschul- und staatliche Quellen bieten zusätzlichen Kontext.','Geprüfte Quellen','Bereitgestellter Richtlinientext geprüft','Kein Richtlinientext geprüft','Nicht bereitgestellt / nicht geprüft','Washington — Offizielle Quelle verfügbar','Grundlage','unklar — Lehrkraft fragen','Erlaubnis gefunden; Grenzen beachten','Einschränkung gefunden','Vom Studierenden bereitgestellte Regeln / Anweisungen','Nur der Text im Feld wird geprüft. Dateiauswahl oder Links allein sind keine Belege. Die Herkunft des Texts wird nicht unabhängig geprüft.','Eingaben geändert — erneut prüfen.'],
    zh: ['华盛顿州人工智能政策','华盛顿州关于负责任使用人工智能的官方指南与政策资源。','州官方来源','查看华盛顿州官方人工智能政策 ↗','在新标签页中打开','你的人工智能使用规则','课程 / 作业','学校政策','华盛顿州指南','课程和作业要求优先。学校与州资源提供补充指南和背景。','已检查的来源','已评估所提供的政策文本','未评估任何政策文本','未提供 / 未评估','华盛顿州 — 官方资源可用','依据','不明确 — 请询问教授','发现许可表述；请核对限制','发现限制表述','学生提供的政策 / 说明','仅评估文本框中的内容。选择文件或提供链接本身不构成证据。粘贴文本的来源未经独立核实。','输入已更改 — 请重新检查。'],
    hi: ['वॉशिंगटन राज्य की AI नीति','कृत्रिम बुद्धिमत्ता के जिम्मेदार उपयोग के लिए वॉशिंगटन राज्य के आधिकारिक दिशानिर्देश और नीति संसाधन।','आधिकारिक राज्य स्रोत','वॉशिंगटन की आधिकारिक AI नीति देखें ↗','नए टैब में खुलता है','आपके AI नियम','पाठ्यक्रम / असाइनमेंट','कॉलेज नीति','वॉशिंगटन राज्य मार्गदर्शन','पाठ्यक्रम और असाइनमेंट के निर्देश पहले आते हैं। कॉलेज और राज्य के संसाधन अतिरिक्त मार्गदर्शन देते हैं।','जाँचे गए स्रोत','दिए गए नीति पाठ का मूल्यांकन हुआ','किसी नीति पाठ का मूल्यांकन नहीं हुआ','प्रदान नहीं / मूल्यांकन नहीं','वॉशिंगटन — आधिकारिक संसाधन उपलब्ध','इस पर आधारित','अस्पष्ट — प्रोफेसर से पूछें','अनुमति का कथन मिला; सीमाएँ देखें','प्रतिबंध का कथन मिला','छात्र द्वारा दिया गया नीति पाठ / निर्देश','केवल बॉक्स के पाठ का मूल्यांकन होता है। फ़ाइल चुनना या लिंक होना प्रमाण नहीं है। पाठ के स्रोत का स्वतंत्र सत्यापन नहीं हुआ है।','इनपुट बदल गए — फिर से जाँचें।'],
    tr: ['Washington Eyaleti Yapay Zekâ Politikası','Yapay zekânın sorumlu kullanımı için Washington eyaletinin resmî rehber ve politika kaynakları.','RESMÎ EYALET KAYNAĞI','Washington resmî yapay zekâ politikasını görüntüle ↗','yeni sekmede açılır','Yapay zekâ kuralların','Ders / Ödev','Üniversite politikası','Washington eyalet rehberi','Ders ve ödev talimatları önce gelir. Üniversite ve eyalet kaynakları ek rehberlik ve bağlam sağlar.','İncelenen kaynaklar','Sağlanan politika metni değerlendirildi','Politika metni değerlendirilmedi','Sağlanmadı / değerlendirilmedi','Washington — Resmî kaynak mevcut','Dayanak','belirsiz — öğretim üyesine sor','izin ifadesi bulundu; sınırları incele','kısıtlama ifadesi bulundu','Öğrencinin sağladığı politika / talimatlar','Yalnızca kutudaki metin değerlendirilir. Dosya seçimi veya bağlantılar tek başına kanıt değildir. Metnin kaynağı bağımsız olarak doğrulanmaz.','Girdiler değişti — yeniden kontrol et.'],
    ur: ['ریاست واشنگٹن کی AI پالیسی','مصنوعی ذہانت کے ذمہ دارانہ استعمال کے لیے ریاست واشنگٹن کی سرکاری رہنمائی اور پالیسی وسائل۔','سرکاری ریاستی ذریعہ','واشنگٹن کی سرکاری AI پالیسی دیکھیں ↗','نئے ٹیب میں کھلتا ہے','آپ کے AI قواعد','کورس / اسائنمنٹ','کالج پالیسی','ریاست واشنگٹن کی رہنمائی','کورس اور اسائنمنٹ کی ہدایات پہلے آتی ہیں۔ کالج اور ریاستی وسائل اضافی رہنمائی دیتے ہیں۔','جانچے گئے ذرائع','فراہم کردہ پالیسی متن کا جائزہ لیا گیا','کسی پالیسی متن کا جائزہ نہیں لیا گیا','فراہم نہیں / جائزہ نہیں لیا گیا','واشنگٹن — سرکاری وسیلہ دستیاب','بنیاد','غیر واضح — استاد سے پوچھیں','اجازت کا بیان ملا؛ حدود دیکھیں','پابندی کا بیان ملا','طالب علم کا فراہم کردہ پالیسی متن / ہدایات','صرف خانے کے متن کا جائزہ لیا جاتا ہے۔ فائل کا انتخاب یا لنک خود ثبوت نہیں ہے۔ متن کے ماخذ کی آزادانہ تصدیق نہیں ہوئی۔','معلومات تبدیل ہوئیں — دوبارہ جانچیں۔']
  };
  // Extend, rather than replace, the existing language dictionaries.
  for (const [lang, values] of Object.entries(translations)) {
    ui[lang].stateResources = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  }
  const sourceBody = q('policySources').querySelector('.body');
  const hierarchy = document.createElement('div');
  hierarchy.className = 'policy-hierarchy';
  hierarchy.innerHTML = '<b data-wa="rules"></b><ol><li data-wa="course"></li><li data-wa="college"></li><li data-wa="state"></li></ol><p data-wa="explanation"></p>';
  sourceBody.appendChild(hierarchy);
  const card = document.createElement('article');
  card.className = 'wa-resource';
  card.setAttribute('aria-labelledby', 'waTitle');
  card.innerHTML = '<span class="official-label" data-wa="official"></span><h3 id="waTitle" data-wa="title"></h3><p data-wa="subtitle"></p><p>Washington Technology Solutions (WaTech)</p><a id="waOfficialLink" class="wa-link" target="_blank" rel="noopener noreferrer"></a>';
  card.querySelector('a').href = officialURL;
  sourceBody.appendChild(card);
  const transparency = document.createElement('section');
  transparency.className = 'source-transparency';
  transparency.setAttribute('aria-labelledby', 'checkedSourcesTitle');
  transparency.setAttribute('aria-live', 'polite');
  transparency.innerHTML = '<h3 id="checkedSourcesTitle" data-wa="checked"></h3><ul><li id="checkedCourse"></li><li id="checkedCollege"></li><li id="checkedState"></li></ul><p id="sourceBasis"></p><p data-wa="limits"></p>';
  q('resultCard').querySelector('.body').appendChild(transparency);
  let evaluated = null;
  const current = () => ({text:q('policy').value.trim(),purpose:use,course:q('course').value,syllabus:q('syllabusFile').files[0]?.name||'',assignment:q('assignmentFile').files[0]?.name||''});
  const signature = value => JSON.stringify(value);
  function render() {
    const t = (ui[q('language').value] || ui.en).stateResources;
    document.querySelectorAll('[data-wa]').forEach(el => el.textContent = t[el.dataset.wa]);
    const a = q('waOfficialLink');
    a.textContent = t.link;
    a.setAttribute('aria-label', `${t.link} — ${t.newTab}`);
    a.title = t.newTab;
    // Keep the original three source cards and the translation selectors intact.
    sourceBody.querySelector('.sources article:last-child b').textContent = '🏛 ' + t.state;
    sourceBody.querySelector('.sources article:last-child em').textContent = t.available;
    sourceBody.querySelector('.note').textContent = t.limits;
    const fresh = evaluated && evaluated.signature === signature(current());
    const hasText = fresh && !!evaluated.text;
    q('checkedCourse').textContent = `📘 ${t.course} — ${hasText ? t.evaluated : t.missing}`;
    q('checkedCourse').dataset.checked = String(!!hasText);
    q('checkedCollege').textContent = `🏫 ${t.college} — ${t.collegeMissing}`;
    q('checkedCollege').dataset.checked = 'false';
    q('checkedState').textContent = `🏛 ${t.available}`;
    q('checkedState').dataset.checked = 'false';
    q('sourceBasis').textContent = evaluated && !fresh ? t.stale : `${t.based}: ${hasText ? t.provided + ' — ' + t[evaluated.state] : t.missing + ' — ' + t.unclear}`;
  }
  // Runs after the existing decision handler. No traffic-light rules are changed.
  q('decide').addEventListener('click', () => {
    const input = current();
    evaluated = {...input, signature:signature(input), state:q('result').classList.contains('red')?'red':q('result').classList.contains('green')?'green':'unclear'};
    render();
  });
  q('language').addEventListener('change', render);
  ['policy','course','tool'].forEach(id => q(id).addEventListener('input',render));
  ['syllabusFile','assignmentFile'].forEach(id => q(id).addEventListener('change',render));
  ['uses','clearPolicy','samplePolicy','courseTabs'].forEach(id => q(id).addEventListener('click',render));
  // Preserve the existing mail workflow; include the student's actual context only.
  const originalEmail = email;
  email = function () {
    originalEmail();
    const t = (ui[q('language').value] || ui.en).stateResources;
    const assignment = q('assignmentFile').files[0]?.name;
    const excerpt = q('policy').value.trim().slice(0,400);
    const context = [assignment ? `${t.course}: ${assignment}` : '', excerpt ? `${t.provided}:\n${excerpt}` : ''].filter(Boolean).join('\n\n');
    if (!context) return;
    q('email').textContent += '\n\n' + context;
    const link = new URL(q('openEmail').href);
    link.searchParams.set('body', (link.searchParams.get('body') || '') + '\n\n' + context);
    q('openEmail').href = link.href;
  };
  render();
})();
