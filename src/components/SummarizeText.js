import React, { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { URL } from "./constants";

function PDFSummarizer() {
  const [pdfData, setPdfData] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [pdfImages, setPdfImages] = useState([]);
  const [summary, setSummary] = useState("");
  const [wordLimit, setWordLimit] = useState(100);
  const [loading, setLoading] = useState(false);

  const handlePDFFile = async (file) => {
    setLoading(true);
    setSummary("");
    setPdfImages([]);
    setFileContent("");

    const readerDataUrl = new FileReader();
    readerDataUrl.readAsDataURL(file);
    readerDataUrl.onload = (e) => setPdfData(e.target.result);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    let images = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item) => item.str).join(" ") + "\n";

      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL("image/png"));
    }

    setFileContent(fullText);
    setPdfImages(images);
    setLoading(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "pdf") {
      alert("Only PDF files are allowed.");
      setPdfData(null);
      setPdfImages([]);
      setFileContent("");
      setSummary("");
      return;
    }

    await handlePDFFile(file);
  };

  const handleWordLimitChange = (e) => {
    const limit = parseInt(e.target.value, 10);
    if (!isNaN(limit)) setWordLimit(limit);
  };

  const getAISummary = async () => {
    if (!fileContent) {
      alert("Please upload a PDF first.");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const imagesBase64 = pdfImages.join("\n");

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Shorten and summarize the following PDF content, including images references, while retaining meaning. 
Text: ${fileContent}

Images (base64 or references): ${imagesBase64}

Give a concise summary with a maximum of ${wordLimit} words. Provide only one answer.`,
              },
            ],
          },
        ],
      };

      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error) setSummary("Error: " + data.error.message);
      else
        setSummary(
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No summary returned."
        );
    } catch (err) {
      console.error(err);
      setSummary("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white font-sans flex flex-col">
      {/* Header */}
      <header className="px-10 py-6 bg-gray-900 shadow-md flex justify-between items-center">
        <a
          href="/"
          className="text-3xl font-extrabold hover:text-indigo-400 transition"
        >
          DocuMind
        </a>
        <h2 className="text-xl sm:text-2xl font-semibold">PDF Summarizer</h2>
      </header>

      {/* Upload & Options */}
      <div className="p-6 flex flex-wrap gap-4 items-center bg-gray-900 shadow-md">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white shadow-sm hover:border-indigo-500 transition w-full sm:w-auto"
        />
        <label className="flex items-center gap-2">
          Word Limit:
          <input
            type="number"
            value={wordLimit}
            onChange={handleWordLimitChange}
            className="w-20 px-2 py-1 rounded-md border border-gray-700 bg-gray-800 text-white shadow-sm"
          />
        </label>
        <button
          onClick={getAISummary}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-white shadow-lg hover:scale-105 transform transition"
        >
          {loading ? "Processing..." : "Get AI Summary"}
        </button>
      </div>

      {/* Main Content */}
      {pdfData && (
        <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1 overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 min-w-[300px] rounded-xl overflow-hidden shadow-lg border border-gray-700 h-[75vh]">
            <Worker workerUrl={pdfjsWorker}>
              <Viewer fileUrl={pdfData} />
            </Worker>
          </div>

          {/* Summary Section */}
          <div className="flex-1 min-w-[300px] flex flex-col gap-4 overflow-y-auto h-[75vh]">
            {summary ? (
              <div className="p-5 rounded-xl bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-lg whitespace-pre-wrap">
                <h3 className="mb-2 font-semibold text-lg text-indigo-400">
                  AI Summary
                </h3>
                <p>{summary}</p>
              </div>
            ) : (
              <p className="text-gray-400 text-center mt-10">
                Upload a PDF and click "Get AI Summary" to see results.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFSummarizer;
// import React, { useState } from "react";
// import { Worker, Viewer } from "@react-pdf-viewer/core";
// import "@react-pdf-viewer/core/lib/styles/index.css";
// import * as pdfjsLib from "pdfjs-dist/build/pdf";
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
// import { URL } from "./constants";

// function PDFSummarizer() {
//   const [pdfData, setPdfData] = useState(null);
//   const [fileContent, setFileContent] = useState(""); // Full PDF text
//   const [pdfImages, setPdfImages] = useState([]); // Extracted page images
//   const [summary, setSummary] = useState(""); // AI summary
//   const [wordLimit, setWordLimit] = useState(100);
//   const [loading, setLoading] = useState(false);

//   // -----------------------------
//   // Handle PDF file
//   // -----------------------------
//   const handlePDFFile = async (file) => {
//     setLoading(true);
//     setSummary("");
//     setPdfImages([]);
//     setFileContent("");

//     // Preview PDF
//     const readerDataUrl = new FileReader();
//     readerDataUrl.readAsDataURL(file);
//     readerDataUrl.onload = (e) => setPdfData(e.target.result);

//     // Extract text and images
//     const arrayBuffer = await file.arrayBuffer();
//     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

//     let fullText = "";
//     let images = [];

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);

//       // Extract text
//       const content = await page.getTextContent();
//       fullText += content.items.map((item) => item.str).join(" ") + "\n";

//       // Extract page image
//       const viewport = page.getViewport({ scale: 1 });
//       const canvas = document.createElement("canvas");
//       const context = canvas.getContext("2d");
//       canvas.width = viewport.width;
//       canvas.height = viewport.height;
//       await page.render({ canvasContext: context, viewport }).promise;
//       images.push(canvas.toDataURL("image/png"));
//     }

//     setFileContent(fullText);
//     setPdfImages(images);
//     setLoading(false);
//   };

//   // -----------------------------
//   // Handle file input
//   // -----------------------------
//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const ext = file.name.split(".").pop().toLowerCase();

//     if (ext !== "pdf") {
//       alert("Only PDF files are allowed.");
//       setPdfData(null);
//       setPdfImages([]);
//       setFileContent("");
//       setSummary("");
//       return;
//     }

//     await handlePDFFile(file);
//   };

//   // -----------------------------
//   // Word limit change
//   // -----------------------------
//   const handleWordLimitChange = (e) => {
//     const limit = parseInt(e.target.value, 10);
//     if (!isNaN(limit)) setWordLimit(limit);
//   };

//   // -----------------------------
//   // Call AI for summary
//   // -----------------------------
//   const getAISummary = async () => {
//     if (!fileContent) {
//       alert("Please upload a PDF first.");
//       return;
//     }

//     setLoading(true);
//     setSummary("");

//     try {
//       // Convert extracted images to base64 strings
//       const imagesBase64 = pdfImages.join("\n"); // Join all images for AI reference

//       // Prepare payload for Gemini 2.0
//       const payload = {
//         contents: [
//           {
//             parts: [
//               {
//                 text: `Shorten and summarize the following PDF content, including images references, while retaining meaning.
// Text: ${fileContent}

// Images (base64 or references): ${imagesBase64}

// Give a concise summary with a maximum of ${wordLimit} words. Provide only one answer.`,
//               },
//             ],
//           },
//         ],
//       };

//       const response = await fetch(URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.error) {
//         setSummary("Error: " + data.error.message);
//       } else {
//         // Gemini API returns candidates array
//         setSummary(
//           data.candidates?.[0]?.content?.parts?.[0]?.text ||
//             "No summary returned."
//         );
//       }
//     } catch (err) {
//       console.error("Error generating summary:", err);
//       setSummary("Something went wrong. Check console.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="font-sans bg-gray-900 min-h-screen text-white">
//         {/* Header */}
//         <h1 className="text-3xl font-bold text-gray-800 mb-4">
//           <a href="/">DocuMind</a>
//         </h1>
//         <h1 className="text-3xl font-bold text-gray-800 mb-4">
//           PDF Summarizer
//         </h1>

//         {/* Main Content */}
//         <main className="p-8 flex flex-col gap-8">
//           {/* Upload & Options */}
//           <div className="flex flex-wrap gap-5 items-center">
//             <input
//               type="file"
//               accept=".pdf"
//               onChange={handleFileChange}
//               className="px-3 py-2 border rounded-lg border-gray-300"
//             />
//             <label className="flex items-center gap-2">
//               Word Limit:
//               <input
//                 type="number"
//                 value={wordLimit}
//                 onChange={handleWordLimitChange}
//                 className="w-20 px-2 py-1 border rounded-md border-gray-300"
//               />
//             </label>
//             <button
//               onClick={getAISummary}
//               className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
//             >
//               {loading ? "Processing..." : "Get AI Summary"}
//             </button>
//           </div>

//           {/* PDF Viewer & Content */}
//           {pdfData && (
//             <div className="flex flex-wrap gap-5 h-[80vh]">
//               {/* PDF Viewer */}
//               <div className="flex-1 min-w-[350px] max-h-[80vh] rounded-xl overflow-hidden shadow-lg border border-gray-300">
//                 <Worker workerUrl={pdfjsWorker}>
//                   <Viewer fileUrl={pdfData} />
//                 </Worker>
//               </div>

//               {/* Summary & Extracted Content */}
//               <div className="flex-1 min-w-[350px] flex flex-col gap-5 overflow-y-auto">
//                 {/* AI Summary */}
//                 {summary && (
//                   <div className="p-5 rounded-xl bg-green-100 shadow-sm whitespace-pre-wrap">
//                     <h3 className="mb-2 font-semibold text-lg">AI Summary</h3>
//                     <p>{summary}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </>
//   );
// }

// export default PDFSummarizer;
