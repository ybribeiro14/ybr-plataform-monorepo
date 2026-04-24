import { useTranslations } from "next-intl";

const AdminHomePage = () => {
  const t = useTranslations("dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-serif text-4xl text-[var(--color-on-surface)]">
        YBR Platform
      </h1>
      <p className="mt-4 text-[var(--color-on-surface-variant)]">
        {t("title", { name: "" })}
      </p>
    </main>
  );
};

export default AdminHomePage;
