// 지도 위 오버레이(스티커·사진 카드)가 함께 쓰는 좌표 변환.

/**
 * 화면 좌표 → viewBox 좌표.
 * 지도가 확대/이동돼 있어도 CTM 이 그 변환을 이미 담고 있어 그대로 역변환하면 된다.
 */
export function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
}
