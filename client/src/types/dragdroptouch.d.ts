declare module '@dragdroptouch/drag-drop-touch' {
  export function enableDragDropTouch(
    dragRoot?: Document | Element,
    dropRoot?: Document | Element,
    options?: {
      forceListen?: boolean;
      threshold?: number;
      isPressHoldMode?: boolean;
      pressHoldAwait?: number;
      pressHoldMargin?: number;
      pressHoldThresholdPixels?: number;
    }
  ): void;
}
