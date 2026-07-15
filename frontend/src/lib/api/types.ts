// API 공용 타입: 에러코드 표, ApiError, 공통 응답 envelope.
// 에러코드는 노션 문서 기준. 새 코드가 추가되면 여기에도 함께 추가하세요.

export const ERROR_CODES = {
  COMMON400_1: { status: 400, name: "INVALID_INPUT_VALUE", message: "요청 값이 올바르지 않습니다." },
  COMMON400_2: { status: 400, name: "INVALID_TYPE_VALUE", message: "요청 파라미터의 타입이 올바르지 않습니다." },
  COMMON400_3: { status: 400, name: "MISSING_REQUEST_PARAMETER", message: "필수 요청 파라미터가 누락되었습니다." },
  COMMON400_4: { status: 400, name: "INVALID_HTTP_BODY", message: "HTTP 요청 바디(JSON) 파싱에 실패했습니다." },
  COMMON400_5: { status: 400, name: "MULTIPART_FILE_ERROR", message: "파일 업로드 처리 중 오류가 발생했습니다." },
  COMMON405_1: { status: 405, name: "METHOD_NOT_ALLOWED", message: "허용되지 않은 HTTP 메서드입니다." },
  COMMON404_1: { status: 404, name: "NOT_FOUND", message: "존재하지 않는 엔드포인트(URL)입니다." },
  COMMON404_2: { status: 404, name: "ENTITY_NOT_FOUND", message: "요청한 리소스를 찾을 수 없습니다." },
  COMMON409_1: { status: 409, name: "DUPLICATE_RESOURCE", message: "이미 존재하는 리소스입니다." },
  COMMON500_1: { status: 500, name: "INTERNAL_SERVER_ERROR", message: "서버 내부 오류가 발생했습니다." },

  AUTH401_1: { status: 401, name: "UNAUTHORIZED", message: "인증이 필요합니다." },
  AUTH401_2: { status: 401, name: "INVALID_TOKEN", message: "유효하지 않은 토큰입니다." },
  AUTH401_3: { status: 401, name: "EXPIRED_TOKEN", message: "만료된 토큰입니다." },
  AUTH401_4: { status: 401, name: "INVALID_CREDENTIALS", message: "아이디 또는 비밀번호가 올바르지 않습니다." },
  AUTH401_5: { status: 401, name: "TOKEN_NOT_FOUND", message: "헤더에 토큰이 존재하지 않습니다." },
  AUTH403_1: { status: 403, name: "ACCESS_DENIED", message: "접근 권한이 없습니다." },

  MEMBER404_1: { status: 404, name: "MEMBER_NOT_FOUND", message: "존재하지 않는 사용자입니다." },
  MEMBER409_1: { status: 409, name: "DUPLICATE_EMAIL", message: "이미 사용중인 이메일입니다." },
  MEMBER409_2: { status: 409, name: "DUPLICATE_NICKNAME", message: "이미 사용중인 닉네임입니다." },

  EXTERNAL400_1: { status: 400, name: "FILE_SIZE_EXCEEDED", message: "파일 업로드 용량을 초과했습니다." },
  EXTERNAL400_2: { status: 400, name: "INVALID_FILE_EXTENSION", message: "허용되지 않는 파일 확장자입니다." },
  EXTERNAL500_1: { status: 500, name: "FILE_UPLOAD_FAILED", message: "S3 파일 업로드에 실패했습니다." },
  EXTERNAL500_2: { status: 500, name: "EXTERNAL_API_ERROR", message: "외부 연동 API 호출에 실패했습니다." },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export function isKnownErrorCode(code: string): code is ErrorCode {
  return code in ERROR_CODES;
}

/** 백엔드 공통 응답 포맷: { isSuccess, code, message, result } */
export interface ApiSuccessResponse<T> {
  isSuccess: true;
  code: string;
  message: string;
  result: T;
}

export interface ApiErrorBody {
  isSuccess: false;
  code: string;
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorBody;

/** 서버 에러 응답을 감싸는 에러 객체. code로 분기하고 message는 사용자에게 그대로 노출해도 됩니다. */
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
