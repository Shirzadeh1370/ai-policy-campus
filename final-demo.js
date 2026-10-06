
(() => {
const $ = id => document.getElementById(id);
const demoText = `BIO 241 - Human Anatomy & Physiology I

Instructor
Professor Jordan Lee
Email: jordan.lee@example.edu
Office Hours: Tuesday and Thursday, 2:00-4:00 PM, Science Building Room 210.

Course Overview
This course introduces human anatomy and physiology with emphasis on body organization, cells, tissues, the skeletal system, muscles, and basic homeostasis. Students should connect structure with function and use scientific vocabulary accurately.

Required Materials
Required textbook: Principles of Anatomy & Physiology, current course edition. Students should also bring access to the course learning platform and laboratory materials listed in class.

Important Dates
Quiz 1: October 6
Midterm Exam: October 28
Lab Practical: November 18
Final Exam: December 9

Grading
Exams 40%
Laboratory work 25%
Assignments 20%
Quizzes 10%
Participation 5%

Attendance and Late Work
Regular attendance is expected. Late assignments may receive a deduction unless the student has arranged an approved extension with the instructor.

Artificial Intelligence Policy
Generative AI tools may be used for brainstorming, creating study questions, and explaining course concepts. Students may not use generative AI to write graded assignment answers or complete quizzes or exams. If an assignment has different AI instructions, the assignment-specific instructions apply. When unsure, ask the instructor before using AI.

Academic Integrity
Students are responsible for submitting their own work and following college academic-integrity requirements.

Student Support
Students who need academic or accessibility support should contact the appropriate college support office and communicate with the instructor as early as possible.`;

$("loadDemoSyllabus")?.addEventListener("click", () => {
  $("course").value = "BIO 241";
  $("prof").value = "Professor Jordan Lee";
  $("profEmail").value = "jordan.lee@example.edu";
  $("policy").value = demoText;
  $("policy").dispatchEvent(new Event("input", {bubbles:true}));
  window.aipcDocuments = window.aipcDocuments || {};
  const detail = {kind:"syllabus", name:"DEMO_SAMPLE_SYLLABUS.pdf", text:demoText, pages:2, format:"demo"};
  window.aipcDocuments.syllabus = detail;
  window.dispatchEvent(new CustomEvent("aipc:document-ready", {detail}));
  const name = $("syllabusFileName");
  if (name) name.textContent = "DEMO_SAMPLE_SYLLABUS.pdf ✓";
  const status = $("pdfReadStatus");
  if (status) status.textContent = "Demo syllabus loaded. You can start the Syllabus Tour now.";
  $("naturalVoiceReady").textContent = "🎙 Demo ready. Open Syllabus Tour to prepare the natural voices.";
  $("syllabusTourButton")?.focus();
});
})();
