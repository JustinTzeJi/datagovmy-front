import { GetStaticProps } from "next";
import type { InferGetStaticPropsType } from "next";
import { get } from "@lib/api";
import type { Page } from "@lib/types";
import Metadata from "@components/Metadata";
import { useTranslation } from "@hooks/useTranslation";
import ImmigrationDashboard from "@dashboards/demography/immigration";
import { withi18n } from "@lib/decorators";

const Immigration: Page = ({}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["dashboard-immigration", "common"]);

  return (
    <>
      <Metadata title={t("header")} description={t("description")} keywords={""} />
      <ImmigrationDashboard />
    </>
  );
};
// Disabled
export const getStaticProps: GetStaticProps = withi18n("dashboard-immigration", async () => {
  //   const { data } = await get("/dashboard", { dashboard: "currency" });

  return {
    notFound: false,
    props: {},
    revalidate: 60 * 60 * 24, // 1 day (in seconds)
  };
});

export default Immigration;
