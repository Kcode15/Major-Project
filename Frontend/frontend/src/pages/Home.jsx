"use client";

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileText, Upload, Clock, X } from "lucide-react";
import { formatDate } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { getIdToken } from "firebase/auth";

const Home = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [selectedSummary, setSelectedSummary] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!user || !user.providerData || !user.displayName) return;

    const providerId = user.providerData[0]?.providerId;
    if (providerId === "google.com" && user.displayName !== username) {
      navigate("/unauthorized");
    }
  }, [user, username, navigate]);

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      if (!user?.displayName) return;

      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/summary/recent-document/?user_name=${user.displayName}`
        );
        const data = await res.json();
        setRecentDocuments(data.recent_documents || []);
      } catch (err) {
        console.error("Error fetching recent documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDocuments();
  }, [user?.displayName]);

  const fetchSummaryById = async (docId) => {
    if (!user) return;
  
    try {
  
      const res = await fetch(
        `http://localhost:8000/summary/document-summary/?document_id=${docId}&user_name=${user.displayName}`
      );
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Unknown error");
      }
  
      const data = await res.json();
      setSelectedSummary(data);
      setModalVisible(true);
    } catch (err) {
      console.error("Error fetching document summary:", err);
    }
  };

  const getRiskColor = (score) =>
    score < 40 ? "text-green-500" : score < 70 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5EEDC] via-[#f9f5ef] to-white p-6">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to LegalSutra, {username}!</h1>
          <p className="text-gray-600 text-lg">
            Your AI-powered legal document analysis platform
          </p>
        </div>

        {/* Upload CTA Card */}
        <div className="grid grid-cols-1 mb-12">
          <Card className="w-full max-w-2xl mx-auto text-center shadow-md">
            <CardHeader className="flex flex-col items-center justify-center pb-2">
              <Upload className="h-10 w-10 text-indigo-500 mb-4" />
              <CardTitle className="text-2xl font-semibold">Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <p className="text-sm text-gray-500">
                Upload your legal documents for AI-powered analysis and risk assessment.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Link to={`/upload/${username}`} className="w-full max-w-xs">
                <Button variant="primary" className="w-full">
                  Upload Now
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Documents */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
            Recent Documents
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : recentDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDate(doc.uploadDate)}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="flex justify-between px-6 pb-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSummaryById(doc.id)}
                    >
                      View Summary
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-6" />
                <p className="text-gray-500 text-center mb-6 text-lg">
                  No documents found
                </p>
                <Link to={`/upload/${username}`}>
                  <Button variant="primary">Upload Your First Document</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {modalVisible && selectedSummary && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-4xl rounded-lg p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => setModalVisible(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-semibold mb-6 text-center">Document Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {selectedSummary.summary || "No summary available."}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Key Clauses</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSummary.keyClauses && Object.entries(selectedSummary.keyClauses).length > 0 ? (
                Object.entries(selectedSummary.keyClauses).map(([clause, text], index) => (
                  <div key={index} className="mb-4">
                    <h4 className="font-semibold text-indigo-700">{clause}</h4>
                    <p className="text-gray-700 whitespace-pre-line text-sm">{text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No key clauses available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    )}
    </div>
  );
};

export default Home;
