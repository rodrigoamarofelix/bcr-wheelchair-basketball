import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ConfirmCtx {
  confirm: (msg: string) => Promise<boolean>;
}

const Ctx = createContext<ConfirmCtx>({ confirm: async () => false });

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ message, resolve });
    });
  }, []);

  function handleAnswer(answer: boolean) {
    if (!state) return;
    state.resolve(answer);
    setState(null);
  }

  return (
    <Ctx.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => handleAnswer(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-900 font-medium mb-6">{state.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => handleAnswer(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={() => handleAnswer(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useConfirm = () => useContext(Ctx).confirm;
