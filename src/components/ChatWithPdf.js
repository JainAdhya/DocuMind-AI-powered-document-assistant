import React, { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { URL } from "./constants";

function ChatWithPdf() {
  const [pdfData, setPdfData] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [pdfImages, setPdfImages] = useState([]);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [wordLimit, setWordLimit] = useState(100);
  const [loading, setLoading] = useState(false);

  const handlePDFFile = async (file) => {
    setLoading(true);
    setPdfImages([]);
    setFileContent("");
    setChat([]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => setPdfData(e.target.result);

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
      setChat([]);
      return;
    }

    await handlePDFFile(file);
  };

  const handleWordLimitChange = (e) => {
    const limit = parseInt(e.target.value, 10);
    if (!isNaN(limit)) setWordLimit(limit);
  };

  const getAIResponse = async () => {
    if (!fileContent) {
      alert("Please upload a PDF first.");
      return;
    }
    if (!question) {
      alert("Please enter a question.");
      return;
    }

    setLoading(true);

    try {
      const imagesBase64 = pdfImages.join("\n");

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are an assistant that answers questions only based on the PDF content provided. 
Do not answer if the question is unrelated to the PDF. 

PDF Text: ${fileContent}

Images (base64 or references): ${imagesBase64}

User Question: ${question}

If the question is related to the PDF, give a clear answer. 
If the question is unrelated, respond with "This question is not related to the PDF."`,
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

      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response returned.";

      setChat((prevChat) => [...prevChat, { question, response: aiResponse }]);
      setQuestion("");
    } catch (err) {
      console.error("Error in AI response:", err);
      setChat((prevChat) => [
        ...prevChat,
        { question, response: "Something went wrong. Check console." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2 sm:mb-0">
          <a href="/">DocuMind</a>
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-300">
          PDF Chat & Summarizer
        </h2>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white w-full sm:w-1/2 shadow-sm hover:border-indigo-500 transition"
        />
      </div>

      {pdfData && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* PDF Viewer */}
          <div className="w-full lg:w-2/5 h-[600px] border border-gray-700 rounded-lg shadow overflow-hidden">
            <Worker workerUrl={pdfjsWorker}>
              <Viewer fileUrl={pdfData} />
            </Worker>
          </div>

          {/* Chat Section */}
          <div className="flex flex-col w-full lg:w-3/5 gap-4">
            <div className="flex-1 h-[600px] p-4 bg-gray-800 border border-gray-700 rounded-lg overflow-y-auto">
              {chat.length === 0 ? (
                <p className="text-gray-400 text-center mt-20">
                  No chat yet. Ask a question based on the PDF.
                </p>
              ) : (
                chat.map((c, idx) => (
                  <div
                    key={idx}
                    className="mb-4 p-3 rounded-lg bg-gray-700 border border-gray-600"
                  >
                    <p className="font-semibold text-indigo-300">
                      Q:{" "}
                      <span className="font-normal text-gray-200">
                        {c.question}
                      </span>
                    </p>
                    <p className="mt-1 text-gray-200">
                      A: <span className="font-normal">{c.response}</span>
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={getAIResponse}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                {loading ? "Processing..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWithPdf;
