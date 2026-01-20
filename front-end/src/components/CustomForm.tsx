import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { FetchDataResponseType } from '@/src/hooks/useFetch';
import type { ChangeStateProps } from '@/src/hooks/useAdvancedState';
import useForm from '@/src/hooks/useForm';
import { ObjectSchema, type AnyObject, type Maybe} from 'yup';
import { Box, Button, CircularProgress, type ButtonProps } from '@mui/material';
import Utilities from '../classes/Utilities';

type FormContextProps<Tform> = {
  initialForm: Tform;
  form: Tform; 
  setForm: (payload: ChangeStateProps<Tform>) => Promise<Tform>;
  loadingForm: boolean;
  error: any;
  onSend: (promise: Promise<unknown>) => Promise<FetchDataResponseType<unknown>>;
  isFormValid: boolean;
}

type RootProps<Tform extends Maybe<AnyObject>> = {
  children?: React.ReactNode;
  initialForm: Tform;
  formSchema: ObjectSchema<Tform|any>;
}

type ContainerProps = {
  children?: React.ReactNode;
  onSendForm?: (form: any) => Promise<unknown>;
}

const FormContext = createContext<FormContextProps<any>|undefined>(undefined);
export const useFormContext = <Tform,>() => useContext(FormContext)! as FormContextProps<Tform>;


const Root = <Tform extends Maybe<AnyObject>>({children, initialForm, formSchema}:RootProps<Tform>) => {
  const {form, setForm, loading, error, onSend} = useForm(Utilities.deepCopyObjects(initialForm as any));
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const validateForm = useCallback(async() => {
    try {
      await formSchema.validate ( 
        form,
        {  strict : true  } , 
      )
      setIsFormValid(true);
    } catch (error) {
      setIsFormValid(false);
    }
  }, [form])

  useEffect(() => {
    validateForm();
  }, [form])

  const value:FormContextProps<Tform> = {
    initialForm,
    form,
    setForm,
    loadingForm: loading,
    error,
    onSend,
    isFormValid
  }

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  )
}

const Container:React.FC<ContainerProps> = ({children, onSendForm}) => {
  const {initialForm, form, loadingForm, setForm, error, onSend} = useFormContext();
  
  
  
  const handleSubmit = useCallback(async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!onSendForm) return;
    const res = await onSend(onSendForm(form));
    if(!res.error) setForm({newState: initialForm});
  }, [form]);

  return (
    <Box sx={{pointerEvents: !loadingForm ? "auto" : "none"}}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </Box>
  )
}

const ConfirmButton:React.FC<ButtonProps> = ({onClick, ...otherProps}) => {
  const {isFormValid, loadingForm} = useFormContext();

  return (
    <Button 
      {...otherProps}
      variant='contained'
      size="large" 
      disabled={!isFormValid || loadingForm} 
      type="submit" 
      endIcon={loadingForm && <CircularProgress size={20}/>}
    />
  )
}

const CustomForm = {
  Root,
  Container,
  ConfirmButton
}

export default CustomForm