// This is the full code for frontend/src/app/brand-hub/page.tsx

"use client";

import { useState } from "react";
import Link from 'next/link';

// We define a type for our voice adjectives state to keep track of checkboxes
type VoiceAdjectives = {
  witty: boolean;
  luxurious: boolean;
  friendly: boolean;
  bold: boolean;
  minimalist: boolean;
};

export default function BrandHubPage() {
  // State to manage which view we are showing: 'scrape' or 'review'
  const [onboardingStep, setOnboardingStep] = useState('scrape');

  // State for the initial URL input
  const [scrapeUrl, setScrapeUrl] = useState("");

  // State for all our detailed form fields
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandOneLiner, setBrandOneLiner] = useState("");
  const [primaryMarkets, setPrimaryMarkets] = useState("");
  const [brandHomeBase, setBrandHomeBase] = useState("");
  const [voiceAdjectives, setVoiceAdjectives] = useState<VoiceAdjectives>({
    witty: false,
    luxurious: false,
    friendly: false,
    bold: false,
    minimalist: false,
  });
  const [humorStyle, setHumorStyle] = useState("None");
  const [wordsToUse, setWordsToUse] = useState("");
  const [wordsToAvoid, setWordsToAvoid] = useState("");
  const [voiceExample, setVoiceExample] = useState("");
  const [productList, setProductList] = useState("");

  // State for loading and status messages
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // --- NEW FUNCTION: Handles the initial scrape ---
  const handleScrape = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage("Analyzing website... This may take a moment.");

    try {
      const response = await fetch("http://localhost:3002/scrape-and-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      if (!response.ok) throw new Error("Failed to scrape the URL. Please ensure it's a valid, public website.");

      const data = await response.json();

      // Pre-populate the form fields with the AI's analysis
      setBrandName(data.brandName || "");
      setWebsiteUrl(scrapeUrl); // Use the URL they entered
      setBrandOneLiner(data.brandOneLiner || "");
      setWordsToUse(data.wordsToUse || "");
      setProductList(data.productListSummary || "");
      
      // A simple way to check the boxes based on the AI's adjective string
      const adjectives = (data.voiceAdjectives || "").toLowerCase();
      setVoiceAdjectives({
          witty: adjectives.includes('witty'),
          luxurious: adjectives.includes('luxurious'),
          friendly: adjectives.includes('friendly'),
          bold: adjectives.includes('bold'),
          minimalist: adjectives.includes('minimalist'),
      });

      // Move to the next step
      setStatusMessage("✅ Analysis complete! Please review and refine your Brand DNA.");
      setOnboardingStep('review');

    } catch (error: any) {
      setStatusMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- This function now saves the final, human-edited data ---
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage("Saving your Brand DNA...");

    const selectedAdjectives = Object.keys(voiceAdjectives).filter(key => voiceAdjectives[key as keyof VoiceAdjectives]).join(', ');

    const brandData = {
      brandName, websiteUrl, brandOneLiner, primaryMarkets, brandHomeBase,
      voiceAdjectives: selectedAdjectives, humorStyle, wordsToUse, wordsToAvoid,
      voiceExample, productList,
    };

    try {
      const response = await fetch("http://localhost:3002/save-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandData),
      });

      if (!response.ok) throw new Error("Server responded with an error.");
      
      const data = await response.json();
      if (data.success) {
        setStatusMessage("✅ Brand DNA Saved Successfully!");
      }
    } catch (error) {
      console.error("Error saving Brand DNA:", error);
      setStatusMessage("❌ Failed to save. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdjectiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setVoiceAdjectives(prevState => ({ ...prevState, [name]: checked }));
  };

  return (
    <main className="container">
      <header>
        <h1>Brand Hub 🧬</h1>
        <p>Onboard a new brand by saving its core DNA to our system.</p>
      </header>

      {/* --- CONDITIONAL RENDERING: Shows one view or the other --- */}
      {onboardingStep === 'scrape' ? (
        // The initial "Scrape" view
        <form onSubmit={handleScrape}>
            <div className="form-group">
                <label htmlFor="scrapeUrl">Enter Your Website URL to Begin</label>
                <input id="scrapeUrl" type="text" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} placeholder="https://www.yourbrand.com" required />
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? "Analyzing..." : "🚀 Scrape & Build My Brand DNA"}
            </button>
        </form>
      ) : (
        // The "Review & Refine" view
        <form onSubmit={handleSave}>
          {/* All the detailed form fields go here... */}
          <div className="form-group">
            <label htmlFor="brandName">Brand Name</label>
            <input id="brandName" type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
          </div>
          {/* ... (all the other form fields from our previous version) ... */}
          <div className="form-group">
            <label htmlFor="websiteUrl">Website URL</label>
            <input id="websiteUrl" type="text" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="brandOneLiner">Brand One-Liner</label>
            <textarea id="brandOneLiner" value={brandOneLiner} onChange={(e) => setBrandOneLiner(e.target.value)} rows={2} required />
          </div>
          <div className="form-group">
            <label htmlFor="primaryMarkets">Primary Markets</label>
            <input id="primaryMarkets" type="text" value={primaryMarkets} onChange={(e) => setPrimaryMarkets(e.target.value)} placeholder="e.g., Chandigarh, Mumbai, Bangalore" />
          </div>
          <div className="form-group">
            <label htmlFor="brandHomeBase">Brand's Home Base / Service Area</label>
            <input id="brandHomeBase" type="text" value={brandHomeBase} onChange={(e) => setBrandHomeBase(e.target.value)} placeholder="e.g., Punjab, India" required />
          </div>
          <div className="form-group">
            <label>Voice Adjectives</label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {Object.keys(voiceAdjectives).map((adj) => (
                <label key={adj} style={{ fontWeight: 'normal' }}>
                  <input type="checkbox" name={adj} checked={voiceAdjectives[adj as keyof VoiceAdjectives]} onChange={handleAdjectiveChange} /> {adj.charAt(0).toUpperCase() + adj.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="humorStyle">Humor Style</label>
            <select id="humorStyle" value={humorStyle} onChange={(e) => setHumorStyle(e.target.value)}>
              <option>None</option>
              <option>Witty / Sarcastic</option>
              <option>Puns</option>
              <option>Memes / Trending</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="wordsToUse">Words to Use (AI-Generated)</label>
            <textarea id="wordsToUse" value={wordsToUse} onChange={(e) => setWordsToUse(e.target.value)} rows={2} />
          </div>
          <div className="form-group">
            <label htmlFor="wordsToAvoid">Words to Avoid</label>
            <textarea id="wordsToAvoid" value={wordsToAvoid} onChange={(e) => setWordsToAvoid(e.target.value)} rows={2} placeholder="e.g., Cheap, Sale, Discount" />
          </div>
          <div className="form-group">
            <label htmlFor="voiceExample">Brand Voice Example (Optional)</label>
            <textarea id="voiceExample" value={voiceExample} onChange={(e) => setVoiceExample(e.target.value)} rows={2} />
          </div>
          <div className="form-group">
            <label htmlFor="productList">Product / Service List (AI-Generated Summary)</label>
            <textarea id="productList" value={productList} onChange={(e) => setProductList(e.target.value)} rows={4} required />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "💾 Save Final Brand DNA"}
          </button>
        </form>
      )}

      {statusMessage && <p style={{ textAlign: 'center', marginTop: '20px' }}>{statusMessage}</p>}
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link href="/campaign-launcher" style={{textDecoration: 'underline'}}>
              Go to Campaign Launcher →
          </Link>
        </div>
    </main>
  );
}
