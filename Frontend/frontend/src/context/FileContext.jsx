import { createContext, useContext, useState } from "react"

const FileContext = createContext()

export const useFile = () => useContext(FileContext)


export const FileProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null)
  
  const [documentInfo, setDocumentInfo] = useState({
    title: "",
    type: "",
    fileSize: ""
  })

  return (
    <FileContext.Provider
      value={{ uploadedFile, setUploadedFile, documentInfo, setDocumentInfo }}
    >
      {children}
    </FileContext.Provider>
  )
}
