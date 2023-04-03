import { FunctionComponent, ReactNode, useMemo } from "react";
import Container from "@components/Container";
import { toDate } from "@lib/helpers";
import { useTranslation } from "next-i18next";

type ConditionalHeroProps =
  | {
      children?: ReactNode;
      last_updated?: never;
      header?: never;
      category?: never;
      description?: never;
      agencyBadge?: never;
    }
  | HeroDefault;

type HeroDefault = {
  children?: never;
  last_updated?: string | number;
  header?: [text: string, className?: string];
  category?: [text: string, className?: string];
  description?: [text: string, className?: string] | ReactNode;
  agencyBadge?: ReactNode;
};

type HeroProps = {
  background?: "gray" | "blue" | "red" | "purple" | "green" | "orange";
  className?: string;
} & ConditionalHeroProps;

const Hero: FunctionComponent<HeroProps> = ({
  background = "gray",
  className,
  children,
  category,
  header,
  description,
  last_updated,
  agencyBadge,
}) => {
  const { t, i18n } = useTranslation();

  const background_style = useMemo<string>(() => {
    switch (background) {
      case "blue":
        return "bg-gradient-radial from-[#A1BFFF] to-background dark:from-[#203053] dark:to-black";
      case "red":
        return "bg-gradient-radial from-[#FFE1E1] to-background dark:from-[#492424] dark:to-black";
      case "purple":
        return "bg-gradient-radial from-[#C4B5FD] to-background dark:from-[#281843] dark:to-black";
      case "green":
        return "bg-gradient-radial from-[#CFFCCC] to-background dark:from-[#1B2C1A] dark:to-black";
      case "orange":
        return "bg-gradient-radial from-[#FFE5CD] to-background dark:from-[#2E2014] dark:to-black";
      default: // gray
        return "bg-gradient-radial from-[#E2E8F0] to-background dark:from-[#3F3F46] dark:to-black";
    }
  }, [background]);

  return (
    <Container
      background={background_style.concat(" border-b dark:border-washed-dark")}
      className={`py-12 ${className}`}
    >
      {children ? (
        children
      ) : (
        <div className="space-y-6 xl:w-full">
          <div className="relative flex justify-between">
            {category && (
              <span className={["text-base font-semibold uppercase", category[1] ?? ""].join(" ")}>
                {t(category[0])}
              </span>
            )}
            <div className="absolute right-0 top-0">{agencyBadge}</div>
          </div>

          {(header || description) && (
            <div className="space-y-3">
              {header && (
                <h3 className={["text-black", header[1] ?? ""].join(" ")}>{t(header[0])}</h3>
              )}
              {description && Array.isArray(description) ? (
                <p className={["text-dim", description[1]].join(" ")}>{description[0]}</p>
              ) : (
                description
              )}
            </div>
          )}

          {last_updated && (
            <p className="text-sm text-dim dark:text-white">
              {t("common.last_updated", {
                date: toDate(last_updated, "dd MMM yyyy, HH:mm", i18n.language),
              })}
            </p>
          )}
        </div>
      )}
    </Container>
  );
};

export default Hero;
