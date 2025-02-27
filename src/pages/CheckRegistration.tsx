import React, { useState } from "react";
import axios from "axios";

const CheckRegistration: React.FC<{ setError: any }> = ({ setError }) => {
  const [domain, setDomain] = useState("");
  const [domainData, setDomainData] = useState<{ registered: string[]; unregistered: string[] }>({
    registered: [],
    unregistered: []
  });

  const handleDomainCheck = async () => {
    try {
      setError("");

      const response = await axios.post("http://18.192.226.48:5000/api/check-registration", { domain });

      if (response.data) {
        // ✅ Ensure registered/unregistered are always arrays
        const registered = response.data.registered || [];
        const unregistered = response.data.unregistered || [];

        setDomainData({ registered, unregistered });
      } else {
        setError("No extensions found for this domain.");
        setDomainData({ registered: [], unregistered: [] });
      }
    } catch (err) {
      setError("Error fetching data.");
      setDomainData({ registered: [], unregistered: [] });
    }
  };

  return (
    <div className="flex-1 border border-gray-300 shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Check Domain</h3>
      <div className="flex space-x-4">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
          placeholder="Enter domain (e.g., 3333.ip-com.co.il)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button
          className="px-6 py-3 border border-gray-400 rounded hover:bg-gray-200 transition"
          onClick={handleDomainCheck}
        >
          Check
        </button>
      </div>

      {/* 🔹 Display API Response */}
      {domainData && (
        <div className="mt-4 p-4 border border-gray-200 rounded">
          <h4 className="text-lg font-semibold">Results:</h4>

          {/* ✅ Show Registered Extensions */}
          <div className="mt-2">
            <strong>Registered Extensions:</strong>
            <ul className="list-disc pl-5">
              {domainData.registered.length > 0 ? (
                domainData.registered.map((ext, index) => <li key={index}>{ext}</li>)
              ) : (
                <li className="text-gray-500">No registered extensions.</li>
              )}
            </ul>
          </div>

          {/* ✅ Show Unregistered Extensions */}
          <div className="mt-2">
            <strong>Unregistered Extensions:</strong>
            <ul className="list-disc pl-5">
              {domainData.unregistered.length > 0 ? (
                domainData.unregistered.map((ext, index) => <li key={index}>{ext}</li>)
              ) : (
                <li className="text-gray-500">No unregistered extensions.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};



const ExtensionCheck: React.FC<{ domain: string }> = ({ domain }) => {
  const [extension, setExtension] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const handleExtensionCheck = async () => {
    try {
      setRegistrationError("");
      const response = await axios.post("http://18.192.226.48:5000/api/check-extension", { domain, extension });
      if (response.data.status === "failed") {
        alert(`Registration failed for extension ${extension}.`);
      } else {
        alert(`Extension ${extension} is registered at ${response.data.sipIp}`);
      }
    } catch (err) {
      setRegistrationError("Extension not found or inactive.");
    }
  };

  return (
    <div className="flex-1 border border-gray-300 shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Check Extension</h3>
      <div className="flex space-x-4">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
          placeholder="Enter extension (200-399)"
          value={extension}
          onChange={(e) => setExtension(e.target.value)}
        />
        <button
          className="px-6 py-3 border border-gray-400 rounded hover:bg-gray-200 transition"
          onClick={handleExtensionCheck}
        >
          Check
        </button>
      </div>
      {registrationError && <p className="text-red-500 mt-2">{registrationError}</p>}
    </div>
  );
};



export default CheckRegistration;
