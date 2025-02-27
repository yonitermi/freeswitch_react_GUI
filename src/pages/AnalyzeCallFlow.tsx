
import React, { useState, useMemo } from "react";
import axios from "axios";
import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

const API_BASE_URL = "http://18.192.226.48:5000/api";

// CustomNode Component Inside AnalyzeCallFlow.tsx


const CustomNode: React.FC<any> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExpand = async () => {
    setExpanded(!expanded);
    if (!expanded) {
        setLoading(true);
        const [destination, domain] = data.destination.split("@");
        
        console.log("Extracted Destination:", destination);
        console.log("Extracted Domain:", domain);

        try {
            const serviceUrl = getServiceUrl(Number(destination), domain);
            console.log("Fetching URL:", serviceUrl); // ✅ Log API request URL

            if (serviceUrl) {
                const response = await axios.get(serviceUrl);
                console.log("Fetched Data:", response.data); // ✅ Log API response
                setDetails(response.data);
            } else {
                console.error("Service URL not found for:", destination, domain);
                setDetails({ error: "No service available for this destination." });
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            setDetails({ error: "Failed to load data." });
        } finally {
            setLoading(false);
        }
    }
};



const getServiceUrl = (destination: number, domain: string) => {
    const cleanDomain = domain?.replace(/[\[\]]/g, ""); // Removes any brackets
    if (destination >= 400 && destination <= 499) {
      return `${API_BASE_URL}/ring-group?extension=${destination}&domain=${cleanDomain}`;
    } else if (destination >= 600 && destination <= 699) {
      return `${API_BASE_URL}/ivr?extension=${destination}&domain=${cleanDomain}`;
    } else if (destination >= 800 && destination <= 899) {
      return `${API_BASE_URL}/time-condition?extension=${destination}&domain=${cleanDomain}`;
    } else if (destination >= 200 && destination <= 399) {
      return `${API_BASE_URL}/extension?extension=${destination}&domain=${cleanDomain}`;
    }
    return null;
};


  return (
    <div
      className={`relative p-6 text-white rounded-lg shadow-lg cursor-pointer transition transform hover:scale-105 ${
        data.color
      } m-6 border border-gray-200 bg-opacity-90 backdrop-blur-md ${
        expanded ? "min-h-[200px]" : "min-h-[100px]"
      }`}
      style={{ minWidth: "220px", textAlign: "center" }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <div>
        <strong className="block text-lg font-semibold">{data.event}</strong>
        <p className="text-sm text-gray-100">Destination: {data.destination}</p>
      </div>

      <button
        className="mt-2 px-4 py-1 bg-white text-blue-600 rounded shadow hover:bg-gray-200 transition"
        onClick={handleExpand}
      >
        {expanded ? "Collapse" : "Expand"}
      </button>

      {expanded && (
        <div className="mt-2 p-2 bg-gray-900 text-white rounded overflow-auto max-h-60">
          {loading ? (
            <p>Loading...</p>
          ) : details ? (
            <div className="text-sm bg-gray-800 p-2 rounded">
              {Array.isArray(details) ? ( // ✅ Handle IVR Data
                <ul className="list-disc list-inside">
                  {details.map((item, index) => (
                    <li key={index}>
                      {item.DTMF_Key} ➝ {item.Destination.split(" ")[1]} {/* Extracts only the number */}
                    </li>
                  ))}
                </ul>
              ) : ( // ✅ Handle Normal JSON Objects
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {Object.entries(details).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-700">
                        <td className="font-bold px-2 py-1">{key}</td>
                        <td className="px-2 py-1 break-words">
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
};



// ✅ Now use CustomNode in ReactFlow
const AnalyzeCallFlow: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callFlow, setCallFlow] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a valid phone number.");
      return;
    }
    try {
      setError("");
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/call-flow`, { phoneNumber });
      setCallFlow(response.data.callFlow);
    } catch {
      setError("No call flow found for this number.");
      setCallFlow([]);
    } finally {
      setIsLoading(false);
    }
  };

const nodes = useMemo(() => {
    return callFlow.map((event, index) => ({
      id: `${index}`,
      type: "custom",
      draggable: true,
      position: { x: index * 400, y: 150 },
      data: { event: event.event, destination: event.display, color: "bg-blue-500" },
    }));
  }, [callFlow]);

  const nodeTypes = { custom: CustomNode };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-9xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Analyze Call Flow</h2>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-xl mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Enter Phone Number</h3>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-400"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button
                className="p-3 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition disabled:opacity-50"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Analyze Call Flow 🔍"}
              </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
        {callFlow.length > 0 && (
          <div className="h-[500px] border border-gray-300 rounded-xl shadow-md bg-white p-4">
            <ReactFlow nodes={nodes} nodeTypes={nodeTypes} fitView>
              <Background color="#ddd" gap={16} />
              <Controls />
            </ReactFlow>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Default export AnalyzeCallFlow
export default AnalyzeCallFlow;

