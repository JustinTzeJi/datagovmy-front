import AgencyBadge from "@components/AgencyBadge";
import { Hero } from "@components/index";
import { useTranslation } from "@hooks/useTranslation";
import { FunctionComponent } from "react";
import Container from "@components/Container";
import { EPFIcon } from "@components/Icon/agency";

/**
 * RetirementReadiness Dashboard
 * @overview Status: In-development
 */

interface RetirementReadinessProps {}

const RetirementReadiness: FunctionComponent<RetirementReadinessProps> = ({}) => {
  const { t, i18n } = useTranslation(["dashboard-retirement-readiness", "common"]);

  return (
    <>
      <Hero
        background="orange"
        category={[t("common:nav.megamenu.categories.economy"), "text-[#FF820E]"]}
        header={[t("header")]}
        description={[t("description")]}
        agencyBadge={
          <AgencyBadge
            agency={"Employees Provident Fund"}
            link="https://www.kwsp.gov.my/"
            icon={<EPFIcon />}
          />
        }
      />
      {/* Rest of page goes here */}
      <Container className="min-h-screen"></Container>
    </>
  );
};

export default RetirementReadiness;
