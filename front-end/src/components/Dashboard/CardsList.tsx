import React from 'react';
import { List, Box } from '@mui/material';
import CardElement from '@/src/components/CardElement';
import type { BaseCardProps } from '@/src/classes/Card';

type CardsListProps = {
  list: Array<BaseCardProps>;
  selected?: BaseCardProps|null;
  loadingCardId?: string|null;
  onClickItem?: (card:BaseCardProps) => void;
}

const CardsList:React.FC<CardsListProps> = ({list, selected, loadingCardId, onClickItem}) => {

  return (
    <List sx={{ display: 'flex', flexDirection: 'row', overflowX: "auto", pt: 1, pb: 1, m: 0, gap: 2 }}  disablePadding>
      {list.map((el) => (
        <Box key={el.id}>
          <Box sx={{cursor: "pointer"}} onClick={() => onClickItem?.(el)}>
            <CardElement card={el} selected={selected?.id === el.id} loading={loadingCardId === el.id}/>
          </Box>
        </Box>
        
      ))}
    </List>
  )
}

export default CardsList