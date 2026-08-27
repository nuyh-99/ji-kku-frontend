// 이미지 업로드 (S3). POST /images 는 도메인 공용이라 lib 에 둔다.
import { apiFetch } from "./client";

interface ImageUploadResult {
  imgUrl: string;
}

/**
 * 이미지 한 장을 올리고 저장된 URL을 돌려준다.
 * 지도 사진 채우기·기록 이미지 블록처럼 "URL을 본문에 넣어야 하는" 요청의 선행 단계다.
 *
 * 실패 코드: EXTERNAL400_1(용량 초과) / EXTERNAL400_2(확장자) / EXTERNAL500_1(S3 실패)
 */
export function uploadImage(file: File): Promise<ImageUploadResult> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<ImageUploadResult>("/images", { method: "POST", body: form });
}
