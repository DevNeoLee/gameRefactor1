import { createContext, useState, useContext, useEffect } from 'react';

const Context = createContext();

export const AppProvider = ({ children }) => {
    const [session, setSession] = useState({})
    const [totalTokens, setTotalTokens] = useState(0)
    const [mTurkcode, setMTurkcode] = useState('')
    const [timeTracker, setTimeTracker] = useState({})
    const [variation, setVariation] = useState('')
    const [generation, setGeneration] = useState('')
    const [ktf, setKtf] = useState('')
    const [nm, setNm] = useState('')

    const values = {
      session,
      setSession,
      totalTokens, 
      setTotalTokens,
      timeTracker,
      setTimeTracker,
      setMTurkcode,
      mTurkcode,
      variation,
      setVariation,
      generation,
      setGeneration,
      ktf,
      setKtf,
      nm,
      setNm,
    }

    return (
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    );
};

export const useAppContext = () => useContext(Context)