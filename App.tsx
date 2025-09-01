import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { ChatWindow } from './components/ChatWindow';
import { CsvData, CsvRow, ChatMessage as ChatMessageType } from './types';
import { getInsightsAndChart } from './services/geminiService';
import { LogoIcon } from './components/icons';

export default function App(): React.ReactNode {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: 'model',
      text: "Hello! I'm your AI CSV Co-Pilot. Please upload a CSV file to begin.",
    },
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setCsvData(null);
      setError(null);
      setIsParsing(true);
      setMessages([{ role: 'model', text: `Parsing "${selectedFile.name}"...`}]);

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results: any) => {
          if (results.errors.length > 0) {
            setError(`Error parsing CSV: ${results.errors[0].message}`);
            setMessages([{ role: 'model', text: `I couldn't parse that CSV. The error was: ${results.errors[0].message}` }]);
          } else {
            const headers = results.meta.fields || [];
            const data = results.data as CsvRow[];
            setCsvData({ headers, data });
            setMessages([
              { role: 'model', text: `Successfully loaded "${selectedFile.name}". You can now ask questions about your data.`}
            ]);
          }
          setIsParsing(false);
        },
        error: (err: Error) => {
          setError(err.message);
          setIsParsing(false);
          setMessages([{ role: 'model', text: `An error occurred: ${err.message}` }]);
        }
      });
    }
  };

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!csvData || csvData.data.length === 0 || isThinking) return;

    const userMessage: ChatMessageType = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await getInsightsAndChart(prompt, csvData.data);
      const modelMessage: ChatMessageType = {
        role: 'model',
        text: response.insight,
        chart: response.chart ?? undefined,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessageType = {
        role: 'model',
        text: "Sorry, I encountered an error trying to process your request. Please check the console for details or try a different question.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  }, [csvData, isThinking]);

  return (
    <div className="flex h-screen w-screen bg-slate-900 font-sans">
      <div className="flex flex-col w-1/3 max-w-lg border-r border-slate-700/60 p-4 space-y-4">
        <header className="flex items-center space-x-2 pb-2 border-b border-slate-700/60">
          <LogoIcon className="h-8 w-8 text-cyan-400" />
          <h1 className="text-xl font-bold text-slate-100">AI CSV Co-Pilot</h1>
        </header>
        <FileUpload onFileChange={handleFileChange} isParsing={isParsing} />
        {error && <div className="text-red-400 p-2 bg-red-900/20 rounded-md text-sm">{error}</div>}
        <div className="flex-grow min-h-0">
          <DataTable csvData={csvData} />
        </div>
      </div>
      <div className="flex-grow flex flex-col h-full">
        <ChatWindow 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isThinking={isThinking} 
          isCsvLoaded={!!csvData}
        />
      </div>
    </div>
  );
}