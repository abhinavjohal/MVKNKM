// This is frontend/src/app/campaign-launcher/page.tsx

"use client";

import { useState } from "react";
import Link from 'next/link';

export default function CampaignLauncherPage() {
  const [brandName, setBrandName] = useState("");
  const [campaignBrief, setCampaignBrief] = useState("");
  const [targetCity, setTargetCity] = useState("");
  
  const [adCopy, setAdCopy] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAdCopy("");

    const campaignData = { brandName, campaignBrief, targetCity };

    try {
      const response = await fetch("http://127.0.0.1:3002/launch-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      
      setAdCopy(data.adCopy);

    } catch (error: any) {
      console.error("Error launching campaign:", error);
      setAdCopy(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Campaign Launcher 🚀</h1>
        <p>Use saved Brand DNA to generate a new, targeted ad campaign.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="brandName">Brand Name to Use</label>
          <input id="brandName" type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g., Hard Rock Cafe (must exist in your database)" required />
        </div>

        <div className="form-group">
          <label htmlFor="targetCity">Audience Location (Where to show ads)</label>
          <input id="targetCity" type="text" value={targetCity} onChange={(e) => setTargetCity(e.target.value)} placeholder="e.g., Sector 26, Chandigarh" required />
        </div>

        <div className="form-group">
          <label htmlFor="campaignBrief">Campaign Brief / Offer</label>
          <textarea id="campaignBrief" value={campaignBrief} onChange={(e) => setCampaignBrief(e.target.value)} placeholder="e.g., Announce our new 'Monsoon Munchies' combo for 20% off." rows={4} required />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "✨ Launch Campaign & Generate Ads"}
        </button>
      </form>

      {adCopy && (
        <section className="results">
          <h2>Generated Ad Copy:</h2>
          <div className="ad-copy-output">
            <pre>{adCopy}</pre>
          </div>
        </section>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link href="/brand-hub" style={{textDecoration: 'underline'}}>
              ← Back to Brand Hub
          </Link>
        </div>
    </main>
  );
}