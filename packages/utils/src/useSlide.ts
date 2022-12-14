import { useCallback, useMemo, useRef, useState } from "react";

const scrollToSlide = (
  slider: HTMLUListElement | null,
  slideIndex: number,
  slideWidth: number,
  slideMargin: number,
) => {
  if (!slider) return;

  slider.scrollTo({
    left: slideIndex * (slideWidth + slideMargin),
    behavior: "smooth",
  });
};

const useSlide = (slideWidth = 400, slideMargin = 20) => {
  const sliderRef = useRef<HTMLUListElement | null>(null);
  const [sliderPosition, setSliderPosition] = useState(0);

  const currentSlide = useMemo(() => {
    return Math.floor(sliderPosition / (slideWidth + slideMargin));
  }, [sliderPosition]);

  const scrolledToEndOfSlider = useMemo(() => {
    if (!sliderRef.current) return false;

    return (
      sliderRef.current.scrollWidth -
        sliderRef.current.scrollLeft -
        sliderRef.current.clientWidth ===
      0
    );
  }, [sliderPosition]);

  const goToNextSlide = useCallback(() => {
    scrollToSlide(sliderRef.current, currentSlide + 1, slideWidth, slideMargin);
  }, [currentSlide]);

  const goToPreviousSlide = useCallback(() => {
    scrollToSlide(sliderRef.current, currentSlide - 1, slideWidth, slideMargin);
  }, [currentSlide]);

  return {
    sliderRef,
    sliderPosition,
    setSliderPosition,
    scrolledToEndOfSlider,
    goToNextSlide,
    goToPreviousSlide,
    currentSlide,
  };
};

export default useSlide;
