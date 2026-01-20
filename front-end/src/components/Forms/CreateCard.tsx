import { Autocomplete, Chip, CircularProgress, Divider, FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CustomForm, { useFormContext } from '@/src/components/CustomForm';
import {boolean, object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import Utilities from '@/src/classes/Utilities';
import { useQuery } from '@tanstack/react-query';
import Holder, { type HolderProps } from '@/src/classes/Holder';
import { CardType } from '@/src/classes/Card';
import BankAccountAutocomplete from '@/src/components/inputs/BankAccountAutocomplete';
import type { AddressProps } from '@/src/components/inputs/AddressAutocomplete';
import { DatePicker } from '@mui/x-date-pickers';
import PhoneInputField from '@/src/components/inputs/PhoneInputField';
import AddressAutocomplete from '@/src/components/inputs/AddressAutocomplete';
import dayjs from 'dayjs';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

type RootProps = {
  children?: React.ReactNode;
  initialForm?: DeepPartial<FormInputsProps>;
}

export type FormInputsProps = {
  cardType: CardType,
  bankAccountId: string|null;
  isHolderNew: boolean;
  holder: HolderProps;
}

type FormProps = {
  children?: React.ReactNode;
  onSendForm?: (form: FormInputsProps) => Promise<unknown>;
}

const formSchema = object({
  cardType: string().oneOf([CardType.debit, CardType.prepaid]).required(),
  bankAccountId: string().when("cardType", {
    is: CardType.debit,
    then: schema => string().required(),
    otherwise: schema => string().notRequired()
  }),
  isHolderNew: boolean().required(),
  holder: object({
    id: string().notRequired(),
    name: string().required(),
    lastname: string().required(),
    dateOfBirth: string(),
    taxCode: string().required(),
    email: string().email().required(),
    phoneNumber: string().required(),
    address: object({
      properties: object({
        formatted: string().required()
      }).required()
    }).required(),
  })
});

const Root:React.FC<RootProps> = ({children, initialForm:initialState={}}) => {
  const initialForm = useMemo(():DeepPartial<FormInputsProps> => {
    const defaultForm:DeepPartial<FormInputsProps> ={
      cardType: CardType.debit,
      bankAccountId: null,
      isHolderNew : false,
      holder: {
        id: "",
        name: "",
        lastname: "",
        dateOfBirth: "",
        taxCode: "",
        email: "",
        phoneNumber: "",
        address: {
          properties: {
            formatted: "",
            street: "",
            housenumber: "",
            city: "",
            postcode: "",
            country: "",
            lat: 0,
            lon: 0
          }
        }
      }
    } 
    return Utilities.mergeObjects(
      defaultForm,
      initialState as any
    )
  }, [])


  return (
    <CustomForm.Root initialForm={initialForm} formSchema={formSchema}>
      {children}
    </CustomForm.Root>
  )
}

const Form:React.FC<FormProps> = ({children, onSendForm}) => {
  const {t} = useTranslation();
  const {initialForm, form, setForm, error} = useFormContext<FormInputsProps>();
  const {cardType, bankAccountId, isHolderNew, holder} = form;
  const { data:holders, isFetching:fetchingHolders } = useQuery({
    queryKey: ['holders'],
    queryFn: Holder.getMe,
    staleTime: 0,
    gcTime: 0,    // nessun salvataggio in cache
  });
  const disabledForm = useMemo(() => {
    return !isHolderNew;
  }, [isHolderNew])
  const [selectedHolder, setSelectedHolder] = useState<HolderProps|null>(null);

  useEffect(() => {
    if(!selectedHolder && holders && holders.length > 0) {
      setSelectedHolder(Utilities.deepCopyObjects(holders[0]))
    }
  }, [holders])

  
  useEffect(() => {
    if(form.isHolderNew) setForm({key: "holder", value: {...initialForm.holder}});
    else if(selectedHolder) setForm({key: "holder", value: {...selectedHolder}});
    else setForm({key: "holder", value: {...initialForm.holder}});
  }, [selectedHolder, form.isHolderNew])

  const handleChangeAdress = useCallback((value:AddressProps|null) => {
    if(!value) setForm({key: "holder.address", value: initialForm.holder.address})
    else setForm({key: "holder.address", value: value});
  }, [initialForm])


  const handleSendForm = useCallback(async(form:FormInputsProps) => {
    if(form.cardType === CardType.prepaid) form.bankAccountId = null;
    await onSendForm?.({
      ...form,
      holder: {
        ...form.holder,
        createdAt: undefined,
        updatedAt: undefined,
        address: {
          ...form.holder.address,
          properties: {
            place_id: form.holder.address.properties.place_id,
            name: form.holder.address.properties.name,
            formatted: form.holder.address.properties.formatted,
            street: form.holder.address.properties.street,
            housenumber:form.holder.address.properties.housenumber,
            city: form.holder.address.properties.city,
            postcode: form.holder.address.properties.postcode,
            country: form.holder.address.properties.country,
            country_code: form.holder.address.properties.country_code,
            state: form.holder.address.properties.state,
            county: form.holder.address.properties.county,
            county_code: form.holder.address.properties.county_code,
            lat: form.holder.address.properties.lat,
            lon: form.holder.address.properties.lon
          }
        }
      }
    }as any);
  }, [onSendForm])


  return (
    <CustomForm.Container onSendForm={handleSendForm}>
      <FormControl fullWidth>
        <Stack spacing={2}>
          <FormControl>
            <RadioGroup
              sx={{ml: 2}}
              value={cardType}
              row
              onChange={(e, value) => setForm({key: "cardType", value})}
            >
              <FormControlLabel value={CardType.debit} control={<Radio />} label={t("debit")} />
              <FormControlLabel value={CardType.prepaid} control={<Radio />} label={t("prepaid")} />
            </RadioGroup>
          </FormControl>
          {cardType === CardType.debit && 
          <BankAccountAutocomplete value={bankAccountId} onChange={(e, value) => setForm({key: "bankAccountId", value})}/>
          }
          <Divider>
            <Chip size='small' label={t("owner_options")}/>
          </Divider>
          <RadioGroup
            sx={{ml: 2}}
            value={form.isHolderNew}
            row
            onChange={(e, value) => setForm({key: "isHolderNew", value: Boolean(value === "true")})}
          >
            <FormControlLabel value={false} control={<Radio />} label={t("existing")} />
            <FormControlLabel value={true} control={<Radio />} label={t("new")} />
          </RadioGroup>
          {!isHolderNew && 
            <Autocomplete
            loading={fetchingHolders}
            options={holders ?? []}
            value={selectedHolder}
            onChange={(e, value) => setSelectedHolder(value)}
            getOptionKey={(option) => option.id}
            getOptionLabel={(e) => `${e.name} ${e.lastname}`}
            renderInput={(params) => 
              <TextField 
                {...params}
                label={t("holder_one")} 
                slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {fetchingHolders ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                },
              }}
              />}
            />}
          <Stack spacing={2}>
            <TextField disabled={disabledForm} label={t("name")} value={holder.name} onChange={(e) => setForm({key: "holder.name", value: e.target.value})}/>
            <TextField disabled={disabledForm} label={t("lastname")} value={holder.lastname} onChange={(e) => setForm({key: "holder.lastname", value: e.target.value})}/>
            <DatePicker
              disabled={disabledForm} 
              disableFuture
              label={t("date_of_birth")}
              value={holder.dateOfBirth ? dayjs(holder.dateOfBirth) : null}
              onChange={(value) => setForm({key: "holder.dateOfBirth", value: value?.toISOString() ?? null})}
              slotProps={{
                textField: {
                  size: "small",
                  required: false
                }
              }}
            />
            <TextField disabled={disabledForm} label={t("tax_code")} value={holder.taxCode} onChange={(e) => setForm({key: "holder.taxCode", value: e.target.value})}/>
            <TextField disabled={disabledForm} label={"Email"} value={holder.email} onChange={(e) => setForm({key: "holder.email", value: e.target.value})}/>
            <PhoneInputField disabled={disabledForm} label={t("phone_number")} value={holder.phoneNumber} onChange={(e) => setForm({key: "holder.phoneNumber", value: e.target.value})}/>
            <AddressAutocomplete disabled={disabledForm} value={holder.address}  onChange={(e, value) => handleChangeAdress(value)}/>
          </Stack>
          {error && <FormHelperText error>{t(error.response.data)}</FormHelperText>}
          {children}
        </Stack>
      </FormControl>
    </CustomForm.Container>
  )
}

const ConfirmButton:React.FC = () => {
  const {t} = useTranslation();
  return (
    <CustomForm.ConfirmButton>{t("confirm")}</CustomForm.ConfirmButton>
  )
}

const CreateCard = {
  Root,
  Form,
  ConfirmButton
}

export default CreateCard