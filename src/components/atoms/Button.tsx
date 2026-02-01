import React from "react";

type ButtonVariant =
  | "dark"       // 닫기/보기 (#26B99A)
  | "blue"       // 수정/저장/등록 (#5A6268)
  | "red"        // 삭제 (#F53C57)
  | "green"      // 엑셀 저장 (#007300)
  | "secondary"  // 기존 회색 보조
  | "primary";   // 기존 주황

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** (호환용) 기존 코드 유지: primary=true면 variant=primary로 간주 */
  primary?: boolean;
  /** 신규: 버튼 스타일 구분 */
  variant?: ButtonVariant;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  primary = false,
  variant,
  className = "",
  type,
  ...props
}) => {
  const baseStyle =
    "px-4 py-2 font-semibold rounded text-sm " +
    "transition-all duration-150 select-none touch-manipulation " +
    "inline-flex items-center justify-center gap-2 " +
    "cursor-pointer " +
    "active:scale-[0.98] active:translate-y-px " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none";

  // 기존 primary 플래그 호환
  const resolved: ButtonVariant = variant ?? (primary ? "primary" : "secondary");

  const styles: Record<ButtonVariant, string> = {
    // 기존 스타일 유지
    primary:
      "bg-orange-600 hover:bg-orange-700 text-white shadow-md focus-visible:ring-orange-500",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300 focus-visible:ring-gray-400",

    // ✅ 스펙 컬러 매핑 (주석과 실제 값 일치)
    dark:
      "bg-[#26B99A] hover:brightness-95 text-white shadow-md focus-visible:ring-[#26B99A]", // 닫기/보기
    blue:
      "bg-[#5A6268] hover:brightness-95 text-white shadow-md focus-visible:ring-[#5A6268]", // 수정/저장/등록
    red:
      "bg-[#F53C57] hover:brightness-95 text-white shadow-md focus-visible:ring-[#F53C57]",
    green:
      "bg-[#007300] hover:brightness-95 text-white shadow-md focus-visible:ring-[#007300]",
  };

  return (
    <button
      type={type ?? "button"}
      className={`${baseStyle} ${styles[resolved]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
