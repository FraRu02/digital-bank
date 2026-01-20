
import React, { useCallback, useState } from 'react'

export type ChangeStateProps<T>= {
  newState: T;
} | {
  key: string;
  value: any|((prev:T) => T);
} | {
  key: Array<string>;
  value: Array<any>|((prev:T) => T);
}


function useAdvancedState<T> (initialState:T):[T, (payload:ChangeStateProps<T>) =>  Promise<T> ] {
  const [state, setState] = useState<T>(initialState);

  const changeState = useCallback(async(payload:ChangeStateProps<T>) => {
    if ('newState' in payload) {
      // Caso 1: payload è { newState: T }
      setState(payload.newState);
      return payload.newState;
    } else if (Array.isArray(payload.key)) {
      const {key, value} = payload;
      let newPrev:Partial<T> = {};
      await setState((prev) => {
        newPrev = {...prev}; // oppure usa una utility deepClone se serve compatibilità
        key.forEach((keyString, i) => {
          let obj:Record<string, any> = newPrev;
          const keys = (keyString as string).split(".");
          keys.forEach((k, j) => {
            if (j === keys.length - 1) {
              if(typeof value === "function") obj[k] = value(prev)[i];
              else obj[k] = value[i];
            }
            obj = obj[k];
          });
        });
        return newPrev as T;
      });
      return newPrev as T;
    } else {
      const {key, value} = payload;
      let newPrev:Partial<T> = {};
      await setState((prev) => {
        newPrev = {...prev};
        let obj:Record<string, any> = newPrev;
        const keys = (key as string).split(".");
        keys.forEach((k, j) => {
          if (j === keys.length - 1) {
            if(typeof value === "function") obj[k] = value(prev);
            else obj[k] = value;
          } 
          obj = obj[k];
        });
        return newPrev as T;
      });
      return newPrev as T;
    }
  }, []);

  return [state, changeState]
}
export default useAdvancedState



