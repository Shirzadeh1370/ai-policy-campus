Open index.html.

Added without changing the core decision flow:
- My Courses bar with Add Class; course names persist locally in the browser.
- 15-language selector. English, Spanish, Persian, and Arabic key hero text are implemented in this prototype; the other languages are ready in the selector for full translation wiring.
- Accessibility panel: larger text, high contrast, reduced motion, read-page speech, keyboard focus indicators, screen-reader labels.
- Existing Upload → Sources → AI Use → Traffic Light → Ask Professor flow remains.

This is a front-end prototype. Real document parsing, official policy-source lookup, and production-grade translation need backend/API integration.


Student-friendly development update:
- Each course now saves its own professor, email, policy text, selected AI use, and tool locally.
- Empty submissions show a clear validation message instead of opening an incomplete flow.
- TXT syllabus/assignment files are read into the policy field automatically. PDF/Word files show an honest prompt to paste the relevant AI section (browser-only parsing is not included yet).
- Policy decisions show the most relevant sentence instead of the first 230 characters.
- Every result includes a practical three-step checklist.
- Unclear results create both a copyable email and a one-click mail-app link.
- Progress indicators, try-an-example, clear, save status, and check-another-use controls were added.
- Language and course selections persist on the device; RTL layout was improved for Persian/Arabic/Urdu.

Important: this remains a browser-only educational aid, not an authoritative policy ruling. Production PDF/Word extraction and official college/state policy lookup still require backend/API integration.

Cloud multilingual text-to-speech:
1. Copy .env.example to .env.
2. Put your OpenAI API key in OPENAI_API_KEY inside .env. Never commit this file.
3. Run: npm start
4. Open http://127.0.0.1:4173 instead of opening index.html with file://.

The server keeps the API key out of browser code and sends Read Page / Listen text to the OpenAI speech endpoint. If cloud speech is unavailable, the interface falls back to the browser voice.

Accessible lesson media workflow:
- Upload a syllabus or assignment (PDF, Word, or TXT), then choose Create Accessible Study Aid.
- The server sends the document as an untrusted file input for structured analysis.
- The result includes a summary, objectives, key points, study steps, a safe tutoring prompt, an audio script, and an accessible infographic prompt.
- Create & Listen generates playable MP3 audio and exposes a download link.
- Create Visual Study Card generates a high-contrast educational image and exposes a PNG download link.
- API-generated analysis, speech, and images require active API billing/credit. A basic text-only study guide remains available as a fallback for pasted text and TXT files.
