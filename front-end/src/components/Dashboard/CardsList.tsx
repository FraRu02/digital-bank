import React from 'react';
import { List, Box } from '@mui/material';
import CardElement from '@/src/components/CardElement';
import { CardStatus, type BaseCardProps } from '@/src/classes/Card';

type CardsListProps = {
  list: Array<BaseCardProps>;
  selected?: BaseCardProps|null;
  loadingCardId?: string|null;
  onClickItem?: (card:BaseCardProps) => void;
  onClickItemVerify?: (card:BaseCardProps) => void;
}

const CardsList:React.FC<CardsListProps> = ({list, selected, loadingCardId, onClickItem, onClickItemVerify}) => {

  return (
    <List sx={{ display: 'flex', flexDirection: 'row', overflowX: "auto", pt: 1, pb: 1, m: 0, gap: 2 }}  disablePadding>
      {list.map((el) => el.status === CardStatus.active ? (
        <Box key={el.id} sx={{cursor: "pointer"}} onClick={() => onClickItem?.(el)}>
          <CardElement card={el} selected={selected?.id === el.id} loading={loadingCardId === el.id}/>
        </Box>
      ) : el.status === CardStatus.pending_verification && (
        <Box key={el.id}>
          <CardElement
          card={el}
          selected={selected?.id === el.id}
          loading={loadingCardId === el.id}
          onClickVerify={onClickItemVerify}
          />
        </Box>
      )
    )}
    </List>
  )
}

export default CardsList