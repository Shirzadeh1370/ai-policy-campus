AI POLICY CAMPUS - FINAL DEMO PACKAGE

FASTEST PRESENTATION PATH
1. Extract this ZIP.
2. Double-click START_AI_POLICY_CAMPUS.bat.
3. Your browser opens automatically.
4. Click "Try Demo Syllabus".
5. Click "Start Syllabus Tour".
6. Wait until you see "Natural Voice Ready".
7. Press Play.

REAL PDF TEST
- Use Choose syllabus file and select DEMO_SAMPLE_SYLLABUS.pdf.
- Wait until the PDF-read success message appears.
- Start Syllabus Tour.

IMPORTANT
- The shareable package intentionally contains NO .env file and NO API key.
- The core Guided Tour does not need an OpenAI API key.
- Kokoro natural English voice uses the local browser/WASM code, but its voice model may need internet on the first-ever load and is then cached by the browser.
- PDF.js and Mammoth are still loaded from their current web dependencies in this prototype, so a first/uncached document parse may require internet.
- For a classroom presentation, open the app and run one tour once before presenting so the natural-voice model is cached.
- If Node.js is unavailable, the launcher tries Python. The frontend Guided Tour works, but server-only AI media endpoints will not.
- Never distribute a ZIP containing your private .env or API key.

V2 PRESENTATION TUNING
- Speaker handoff target tightened to about 180 ms.
- Next topic/title is prepared before the next voice starts.
- Guided Tour spoken turns are shorter for a faster classroom demo.
- AI Policy GREEN / YELLOW / RED meaning cards are now visibly shown in the AI-policy workflow.

V3 PERFORMANCE FIX
- Kokoro rolling buffer reduced to exactly one upcoming segment (N+1).
- Removed N+2 background generation while audio is playing.
- Heavy next-voice generation is deferred briefly so the browser can repaint first.
- Topic/transcript rendering is scheduled on animation frames before next playback.
- Maximum text sent to Kokoro per turn reduced from 480 to 300 characters.
- Natural two-voice mode and fast handoff remain enabled.

V4 ULTRA-SMOOTH PERFORMANCE
- First two English natural-voice turns are warmed before playback.
- Generated natural audio is cached in memory and reused instead of synthesized again.
- Kokoro input per turn is capped at about 220 characters to reduce CPU/WASM stalls.
- Only one upcoming turn continues to prefetch during playback.
- Decorative animations/transitions are suppressed while the tour is speaking.
- Speaker handoff target is about 160 ms when the next segment is ready.
- Previous/Next can reuse already-generated audio from the session cache.

PRESENTATION TIP
Open one Guided Tour before class and let the first natural voices prepare. This also warms the browser/model cache.

V6 — SINGLE COMPLETE PODCAST MODE

NEW WORKFLOW
1. Upload/open the Syllabus or Assignment Tour.
2. Click "Create Complete Podcast".
3. The app analyzes the already-created tour dialogue and generates every GUIDE/STUDENT voice segment.
4. It decodes the audio, inserts a short natural 180 ms pause between speakers, and joins every segment into ONE WAV audio file.
5. Wait for "Podcast Ready".
6. Press Play.

DURING PLAYBACK
- No Kokoro voice generation occurs.
- The browser plays one prepared audio file continuously.
- Topic/title/transcript are synchronized to the single audio timeline.
- This is the smoothest presentation mode and removes speaker-to-speaker generation waits.

NOTE
The initial Create Complete Podcast step takes time because every voice must be generated once. After Podcast Ready, playback is continuous like a downloaded podcast file.
