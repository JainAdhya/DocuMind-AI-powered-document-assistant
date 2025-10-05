import React from "react";

function HomePage() {
  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative px-10 py-6 bg-gray-950 text-white shadow-md">
        <a
          href="/"
          className="text-3xl font-extrabold tracking-tight hover:text-indigo-400 transition"
        >
          DocuMind
        </a>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg"></div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 lg:px-8">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Summarize & Chat with Your PDFs
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl mb-10">
            DocuMind helps you quickly summarize documents and interact with
            PDFs using AI-powered tools.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="/summarize"
              className="group relative inline-block rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 text-lg font-semibold text-white overflow-hidden transition hover:scale-105"
            >
              <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition"></span>
              Summarize PDF
            </a>
            <a
              href="/chatwithpdf"
              className="group relative inline-block rounded-lg bg-gradient-to-r from-pink-500 to-red-500 px-8 py-4 text-lg font-semibold text-white overflow-hidden transition hover:scale-105"
            >
              <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition"></span>
              Chat with PDF
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
