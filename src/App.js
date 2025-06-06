import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    Timestamp,
    writeBatch 
} from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

// --- Icons ---
const WineBottleIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.252 2.262A2.25 2.25 0 0 0 5.254 4.24v11.517a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25V4.24a2.25 2.25 0 0 0-1.998-1.978A2.253 2.253 0 0 0 15 2.25H9c-1.014 0-1.881.676-2.172 1.622a2.24 2.24 0 0 1 .424-1.61ZM9 4.5h6M9 7.5h6m-6 3h6m-3.75 3h.008v.008h-.008V15Z" />
    </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const FoodIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const UserIcon = ({className = "w-5 h-5"}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const LogoutIcon = ({className = "w-5 h-5"}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L21.75 9 18.937 5.154a4.5 4.5 0 0 0-3.09-3.09L12.75 3l-2.846.813a4.5 4.5 0 0 0-3.09 3.09L6 9l2.846.813a4.5 4.5 0 0 0 3.09 3.09L12.75 12l-.813 2.846a4.5 4.5 0 0 0-3.09 3.09L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813" />
    </svg>
);

const UploadIcon = ({ className="w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);


// --- Firebase Config ---
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBsdxrVpBqirIxNCNgN1SPYHM7s2axaRA",
  authDomain: "mywineapp.firebaseapp.com",
  projectId: "mywineapp",
  storageBucket: "mywineapp.firebasestorage.app",
  messagingSenderId: "208476333397",
  appId: "1:208476333397:web:480e850942953e8b8c7bdc",
  measurementId: "G-95MENR8XZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-wine-cellar-app-v3';

// --- Helper Components ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            {/* Dialog Box with max height and scroll */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600"
                    >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const AlertMessage = ({ message, type, onDismiss, isHtml = false }) => {
    if (!message) return null;
    const baseClasses = "p-4 rounded-md mb-4 text-sm";
    const typeClasses = {
        success: "bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300",
        error: "bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300",
        info: "bg-blue-100 border border-blue-400 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300",
        warning: "bg-yellow-100 border border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300",
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info} flex justify-between items-center`}>
            {isHtml ? <span dangerouslySetInnerHTML={{ __html: message }} /> : <span>{message}</span>}
            {onDismiss && (
                 <button onClick={onDismiss} className="ml-4 text-lg font-semibold">&times;</button>
            )}
        </div>
    );
};

// --- Main App Component ---
function App() {
    const [auth, setAuthInstance] = useState(null); 
    const [db, setDbInstance] = useState(null); 
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [wines, setWines] = useState([]);
    const [isLoadingWines, setIsLoadingWines] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showWineFormModal, setShowWineFormModal] = useState(false);
    const [currentWineToEdit, setCurrentWineToEdit] = useState(null);

    const [showFoodPairingModal, setShowFoodPairingModal] = useState(false);
    const [selectedWineForPairing, setSelectedWineForPairing] = useState(null);
    const [foodPairingSuggestion, setFoodPairingSuggestion] = useState('');
    const [isLoadingPairing, setIsLoadingPairing] = useState(false);

    const [foodForReversePairing, setFoodForReversePairing] = useState('');
    const [reversePairingResult, setReversePairingResult] = useState('');
    const [isLoadingReversePairing, setIsLoadingReversePairing] = useState(false);
    const [showReversePairingModal, setShowReversePairingModal] = useState(false);

    const [csvFile, setCsvFile] = useState(null);
    const [isImportingCsv, setIsImportingCsv] = useState(false);
    const [csvImportStatus, setCsvImportStatus] = useState({ message: '', type: '', errors: [] });


    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) {
            setError("Firebase configuration is missing. Please contact support.");
            setIsAuthReady(true); 
            return;
        }
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setLogLevel('debug'); 

            setAuthInstance(authInstance);
            setDbInstance(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    setUserId(firebaseUser.uid);
                } else {
                    try {
                        const currentToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                        if (currentToken) {
                            await signInWithCustomToken(authInstance, currentToken);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (signInError) {
                        setError(`Sign-in failed: ${signInError.message}`);
                        setUser(null); setUserId(null);
                    }
                }
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        } catch (e) {
            setError("Could not initialize Firebase. Some features may not work.");
            setIsAuthReady(true); 
        }
    }, []);

    useEffect(() => {
        if (!db || !userId || !isAuthReady) {
            setIsLoadingWines(isAuthReady && (!db || !userId)); 
            return;
        }
        
        setIsLoadingWines(true);
        const winesCollectionPath = `artifacts/${appId}/users/${userId}/wines`;
        const q = query(collection(db, winesCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const winesData = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            winesData.sort((a, b) => {
                const producerCompare = (a.producer || "").localeCompare(b.producer || "");
                if (producerCompare !== 0) return producerCompare;
                return (a.year || 0) - (b.year || 0);
            });
            setWines(winesData);
            setIsLoadingWines(false);
            setError(null); 
        }, (err) => {
            setError(`Failed to fetch wines: ${err.message}. Check Firestore rules & connectivity.`);
            setWines([]); 
            setIsLoadingWines(false);
        });
        return () => unsubscribe();
    }, [db, userId, isAuthReady]);

    const handleAddWine = async (wineData) => {
        if (!db || !userId) { setError("Database not ready or user not logged in."); return; }
        try {
            const winesCollectionPath = `artifacts/${appId}/users/${userId}/wines`;
            await addDoc(collection(db, winesCollectionPath), {
                ...wineData, year: wineData.year ? parseInt(wineData.year, 10) : null, addedAt: Timestamp.now(),
            });
            setShowWineFormModal(false); setCurrentWineToEdit(null); setError(null); 
        } catch (err) { setError(`Failed to add wine: ${err.message}`); }
    };

    const handleUpdateWine = async (wineIdToUpdate, wineData) => { 
        if (!db || !userId) { setError("Database not ready or user not logged in."); return; }
        try {
            const wineDocRef = doc(db, `artifacts/${appId}/users/${userId}/wines`, wineIdToUpdate);
            await updateDoc(wineDocRef, { ...wineData, year: wineData.year ? parseInt(wineData.year, 10) : null });
            setShowWineFormModal(false); setCurrentWineToEdit(null); setError(null);
        } catch (err) { setError(`Failed to update wine: ${err.message}`); }
    };

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [wineToDelete, setWineToDelete] = useState(null);

    const confirmDeleteWine = (wineIdToDelete) => {
        const wine = wines.find(w => w.id === wineIdToDelete);
        setWineToDelete(wine); setShowDeleteConfirmModal(true);
    };

    const handleDeleteWine = async () => {
        if (!db || !userId || !wineToDelete) {
            setError("Database error or no wine selected for deletion.");
            setShowDeleteConfirmModal(false); return;
        }
        try {
            const wineDocRef = doc(db, `artifacts/${appId}/users/${userId}/wines`, wineToDelete.id);
            await deleteDoc(wineDocRef);
            setError(null); setShowDeleteConfirmModal(false); setWineToDelete(null);
        } catch (err) { setError(`Failed to delete wine: ${err.message}`); setShowDeleteConfirmModal(false); }
    };

    const handleOpenWineForm = (wine = null) => { setCurrentWineToEdit(wine); setShowWineFormModal(true); };
    const handleOpenFoodPairing = (wine) => { setSelectedWineForPairing(wine); setFoodPairingSuggestion(''); setShowFoodPairingModal(true); };

    const fetchFoodPairing = async () => {
        if (!selectedWineForPairing) return;
        setIsLoadingPairing(true);
        setError(null);

        const { producer, year, region, color, name } = selectedWineForPairing;
        const wineDescription = `${name ? name + " " : ""}${producer} ${color} wine from ${region}, year ${year || 'N/A'}`;
        const prompt = `Suggest a specific food pairing for the following wine: ${wineDescription}. Provide a concise suggestion (1-2 sentences).`;

        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setFoodPairingSuggestion(text);
            } else {
                setFoodPairingSuggestion("Could not retrieve a pairing suggestion at this time (unexpected AI response).");
            }
        } catch (err) {
            setError(prevError => prevError || `Food pairing suggestion failed: ${err.message}`);
            setFoodPairingSuggestion(`Failed to get suggestion: ${err.message}`);
        } finally {
            setIsLoadingPairing(false);
        }
    };

    const handleFindWineForFood = async () => {
        if (!foodForReversePairing.trim()) {
            setError("Please enter a food item to find a wine pairing.");
            return;
        }
        if (wines.length === 0) {
            setError("Your cellar is empty. Add some wines first to find a pairing.");
            setReversePairingResult("Please add wines to your cellar to use this feature.");
            setShowReversePairingModal(true);
            return;
        }

        setIsLoadingReversePairing(true);
        setError(null);
        setReversePairingResult('');

        const wineListForPrompt = wines.map((wine, index) => 
            `${index + 1}. Name: ${wine.name || 'N/A'}, Producer: ${wine.producer}, Color: ${wine.color}, Region: ${wine.region}, Year: ${wine.year || 'N/A'}`
        ).join('\n');

        const prompt = `I want to eat "${foodForReversePairing}". From the following list of wines in my cellar, which one would be the BEST match? Also, list up to two other good alternatives if any. For each suggested wine, briefly explain your choice. If no wines are a good match, please state that.
My wines are:
${wineListForPrompt}`;
        
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setReversePairingResult(text);
            } else {
                setReversePairingResult("Could not get a wine suggestion at this time (unexpected AI response).");
            }
        } catch (err) {
            setError(prevError => prevError || `Finding wine for food failed: ${err.message}`);
            setReversePairingResult(`Failed to get suggestion: ${err.message}`);
        } finally {
            setIsLoadingReversePairing(false);
            setShowReversePairingModal(true);
        }
    };


    const handleLogout = async () => {
        if (auth) {
            try { await signOut(auth); setUser(null); setUserId(null); setWines([]); } 
            catch (e) { setError("Logout failed. Please try again."); }
        }
    };
    
    // --- CSV IMPORT LOGIC ---
    const handleCsvFileChange = (event) => {
        setCsvFile(event.target.files[0]);
        setCsvImportStatus({ message: '', type: '', errors: [] }); 
    };

    const parseCsv = (csvText) => {
        const lines = csvText.split(/\r\n|\n/); 
        if (lines.length < 2) return { headers: [], data: [] }; 

        const parseLine = (line) => {
            const result = [];
            let currentField = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(currentField.trim());
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            result.push(currentField.trim()); 
            return result;
        };
        
        const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue; 
            const values = parseLine(lines[i]);
            const rowObject = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index] || ''; 
            });
            data.push(rowObject);
        }
        return { headers, data };
    };


    const handleImportCsv = async () => {
        if (!csvFile) {
            setCsvImportStatus({ message: 'Please select a CSV file first.', type: 'error', errors: [] });
            return;
        }
        if (!db || !userId) {
            setCsvImportStatus({ message: 'Database not ready or user not logged in.', type: 'error', errors: [] });
            return;
        }

        setIsImportingCsv(true);
        setCsvImportStatus({ message: 'Processing CSV...', type: 'info', errors: [] });

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvText = event.target.result;
            const { headers, data: parsedData } = parseCsv(csvText);
            
            const expectedHeaders = ['name', 'producer', 'year', 'region', 'color', 'location'];
            const requiredHeaders = ['producer', 'year', 'region', 'color', 'location']; // Name is optional
            const missingHeaders = requiredHeaders.filter(eh => !headers.includes(eh));
            
            if (missingHeaders.length > 0) {
                setCsvImportStatus({ 
                    message: `CSV import failed. Missing required headers: ${missingHeaders.join(', ')}. Expected at least: ${requiredHeaders.join(', ')}.`, 
                    type: 'error', 
                    errors: [] 
                });
                setIsImportingCsv(false);
                return;
            }

            const winesToImport = [];
            const importErrors = [];
            const currentCellarLocations = wines.map(w => w.location.trim().toLowerCase());
            const locationsInCsv = new Set(); 

            for (let i = 0; i < parsedData.length; i++) {
                const row = parsedData[i];
                const wineData = {
                    name: row.name || '', 
                    producer: row.producer || '',
                    year: row.year ? parseInt(row.year, 10) : null,
                    region: row.region || '',
                    color: (row.color || 'other').toLowerCase(),
                    location: row.location || ''
                };

                if (!wineData.producer || !wineData.region || !wineData.color || !wineData.location) {
                    importErrors.push(`Row ${i + 2}: Missing required fields (Producer, Region, Color, Location). Skipped.`);
                    continue;
                }
                if (row.year && (isNaN(wineData.year) || wineData.year < 1000 || wineData.year > new Date().getFullYear() + 10)) {
                    importErrors.push(`Row ${i + 2}: Invalid year "${row.year}". Skipped.`);
                    continue;
                }

                const trimmedLocation = wineData.location.trim().toLowerCase();
                if (currentCellarLocations.includes(trimmedLocation) || locationsInCsv.has(trimmedLocation)) {
                    importErrors.push(`Row ${i + 2}: Location "${wineData.location}" is already in use. Skipped.`);
                    continue;
                }
                
                locationsInCsv.add(trimmedLocation);
                winesToImport.push({ ...wineData, addedAt: Timestamp.now() });
            }

            if (winesToImport.length > 0) {
                try {
                    const batch = writeBatch(db);
                    const winesCollectionPath = `artifacts/${appId}/users/${userId}/wines`;
                    
                    winesToImport.forEach(wineDoc => {
                        const newWineRef = doc(collection(db, winesCollectionPath));
                        batch.set(newWineRef, wineDoc);
                    });
                    await batch.commit();
                    
                    let successMsg = `${winesToImport.length} wine(s) imported successfully.`;
                    if(importErrors.length > 0) {
                        successMsg += ` ${importErrors.length} row(s) had errors.`;
                    }
                    setCsvImportStatus({ message: successMsg, type: 'success', errors: importErrors });

                } catch (dbError) {
                    setCsvImportStatus({ message: `Database error during import: ${dbError.message}`, type: 'error', errors: importErrors });
                }
            } else {
                 let noImportMsg = 'No wines were imported.';
                 if(importErrors.length > 0) noImportMsg += ` ${importErrors.length} row(s) had errors.`
                 else if(parsedData.length === 0) noImportMsg = 'CSV file is empty or has no data rows.'
                 else noImportMsg = 'All rows in CSV had errors or were duplicates.'

                setCsvImportStatus({ message: noImportMsg, type: importErrors.length > 0 ? 'warning' : 'info', errors: importErrors });
            }
            setIsImportingCsv(false);
            setCsvFile(null); 
            if (document.getElementById('csvFileInput')) { 
                document.getElementById('csvFileInput').value = "";
            }
        };
        reader.onerror = () => {
            setCsvImportStatus({ message: 'Failed to read the CSV file.', type: 'error', errors: [] });
            setIsImportingCsv(false);
        };
        reader.readAsText(csvFile);
    };

    // --- End CSV Import ---

    const filteredWines = useMemo(() => {
        return wines.filter(wine => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                wine.name?.toLowerCase().includes(searchTermLower) ||
                wine.producer?.toLowerCase().includes(searchTermLower) ||
                wine.region?.toLowerCase().includes(searchTermLower) ||
                wine.color?.toLowerCase().includes(searchTermLower) ||
                wine.location?.toLowerCase().includes(searchTermLower) ||
                (wine.year && wine.year.toString().includes(searchTermLower))
            );
        });
    }, [wines, searchTerm]);

    if (!isAuthReady) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                Loading authentication...
            </div>
        );
    }
    
    if (Object.keys(firebaseConfig).length === 0 && error && !auth) { 
         return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
                <AlertMessage message={error} type="error" />
                <p className="text-slate-600 dark:text-slate-400 mt-2">Please ensure the application is correctly configured.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 md:p-8 transition-colors duration-300">
            <header className="mb-6">
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                        <WineBottleIcon className="w-10 h-10 text-red-700 dark:text-red-500" />
                        <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-100">My Wine Cellar</h1>
                    </div>
                    {user && (
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center" title={`User ID: ${userId}`}>
                                <UserIcon className="w-4 h-4 mr-1" /> 
                                {user.isAnonymous ? `Guest (ID: ${userId ? userId.substring(0,8) : 'N/A'}...)` : (user.email || `User (ID: ${userId ? userId.substring(0,8) : 'N/A'}...)`)}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm flex items-center space-x-1"
                            >
                                <LogoutIcon className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
                 {error && <AlertMessage message={error} type="error" onDismiss={() => setError(null)} />}
            </header>

            <main className="container mx-auto">
                {!user && isAuthReady && !error && (
                     <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
                        <p className="text-lg mb-4">Authenticating and loading your cellar...</p>
                         <svg className="animate-spin h-8 w-8 text-red-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}

                {user && (
                    <>
                        {/* Action Bar: Search & Add Wine */}
                        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label htmlFor="wineSearch" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search Your Wines</label>
                                    <div className="relative">
                                        <input
                                            id="wineSearch"
                                            type="text"
                                            placeholder="Producer, region, year..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full p-3 pl-10 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none dark:bg-slate-700 dark:text-slate-200"
                                        />
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenWineForm()}
                                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <PlusIcon />
                                    <span>Add New Wine</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* CSV Import Section */}
                        <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Import Wines from CSV</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                Expected CSV headers: <code>name</code> (optional), <code>producer</code>, <code>year</code>, <code>region</code>, <code>color</code>, <code>location</code>.
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                                Ensure locations are unique. Commas within fields should be enclosed in double quotes (e.g., "Napa Valley, California").
                            </p>
                            <div className="flex flex-col sm:flex-row items-end gap-3">
                                <div className="flex-grow w-full">
                                    <label htmlFor="csvFileInput" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Select CSV File</label>
                                    <input
                                        id="csvFileInput"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleCsvFileChange}
                                        className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-800 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-700"
                                    />
                                </div>
                                <button
                                    onClick={handleImportCsv}
                                    disabled={!csvFile || isImportingCsv}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <UploadIcon />
                                    <span>{isImportingCsv ? 'Importing...' : 'Import CSV'}</span>
                                </button>
                            </div>
                            {csvImportStatus.message && (
                                <div className="mt-4">
                                    <AlertMessage 
                                        message={csvImportStatus.message + (csvImportStatus.errors.length > 0 ? "<br/><strong>Errors:</strong><ul>" + csvImportStatus.errors.map(e => `<li>- ${e}</li>`).join('') + "</ul>" : "")} 
                                        type={csvImportStatus.type} 
                                        onDismiss={() => setCsvImportStatus({ message: '', type: '', errors: [] })}
                                        isHtml={csvImportStatus.errors.length > 0}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Reverse Food Pairing Section */}
                        <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Find the Perfect Wine for Your Meal</h2>
                            <div className="flex flex-col sm:flex-row items-end gap-3">
                                <div className="flex-grow w-full">
                                    <label htmlFor="foodItem" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">What are you eating?</label>
                                    <input
                                        id="foodItem"
                                        type="text"
                                        placeholder="e.g., Grilled Chicken, Spicy Pasta"
                                        value={foodForReversePairing}
                                        onChange={(e) => setFoodForReversePairing(e.target.value)}
                                        className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none dark:bg-slate-700 dark:text-slate-200"
                                    />
                                </div>
                                <button
                                    onClick={handleFindWineForFood}
                                    disabled={isLoadingReversePairing || wines.length === 0}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon /> 
                                    <span>Suggest Wine</span>
                                </button>
                            </div>
                             {wines.length === 0 && (
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">Add some wines to your cellar to use this feature.</p>
                            )}
                        </div>


                        {/* Wine Collection Display */}
                         {isLoadingWines && user && <p className="text-center py-4">Loading your wine collection...</p>}
                        
                        {!isLoadingWines && wines.length === 0 && !searchTerm && user && (
                            <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md mt-6">
                                <WineBottleIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">Your cellar is empty!</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">Start by adding your first bottle or importing a CSV file.</p>
                            </div>
                        )}

                        {!isLoadingWines && filteredWines.length === 0 && searchTerm && user && (
                            <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md mt-6">
                                 <SearchIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">No wines found for "{searchTerm}"</h3>
                                <p className="text-slate-500 dark:text-slate-400">Try adjusting your search term.</p>
                            </div>
                        )}
                        
                        {filteredWines.length > 0 && user && (
                             <>
                                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 mt-8">Your Wine Collection</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredWines.map(wine => (
                                        <WineItem
                                            key={wine.id}
                                            wine={wine}
                                            onEdit={() => handleOpenWineForm(wine)}
                                            onDelete={() => confirmDeleteWine(wine.id)}
                                            onPairFood={() => handleOpenFoodPairing(wine)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Modals */}
                <WineFormModal isOpen={showWineFormModal} onClose={() => { setShowWineFormModal(false); setCurrentWineToEdit(null); }} onSubmit={currentWineToEdit ? (data) => handleUpdateWine(currentWineToEdit.id, data) : handleAddWine} wine={currentWineToEdit} allWines={wines} />
                <FoodPairingModal isOpen={showFoodPairingModal} onClose={() => setShowFoodPairingModal(false)} wine={selectedWineForPairing} suggestion={foodPairingSuggestion} isLoading={isLoadingPairing} onFetchPairing={fetchFoodPairing} />
                <ReverseFoodPairingModal isOpen={showReversePairingModal} onClose={() => setShowReversePairingModal(false)} foodItem={foodForReversePairing} suggestion={reversePairingResult} isLoading={isLoadingReversePairing} />
                <Modal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} title="Confirm Deletion">
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                        Are you sure you want to delete the wine: <strong className="font-semibold">{wineToDelete?.name || wineToDelete?.producer} ({wineToDelete?.year || 'N/A'})</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteConfirmModal(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-md border border-slate-300 dark:border-slate-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteWine}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
                        >
                            Delete Wine
                        </button>
                    </div>
                </Modal>
            </main>
            <footer className="text-center mt-12 py-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Wine Cellar App &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}

// --- Other Components (WineItem, WineFormModal, FoodPairingModal, ReverseFoodPairingModal) ---

const WineItem = ({ wine, onEdit, onDelete, onPairFood }) => {
    const wineColors = {
        red: 'bg-red-200 dark:bg-red-800 border-red-400 dark:border-red-600',
        white: 'bg-yellow-100 dark:bg-yellow-700 border-yellow-300 dark:border-yellow-500',
        rose: 'bg-pink-100 dark:bg-pink-700 border-pink-300 dark:border-pink-500',
        sparkling: 'bg-blue-100 dark:bg-blue-700 border-blue-300 dark:border-blue-500',
        other: 'bg-slate-200 dark:bg-slate-600 border-slate-400 dark:border-slate-500',
    };
    const colorClass = wineColors[wine.color?.toLowerCase()] || wineColors.other;

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl flex flex-col`}>
            <div className={`p-4 border-l-8 ${colorClass}`}>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate" title={wine.name || wine.producer}>{wine.name || wine.producer}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{wine.year || 'N/A'}</p>
            </div>
            <div className="p-5 space-y-3 flex-grow">
                <p><strong className="text-slate-600 dark:text-slate-300">Producer:</strong> <span className="text-slate-700 dark:text-slate-200">{wine.producer}</span></p>
                <p><strong className="text-slate-600 dark:text-slate-300">Region:</strong> <span className="text-slate-700 dark:text-slate-200">{wine.region}</span></p>
                <p><strong className="text-slate-600 dark:text-slate-300">Color:</strong> <span className="text-slate-700 dark:text-slate-200 capitalize">{wine.color}</span></p>
                <p><strong className="text-slate-600 dark:text-slate-300">Location:</strong> <span className="text-slate-700 dark:text-slate-200">{wine.location}</span></p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={onPairFood}
                    title="Pair with Food (AI)"
                    className="p-2 rounded-md text-sm text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-700 transition-colors"
                >
                    <FoodIcon />
                </button>
                <button
                    onClick={onEdit}
                    title="Edit Wine"
                    className="p-2 rounded-md text-sm text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-700 transition-colors"
                >
                    <EditIcon />
                </button>
                <button
                    onClick={onDelete}
                    title="Delete Wine"
                    className="p-2 rounded-md text-sm text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-700 transition-colors"
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

const WineFormModal = ({ isOpen, onClose, onSubmit, wine, allWines }) => { 
    const [formData, setFormData] = useState({
        name: '', 
        producer: '',
        year: '',
        region: '',
        color: 'red', 
        location: ''
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (wine) {
            setFormData({
                name: wine.name || '',
                producer: wine.producer || '',
                year: wine.year || '',
                region: wine.region || '',
                color: wine.color || 'red',
                location: wine.location || ''
            });
        } else {
            setFormData({ name: '', producer: '', year: '', region: '', color: 'red', location: '' });
        }
        setFormError(''); 
    }, [wine, isOpen]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.producer || !formData.region || !formData.color || !formData.location) {
            setFormError('Producer, Region, Color, and Location are required.');
            return;
        }
        if (formData.year && (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 1000 || parseInt(formData.year) > new Date().getFullYear() + 10 )) { 
            setFormError('Please enter a valid year (e.g., 2020).');
            return;
        }

        if (formData.location && allWines) {
            const currentLocation = formData.location.trim().toLowerCase();
            let isLocationTaken = false;
            if (wine && wine.id) { 
                isLocationTaken = allWines.some(
                    w => w.id !== wine.id && w.location && w.location.trim().toLowerCase() === currentLocation
                );
            } else { 
                isLocationTaken = allWines.some(
                    w => w.location && w.location.trim().toLowerCase() === currentLocation
                );
            }

            if (isLocationTaken) {
                setFormError(`Location "${formData.location}" is already in use. Please choose a different one or clear the location of the other bottle first.`);
                return;
            }
        }
        onSubmit(formData);
    };

    const wineColorOptions = ['red', 'white', 'rose', 'sparkling', 'other'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={wine ? 'Edit Wine' : 'Add New Wine'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && <AlertMessage message={formError} type="error" onDismiss={() => setFormError('')} />}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name (Optional)</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-red-500 focus:border-red-500 shadow-sm sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                    />
                </div>
                <div>
                    <label htmlFor="producer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Producer <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="producer"
                        id="producer"
                        value={formData.producer}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-red-500 focus:border-red-500 shadow-sm sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                    />
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                    <input
                        type="number"
                        name="year"
                        id="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder={`e.g., ${new Date().getFullYear() - 5}`}
                        className="mt-1 block w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-red-500 focus:border-red-500 shadow-sm sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                    />
                </div>
                <div>
                    <label htmlFor="region" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Region <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="region"
                        id="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-red-500 focus:border-red-500 shadow-sm sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                    />
                </div>
                <div>
                    <label htmlFor="color" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Color <span className="text-red-500">*</span></label>
                    <select
                        name="color"
                        id="color"
                        value={formData.color}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-red-500 focus:border-red-500 shadow-sm sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                    >
                        {wineColorOptions.map(opt => (
                            <option key={opt} value={opt} className="capitalize">{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cellar Location <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Rack A, Shelf 3"
                        required
                        className="mt-1 block w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-red-500 focus:border-red-500 shadow-sm sm:text-sm dark:bg-slate-700 dark:text-slate-200"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-md border border-slate-300 dark:border-slate-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        {wine ? 'Save Changes' : 'Add Wine'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const FoodPairingModal = ({ isOpen, onClose, wine, suggestion, isLoading, onFetchPairing }) => {
    useEffect(() => {
        if (isOpen && wine && !suggestion && !isLoading) {
            onFetchPairing();
        }
    }, [isOpen, wine, suggestion, isLoading, onFetchPairing]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Food Pairing for ${wine?.name || wine?.producer || 'Wine'}`}>
            {wine && (
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{wine.producer} {wine.year || 'N/A'}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{wine.region} - <span className="capitalize">{wine.color}</span></p>
                </div>
            )}
            {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 py-4">
                    <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Finding the perfect pairing...</span>
                </div>
            )}
            {!isLoading && suggestion && (
                <div className="p-3 bg-green-50 dark:bg-green-800/50 rounded-md border border-green-200 dark:border-green-700">
                    <p className="text-slate-700 dark:text-green-200 whitespace-pre-wrap">{suggestion}</p>
                </div>
            )}
             {!isLoading && !suggestion && wine && ( 
                <div className="text-center py-4">
                     <p className="text-slate-500 dark:text-slate-400 mb-4">Click below to get a food pairing suggestion for this wine.</p>
                     <button
                        onClick={onFetchPairing}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        <FoodIcon />
                        <span>Get Suggestion</span>
                    </button>
                </div>
            )}
            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-md border border-slate-300 dark:border-slate-500"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

const ReverseFoodPairingModal = ({ isOpen, onClose, foodItem, suggestion, isLoading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Wine Suggestion for ${foodItem || 'Your Meal'}`}>
            {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 py-6">
                    <svg className="animate-spin h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching your cellar for the best match...</span>
                </div>
            )}
            {!isLoading && suggestion && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">For "{foodItem}":</h4>
                    <p className="text-slate-700 dark:text-blue-200 whitespace-pre-wrap">{suggestion}</p>
                </div>
            )}
            {!isLoading && !suggestion && (
                 <p className="text-slate-500 dark:text-slate-400 py-4 text-center">No suggestion available. Please try again.</p>
            )}
            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-md border border-slate-300 dark:border-slate-500"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};


export default App;
