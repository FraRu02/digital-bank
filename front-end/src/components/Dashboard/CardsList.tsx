import React, { useEffect, useRef, useState } from 'react';
import CardElement from '@/src/components/CardElement';
import { CardStatus, type BaseCardProps } from '@/src/classes/Card';
import Carousel from '@/src/components/Carousel';

type CardsListProps = {
  list: Array<BaseCardProps>;
  selected?: BaseCardProps|null;
  loadingCardId?: string|null;
  onClickItem?: (card:BaseCardProps) => void;
  onClickItemVerify?: (card:BaseCardProps) => void;
}

const CardsList:React.FC<CardsListProps> = ({list, selected, loadingCardId, onClickItem, onClickItemVerify}) => {
  const carouselRef = useRef<HTMLDivElement|null>(null);
  const [gridSize, setGridSize] = useState<number>(2);


  useEffect(() => {
    if(!carouselRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const clientWidth = entries[0].target.clientWidth;
      let grid = 0;
      for (let index = 1; index < 6; index += 0.5) {
        const width = Math.floor(clientWidth/index);
        if(width >= 330 && width <= 480) {
          grid = index;
          break;
        }
      }

      if(grid > 0) setGridSize(grid);

    })
    observer.observe(carouselRef.current)

    return () => {
      carouselRef.current && observer.unobserve(carouselRef.current);
      observer.disconnect();
    }
  }, [carouselRef.current])

  return (
    <Carousel.Root>
      <Carousel.Content ref={carouselRef} sx={{pt: 1, m: 0}}>
        {list.map((el) => el.status === CardStatus.active ? (
          <Carousel.Item 
            key={el.id} 
            sx={{ flex: `0 0 calc(100% / ${gridSize})`, cursor: "pointer"}}
            onClick={() => onClickItem?.(el)}
          >
            <CardElement
              sx={{height: "100%"}}
              card={el}
              selected={selected?.id === el.id}
              loading={loadingCardId === el.id}
            />
          </Carousel.Item>
        ): el.status === CardStatus.pending_verification && (
           <Carousel.Item key={el.id} sx={{ flex: `0 0 calc(100% / ${gridSize})`}}>
             <CardElement
              sx={{height: "100%"}}
              card={el}
              selected={selected?.id === el.id}
              loading={loadingCardId === el.id}
              onClickVerify={onClickItemVerify}
            />
           </Carousel.Item>
        )
        
        )}
      </Carousel.Content>
    </Carousel.Root>
  )
  // return (
    
  //   <List sx={{ display: 'flex', overflowX: "auto", pt: 1, pb: 1, m: 0, gap: "1rem" }}  disablePadding>
  //     {list.map((el) => el.status === CardStatus.active ? (
  //       <Box key={el.id} sx={{cursor: "pointer"}} onClick={() => onClickItem?.(el)}>
  //         <CardElement
  //           card={el}
  //           selected={selected?.id === el.id}
  //           loading={loadingCardId === el.id}
  //         />
  //       </Box>
  //     ) : el.status === CardStatus.pending_verification && (
  //       <>
  //         <CardElement
  //           key={el.id+"1"}
  //           card={el}
  //           selected={selected?.id === el.id}
  //           loading={loadingCardId === el.id}
  //           onClickVerify={onClickItemVerify}
  //         />

  //         <CardElement
  //         key={el.id+"2"}
  //           card={el}
  //           selected={selected?.id === el.id}
  //           loading={loadingCardId === el.id}
  //           onClickVerify={onClickItemVerify}
  //         />
  //         <CardElement
  //         key={el.id+"3"}
  //           card={el}
  //           selected={selected?.id === el.id}
  //           loading={loadingCardId === el.id}
  //           onClickVerify={onClickItemVerify}
  //         />
  //         <CardElement
  //         key={el.id+"4"}
  //           card={el}
  //           selected={selected?.id === el.id}
  //           loading={loadingCardId === el.id}
  //           onClickVerify={onClickItemVerify}
  //         />
  //       </>
  //     )
  //   )}
  //   </List>
  // )
}

export default CardsList