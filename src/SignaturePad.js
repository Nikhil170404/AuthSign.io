import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { ref, uploadString, getDownloadURL, deleteObject, listAll } from "firebase/storage"; // Ensure listAll is imported
import { storage } from './Firebase'; // Firebase setup
import { auth } from './Firebase'; // Import Firebase Auth
import './SignaturePad.css'; // Updated styling
import { compareSignatures } from './SignatureVerification'; // Signature comparison logic

const SignaturePad = () => {
  const sigPad = useRef({});
  const [imageURL, setImageURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const [savedSignatures, setSavedSignatures] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const clearPad = () => {
    sigPad.current.clear();
  };

  const verifySignature = async (newSignatureURL, oldSignatureURL) => {
    const img1 = new Image();
    img1.src = newSignatureURL;

    const img2 = new Image();
    img2.src = oldSignatureURL;

    img1.onload = () => {
      img2.onload = () => {
        const result = compareSignatures(img1, img2);
        setVerificationResult(result ? "Signatures Match!" : "Signatures Do Not Match!");
      };
    };
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

      // Fetch an old signature URL for verification
      const oldSignatureURL = await fetchOldSignatureURL(); // Replace with actual fetching logic if needed
      await verifySignature(downloadURL, oldSignatureURL); // Call verifySignature after saving

      // Refresh saved signatures
      await fetchSavedSignatures(); // Wait for signatures to be fetched

    } catch (error) {
      console.error("Error saving signature:", error);
      setErrorMessage("There was an error saving your signature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOldSignatureURL = async () => {
    // Implement logic to fetch the old signature URL if needed
    // For now, you can return a placeholder or a fetched URL from Firebase
    return ''; // Replace with actual URL fetching logic
  };

  const fetchSavedSignatures = async () => {
    if (!user) return;

    const userSignaturesRef = ref(storage, `signatures/${user.uid}/`);
    try {
      // List all files in the user's signatures folder
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
      fetchSavedSignatures(); // Refresh the list after deletion
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
