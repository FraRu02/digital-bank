import BankAccount, { BankAccountStatus, type BankAccountProps } from '@/src/classes/BankAccount';
import { Autocomplete, Checkbox, TextField, type AutocompleteProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// type BankAccountAutocompleteProps = AutocompleteProps<
//   BankAccountProps,
//   boolean,
//   boolean,
//   boolean
// >

type BankAccountAutocompleteProps = Omit<AutocompleteProps<
  string,
  boolean,
  boolean,
  boolean
>, "options"|"renderInput"> & {
  options?: BankAccountProps[]
}

const BankAccountAutocomplete:React.FC<BankAccountAutocompleteProps> = ({sx, options, multiple, ...otherProps}) => {
  const {t} = useTranslation();
  const { data:bankAccounts, isFetching } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: BankAccount.getMe,
    staleTime: 0,
    gcTime: 0,    // nessun salvataggio in cache
    enabled: !Boolean(options)
  });

  const filteredOprions = useMemo(() => {
    if(options) options.map((e) => e.id);
    else if(bankAccounts) return bankAccounts.filter(e => e.status === BankAccountStatus.active).map((e) => e.id);
    return [];
  }, [options, bankAccounts])

  const getLabel = useCallback((bankAccountId:string) => {
    return bankAccounts?.find((e) => e.id === bankAccountId)?.iban ?? "";
  }, [bankAccounts])
  

  return (
    <Autocomplete
      sx={{ width: 300, ...sx }}
      loading={isFetching}
      options={filteredOprions}
      {...otherProps}
      renderValue={(option) => getLabel(option as string)}
      renderInput={(params) => 
        <TextField 
          {...params}
          label={t("bank_account_one")} 
        />}
      renderOption={({key, ...props}, option, { selected }) => (
        <li key={key} {...props}>
          {multiple && <Checkbox checked={selected} />}
          {getLabel(option)}
        </li>
      )}
    />
  )
}

export default BankAccountAutocomplete