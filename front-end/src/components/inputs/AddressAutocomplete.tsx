import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { useTranslation } from 'react-i18next';
import { Autocomplete, CircularProgress, TextField, type AutocompleteProps } from '@mui/material';
import axios from 'axios';
import useFetch from '@/src/hooks/useFetch';

export type AddressProps = {
  bbox: [number, number, number, number];
  geometry: {
    coordinates: [number, number];
    type: string;
  };
  properties: {
    place_id: string;
    name: string;
    formatted: string;
    street: string;
    housenumber:string;
    city: string;
    postcode: string;
    country: string;
    country_code: string;
    state: string;
    county: string;
    county_code: string;
    lat: number;
    lon: number;
  };
  type: string;
}

type AddressAutocompleteProps = Omit<AutocompleteProps<AddressProps, undefined, undefined, undefined>, "options"|"renderInput">;

const getAdress = async(text:string):Promise<AddressProps[]> => {
  return await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {params: {
    apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
    text,
    type: "amenity",
    limit: 10
  }}).then((res) => res.data.features);
}

const AddressAutocomplete:React.FC<AddressAutocompleteProps> = ({value:val, onChange, onInputChange, ...otherProps}) => {
  const {t} = useTranslation();
  const [value, setValue] = useState<AddressProps|null>(null);
  const [inputText, setInputText] = useState<string>("");
  const {fetchData, response:options, loading, setResponse:setOptions} = useFetch<any[]>({defaultValue: []})

  useEffect(() => {
    setValue(val ?? null);
  }, [val]);

  useEffect(() => {
    if(inputText === value?.properties.formatted) {
      return;
    }
    if(inputText === "") {
      setOptions([]);
      return;
    }

    let searchTimeout:number|null = setTimeout(() => {  
      fetchData(getAdress(inputText))
    }, 1000);

    return () => {
      clearTimeout(searchTimeout ?? undefined);
      searchTimeout = null;
    }
  }, [inputText])

  const handleChange = useCallback((e:any, value:AddressProps|null, reason:any, details:any) => {
    setValue(value);
    onChange?.(e, value, reason, details);
  }, [onChange]);

  const handleInputChange = useCallback((e: any, value: string, reason: any) => {
    setInputText(value);
    onInputChange?.(e, value, reason);
  }, [onInputChange]);


  return (
    <Autocomplete
      loading={loading}
      loadingText={`${t("research")}...`}
      noOptionsText={t("no_address")}
      options={options}
      value={value}
      inputValue={inputText}
      getOptionKey={(e) => e.properties.place_id}
      getOptionLabel={(e) => e.properties.formatted}
      onInputChange={handleInputChange}
      onChange={handleChange}
      // getOptionKey={(option) => option.id}
      // onClose={() => setOptions([])}
      filterOptions={(e) => e}
      renderInput={(params) => 
        <TextField 
          {...params}
          label={t("address")} 
          slotProps={{
          input: {
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading && <CircularProgress size={20}/>}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          },
        }}
        />}
      {...otherProps}
    />
  )
}

export default AddressAutocomplete