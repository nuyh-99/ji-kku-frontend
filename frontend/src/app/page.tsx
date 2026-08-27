// 루트(/) 페이지 — 서비스 진입 시 노출되는 랜딩 화면.
// /login 과 동일한 랜딩을 렌더한다. (/login 은 로그아웃·인증 만료 시 이동 경로로 유지)
import { Login } from "@/features/login/components/Login";

export default function LandingPage() {
  return <Login />;
}
