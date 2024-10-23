import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { ref, uploadString, getDownloadURL, deleteObject, listAll } from "firebase/storage"; 
import { storage } from './Firebase'; 
import { auth } from './Firebase'; 
import './SignaturePad.css'; 
import { compareSignatures } from './SignatureVerification'; 

const SignaturePad = () => {
  const sigPad = useRef({});
  const [imageURL, setImageURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [similarSignatures, setSimilarSignatures] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe(); 
  }, []);

  const clearPad = () => {
    sigPad.current.clear();
  };

  const verifySignature = async (newSignatureURL) => {
    const newSignatureImage = new Image();
    newSignatureImage.src = newSignatureURL;

    const similarityScores = await Promise.all(savedSignatures.map(async (oldSignatureURL) => {
      const oldSignatureImage = new Image();
      oldSignatureImage.src = oldSignatureURL;

      return new Promise((resolve) => {
        oldSignatureImage.onload = async () => {
          const score = await compareSignatures(newSignatureImage, oldSignatureImage);
          resolve({ url: oldSignatureURL, score });
        };
      });
    }));

    // Filter to get signatures above a certain similarity threshold (e.g., 80%)
    const similarMatches = similarityScores.filter(match => match.score >= 0.8);
    setSimilarSignatures(similarMatches);
    
    if (similarMatches.length > 0) {
      setVerificationResult("Similar signatures found!");
    } else {
      setVerificationResult("No similar signatures found.");
    }
  };

  const saveSignature = async () => {
    if (!user) {
      alert("You must be logged in to save a signature.");
      return;
    }

    if (sigPad.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const signatureDataURL = sigPad.current.getTrimmedCanvas().toDataURL("image/png");

    try {
      const signatureRef = ref(storage, `signatures/${user.uid}/${new Date().toISOString()}.png`);
      await uploadString(signatureRef, signatureDataURL, 'data_url');
      const downloadURL = await getDownloadURL(signatureRef);
      setImageURL(downloadURL);

      // Verify the new signature against saved signatures
      await verifySignature(downloadURL);
      await fetchSavedSignatures(); 

    } catch (error) {
      console.error("Error saving signature:", error);
      setErrorMessage("There was an error saving your signature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSignatures = async () => {
    if (!user) return;

    const userSignaturesRef = ref(storage, `signatures/${user.uid}/`);
    try {
      const listResponse = await listAll(userSignaturesRef);
      const urls = await Promise.all(
        listResponse.items.map(item => getDownloadURL(item))
      );
      setSavedSignatures(urls);
    } catch (error) {
      console.error("Error fetching saved signatures:", error);
      setErrorMessage("Could not fetch signatures.");
    }
  };

  const deleteSignature = async (signatureURL) => {
    const signatureRef = ref(storage, signatureURL);
    try {
      await deleteObject(signatureRef);
      fetchSavedSignatures(); 
    } catch (error) {
      console.error("Error deleting signature:", error);
    }
  };

  return (
    <div className="signature-container">
      <h2>Sign Below</h2>
      <SignatureCanvas
        ref={sigPad}
        penColor="black"
        canvasProps={{ className: 'signature-canvas' }}
      />
      <div className="buttons">
        <button onClick={clearPad}>Clear</button>
        <button onClick={saveSignature} disabled={loading}>
          {loading ? 'Saving...' : 'Save Signature'}
        </button>
      </div>

      {imageURL && (
        <div>
          <h3>Signature Saved:</h3>
          <img src={imageURL} alt="Signature" className="saved-signature" />
        </div>
      )}

      {verificationResult && <p className="verification-result">{verificationResult}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="similar-signatures">
        <h3>Similar Signatures:</h3>
        {similarSignatures.map((match, index) => (
          <div key={index} className="similar-signature-item">
            <img src={match.url} alt={`Similar Signature ${index}`} className="similar-signature-thumb" />
            <p>Similarity Score: {(match.score * 100).toFixed(2)}%</p>
          </div>
        ))}
      </div>

      <div className="saved-signatures">
        <h3>Your Saved Signatures:</h3>
        {savedSignatures.map((url, index) => (
          <div key={index} className="signature-item">
            <img src={url} alt={`Signature ${index}`} className="signature-thumb" />
            <button onClick={() => deleteSignature(url)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignaturePad;
