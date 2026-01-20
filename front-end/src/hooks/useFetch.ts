import { useCallback, useEffect, useRef, useState } from 'react';

export type FetchDataResponseType<T> = {
  response: Awaited<T> | null;
  canSet: boolean;
  error: any | null;
}

type ResponseType<T> = {
  fetchData: (axios:Promise<T>) => Promise<FetchDataResponseType<T|null>>; 
  loading: boolean;
  error: any;
  response: T;
  setResponse: React.Dispatch<React.SetStateAction<T|undefined>>;
};


type BaseOptions = {
  autoLoading?: boolean;
  ingnoreResponse?: boolean;
};

type OptionsWithDefault<T> = BaseOptions & {
  defaultValue: T|(() => T);
};

type OptionsWithoutDefault = BaseOptions & {
  defaultValue?: undefined;
};

function useFetch<T>(options: OptionsWithDefault<T>): ResponseType<T>;
function useFetch<T>(options?: OptionsWithoutDefault): ResponseType<T | undefined>;
function useFetch<T=unknown>(options?:OptionsWithoutDefault | OptionsWithDefault<T>) {
  const fetchId = useRef<number>(-1);
  const [loading, setLoading] = useState<boolean>(options?.autoLoading ?? false);
  const [error, setError] = useState<any>(null);
  const [response, setResponse] = useState(options?.defaultValue);
  const canSet = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      canSet.current = false;
    }
  }, [])


  const createFetch = useCallback(async(id:number, axios:Promise<T>) => {
    const response = await axios;
    canSet.current = fetchId.current === id;

    return response;
  }, [])

  const fetchData = useCallback(async(axios:Promise<T>):Promise<FetchDataResponseType<T>> => {
    fetchId.current++;
    setLoading(true);
    setError(null);
    try {
      const res = await createFetch(fetchId.current, axios);
      canSet.current && !options?.ingnoreResponse && setResponse(res);
      return {response: res, canSet: canSet.current, error: null};
    } catch (error) {
      console.log(error);
      canSet.current && setError(error);
      return {response: null, canSet: canSet.current, error: error as any};
    }finally {
      if(canSet.current) setLoading(false);
    }
  }, [])

  return {fetchData, loading, error, response, setResponse}
}

export default useFetch