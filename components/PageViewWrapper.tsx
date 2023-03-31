import React, {forwardRef, useImperativeHandle, useRef} from "react"
import {PageView} from "../model/PageView"
import {ReactZoomPanPinchRef, TransformComponent, TransformWrapper} from "react-zoom-pan-pinch"
import {useKeyPress} from "../util/KeyPress"
import {Dimensions} from "../model/Dimensions"
import {FloatingPageTurnAction} from "../model/FloatingPageTurnAction"
import {FloatingPageSettings} from "../model/AppSettings"

interface Props {
  pageView: PageView,
  zoom: number,
  floatingPage: FloatingPageSettings,
  wrapper: (ref: React.Ref<HTMLDivElement>, width: (dimensions: Dimensions) => string, alignSelf: string) => JSX.Element,
}

export type PageViewWrapperHandle = {
  pageTurned: () => void;
  zoomToPageNow: () => void;
};

export const PageViewWrapper = forwardRef<PageViewWrapperHandle, Props>(function PageViewWrapper(
  {
    pageView,
    zoom,
    floatingPage,
    wrapper,
  }: Props, ref
) {
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const divRef = useRef<HTMLDivElement>(null)

  const altKeyPressed = useKeyPress("Alt")

  useImperativeHandle(ref, () => {
    return {
      pageTurned() {
        if (!divRef.current) {
          return
        }
        const animationTime = floatingPage.animateTurn ? undefined : 0
        switch (floatingPage.turnAction) {
          case FloatingPageTurnAction.CenterViewKeepZoom:
            transformRef.current?.centerView(undefined, animationTime)
            break
          case FloatingPageTurnAction.CenterViewResetZoom:
            transformRef.current?.centerView(1, animationTime)
            break
          case FloatingPageTurnAction.FitToScreen:
            transformRef.current?.zoomToElement(divRef.current, undefined, animationTime)
            break
          case FloatingPageTurnAction.KeepCurrentView:
            break
        }
      },
      zoomToPageNow() {
        if (divRef.current) {
          transformRef.current?.zoomToElement(divRef.current, undefined, 0)
        }
      },
    }
  }, [floatingPage.animateTurn, floatingPage.turnAction])

  switch (pageView) {
    case PageView.Fixed:
      return wrapper(divRef, (dimensions) => Math.round(dimensions.w * zoom / 100) + "px", "center")
    case PageView.Floating:
      return <TransformWrapper
        limitToBounds={floatingPage.limitToBounds}
        minScale={0.1}
        disabled={altKeyPressed}
        panning={{velocityDisabled: !floatingPage.panningVelocity}}
        alignmentAnimation={{disabled: true}}
        disablePadding={true}
        ref={transformRef}
      >
        <TransformComponent wrapperStyle={{width: "100%", height: "100%"}}>
          {wrapper(divRef, () => "auto", "stretch")}
        </TransformComponent>
      </TransformWrapper>
  }
})
