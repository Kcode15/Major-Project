import { useState, useEffect, useRef} from "react";
import { useLocation, useNavigate, Link , useParams} from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Spinner } from 'react-bootstrap';
import { FileText, BarChart2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import html2pdf from "html2pdf.js";  

const SummaryGeneration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { docid} = useParams();
  const [error, setError] = useState('');
  const [summary, setSummary] = useState("");
  const [keyClauses, setKeyClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState({ title: "", type: "", fileSize: "" });
  const pageRef = useRef(null);

  useEffect(() => {
    const state = location.state;

    if (state && state.summary && state.keyClauses && state.document) {
      setSummary(state.summary);
      setKeyClauses(state.keyClauses);
      setDocument(state.document);
      setLoading(false);
    } else {
    
      const fetchFromBackend = async () => {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/summary/get-summary/${docid}/`);
          const data = res.data;

          setSummary(data.summary);
          setKeyClauses(data.keyClauses);
          setDocument({
            title: data.file_name,
            type: data.file_type || "pdf",
            fileSize: data.file_size || "Unknown",
          });
          setLoading(false);
        } catch (err) {
          console.error("Error fetching summary:", err);
          alert("Failed to fetch summary. Please re-upload.");
          navigate("/");
        }
      };

      fetchFromBackend();
    }
  }, [docid, location.state, navigate]);

  //Regenerating the summary
  const handleRegenerate = async () => {
    if (!docid) {
      console.error("ID is missing");
      alert("Document ID is missing. Please try again.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log("Regenerating summary...");
      const res = await axios.post(`http://127.0.0.1:8000/summary/regenerate-summary/${docid}/`);

      const data = res.data;
      setSummary(data.summary);
      setKeyClauses(data.keyClauses);

      console.log("Regeneration response:", data);
    } catch (error) {
      console.error("Error regenerating summary:", error);
      setError('Failed to regenerate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // downloading it
  const handleDownloadPageAsPDF = () => {
    const element = pageRef.current;
    if (!element) return;

    const options = {
      margin: 0.5,
      filename: 'document_summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().set(options).from(element).save();
  };

  
  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-[#F5EEDC] via-[#f9f5ef] to-white p-6">
      <div ref={pageRef} className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Document Summary</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-indigo-500 mr-2" />
              <div>
                <CardTitle>{document.title}</CardTitle>
                <CardDescription>
                  {document.type.charAt(0).toUpperCase() + document.type.slice(1)} • {document.fileSize}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Clauses</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(keyClauses).map(([clause, text], index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-semibold text-indigo-700">{clause}</h4>
                  <p className="text-gray-700 whitespace-pre-line text-sm">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <Button variant="outline" onClick={handleRegenerate} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Regenerate Summary"}
        </Button>

        <Button variant="default" onClick={handleDownloadPageAsPDF}>
          Download Summary
        </Button>

        <Link to={`/RiskAnalysis/${user.displayName}`} state={{ document }}>
          <Button variant="primary">
            <BarChart2 className="mr-2 h-4 w-4" />
            View Risk Analysis
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SummaryGeneration;
