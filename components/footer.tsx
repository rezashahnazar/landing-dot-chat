"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-6">
      <div className="flex justify-center items-center">
        <Link
          prefetch={false}
          target="_blank"
          referrerPolicy="origin"
          href="https://trustseal.enamad.ir/?id=567125&Code=rykQqrC625bllzUtpShdgYpNrXhmLIrF"
          className="rounded-lg border border-gray-600 p-2 size-[100px] flex items-center justify-center"
        >
          <img
            referrerPolicy="origin"
            src="https://trustseal.enamad.ir/logo.aspx?id=567125&Code=rykQqrC625bllzUtpShdgYpNrXhmLIrF"
            alt="Enamad Trust Seal"
            style={{ cursor: "pointer" }}
            code="rykQqrC625bllzUtpShdgYpNrXhmLIrF"
            {...({} as any)}
          />
        </Link>
      </div>
      <div className="text-center mt-4 text-xs text-gray-600">
        <p>Powered by LeelE</p>
        <p>Produced by Reza Shahnazar</p>
      </div>
    </footer>
  );
}
