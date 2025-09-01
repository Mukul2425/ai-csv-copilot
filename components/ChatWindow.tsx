import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { ChatMessage, ChartData } from '../types';
import { BotIcon, UserIcon, SendIcon } from './icons';

interface ChartRendererProps {
  chart: ChartData;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ chart }) => {
    const processedData = useMemo(() => {
        if (!chart.data) return [];
        // For scatter plots, x-axis values are sent as strings but need to be numbers.
        if (chart.type === 'scatter') {
            return chart.data.map(item => ({
                ...item,
                [chart.xKey]: parseFloat(item[chart.xKey]),
                [chart.yKey]: parseFloat(item[chart.yKey]),
                 ...(chart.zKey && item[chart.zKey] != null && { [chart.zKey]: parseFloat(item[chart.zKey]) }),
            }));
        }
        return chart.data;
    }, [chart]);

    const renderChart = () => {
        switch (chart.type) {
            case 'bar':
                return (
                    <BarChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey={chart.xKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey={chart.yKey} fill="#22d3ee" />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey={chart.xKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Line type="monotone" dataKey={chart.yKey} stroke="#22d3ee" strokeWidth={2} dot={{ r: 4, fill: '#22d3ee' }} activeDot={{ r: 8 }} />
                    </LineChart>
                );
            case 'scatter':
                return (
                     <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" dataKey={chart.xKey} name={chart.xKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis type="number" dataKey={chart.yKey} name={chart.yKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        {chart.zKey && <ZAxis dataKey={chart.zKey} range={[60, 400]} name={chart.zKey} />}
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Legend wrapperStyle={{ fontSize: '14px' }}/>
                        <Scatter name="Data" data={processedData} fill="#22d3ee" />
                    </ScatterChart>
                );
            default:
                return <p>Unsupported chart type.</p>;
        }
    };

    return (
        <div className="mt-4 p-4 rounded-lg bg-slate-900/70 border border-slate-700">
            <ResponsiveContainer width="100%" height={300}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};


interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  isCsvLoaded: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isThinking, isCsvLoaded }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking && isCsvLoaded) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800">
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><BotIcon className="w-5 h-5 text-cyan-400"/></div>}
              
              <div className={`max-w-xl p-4 rounded-xl ${message.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                 <p className="whitespace-pre-wrap">{message.text}</p>
                 {message.chart && <ChartRenderer chart={message.chart} />}
              </div>

              {message.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-300"/></div>}
            </div>
          ))}
          {isThinking && (
             <div className="flex items-start gap-4 justify-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><BotIcon className="w-5 h-5 text-cyan-400"/></div>
               <div className="max-w-xl p-4 rounded-xl bg-slate-700 text-slate-200 rounded-bl-none flex items-center space-x-2">
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-700/60 bg-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isCsvLoaded ? "Ask a question about your data..." : "Please upload a CSV file first"}
            disabled={!isCsvLoaded || isThinking}
            className="w-full pl-4 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isCsvLoaded || isThinking || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-600 transition-colors disabled:hover:bg-transparent disabled:text-slate-600"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
