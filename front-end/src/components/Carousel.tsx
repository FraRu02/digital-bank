import { Box, Stack, type BoxProps, type StackProps } from '@mui/material';
import React, { createContext, useContext, useState } from 'react';

type CarouselContextProps = {

}

const CarouselContext = createContext<CarouselContextProps|undefined>(undefined);
const useCarousel = () => useContext(CarouselContext)!;

type RootProps = {
  children?: React.ReactNode;
}

const Root:React.FC<RootProps> = ({children}) => {
  const [currentView, setCurrentView] = useState<number>(0);

  const value:CarouselContextProps = {
    currentView, setCurrentView
  }

  return (
    <CarouselContext.Provider value={value}>
      {children}
    </CarouselContext.Provider>
  )
}

const Content:React.FC<StackProps> = ({sx, ...otherProps}) => {
  return(
    <Stack direction={"row"} spacing={1} sx={{width: "100%", overflowX: "auto", scrollSnapType: "x mandatory", ...sx}} {...otherProps} />
  )
}

const Item:React.FC<BoxProps> = ({sx, ...otherProps}) => {
  return(
    <Box
      sx={{
        flex: "1 0 100%",
        aspectRatio: "16/9",
        scrollSnapAlign: "start",
        ...sx
      }}
      {...otherProps}
    />
  )
}
 
const Carousel = {
  Root,
  Content,
  Item
}


export default Carousel