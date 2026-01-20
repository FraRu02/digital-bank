import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CardsTable from './CardsTable';
import { useCardsView } from '@/src/views/Cards';

const CardsContent:React.FC = () => {
  const {t} = useTranslation();
  const {cardsQuery} = useCardsView();
  const {data, isFetching, refetch} = cardsQuery;
  
  return (
    <Box sx={{p: 1}}>
      <Typography sx={{mb: 2}} fontWeight={"bold"} variant='h5'>{t("card_other")}</Typography>
      <CardsTable
        loading={isFetching}
        cards={data} 
        onRefresh={refetch}
        dataGrid={{
          initialState: {
            pagination: {
              paginationModel: {
                pageSize: 10
              }
            }
          }
        }}
      />
    </Box>
  )
}

export default CardsContent