import React, { useEffect, useState } from "react"
import axios from "axios"
import { useFile } from "../context/FileContext"
import { FileText, AlertTriangle, CheckCircle, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const RiskAnalysis = () => {
  const { uploadedFile, documentInfo } = useFile()
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth();

  useEffect(() => {
    if (!uploadedFile || !documentInfo) {
      console.warn("Missing uploaded file or document info.")
      setError("Please upload a document first.")
      return
    }

    const fetchRiskAnalysis = async () => {
      setLoading(true)
      setError(null)
      const formData = new FormData()
      formData.append("file", uploadedFile)

      try {
        const response = await axios.post(
          "http://localhost:8000/risk/analyze/",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
        setRiskData(response.data)
      } catch (err) {
        console.error("Error during risk analysis:", err)
        setError("Failed to analyze document.")
      } finally {
        setLoading(false)
      }
    }

    fetchRiskAnalysis()
  }, [uploadedFile, documentInfo])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low": return "text-green-500"
      case "medium": return "text-yellow-500"
      case "high": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  const getSeverityBgColor = (severity) => {
    switch (severity) {
      case "low": return "bg-green-100"
      case "medium": return "bg-yellow-100"
      case "high": return "bg-red-100"
      default: return "bg-gray-100"
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "low": return <CheckCircle className="h-5 w-5 text-green-500" />
      case "medium": return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "high": return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return null
    }
  }

  const getRiskScoreColor = (score) => {
    if (score < 40) return "text-green-600"
    if (score < 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getRiskScoreBgColor = (score) => {
    if (score < 30) return "bg-green-400"
    if (score < 50) return "bg-yellow-400"
    return "bg-red-400"
  }

  if (loading) return <p className="text-blue-500 p-6 text-center text-lg">🔍 Analyzing document...</p>
  if (error) return <p className="text-red-500 p-6 text-center text-lg">{error}</p>
  if (!riskData) return <p className="text-gray-500 p-6 text-center">No risk data found.</p>

  const analysis = riskData.risk_analysis || riskData

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#fef9f5] via-[#f0f4ff] to-white py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
    
        <button
          onClick={() => navigate(`/summary/${user.displayName}/${data.document_id}`,)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Summary
        </button>

        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-4"> Risk Analysis Report</h1>

        <Card className="shadow-lg border border-indigo-100 bg-white rounded-xl">
          <CardHeader className="flex flex-col items-start gap-2">
            <div className="flex items-center text-xl font-semibold text-indigo-600">
              <FileText className="mr-2 h-6 w-6" />
              Document Type: {riskData.document_type}
            </div>
            <div className="flex items-center justify-between w-full mt-4">
              <div>
                <p className="text-sm text-gray-500">Overall Risk Score</p>
                <div className="text-3xl font-bold mt-1 text-indigo-700">
                  {(analysis.overallRiskScore || analysis.risk_percentage).toFixed(2)}%
                </div>
                <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
                  <div
                    className={`h-2 rounded-full ${getRiskScoreBgColor(Number((analysis.overallRiskScore || analysis.risk_percentage || 0).toFixed(2)))}`}
                    style={{ width: `${(analysis.overallRiskScore || analysis.risk_percentage || 0).toFixed(2)}%` }}
                  ></div>
                </div>
              </div>
              <Shield className="h-10 w-10 text-indigo-500" />
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow border border-gray-100 bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Detailed Risk Breakdown</h2>

          {riskData.risk_analysis ? (
            <>
              <p className="text-gray-700"><strong>Risk Level:</strong> {analysis.risk_category}</p>
              <p className="text-gray-700 mb-4">
                <strong>Risk Percentage:</strong> {analysis.risk_percentage.toFixed(2)}%
              </p>

              <div className="space-y-4">
                {Object.entries(analysis.risk_scores || {}).map(([category, score], idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-md shadow-sm">
                    <p className="text-lg font-semibold">
                      {category}: <span className={getSeverityColor(category.toLowerCase())}>{score}</span>
                    </p>
                    <ul className="list-disc pl-6 mt-2 text-sm text-gray-600">
                      {(analysis.relevant_sentences?.[category] || []).map((sentence, i) => (
                        <li key={i}>{sentence}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700"><strong>Risk Level:</strong> {riskData.risk_level}</p>
              <p className="text-gray-700 mb-4">
                <strong>Risk Percentage:</strong> {riskData.risk_percentage.toFixed(2)}%
              </p>

              <div className="space-y-4">
                {riskData.risk_details?.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-md shadow-sm">
                    <p className="text-lg font-semibold">{item.category}</p>
                    <ul className="list-disc pl-6 mt-2 text-sm text-gray-600">
                      {item.evidence?.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default RiskAnalysis
