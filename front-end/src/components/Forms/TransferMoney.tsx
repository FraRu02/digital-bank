import React from 'react';
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import { number, object, string } from 'yup';
import CustomForm, { useFormContext } from '../CustomForm';
import { useTranslation } from 'react-i18next';
import ImportField from '../inputs/ImportField';

type RootProps = {
  children: React.ReactNode;
}

export type FormInputsProps = {
  type: "bankAccount"|"card";
  iban: string;
  cardNumber: string;
  description: string;
  import: number;
}

type FormProps = {
  children?: React.ReactNode;
  onSendForm?: (form: FormInputsProps) => Promise<unknown>;
}

const initialForm:FormInputsProps = {
  type: "bankAccount",
  iban: "",
  cardNumber: "",
  description: "",
  import: 0
}

const formSchema = object({
  type: string().oneOf(["bankAccount", "card"]).required(),
  iban: string().when("type", {
    is: "bankAccount",
    then: schema => string().min(9).required(),
    otherwise: schema => string().notRequired()
  }),
  cardNumber: string().when("type", {
    is: "card",
    then: schema => string().min(5).required(),
    otherwise: schema => string().notRequired()
  }),
  description: string().max(100),
  import: number().moreThan(0)
})


const Root:React.FC<RootProps> = ({children}) => {
  return (
    <CustomForm.Root initialForm={initialForm} formSchema={formSchema}>
      {children}
    </CustomForm.Root>
  )
}

const Form:React.FC<FormProps> = ({children, onSendForm}) => {
  const {t} = useTranslation();
  const {form, setForm, error} = useFormContext<FormInputsProps>();
  const {type, cardNumber, iban, description, import:Import} = form;


  return (
    <CustomForm.Container onSendForm={onSendForm}>
      <FormControl fullWidth>
        <Stack direction={"column"} spacing={2}>
          <FormControl>
            <RadioGroup
              sx={{ml: 2}}
              value={type}
              onChange={(e, value) => setForm({key: "type", value})}
            >
              <FormControlLabel value={"bankAccount"} control={<Radio />} label={t("bank_account_one")} />
              <FormControlLabel value={"card"} control={<Radio />} label={t("prepaid_card")} />
            </RadioGroup>
          </FormControl>
          {type === "bankAccount" ?
            <TextField label={"IBAN"} value={iban} onChange={(e) => setForm({key: "iban", value: e.target.value}) }/>
            :
            <TextField label={t("card_number")} value={cardNumber} onChange={(e) => setForm({key: "cardNumber", value: e.target.value}) }/>
          }
          {/* <TextField label={t("import")} slotProps={{input: {type: "number"}}} value={Import} onChange={(e) => setForm({key: "import", value: Number(e.target.value)}) }/> */}
          <ImportField value={Import} onValueChange={(value) => setForm({key: "import", value: value.floatValue})}/>
          <TextField label={t("description")} multiline minRows={2} maxRows={4} value={description} onChange={(e) => setForm({key: "description", value: e.target.value}) }/>
          {error && <FormHelperText error>{t(error.response.data)}</FormHelperText>}
          {children}
        </Stack>
      </FormControl>
    </CustomForm.Container>
  )
}

const ConfirmButton = () => {
  const {t} = useTranslation();
  return (
    <CustomForm.ConfirmButton>{t("confirm")}</CustomForm.ConfirmButton>
  )
}

const TransferMoney = {
  Root,
  Form,
  ConfirmButton
}

export default TransferMoney