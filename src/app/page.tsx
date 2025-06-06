// app/page.tsx
import { redirect } from 'next/navigation';

export default function Page(): never {
  // "/" 접속 시 로그인 페이지로 리다이렉트
  redirect('/auth/sign-in');
}
