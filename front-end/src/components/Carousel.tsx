import { Box, Stack, type BoxProps, type StackProps } from '@mui/material';
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Utilities from '../classes/Utilities';

type CarouselContextProps = {
  currentView: number;
  setCurrentView: React.Dispatch<React.SetStateAction<number>>;
}

const CarouselContext = createContext<CarouselContextProps|undefined>(undefined);
const useCarousel = () => useContext(CarouselContext)!;

type RootProps = {
  children?: React.ReactNode;
  viewIndex?: number;
}

const Root:React.FC<RootProps> = ({viewIndex=0, children}) => {
  const [currentView, setCurrentView] = useState<number>(viewIndex);

  useEffect(() => {
    setCurrentView(viewIndex);
  }, [viewIndex])

  const value:CarouselContextProps = {
    currentView, setCurrentView
  }

  return (
    <CarouselContext.Provider value={value}>
      {children}
    </CarouselContext.Provider>
  )
}

const Content: React.FC<StackProps> = ({ref, sx, ...otherProps }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { currentView } = useCarousel();

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const container = contentRef.current;
    const child = container.children[currentView] as HTMLElement;
    if (child) {
      container.scrollTo({
        left: child.offsetLeft,
        behavior: "smooth",
      });
    }
  }, [contentRef.current, currentView]);


  return (
    <Stack
      ref={Utilities.mergeRefs(ref, contentRef)}
      direction="row"
      spacing={1}
      sx={{
        width: "100%",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        ...sx,
      }}
      {...otherProps}
    />
  );
};

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