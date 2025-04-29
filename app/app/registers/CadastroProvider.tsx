import React, { createContext, useContext, useState } from 'react';
import { ReactNode } from 'react';

interface CadastroContextType {
  dados: object;
  setDados: React.Dispatch<React.SetStateAction<object>>;
}

const CadastroContext = createContext<CadastroContextType>({
  dados: {},
  setDados: () => {},
});


export default function CadastroProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState({});

  return (
    <CadastroContext.Provider value={{ dados, setDados }}>
      <>{children}</>
    </CadastroContext.Provider>
  );

}

export const useCadastro = () => useContext(CadastroContext);