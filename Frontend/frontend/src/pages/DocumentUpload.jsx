import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFile } from "../context/FileContext";

function Upload() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setUploadedFile } = useFile();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      event.target.value = null;
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setUploadedFile(selectedFile);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append('user_name', user.displayName);
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/summary/extract-text/", formData);
      const data = response.data;

      navigate(`/summary/${user.displayName}/${data.document_id}`, {
        state: {
          summary: data.summary,
          keyClauses: data.keyClauses,
          document: {
            title: file.name,
            type: file.type.split("/")[1],
            fileSize: (file.size / 1024).toFixed(2) + " KB",
          },
        },
      });

    } catch (error) {
      alert("Error analyzing the contract.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5EEDC] via-[#f9f5ef] to-white p-6">
      <div className="w-full max-w-md shadow-2xl rounded-2xl p-8 border border-[#e0d9c8] bg-transparent">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Upload Your Contract
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Choose PDF File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-800 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5F99AE] focus:border-[#5F99AE]"
            />
          </div>

          <button
            onClick={handleUploadAndAnalyze}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded-lg transition-all duration-300 ease-in-out"
          >
            Upload and Analyze
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;
