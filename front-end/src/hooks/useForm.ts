import { useCallback } from 'react';
import useAdvancedState, { type ChangeStateProps } from './useAdvancedState';
import useFetch, { type FetchDataResponseType } from './useFetch';

type FormResponseType<Tform, T> = {
  form: Tform;
  setForm: (payload: ChangeStateProps<Tform>) => Promise<Tform>;
  loading: boolean;
  error: any;
  onSend: (promise:Promise<T>) => Promise<FetchDataResponseType<T|null|undefined>>;
}

function useForm<T, Tform=undefined>(defaultForm:Tform):FormResponseType<Tform, T> {
  const {fetchData, loading, error} = useFetch<T>({ingnoreResponse: true});
  const [form, setForm] = useAdvancedState<Tform>(defaultForm);

  const onSend = useCallback(async(promise: Promise<T>) => {
    return await fetchData(promise)
  }, [])

  return {form, setForm, loading, error, onSend}
  
}

export default useForm