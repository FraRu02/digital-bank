import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, type OutlinedInputProps } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

export type SearchFieldProps = OutlinedInputProps & {
  autoSearch?: boolean;
  onSearch?: (value: string) => void;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const SearchField:React.FC<SearchFieldProps> = ({size="small", autoSearch=true, value, onChange, onSearch, onCancel, ...otherProps}) => {
  const {t} = useTranslation();
  const [text, setText] = useState<string>(value as any ?? "");

  useEffect(() => {
    setText(value as any ?? "");
  }, [value])

  useEffect(() => {
    if(!autoSearch) return;
    const timeout = setTimeout(() => {
      onSearch?.(text);
    }, 700)
    return () => {
      clearTimeout(timeout);
    }
  }, [autoSearch, text])

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch?.(text);
  }, [text, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setText(e.currentTarget.value);
    onChange?.(e);
  }, [onChange])

  const handleCancel = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if(onCancel) onCancel(e);
    else setText("");
  }, [onCancel])


  return (
    <FormControl size={size} fullWidth variant="outlined">
      <form onSubmit={handleSubmit}>
        <InputLabel size="small" htmlFor="outlined-adornment-search">{t("search")}</InputLabel>
        <OutlinedInput
          id="outlined-adornment-search"
          size={size}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                sx={{opacity: text ? 1: 0, pointerEvents: text ? "auto" : "none"}}
                size={size}
                aria-label={'cancel text'}
                onMouseDown={(e) => e.preventDefault()}
                onMouseUp={(e) => e.preventDefault()}
                edge="end"
                onClick={handleCancel}
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          }
          label={t("search")}
          value={text}
          onChange={handleChange}
          {...otherProps}
        />
        <Button sx={{display: "none"}} type='submit'/>
      </form>
    </FormControl>
  )
}

export default SearchField